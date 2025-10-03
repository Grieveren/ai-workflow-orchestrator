import { describe, it, expect } from 'vitest';
import { filterRequestsByView, getCurrentUser, sortRequestsByPriority } from './requestFilters';
import { MOCK_USERS } from '../constants/users';
import type { Request } from '../types';

describe('requestFilters', () => {
  const mockRequests: Request[] = [
    {
      id: 'REQ-001',
      title: 'Request by Jessica',
      status: 'Active',
      owner: 'Sarah Chen',
      submittedBy: 'Jessica Martinez',
      priority: 'High',
      clarityScore: 8,
      daysOpen: 2,
      stage: 'In Progress',
      lastUpdate: '2 hours ago',
    },
    {
      id: 'REQ-002',
      title: 'Request by John',
      status: 'Active',
      owner: 'Mike Torres',
      submittedBy: 'John Doe',
      priority: 'Medium',
      clarityScore: 7,
      daysOpen: 5,
      stage: 'Ready for Dev',
      lastUpdate: '1 day ago',
    },
    {
      id: 'REQ-003',
      title: 'Another request by Jessica',
      status: 'Completed',
      owner: 'Sarah Chen',
      submittedBy: 'Jessica Martinez',
      priority: 'Low',
      clarityScore: 9,
      daysOpen: 10,
      stage: 'Completed',
      lastUpdate: 'Just now',
    },
    {
      id: 'REQ-004',
      title: 'Ready for dev request',
      status: 'Active',
      owner: 'Unassigned',
      submittedBy: 'Jane Smith',
      priority: 'High',
      clarityScore: 8,
      daysOpen: 1,
      stage: 'Ready for Dev',
      lastUpdate: '3 hours ago',
    },
  ];

  describe('filterRequestsByView', () => {
    it('filters by submittedBy for requester view', () => {
      const filtered = filterRequestsByView(mockRequests, 'requester');

      expect(filtered).toHaveLength(2);
      expect(filtered.every(req => req.submittedBy === MOCK_USERS.REQUESTER)).toBe(true);
      expect(filtered.map(r => r.id)).toEqual(['REQ-001', 'REQ-003']);
    });

    it('filters by owner OR Ready for Dev for dev view', () => {
      const filtered = filterRequestsByView(mockRequests, 'dev');

      // Should include requests assigned to Sarah Chen OR with stage "Ready for Dev"
      // REQ-001 (owned by Sarah), REQ-002 (Ready for Dev), REQ-003 (owned by Sarah), REQ-004 (Ready for Dev)
      expect(filtered).toHaveLength(4);
      expect(filtered.map(r => r.id)).toEqual(['REQ-001', 'REQ-002', 'REQ-003', 'REQ-004']);

      // Verify logic: either owned by dev or Ready for Dev
      filtered.forEach(req => {
        const isOwnedByDev = req.owner === MOCK_USERS.DEV;
        const isReadyForDev = req.stage === 'Ready for Dev';
        expect(isOwnedByDev || isReadyForDev).toBe(true);
      });
    });

    it('returns all requests for management view', () => {
      const filtered = filterRequestsByView(mockRequests, 'management');

      expect(filtered).toHaveLength(mockRequests.length);
      expect(filtered).toEqual(mockRequests);
    });

    it('handles empty request array', () => {
      expect(filterRequestsByView([], 'requester')).toEqual([]);
      expect(filterRequestsByView([], 'dev')).toEqual([]);
      expect(filterRequestsByView([], 'management')).toEqual([]);
    });

    it('handles requests without submittedBy field', () => {
      const requestsWithoutSubmitter: Request[] = [
        {
          id: 'REQ-005',
          title: 'No submitter',
          status: 'Active',
          owner: 'Sarah Chen',
          priority: 'Medium',
          clarityScore: 7,
          daysOpen: 3,
          stage: 'In Progress',
          lastUpdate: '1 hour ago',
        },
      ];

      const filtered = filterRequestsByView(requestsWithoutSubmitter, 'requester');
      expect(filtered).toHaveLength(0);
    });
  });

  describe('getCurrentUser', () => {
    it('returns correct user for requester view', () => {
      expect(getCurrentUser('requester')).toBe(MOCK_USERS.REQUESTER);
      expect(getCurrentUser('requester')).toBe('Jessica Martinez');
    });

    it('returns correct user for dev view', () => {
      expect(getCurrentUser('dev')).toBe(MOCK_USERS.DEV);
      expect(getCurrentUser('dev')).toBe('Sarah Chen');
    });

    it('returns undefined for management view', () => {
      expect(getCurrentUser('management')).toBeUndefined();
    });
  });

  describe('sortRequestsByPriority', () => {
    it('sorts requests by priority (High → Medium → Low)', () => {
      const requests: Request[] = [
        { ...mockRequests[2], priority: 'Low', createdAt: '2025-01-01' },
        { ...mockRequests[0], priority: 'High', createdAt: '2025-01-02' },
        { ...mockRequests[1], priority: 'Medium', createdAt: '2025-01-03' }
      ];

      const sorted = sortRequestsByPriority(requests);

      expect(sorted[0].priority).toBe('High');
      expect(sorted[1].priority).toBe('Medium');
      expect(sorted[2].priority).toBe('Low');
    });

    it('sorts by creation date when priority is the same (newest first)', () => {
      const requests: Request[] = [
        { ...mockRequests[0], priority: 'High', createdAt: '2025-01-01T10:00:00Z' },
        { ...mockRequests[1], priority: 'High', createdAt: '2025-01-03T10:00:00Z' },
        { ...mockRequests[2], priority: 'High', createdAt: '2025-01-02T10:00:00Z' }
      ];

      const sorted = sortRequestsByPriority(requests);

      expect(sorted[0].createdAt).toBe('2025-01-03T10:00:00Z'); // Newest
      expect(sorted[1].createdAt).toBe('2025-01-02T10:00:00Z');
      expect(sorted[2].createdAt).toBe('2025-01-01T10:00:00Z'); // Oldest
    });

    it('maintains priority order even with mixed dates', () => {
      const requests: Request[] = [
        { ...mockRequests[0], id: 'LOW', priority: 'Low', createdAt: '2025-01-10T10:00:00Z' },
        { ...mockRequests[1], id: 'HIGH', priority: 'High', createdAt: '2025-01-01T10:00:00Z' },
        { ...mockRequests[2], id: 'MED', priority: 'Medium', createdAt: '2025-01-05T10:00:00Z' }
      ];

      const sorted = sortRequestsByPriority(requests);

      expect(sorted[0].id).toBe('HIGH'); // High priority wins despite being oldest
      expect(sorted[1].id).toBe('MED'); // Medium priority
      expect(sorted[2].id).toBe('LOW'); // Low priority even though newest
    });

    it('handles requests without createdAt field', () => {
      const requests: Request[] = [
        { ...mockRequests[0], priority: 'High', createdAt: undefined },
        { ...mockRequests[1], priority: 'High', createdAt: '2025-01-02' },
        { ...mockRequests[2], priority: 'Medium', createdAt: undefined }
      ];

      const sorted = sortRequestsByPriority(requests);

      // Should not throw error and should sort by priority
      expect(sorted[0].priority).toBe('High');
      expect(sorted[1].priority).toBe('High');
      expect(sorted[2].priority).toBe('Medium');
    });

    it('does not mutate original array', () => {
      const requests: Request[] = [
        { ...mockRequests[0], priority: 'Low', createdAt: '2025-01-01' },
        { ...mockRequests[1], priority: 'High', createdAt: '2025-01-02' }
      ];

      const originalOrder = [...requests];
      sortRequestsByPriority(requests);

      expect(requests).toEqual(originalOrder);
    });

    it('handles empty array', () => {
      const sorted = sortRequestsByPriority([]);
      expect(sorted).toEqual([]);
    });

    it('handles single request', () => {
      const requests: Request[] = [mockRequests[0]];
      const sorted = sortRequestsByPriority(requests);

      expect(sorted).toHaveLength(1);
      expect(sorted[0]).toEqual(mockRequests[0]);
    });

    it('integrates correctly with filterRequestsByView', () => {
      // Test that sorting works after filtering
      const filtered = filterRequestsByView(mockRequests, 'management');
      const sorted = sortRequestsByPriority(filtered);

      // REQ-001 is High, REQ-002 is Medium, REQ-003 is Low, REQ-004 is High
      expect(sorted[0].priority).toBe('High'); // Should be REQ-001 or REQ-004
      expect(sorted[sorted.length - 1].priority).toBe('Low'); // Should be REQ-003
    });
  });
});
