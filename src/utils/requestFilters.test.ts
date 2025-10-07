import { describe, it, expect } from 'vitest';
import {
  sortRequestsByPriority,
  sortRequestsByImpact,
  filterRequestsByView,
  getCurrentUser
} from './requestFilters';
import type { Request, ImpactAssessment, Priority } from '../types';
import { MOCK_USERS } from '../constants/users';

// Mock request factory with extended options
const createMockRequest = (
  id: string,
  priority: Priority = 'Medium',
  createdAt?: string,
  impactAssessment?: ImpactAssessment,
  owner?: string,
  submittedBy?: string,
  stage?: Request['stage']
): Request => ({
  id,
  title: `Test Request ${id}`,
  status: 'Open',
  owner: owner || 'Sarah Chen',
  submittedBy,
  priority,
  clarityScore: 8,
  daysOpen: 5,
  stage: stage || 'Scoping',
  lastUpdate: '2025-01-15',
  createdAt,
  impactAssessment
});

// Mock impact assessment factory
const createMockAssessment = (totalScore: number, tier: 1 | 2 | 3 = 1): ImpactAssessment => ({
  totalScore,
  breakdown: {
    revenueImpact: 20,
    userReach: 15,
    strategicAlignment: 10,
    urgency: 10,
    quickWinBonus: totalScore - 55
  },
  tier,
  assessedAt: '2025-01-15T10:00:00Z',
  assessedBy: 'AI',
  justification: 'High business value'
});

describe('sortRequestsByPriority', () => {
  it('sorts requests by priority (High → Medium → Low)', () => {
    const requests = [
      createMockRequest('REQ-001', 'Low'),
      createMockRequest('REQ-002', 'High'),
      createMockRequest('REQ-003', 'Medium')
    ];

    const sorted = sortRequestsByPriority(requests);

    expect(sorted[0].priority).toBe('High');
    expect(sorted[1].priority).toBe('Medium');
    expect(sorted[2].priority).toBe('Low');
  });

  it('sorts by creation date when priorities are equal', () => {
    const requests = [
      createMockRequest('REQ-001', 'High', '2025-01-10'),
      createMockRequest('REQ-002', 'High', '2025-01-15'),
      createMockRequest('REQ-003', 'High', '2025-01-12')
    ];

    const sorted = sortRequestsByPriority(requests);

    expect(sorted[0].createdAt).toBe('2025-01-15'); // Newest first
    expect(sorted[1].createdAt).toBe('2025-01-12');
    expect(sorted[2].createdAt).toBe('2025-01-10');
  });

  it('handles requests without createdAt (treats as epoch 0)', () => {
    const requests = [
      createMockRequest('REQ-001', 'High', '2025-01-15'),
      createMockRequest('REQ-002', 'High'),
      createMockRequest('REQ-003', 'High', '2025-01-10')
    ];

    const sorted = sortRequestsByPriority(requests);

    expect(sorted[0].createdAt).toBe('2025-01-15');
    expect(sorted[1].createdAt).toBe('2025-01-10');
    expect(sorted[2].createdAt).toBeUndefined();
  });

  it('handles empty array', () => {
    const requests: Request[] = [];

    const sorted = sortRequestsByPriority(requests);

    expect(sorted).toEqual([]);
  });

  it('handles single request', () => {
    const requests = [createMockRequest('REQ-001', 'High')];

    const sorted = sortRequestsByPriority(requests);

    expect(sorted).toHaveLength(1);
    expect(sorted[0].id).toBe('REQ-001');
  });

  it('preserves original array (does not mutate)', () => {
    const requests = [
      createMockRequest('REQ-001', 'Low'),
      createMockRequest('REQ-002', 'High')
    ];

    const original = [...requests];
    sortRequestsByPriority(requests);

    expect(requests).toEqual(original);
  });

  it('handles all same priority and date', () => {
    const requests = [
      createMockRequest('REQ-001', 'Medium', '2025-01-15'),
      createMockRequest('REQ-002', 'Medium', '2025-01-15'),
      createMockRequest('REQ-003', 'Medium', '2025-01-15')
    ];

    const sorted = sortRequestsByPriority(requests);

    expect(sorted).toHaveLength(3);
    expect(sorted.every(r => r.priority === 'Medium')).toBe(true);
  });
});

describe('sortRequestsByImpact', () => {
  describe('Impact Score Sorting', () => {
    it('sorts assessed requests by impact score (descending)', () => {
      const requests = [
        createMockRequest('REQ-001', 'Medium', undefined, createMockAssessment(60)),
        createMockRequest('REQ-002', 'Medium', undefined, createMockAssessment(85)),
        createMockRequest('REQ-003', 'Medium', undefined, createMockAssessment(70))
      ];

      const sorted = sortRequestsByImpact(requests);

      expect(sorted[0].impactAssessment?.totalScore).toBe(85);
      expect(sorted[1].impactAssessment?.totalScore).toBe(70);
      expect(sorted[2].impactAssessment?.totalScore).toBe(60);
    });

    it('places assessed requests before unassessed', () => {
      const requests = [
        createMockRequest('REQ-001'),
        createMockRequest('REQ-002', 'Medium', undefined, createMockAssessment(60)),
        createMockRequest('REQ-003')
      ];

      const sorted = sortRequestsByImpact(requests);

      expect(sorted[0].impactAssessment?.totalScore).toBe(60);
      expect(sorted[1].impactAssessment).toBeUndefined();
      expect(sorted[2].impactAssessment).toBeUndefined();
    });

    it('handles all unassessed requests', () => {
      const requests = [
        createMockRequest('REQ-001'),
        createMockRequest('REQ-002'),
        createMockRequest('REQ-003')
      ];

      const sorted = sortRequestsByImpact(requests);

      expect(sorted).toHaveLength(3);
      expect(sorted.every(r => !r.impactAssessment)).toBe(true);
    });

    it('handles all assessed requests', () => {
      const requests = [
        createMockRequest('REQ-001', 'Medium', undefined, createMockAssessment(50)),
        createMockRequest('REQ-002', 'Medium', undefined, createMockAssessment(90)),
        createMockRequest('REQ-003', 'Medium', undefined, createMockAssessment(70))
      ];

      const sorted = sortRequestsByImpact(requests);

      expect(sorted[0].impactAssessment?.totalScore).toBe(90);
      expect(sorted[1].impactAssessment?.totalScore).toBe(70);
      expect(sorted[2].impactAssessment?.totalScore).toBe(50);
    });
  });

  describe('Priority Fallback', () => {
    it('uses priority as tie-breaker when impact scores are equal', () => {
      const requests = [
        createMockRequest('REQ-001', 'Low', undefined, createMockAssessment(70)),
        createMockRequest('REQ-002', 'High', undefined, createMockAssessment(70)),
        createMockRequest('REQ-003', 'Medium', undefined, createMockAssessment(70))
      ];

      const sorted = sortRequestsByImpact(requests);

      expect(sorted[0].priority).toBe('High');
      expect(sorted[1].priority).toBe('Medium');
      expect(sorted[2].priority).toBe('Low');
    });

    it('sorts unassessed requests by priority', () => {
      const requests = [
        createMockRequest('REQ-001', 'Low'),
        createMockRequest('REQ-002', 'High'),
        createMockRequest('REQ-003', 'Medium')
      ];

      const sorted = sortRequestsByImpact(requests);

      expect(sorted[0].priority).toBe('High');
      expect(sorted[1].priority).toBe('Medium');
      expect(sorted[2].priority).toBe('Low');
    });
  });

  describe('Date Fallback', () => {
    it('uses creation date as final tie-breaker', () => {
      const requests = [
        createMockRequest('REQ-001', 'High', '2025-01-10', createMockAssessment(70)),
        createMockRequest('REQ-002', 'High', '2025-01-15', createMockAssessment(70)),
        createMockRequest('REQ-003', 'High', '2025-01-12', createMockAssessment(70))
      ];

      const sorted = sortRequestsByImpact(requests);

      expect(sorted[0].createdAt).toBe('2025-01-15'); // Newest first
      expect(sorted[1].createdAt).toBe('2025-01-12');
      expect(sorted[2].createdAt).toBe('2025-01-10');
    });

    it('handles missing createdAt in tie-breaking', () => {
      const requests = [
        createMockRequest('REQ-001', 'High', undefined, createMockAssessment(70)),
        createMockRequest('REQ-002', 'High', '2025-01-15', createMockAssessment(70))
      ];

      const sorted = sortRequestsByImpact(requests);

      expect(sorted[0].createdAt).toBe('2025-01-15');
      expect(sorted[1].createdAt).toBeUndefined();
    });
  });

  describe('Multi-Level Sorting', () => {
    it('correctly applies all three levels (impact → priority → date)', () => {
      const requests = [
        createMockRequest('REQ-001', 'Low', '2025-01-10', createMockAssessment(70)),
        createMockRequest('REQ-002', 'High', '2025-01-12'),
        createMockRequest('REQ-003', 'High', '2025-01-15', createMockAssessment(85)),
        createMockRequest('REQ-004', 'Medium', '2025-01-14', createMockAssessment(70)),
        createMockRequest('REQ-005', 'Low', '2025-01-11')
      ];

      const sorted = sortRequestsByImpact(requests);

      // 1. Assessed first (REQ-003, REQ-001, REQ-004 by impact score)
      expect(sorted[0].id).toBe('REQ-003'); // Score: 85
      expect(sorted[1].id).toBe('REQ-004'); // Score: 70, Priority: Medium
      expect(sorted[2].id).toBe('REQ-001'); // Score: 70, Priority: Low
      // 2. Unassessed next (REQ-002, REQ-005 by priority)
      expect(sorted[3].id).toBe('REQ-002'); // Priority: High
      expect(sorted[4].id).toBe('REQ-005'); // Priority: Low
    });
  });

  describe('Edge Cases', () => {
    it('handles empty array', () => {
      const requests: Request[] = [];

      const sorted = sortRequestsByImpact(requests);

      expect(sorted).toEqual([]);
    });

    it('handles single request', () => {
      const requests = [createMockRequest('REQ-001', 'High', undefined, createMockAssessment(85))];

      const sorted = sortRequestsByImpact(requests);

      expect(sorted).toHaveLength(1);
      expect(sorted[0].id).toBe('REQ-001');
    });

    it('preserves original array (does not mutate)', () => {
      const requests = [
        createMockRequest('REQ-001', 'Low', undefined, createMockAssessment(60)),
        createMockRequest('REQ-002', 'High', undefined, createMockAssessment(85))
      ];

      const original = [...requests];
      sortRequestsByImpact(requests);

      expect(requests).toEqual(original);
    });

    it('handles boundary impact scores', () => {
      const requests = [
        createMockRequest('REQ-001', 'Medium', undefined, createMockAssessment(0)),
        createMockRequest('REQ-002', 'Medium', undefined, createMockAssessment(100)),
        createMockRequest('REQ-003', 'Medium', undefined, createMockAssessment(50))
      ];

      const sorted = sortRequestsByImpact(requests);

      expect(sorted[0].impactAssessment?.totalScore).toBe(100);
      expect(sorted[1].impactAssessment?.totalScore).toBe(50);
      expect(sorted[2].impactAssessment?.totalScore).toBe(0);
    });
  });
});

describe('filterRequestsByView', () => {
  describe('Requester View', () => {
    it('shows only requests submitted by the requester', () => {
      const requests = [
        createMockRequest('REQ-001', 'High', undefined, undefined, 'Sarah Chen', MOCK_USERS.REQUESTER),
        createMockRequest('REQ-002', 'High', undefined, undefined, 'Sarah Chen', 'Other User'),
        createMockRequest('REQ-003', 'High', undefined, undefined, 'Sarah Chen', MOCK_USERS.REQUESTER)
      ];

      const filtered = filterRequestsByView(requests, 'requester');

      expect(filtered).toHaveLength(2);
      expect(filtered.every(r => r.submittedBy === MOCK_USERS.REQUESTER)).toBe(true);
    });

    it('returns empty array when requester has no requests', () => {
      const requests = [
        createMockRequest('REQ-001', 'High', undefined, undefined, 'Sarah Chen', 'Other User')
      ];

      const filtered = filterRequestsByView(requests, 'requester');

      expect(filtered).toEqual([]);
    });
  });

  describe('Product Owner View', () => {
    it('shows only requests in Scoping stage', () => {
      const requests = [
        createMockRequest('REQ-001', 'High', undefined, undefined, 'Sarah Chen', undefined, 'Scoping'),
        createMockRequest('REQ-002', 'High', undefined, undefined, 'Sarah Chen', undefined, 'Ready for Dev'),
        createMockRequest('REQ-003', 'High', undefined, undefined, 'Sarah Chen', undefined, 'Scoping')
      ];

      const filtered = filterRequestsByView(requests, 'product-owner');

      expect(filtered).toHaveLength(2);
      expect(filtered.every(r => r.stage === 'Scoping')).toBe(true);
    });

    it('returns empty array when no requests in Scoping', () => {
      const requests = [
        createMockRequest('REQ-001', 'High', undefined, undefined, 'Sarah Chen', undefined, 'Ready for Dev')
      ];

      const filtered = filterRequestsByView(requests, 'product-owner');

      expect(filtered).toEqual([]);
    });
  });

  describe('Developer View', () => {
    it('shows assigned requests', () => {
      const requests = [
        createMockRequest('REQ-001', 'High', undefined, undefined, MOCK_USERS.DEV),
        createMockRequest('REQ-002', 'High', undefined, undefined, 'Other Dev')
      ];

      const filtered = filterRequestsByView(requests, 'dev');

      expect(filtered).toHaveLength(1);
      expect(filtered[0].owner).toBe(MOCK_USERS.DEV);
    });

    it('shows available work (Ready for Dev stage)', () => {
      const requests = [
        createMockRequest('REQ-001', 'High', undefined, undefined, 'Other Dev', undefined, 'Ready for Dev'),
        createMockRequest('REQ-002', 'High', undefined, undefined, 'Other Dev', undefined, 'In Progress')
      ];

      const filtered = filterRequestsByView(requests, 'dev');

      expect(filtered).toHaveLength(1);
      expect(filtered[0].stage).toBe('Ready for Dev');
    });

    it('shows both assigned requests and available work', () => {
      const requests = [
        createMockRequest('REQ-001', 'High', undefined, undefined, MOCK_USERS.DEV, undefined, 'In Progress'),
        createMockRequest('REQ-002', 'High', undefined, undefined, 'Other Dev', undefined, 'Ready for Dev'),
        createMockRequest('REQ-003', 'High', undefined, undefined, 'Other Dev', undefined, 'Completed')
      ];

      const filtered = filterRequestsByView(requests, 'dev');

      expect(filtered).toHaveLength(2);
      expect(filtered[0].owner).toBe(MOCK_USERS.DEV);
      expect(filtered[1].stage).toBe('Ready for Dev');
    });
  });

  describe('Management View', () => {
    it('shows all requests', () => {
      const requests = [
        createMockRequest('REQ-001', 'High', undefined, undefined, MOCK_USERS.DEV, MOCK_USERS.REQUESTER),
        createMockRequest('REQ-002', 'High', undefined, undefined, 'Other Dev', 'Other User'),
        createMockRequest('REQ-003', 'High', undefined, undefined, 'Another Dev', 'Another User')
      ];

      const filtered = filterRequestsByView(requests, 'management');

      expect(filtered).toEqual(requests);
    });

    it('returns all requests regardless of stage or owner', () => {
      const requests = [
        createMockRequest('REQ-001', 'High', undefined, undefined, 'Dev 1', 'User 1', 'Scoping'),
        createMockRequest('REQ-002', 'High', undefined, undefined, 'Dev 2', 'User 2', 'Ready for Dev'),
        createMockRequest('REQ-003', 'High', undefined, undefined, 'Dev 3', 'User 3', 'Completed')
      ];

      const filtered = filterRequestsByView(requests, 'management');

      expect(filtered).toHaveLength(3);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty array', () => {
      const requests: Request[] = [];

      const filtered = filterRequestsByView(requests, 'requester');

      expect(filtered).toEqual([]);
    });

    it('handles requests without submittedBy (requester view)', () => {
      const requests = [
        createMockRequest('REQ-001', 'High')
      ];

      const filtered = filterRequestsByView(requests, 'requester');

      expect(filtered).toEqual([]);
    });

    it('does not mutate original array', () => {
      const requests = [
        createMockRequest('REQ-001', 'High', undefined, undefined, MOCK_USERS.DEV),
        createMockRequest('REQ-002', 'High', undefined, undefined, 'Other Dev')
      ];

      const original = [...requests];
      filterRequestsByView(requests, 'dev');

      expect(requests).toEqual(original);
    });
  });
});

describe('getCurrentUser', () => {
  it('returns requester user name for requester view', () => {
    expect(getCurrentUser('requester')).toBe(MOCK_USERS.REQUESTER);
  });

  it('returns product owner user name for product-owner view', () => {
    expect(getCurrentUser('product-owner')).toBe(MOCK_USERS.PRODUCT_OWNER);
  });

  it('returns developer user name for dev view', () => {
    expect(getCurrentUser('dev')).toBe(MOCK_USERS.DEV);
  });

  it('returns undefined for management view', () => {
    expect(getCurrentUser('management')).toBeUndefined();
  });
});
