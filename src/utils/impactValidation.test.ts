import { describe, it, expect } from 'vitest';
import {
  validateImpactScore,
  getImpactScore,
  getImpactTier,
  hasImpactAssessment,
  getImpactBadgeVariant,
  isQuickWin,
  sortByImpactScore
} from './impactValidation';
import type { Request, ImpactAssessment } from '../types';

// Mock request factory
const createMockRequest = (
  impactAssessment?: ImpactAssessment,
  complexity?: 'simple' | 'medium' | 'complex'
): Request => ({
  id: 'REQ-001',
  title: 'Test Request',
  status: 'Open',
  owner: 'Sarah Chen',
  priority: 'Medium',
  clarityScore: 8,
  daysOpen: 5,
  stage: 'Scoping',
  lastUpdate: '2025-01-15',
  complexity,
  impactAssessment
});

// Mock impact assessment factory
const createMockAssessment = (
  totalScore: number,
  tier: 1 | 2 | 3 = 1,
  breakdown?: ImpactAssessment['breakdown']
): ImpactAssessment => ({
  totalScore,
  breakdown: breakdown || {
    revenueImpact: 20,
    userReach: 15,
    strategicAlignment: 10,
    urgency: 10,
    quickWinBonus: totalScore - 55 // Adjust to match totalScore
  },
  tier,
  assessedAt: '2025-01-15T10:00:00Z',
  assessedBy: 'AI',
  justification: 'High business value with significant user reach'
});

describe('validateImpactScore', () => {
  it('returns true when breakdown sums to totalScore', () => {
    const assessment = createMockAssessment(85, 1, {
      revenueImpact: 25,
      userReach: 20,
      strategicAlignment: 15,
      urgency: 15,
      quickWinBonus: 10
    });

    expect(validateImpactScore(assessment)).toBe(true);
  });

  it('returns false when breakdown does not sum to totalScore', () => {
    const assessment = createMockAssessment(85, 1, {
      revenueImpact: 25,
      userReach: 20,
      strategicAlignment: 15,
      urgency: 10, // Should be 15 to sum to 85
      quickWinBonus: 10
    });

    expect(validateImpactScore(assessment)).toBe(false);
  });

  it('handles floating point precision with 0.01 tolerance', () => {
    const assessment = createMockAssessment(85.005, 1, {
      revenueImpact: 25,
      userReach: 20.002,
      strategicAlignment: 15,
      urgency: 15,
      quickWinBonus: 10.003
    });

    // Sum = 85.005, totalScore = 85.005 (within tolerance)
    expect(validateImpactScore(assessment)).toBe(true);
  });

  it('rejects scores outside 0.01 tolerance', () => {
    const assessment = createMockAssessment(85, 1, {
      revenueImpact: 25,
      userReach: 20,
      strategicAlignment: 15,
      urgency: 15,
      quickWinBonus: 10.02 // Sum = 85.02 (outside tolerance)
    });

    expect(validateImpactScore(assessment)).toBe(false);
  });

  it('validates score of 0', () => {
    const assessment = createMockAssessment(0, 3, {
      revenueImpact: 0,
      userReach: 0,
      strategicAlignment: 0,
      urgency: 0,
      quickWinBonus: 0
    });

    expect(validateImpactScore(assessment)).toBe(true);
  });

  it('validates maximum score of 100', () => {
    const assessment = createMockAssessment(100, 1, {
      revenueImpact: 30,
      userReach: 25,
      strategicAlignment: 20,
      urgency: 15,
      quickWinBonus: 10
    });

    expect(validateImpactScore(assessment)).toBe(true);
  });
});

describe('getImpactScore', () => {
  it('returns score from assessment when present', () => {
    const request = createMockRequest(createMockAssessment(85, 1));

    expect(getImpactScore(request)).toBe(85);
  });

  it('returns 0 when assessment is undefined', () => {
    const request = createMockRequest();

    expect(getImpactScore(request)).toBe(0);
  });

  it('returns 0 for score of 0', () => {
    const request = createMockRequest(createMockAssessment(0, 3));

    expect(getImpactScore(request)).toBe(0);
  });

  it('returns correct score for maximum value', () => {
    const request = createMockRequest(createMockAssessment(100, 1));

    expect(getImpactScore(request)).toBe(100);
  });

  it('returns correct score for fractional values', () => {
    const request = createMockRequest(createMockAssessment(85.5, 1));

    expect(getImpactScore(request)).toBe(85.5);
  });
});

describe('getImpactTier', () => {
  it('returns tier from assessment when present', () => {
    const request = createMockRequest(createMockAssessment(85, 1));

    expect(getImpactTier(request)).toBe(1);
  });

  it('returns null when assessment is undefined', () => {
    const request = createMockRequest();

    expect(getImpactTier(request)).toBeNull();
  });

  it('returns tier 1 for AI-assessed high impact', () => {
    const request = createMockRequest(createMockAssessment(90, 1));

    expect(getImpactTier(request)).toBe(1);
  });

  it('returns tier 2 for manually assessed medium impact', () => {
    const request = createMockRequest(createMockAssessment(70, 2));

    expect(getImpactTier(request)).toBe(2);
  });

  it('returns tier 3 for business case low impact', () => {
    const request = createMockRequest(createMockAssessment(45, 3));

    expect(getImpactTier(request)).toBe(3);
  });
});

describe('hasImpactAssessment', () => {
  it('returns true when assessment is present', () => {
    const request = createMockRequest(createMockAssessment(85, 1));

    expect(hasImpactAssessment(request)).toBe(true);
  });

  it('returns false when assessment is undefined', () => {
    const request = createMockRequest();

    expect(hasImpactAssessment(request)).toBe(false);
  });

  it('enables TypeScript narrowing for safe access', () => {
    const request = createMockRequest(createMockAssessment(85, 1));

    if (hasImpactAssessment(request)) {
      // TypeScript should allow direct access without optional chaining
      expect(request.impactAssessment.totalScore).toBe(85);
      expect(request.impactAssessment.tier).toBe(1);
    }
  });

  it('correctly identifies request with score of 0 as assessed', () => {
    const request = createMockRequest(createMockAssessment(0, 3));

    expect(hasImpactAssessment(request)).toBe(true);
  });
});

describe('getImpactBadgeVariant', () => {
  it('returns "none" for unassessed requests', () => {
    const request = createMockRequest();

    expect(getImpactBadgeVariant(request)).toBe('none');
  });

  it('returns "high" for score >= 80', () => {
    const request = createMockRequest(createMockAssessment(85, 1));

    expect(getImpactBadgeVariant(request)).toBe('high');
  });

  it('returns "high" for score exactly 80', () => {
    const request = createMockRequest(createMockAssessment(80, 1));

    expect(getImpactBadgeVariant(request)).toBe('high');
  });

  it('returns "medium" for score 60-79', () => {
    const request = createMockRequest(createMockAssessment(70, 2));

    expect(getImpactBadgeVariant(request)).toBe('medium');
  });

  it('returns "medium" for score exactly 60', () => {
    const request = createMockRequest(createMockAssessment(60, 2));

    expect(getImpactBadgeVariant(request)).toBe('medium');
  });

  it('returns "low" for score < 60', () => {
    const request = createMockRequest(createMockAssessment(45, 3));

    expect(getImpactBadgeVariant(request)).toBe('low');
  });

  it('returns "low" for score of 0', () => {
    const request = createMockRequest(createMockAssessment(0, 3));

    expect(getImpactBadgeVariant(request)).toBe('low');
  });

  it('returns "high" for maximum score of 100', () => {
    const request = createMockRequest(createMockAssessment(100, 1));

    expect(getImpactBadgeVariant(request)).toBe('high');
  });

  it('correctly classifies boundary value 59 as low', () => {
    const request = createMockRequest(createMockAssessment(59, 3));

    expect(getImpactBadgeVariant(request)).toBe('low');
  });

  it('correctly classifies boundary value 79 as medium', () => {
    const request = createMockRequest(createMockAssessment(79, 2));

    expect(getImpactBadgeVariant(request)).toBe('medium');
  });
});

describe('isQuickWin', () => {
  it('returns true for high impact (>70) and simple complexity', () => {
    const request = createMockRequest(createMockAssessment(85, 1), 'simple');

    expect(isQuickWin(request)).toBe(true);
  });

  it('returns false for unassessed requests', () => {
    const request = createMockRequest(undefined, 'simple');

    expect(isQuickWin(request)).toBe(false);
  });

  it('returns false for high impact but medium complexity', () => {
    const request = createMockRequest(createMockAssessment(85, 1), 'medium');

    expect(isQuickWin(request)).toBe(false);
  });

  it('returns false for high impact but complex complexity', () => {
    const request = createMockRequest(createMockAssessment(85, 1), 'complex');

    expect(isQuickWin(request)).toBe(false);
  });

  it('returns false for simple complexity but low impact (<=70)', () => {
    const request = createMockRequest(createMockAssessment(60, 2), 'simple');

    expect(isQuickWin(request)).toBe(false);
  });

  it('returns false for score exactly 70 (requires >70)', () => {
    const request = createMockRequest(createMockAssessment(70, 2), 'simple');

    expect(isQuickWin(request)).toBe(false);
  });

  it('returns true for score 71 with simple complexity', () => {
    const request = createMockRequest(createMockAssessment(71, 1), 'simple');

    expect(isQuickWin(request)).toBe(true);
  });

  it('returns false when complexity is undefined', () => {
    const request = createMockRequest(createMockAssessment(85, 1));

    expect(isQuickWin(request)).toBe(false);
  });

  it('identifies maximum score quick win', () => {
    const request = createMockRequest(createMockAssessment(100, 1), 'simple');

    expect(isQuickWin(request)).toBe(true);
  });
});

describe('sortByImpactScore', () => {
  it('sorts assessed requests by score (descending)', () => {
    const requests = [
      createMockRequest(createMockAssessment(60, 2)),
      createMockRequest(createMockAssessment(85, 1)),
      createMockRequest(createMockAssessment(70, 2))
    ];

    const sorted = sortByImpactScore(requests);

    expect(sorted[0].impactAssessment?.totalScore).toBe(85);
    expect(sorted[1].impactAssessment?.totalScore).toBe(70);
    expect(sorted[2].impactAssessment?.totalScore).toBe(60);
  });

  it('places unassessed requests at the end', () => {
    const requests = [
      createMockRequest(createMockAssessment(60, 2)),
      createMockRequest(),
      createMockRequest(createMockAssessment(85, 1))
    ];

    const sorted = sortByImpactScore(requests);

    expect(sorted[0].impactAssessment?.totalScore).toBe(85);
    expect(sorted[1].impactAssessment?.totalScore).toBe(60);
    expect(sorted[2].impactAssessment).toBeUndefined();
  });

  it('handles all unassessed requests', () => {
    const requests = [
      createMockRequest(),
      createMockRequest(),
      createMockRequest()
    ];

    const sorted = sortByImpactScore(requests);

    expect(sorted).toHaveLength(3);
    expect(sorted.every(r => !r.impactAssessment)).toBe(true);
  });

  it('handles all assessed requests', () => {
    const requests = [
      createMockRequest(createMockAssessment(50, 3)),
      createMockRequest(createMockAssessment(90, 1)),
      createMockRequest(createMockAssessment(70, 2))
    ];

    const sorted = sortByImpactScore(requests);

    expect(sorted[0].impactAssessment?.totalScore).toBe(90);
    expect(sorted[1].impactAssessment?.totalScore).toBe(70);
    expect(sorted[2].impactAssessment?.totalScore).toBe(50);
  });

  it('handles empty array', () => {
    const requests: Request[] = [];

    const sorted = sortByImpactScore(requests);

    expect(sorted).toEqual([]);
  });

  it('handles single request', () => {
    const requests = [createMockRequest(createMockAssessment(85, 1))];

    const sorted = sortByImpactScore(requests);

    expect(sorted).toHaveLength(1);
    expect(sorted[0].impactAssessment?.totalScore).toBe(85);
  });

  it('preserves original array (does not mutate)', () => {
    const requests = [
      createMockRequest(createMockAssessment(60, 2)),
      createMockRequest(createMockAssessment(85, 1))
    ];

    const original = [...requests];
    sortByImpactScore(requests);

    expect(requests).toEqual(original);
  });

  it('handles requests with equal scores', () => {
    const requests = [
      createMockRequest(createMockAssessment(70, 2)),
      createMockRequest(createMockAssessment(70, 2)),
      createMockRequest(createMockAssessment(70, 2))
    ];

    const sorted = sortByImpactScore(requests);

    expect(sorted).toHaveLength(3);
    expect(sorted.every(r => r.impactAssessment?.totalScore === 70)).toBe(true);
  });

  it('handles mixed assessed and unassessed with multiple unassessed', () => {
    const requests = [
      createMockRequest(),
      createMockRequest(createMockAssessment(85, 1)),
      createMockRequest(),
      createMockRequest(createMockAssessment(60, 2)),
      createMockRequest()
    ];

    const sorted = sortByImpactScore(requests);

    expect(sorted[0].impactAssessment?.totalScore).toBe(85);
    expect(sorted[1].impactAssessment?.totalScore).toBe(60);
    expect(sorted[2].impactAssessment).toBeUndefined();
    expect(sorted[3].impactAssessment).toBeUndefined();
    expect(sorted[4].impactAssessment).toBeUndefined();
  });

  it('handles boundary scores correctly', () => {
    const requests = [
      createMockRequest(createMockAssessment(0, 3)),
      createMockRequest(createMockAssessment(100, 1)),
      createMockRequest(createMockAssessment(50, 2))
    ];

    const sorted = sortByImpactScore(requests);

    expect(sorted[0].impactAssessment?.totalScore).toBe(100);
    expect(sorted[1].impactAssessment?.totalScore).toBe(50);
    expect(sorted[2].impactAssessment?.totalScore).toBe(0);
  });
});
