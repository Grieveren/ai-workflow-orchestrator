import type { Request, ViewType, Priority } from '../types';
import { MOCK_USERS } from '../constants/users';

/**
 * Priority ranking for sorting (higher number = higher priority)
 */
const PRIORITY_RANK: Record<Priority, number> = {
  High: 3,
  Medium: 2,
  Low: 1
};

/**
 * Sort requests by priority (High → Medium → Low), then by creation date (newest first)
 *
 * @param requests - Array of requests to sort
 * @returns Sorted array with High priority first, then by newest
 */
export function sortRequestsByPriority(requests: Request[]): Request[] {
  return [...requests].sort((a, b) => {
    // First, sort by priority (descending: High → Medium → Low)
    const priorityDiff = PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // If same priority, sort by creation date (newest first)
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });
}

/**
 * Filter requests based on the current view and user role
 *
 * @param requests - Array of all requests
 * @param view - Current view type (requester/dev/management)
 * @returns Filtered array of requests based on view permissions
 */
export function filterRequestsByView(
  requests: Request[],
  view: ViewType
): Request[] {
  return requests.filter(request => {
    if (view === 'requester') {
      // Requesters see only their submitted requests
      return request.submittedBy === MOCK_USERS.REQUESTER;
    } else if (view === 'dev') {
      // Developers see assigned requests OR available work (Ready for Dev)
      return request.owner === MOCK_USERS.DEV || request.stage === 'Ready for Dev';
    } else if (view === 'management') {
      // Management sees everything
      return true;
    }
    return true;
  });
}

/**
 * Get the current user name based on view type
 *
 * @param view - Current view type (requester/dev/management)
 * @returns User name for requester/dev views, undefined for management
 */
export function getCurrentUser(view: ViewType): string | undefined {
  if (view === 'requester') return MOCK_USERS.REQUESTER;
  if (view === 'dev') return MOCK_USERS.DEV;
  return undefined;
}
