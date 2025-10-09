import '@testing-library/jest-dom';
import { expect, afterEach, beforeAll, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

const createResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });

const fetchMock = vi.fn(
  async (input: RequestInfo | URL, init?: RequestInit | undefined) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.toString();
    const method = init?.method ?? 'GET';

    if (url.includes('/api/chat')) {
      const payload =
        typeof init?.body === 'string'
          ? JSON.parse(init.body)
          : { messages: [] };
      const prompt: string =
        Array.isArray(payload.messages) && payload.messages.length > 0
          ? payload.messages.map((m: { content: string }) => m.content).join(' ')
          : '';

      type ImpactAssessmentOverride = {
        breakdown?: {
          revenueImpact?: number;
          userReach?: number;
          strategicAlignment?: number;
          urgency?: number;
          quickWinBonus?: number;
        };
        tier?: number;
        justification?: string;
      };

      const buildAssessment = (overrides: ImpactAssessmentOverride) => {
        const baseBreakdown = {
          revenueImpact: 8,
          userReach: 8,
          strategicAlignment: 8,
          urgency: 5,
          quickWinBonus: 2
        };
        const breakdown = { ...baseBreakdown, ...overrides.breakdown };
        const totalScore = Object.values(breakdown).reduce((sum, value) => sum + value, 0);
        return {
          totalScore,
          breakdown,
          tier: overrides.tier ?? 1,
          assessedAt: new Date().toISOString(),
          assessedBy: 'AI',
          justification: overrides.justification ?? 'Mocked impact assessment for testing scenarios.'
        };
      };

      let assessment = buildAssessment({});

      if (prompt.includes('conversion dashboard')) {
        assessment = buildAssessment({
          breakdown: {
            revenueImpact: 24,
            userReach: 18,
            strategicAlignment: 16,
            urgency: 12,
            quickWinBonus: 6
          },
          justification: 'Large sales team loses revenue without regional visibility; VP deadline next week.'
        });
      } else if (prompt.includes('button color')) {
        assessment = buildAssessment({
          breakdown: {
            revenueImpact: 2,
            userReach: 3,
            strategicAlignment: 2,
            urgency: 1,
            quickWinBonus: 1
          },
          justification: 'Purely cosmetic change requested by single user with no urgency.'
        });
      } else if (prompt.includes('lead assignment')) {
        assessment = buildAssessment({
          breakdown: {
            revenueImpact: 14,
            userReach: 11,
            strategicAlignment: 9,
            urgency: 6,
            quickWinBonus: 4
          },
          justification: 'Automation saves SDR hours each day with moderate urgency this quarter.'
        });
      } else if (prompt.includes('Need help with reports')) {
        assessment = buildAssessment({
          breakdown: {
            revenueImpact: 7,
            userReach: 6,
            strategicAlignment: 6,
            urgency: 5,
            quickWinBonus: 3
          },
          justification: 'Limited context provided; conservative scoring applied.'
        });
      } else if (prompt.includes('customer health score dashboard')) {
        assessment = buildAssessment({
          breakdown: {
            revenueImpact: 18,
            userReach: 14,
            strategicAlignment: 18,
            urgency: 10,
            quickWinBonus: 4
          },
          justification: 'Directly tied to churn-reduction OKR affecting entire CS team.'
        });
      } else if (prompt.includes('competitor mentions')) {
        assessment = buildAssessment({
          breakdown: {
            revenueImpact: 17,
            userReach: 20,
            strategicAlignment: 12,
            urgency: 11,
            quickWinBonus: 8
          },
          justification: 'Simple field unlocks competitive intelligence for whole sales org.'
        });
      } else if (prompt.includes('data retention policy')) {
        assessment = buildAssessment({
          breakdown: {
            revenueImpact: 12,
            userReach: 14,
            strategicAlignment: 14,
            urgency: 13,
            quickWinBonus: 3
          },
          justification: 'GDPR compliance deadline with penalty risk drives high urgency and reach.'
        });
      }

      return createResponse({
        content: [{ text: JSON.stringify(assessment) }]
      });
    }

    if (url.includes('/api/requests')) {
      if (method === 'POST') {
        const payload =
          typeof init?.body === 'string'
            ? JSON.parse(init.body)
            : {};
        return createResponse(payload);
      }

      if (method === 'PATCH' || method === 'DELETE') {
        return createResponse({ success: true });
      }

      return createResponse([]);
    }

    return createResponse({});
  }
);

beforeAll(() => {
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  cleanup();
  fetchMock.mockClear();
});

afterAll(() => {
  vi.unstubAllGlobals();
});
