/* global process, console, setTimeout, document, HTMLElement, HTMLInputElement, HTMLTextAreaElement, fetch, window */
import puppeteer from 'puppeteer';

const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';
const apiHost = process.env.API_URL ?? 'http://localhost:3001';

const results = [];
const consoleErrors = [];
const pageErrors = [];
const apiFailures = [];
const requestFailures = [];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function recordResult(step, status, details) {
  results.push({ step, status, details });
}

function formatFailure(entry) {
  if (!entry) return '';
  const { url, status, statusText, method, failure } = entry;
  if (failure) {
    return `${method} ${url} failed: ${failure}`;
  }
  return `${method} ${url} → ${status} ${statusText}`;
}

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 }
  });
  const page = await browser.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', error => {
    pageErrors.push(error.message);
  });

  page.on('response', response => {
    if (response.url().startsWith(apiHost) && response.status() >= 400) {
      apiFailures.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        method: response.request().method()
      });
    }
  });

  page.on('requestfailed', request => {
    if (request.url().startsWith(apiHost)) {
      requestFailures.push({
        url: request.url(),
        method: request.method(),
        failure: request.failure()?.errorText
      });
    }
  });

  try {
    const seedRequestState = async () => {
      const safeRequest = async (url, init) => {
        try {
          const response = await fetch(url, init);
          if (!response.ok) {
            console.warn(`Seed request call failed (${response.status}): ${url}`);
          }
        } catch (error) {
          console.warn(`Seed request call threw for ${url}:`, error);
        }
      };

      await Promise.all([
        safeRequest(`${apiHost}/api/requests/REQ-003`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stage: 'Scoping',
            owner: 'Alex Rivera',
            lastUpdate: 'Reset for smoke test',
            activity: []
          })
        }),
        safeRequest(`${apiHost}/api/requests/REQ-003/documents`, {
          method: 'DELETE'
        }),
        safeRequest(`${apiHost}/api/requests/REQ-002/documents`, {
          method: 'DELETE'
        })
      ]);
    };

    await seedRequestState();

    // --- Step 1: Landing page smoke check ---
    try {
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
      const heroSelector = 'h1';
      await page.waitForSelector(heroSelector, { timeout: 5000 });
      const heroText = await page.$eval(heroSelector, el => el.textContent?.trim() ?? '');
      if (!heroText.toLowerCase().includes('what can we do for you today')) {
        recordResult('Landing page hero renders', 'fail', `Unexpected hero text: "${heroText}"`);
      } else {
        recordResult('Landing page hero renders', 'pass');
      }
    } catch (error) {
      recordResult('Landing page hero renders', 'fail', error.message);
    }

    // --- Step 2: Start conversation from example ---
    try {
      const clicked = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const target = buttons.find(btn =>
          btn.textContent?.includes('Bug: Investigate why the order export job times out after 5 minutes')
        );
        if (target instanceof HTMLElement) {
          target.click();
          return true;
        }
        return false;
      });

      if (!clicked) {
        recordResult(
          'Example intake conversation responds successfully',
          'fail',
          'Failed to locate example button on landing page.'
        );
      } else {
        await delay(4000);
        const errorDetected = await page.evaluate(() => {
          const bubbles = Array.from(document.querySelectorAll('div'));
          return bubbles.some(div => div.textContent?.includes('I encountered an error. Please try again or rephrase your request.'));
        });

        if (errorDetected) {
          recordResult(
            'Example intake conversation responds successfully',
            'fail',
            'Assistant returned an error message after starting the conversation.'
          );
        } else {
          recordResult('Example intake conversation responds successfully', 'pass');
        }
      }
    } catch (error) {
      recordResult('Example intake conversation responds successfully', 'fail', error.message);
    }

    // --- Step 3: Dashboard data loads ---
    try {
      await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'domcontentloaded' });
      await delay(3000);
      const hasRequest = await page.evaluate(() => {
        const cells = Array.from(document.querySelectorAll('td'));
        return cells.some(td => td.textContent?.includes('REQ-001'));
      });
      if (!hasRequest) {
        recordResult('Dashboard request table renders seed data', 'fail', 'Could not find seeded request REQ-001.');
      } else {
        recordResult('Dashboard request table renders seed data', 'pass');
      }
    } catch (error) {
      recordResult('Dashboard request table renders seed data', 'fail', error.message);
    }

    // --- Step 4: Switch to Product Owner view ---
    try {
      const switched = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const target = buttons.find(btn => btn.textContent?.trim() === 'Product Owner');
        if (target instanceof HTMLElement) {
          target.click();
          return true;
        }
        return false;
      });

      await delay(1000);

      const isActive = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const target = buttons.find(btn => btn.textContent?.trim() === 'Product Owner');
        if (target instanceof HTMLElement) {
          return target.className.includes('bg-white');
        }
        return false;
      });

      if (!switched) {
        recordResult('Switch to Product Owner view', 'fail', 'Product Owner toggle not found.');
      } else if (!isActive) {
        recordResult('Switch to Product Owner view', 'fail', 'Product Owner view toggle did not activate.');
      } else {
        recordResult('Switch to Product Owner view', 'pass');
      }
    } catch (error) {
      recordResult('Switch to Product Owner view', 'fail', error.message);
    }

    // --- Step 5: Navigate to request detail view ---
    try {
      await delay(1000);
      const clickedRow = await page.evaluate(() => {
        const cells = Array.from(document.querySelectorAll('td'));
        const target = cells.find(td => td.textContent?.includes('REQ-003'));
        if (target) {
          const row = target.closest('tr');
          if (row instanceof HTMLElement) {
            row.click();
            return true;
          }
        }
        return false;
      });

      if (!clickedRow) {
        recordResult('Request detail view opens from dashboard', 'fail', 'Unable to locate REQ-003 row to click.');
      } else {
        await page.waitForFunction(() => window.location.pathname.includes('/request/'), { timeout: 5000 });
        const headingVisible = await page.evaluate(() => {
          const headings = Array.from(document.querySelectorAll('h2'));
          return headings.some(h => h.textContent?.includes('REQ-003'));
        });
        const modeSelectorVisible = await page.evaluate(() => {
          const headings = Array.from(document.querySelectorAll('h3'));
          return headings.some(h => h.textContent?.includes('Generate Requirements Documents'));
        });
        if (!headingVisible) {
          recordResult('Request detail view opens from dashboard', 'fail', 'Request detail heading did not render.');
        } else if (!modeSelectorVisible) {
          recordResult('Request detail view opens from dashboard', 'fail', 'Mode selector not available for document generation.');
        } else {
          recordResult('Request detail view opens from dashboard', 'pass');
        }
      }
    } catch (error) {
      recordResult('Request detail view opens from dashboard', 'fail', error.message);
    }

    // --- Step 6: Attempt document generation ---
    try {
      const selectedMode = await page.evaluate(() => {
        const radio = document.querySelector('input[type="radio"][value="guided"]');
        if (radio instanceof HTMLInputElement) {
          radio.click();
          return true;
        }
        return false;
      });

      if (!selectedMode) {
        recordResult('Document generation succeeds', 'fail', 'Could not select a generation mode.');
      } else {
        const clickedGenerate = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const target = buttons.find(btn => btn.textContent?.includes('Generate Requirements Documents'));
          if (target instanceof HTMLElement) {
            target.click();
            return true;
          }
          return false;
        });

        if (!clickedGenerate) {
          recordResult('Document generation succeeds', 'fail', 'Generate button not found.');
        } else {
          const docsRendered = await page
            .waitForFunction(
              () => !!document.querySelector('textarea'),
              { timeout: 60000 }
            )
            .then(() => true)
            .catch(() => false);

          const errorToastPresent = await page.evaluate(() => {
            const toasts = Array.from(document.querySelectorAll('div'));
            return toasts.some(div =>
              div.textContent?.includes('Failed to generate requirements')
            );
          });

          if (!docsRendered) {
            recordResult(
              'Document generation succeeds',
              'fail',
              'Generated documents did not render within 60 seconds.'
            );
          } else if (errorToastPresent) {
            recordResult(
              'Document generation succeeds',
              'fail',
              'Toast reported "Failed to generate requirements" after triggering generation.'
            );
          } else {
            const docContent = await page.evaluate(() => {
              const textarea = document.querySelector('textarea');
              if (textarea instanceof HTMLTextAreaElement) {
                return textarea.value;
              }
              return '';
            });

            if (!docContent.trim()) {
              recordResult(
                'Document generation succeeds',
                'fail',
                'Document viewer rendered but initial document content was empty.'
              );
            } else {
              recordResult('Document generation succeeds', 'pass');
            }
          }
        }
      }
    } catch (error) {
      recordResult('Document generation succeeds', 'fail', error.message);
    }

    // --- Step 7: Document refinement updates document ---
    try {
      const initialDocContent = await page.evaluate(() => {
        const textarea = document.querySelector('textarea');
        if (textarea instanceof HTMLTextAreaElement) {
          return textarea.value;
        }
        return '';
      });

      const inputFocused = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input'));
        const target = inputs.find(input =>
          input instanceof HTMLInputElement &&
          input.placeholder?.includes('risk analysis')
        );
        if (target instanceof HTMLInputElement) {
          target.focus();
          return true;
        }
        return false;
      });

      if (!inputFocused) {
        recordResult('Document refinement updates document', 'fail', 'Document chat input not found.');
      } else {
        await page.keyboard.type('Please add a concise summary of key risks.');

        const clickedUpdate = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const target = buttons.find(btn => btn.textContent?.trim() === 'Update');
          if (target instanceof HTMLElement) {
            target.click();
            return true;
          }
          return false;
        });

        if (!clickedUpdate) {
          recordResult('Document refinement updates document', 'fail', 'Document chat Update button not found.');
        } else {
          await delay(60000);

          const refinementStatus = await page.evaluate(() => {
            const containers = Array.from(document.querySelectorAll('div'));
            if (containers.some(div => div.textContent?.includes('I had trouble updating the document.'))) {
              return 'error';
            }
            if (containers.some(div => div.textContent?.includes("I've updated the document based on your feedback."))) {
              return 'success';
            }
            return 'unknown';
          });

          if (refinementStatus === 'error') {
            recordResult(
              'Document refinement updates document',
              'fail',
              'Assistant responded with an error when refining the document.'
            );
          } else if (refinementStatus === 'success') {
            const updatedDocContent = await page.evaluate(() => {
              const textarea = document.querySelector('textarea');
              if (textarea instanceof HTMLTextAreaElement) {
                return textarea.value;
              }
              return '';
            });

            if (updatedDocContent.trim() === initialDocContent.trim()) {
              recordResult(
                'Document refinement updates document',
                'fail',
                'Document text did not change after refinement.'
              );
            } else {
              recordResult('Document refinement updates document', 'pass');
            }
          } else {
            recordResult('Document refinement updates document', 'fail', 'No refinement response detected after 60 seconds.');
          }
        }
      }
    } catch (error) {
      recordResult('Document refinement updates document', 'fail', error.message);
    }

    // --- Step 8: Submit page availability ---
    try {
      await page.goto(`${baseUrl}/submit`, { waitUntil: 'domcontentloaded' });
      await delay(1500);
      const headingVisible = await page.evaluate(() => {
        const headings = Array.from(document.querySelectorAll('h2'));
        return headings.some(h => h.textContent?.includes('AI Assistant'));
      });
      if (headingVisible) {
        recordResult('Submit page renders intake assistant', 'pass');
      } else {
        recordResult('Submit page renders intake assistant', 'fail', 'AI Assistant heading not found.');
      }
    } catch (error) {
      recordResult('Submit page renders intake assistant', 'fail', error.message);
    }

    // --- Step 9: Kanban board renders ---
    try {
      await page.goto(`${baseUrl}/kanban`, { waitUntil: 'domcontentloaded' });
      await delay(2000);
      const columnVisible = await page.evaluate(() => {
        const headings = Array.from(document.querySelectorAll('h3'));
        return headings.some(h => h.textContent?.includes('Scoping'));
      });
      const cardVisible = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('[data-kanban-card]'));
        if (cards.length > 0) return true;
        // Fallback: detect by class pattern
        const divs = Array.from(document.querySelectorAll('div'));
        return divs.some(div => (div.className || '').includes('hover:shadow-md') && div.textContent?.includes('REQ-'));
      });

      if (!columnVisible) {
        recordResult('Kanban board displays stages', 'fail', 'Kanban stage headers not found.');
      } else if (!cardVisible) {
        recordResult('Kanban board displays stages', 'fail', 'No request cards rendered on Kanban board.');
      } else {
        recordResult('Kanban board displays stages', 'pass');
      }
    } catch (error) {
      recordResult('Kanban board displays stages', 'fail', error.message);
    }

    // --- Step 10: Analytics dashboard renders ---
    try {
      await page.goto(`${baseUrl}/analytics`, { waitUntil: 'domcontentloaded' });
      await delay(2000);
      const analyticsHeading = await page.evaluate(() => {
        const headings = Array.from(document.querySelectorAll('h1'));
        return headings.some(h => h.textContent?.includes('Portfolio Analytics'));
      });
      const funnelRows = await page.evaluate(() => {
        const labels = Array.from(document.querySelectorAll('div'));
        return labels.filter(div => div.textContent?.includes('Scoping')).length > 0;
      });

      if (!analyticsHeading) {
        recordResult('Analytics dashboard displays metrics', 'fail', 'Portfolio Analytics heading not found.');
      } else if (!funnelRows) {
        recordResult('Analytics dashboard displays metrics', 'fail', 'Funnel data rows not rendered.');
      } else {
        recordResult('Analytics dashboard displays metrics', 'pass');
      }
    } catch (error) {
      recordResult('Analytics dashboard displays metrics', 'fail', error.message);
    }

    // Ensure REQ-002 is reset to Ready for Dev before developer flow
    try {
      await fetch(`${apiHost}/api/requests/REQ-002`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: 'Ready for Dev',
          owner: 'Sarah Chen',
          lastUpdate: 'Reset for smoke test',
          activity: []
        })
      });
    } catch (error) {
      console.warn('Failed to reset REQ-002 state before developer flow:', error);
    }

    // --- Step 11: Developer can move request to In Progress ---
    try {
      await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'domcontentloaded' });
      await delay(3000);

      const switchedDev = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const target = buttons.find(btn => btn.textContent?.trim() === 'Developer');
        if (target instanceof HTMLElement) {
          target.click();
          return true;
        }
        return false;
      });

      await delay(1000);

      const devActive = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const target = buttons.find(btn => btn.textContent?.trim() === 'Developer');
        if (target instanceof HTMLElement) {
          return target.className.includes('bg-white');
        }
        return false;
      });

      if (!switchedDev || !devActive) {
        recordResult('Developer can start work on Ready for Dev request', 'fail', 'Developer view toggle unavailable.');
      } else {
        const clickedReq = await page.evaluate(() => {
          const cells = Array.from(document.querySelectorAll('td'));
          const target = cells.find(td => td.textContent?.includes('REQ-002'));
          if (target) {
            const row = target.closest('tr');
            if (row instanceof HTMLElement) {
              row.click();
              return true;
            }
          }
          return false;
        });

        if (!clickedReq) {
          recordResult('Developer can start work on Ready for Dev request', 'fail', 'Could not open REQ-002 from dashboard.');
        } else {
          await page.waitForFunction(() => window.location.pathname.includes('/request/'), { timeout: 5000 });
          await delay(1000);

          const acceptButtonFound = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            return buttons.some(btn => btn.textContent?.includes('Accept & Start Work'));
          });

          if (!acceptButtonFound) {
            recordResult('Developer can start work on Ready for Dev request', 'fail', 'Accept & Start Work button not visible.');
          } else {
            const clickedAccept = await page.evaluate(() => {
              const buttons = Array.from(document.querySelectorAll('button'));
              const target = buttons.find(btn => btn.textContent?.includes('Accept & Start Work'));
              if (target instanceof HTMLElement) {
                target.click();
                return true;
              }
              return false;
            });

            if (!clickedAccept) {
              recordResult('Developer can start work on Ready for Dev request', 'fail', 'Failed to click Accept & Start Work button.');
            } else {
              const stageUpdated = await page
                .waitForFunction(
                  () => {
                    const spans = Array.from(document.querySelectorAll('span'));
                    return spans.some(span => span.textContent === 'In Progress');
                  },
                  { timeout: 10000 }
                )
                .then(() => true)
                .catch(() => false);

              if (!stageUpdated) {
                recordResult('Developer can start work on Ready for Dev request', 'fail', 'Stage badge did not update to In Progress.');
              } else {
                recordResult('Developer can start work on Ready for Dev request', 'pass');
              }
            }
          }
        }
      }
    } catch (error) {
      recordResult('Developer can start work on Ready for Dev request', 'fail', error.message);
    }
  } finally {
    await browser.close();

    const failures = results.filter(result => result.status === 'fail');
    console.log('--- Smoke Test Results ---');
    for (const result of results) {
      const statusIcon = result.status === 'pass' ? '✅' : '❌';
      console.log(`${statusIcon} ${result.step}${result.details ? ` – ${result.details}` : ''}`);
    }

    if (consoleErrors.length > 0) {
      console.log('\nBrowser console errors:');
      consoleErrors.forEach((msg, idx) => {
        console.log(`  ${idx + 1}. ${msg}`);
      });
    }

    if (pageErrors.length > 0) {
      console.log('\nPage runtime errors:');
      pageErrors.forEach((msg, idx) => {
        console.log(`  ${idx + 1}. ${msg}`);
      });
    }

    const networkIssues = [...apiFailures, ...requestFailures];
    if (networkIssues.length > 0) {
      console.log('\nAPI call issues:');
      networkIssues.forEach((entry, idx) => {
        console.log(`  ${idx + 1}. ${formatFailure(entry)}`);
      });
    }

    if (failures.length > 0 || consoleErrors.length > 0 || pageErrors.length > 0 || networkIssues.length > 0) {
      process.exitCode = 1;
    }
  }
}

run().catch(error => {
  console.error('Smoke test runner crashed:', error);
  process.exitCode = 1;
});
