# UX Experience Refresh & QA Baseline

**Date**: October 11, 2025  
**Status**: ✅ Complete  
**Branch**: `feature/ux-improvements`

## Overview
We modernised the persona flows and hardened quality signals ahead of the next release. The work pairs a richer product experience with foundational end-to-end coverage so future iterations have fast feedback.

## What Changed
- **Persona-aware navigation & persistence**  
  - `src/contexts/AppContext.tsx` now stores the active persona in localStorage so users return to their preferred lens.  
  - `src/components/layout/TabNavigation.tsx` renders tailored entry points (Requester: Submit + Dashboard, Ops personas: Dashboard + Kanban + Analytics).
- **Request operations are role-smart**  
  - `src/hooks/useRequests.ts` assigns owners automatically when Developers start work, records activity logs, and exposes a `reloadRequests` helper for retry UX.  
  - `src/features/dashboard/components/RequestTable.tsx` conditionally reveals requester context for Dev/Management personas so they can triage faster.
- **Analytics fed by real request data**  
  - `src/pages/AnalyticsPage.tsx` now calculates funnel counts, bottlenecks, SLA adherence, and cycle-time metrics directly from persisted requests instead of static placeholders.
- **Document automation is resilient**  
  - `src/hooks/useDocuments.ts` persists generated artifacts via the SQLite API, batches autosaves, tracks approval metadata, and falls back gracefully if the assistant can’t refine content.  
  - `src/services/api.ts` adds Claude streaming support, strict validation for impact scoring, and rich fallbacks for document generation/refinement failures.
- **Backend supports the richer workflows**  
  - `server.js` seeds persona-ready data, persists document approvals, exposes CRUD endpoints for `/api/requests/:id/documents`, and proxies both standard and streaming Claude calls.
- **Baseline QA coverage**  
  - `scripts/smoke-test.js` runs a 11-step Puppeteer journey (intake → dashboard → document refinement → analytics) with defensive seeding/reset logic.  
  - `tests/e2e/landing.spec.ts` introduces Playwright smoke coverage for the landing and request detail flows. `package.json` exposes the runner as `npm run smoke:test`.

## Next Steps
1. Wire the Puppeteer smoke test into CI with seeded DB resets so regressions fail the pipeline automatically.  
2. Switch the UI to the streaming document generation API once the front-end progress UI is ready.  
3. Expand Playwright coverage to developer handoffs and analytics assertions to complement the smoke baseline.  
4. Capture real performance timings from the smoke script (Lighthouse or Navigation Timing) so we can trend UX improvements.

