import { useState } from 'react';
import type { Request, RequestStage, RequestData } from '../types';
import { api } from '../services/api';

// Mock initial requests data
const initialRequests: Request[] = [
  {
    id: 'REQ-001',
    title: 'Lead conversion report by region',
    status: 'In Progress',
    owner: 'Sarah Chen',
    priority: 'High',
    clarityScore: 9,
    daysOpen: 3,
    stage: 'In Progress',
    lastUpdate: '2 hours ago',
    activity: [
      { timestamp: '3 days ago', action: 'Request submitted', user: 'Jessica Martinez' },
      { timestamp: '3 days ago', action: 'Auto-routed to Sarah Chen', user: 'AI Agent' },
      { timestamp: '2 days ago', action: 'Requirements generated', user: 'Sarah Chen' },
      { timestamp: '2 days ago', action: 'Approved and sent to dev', user: 'Sarah Chen' },
      { timestamp: '2 hours ago', action: 'Status updated: 60% complete', user: 'Sarah Chen' }
    ]
  },
  {
    id: 'REQ-002',
    title: 'Salesforce automation for renewals',
    status: 'Ready for Dev',
    owner: 'Mike Torres',
    priority: 'Medium',
    clarityScore: 6,
    daysOpen: 1,
    stage: 'Ready for Dev',
    lastUpdate: '1 day ago',
    activity: [
      { timestamp: '1 day ago', action: 'Request submitted', user: 'Tom Wilson' },
      { timestamp: '1 day ago', action: 'Auto-routed to Mike Torres', user: 'AI Agent' },
      { timestamp: '1 day ago', action: 'Requirements generated', user: 'Mike Torres' }
    ]
  },
  {
    id: 'REQ-003',
    title: 'Customer health score dashboard',
    status: 'Scoping',
    owner: 'Jennifer Kim',
    priority: 'High',
    clarityScore: 8,
    daysOpen: 5,
    stage: 'Scoping',
    lastUpdate: '3 days ago',
    activity: [
      { timestamp: '5 days ago', action: 'Request submitted', user: 'Mark Stevens' },
      { timestamp: '5 days ago', action: 'Auto-routed to Jennifer Kim', user: 'AI Agent' },
      { timestamp: '3 days ago', action: 'AI reminder sent: No activity for 48 hours', user: 'AI Agent' }
    ],
    aiAlert: 'No activity for 3 days - may be stalled'
  }
];

/**
 * Custom hook for managing requests state and operations
 */
export function useRequests() {
  const [requests, setRequests] = useState<Request[]>(initialRequests);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  /**
   * Add a new request to the list
   */
  const addRequest = (request: Request) => {
    setRequests([request, ...requests]);
  };

  /**
   * Submit a new request with AI routing
   */
  const submitRequest = async (requestData: RequestData): Promise<Request | null> => {
    try {
      const routing = await api.routeRequest(requestData);

      const newRequest: Request = {
        id: `REQ-${String(requests.length + 1).padStart(3, '0')}`,
        title: requestData.title || 'New Request',
        status: 'Scoping',
        owner: routing.owner,
        priority: routing.priority,
        clarityScore: 9,
        daysOpen: 0,
        stage: 'Scoping' as RequestStage,
        lastUpdate: 'Just now',
        timeline: routing.timeline
      };

      addRequest(newRequest);
      return newRequest;
    } catch (error) {
      console.error('Routing error:', error);
      return null;
    }
  };

  /**
   * Update a request's stage and add activity log entry
   */
  const updateRequestStage = (requestId: string, newStage: RequestStage, note: string, user?: string) => {
    setRequests(requests.map(req => {
      if (req.id === requestId) {
        const activity = [...(req.activity || []), {
          timestamp: 'Just now',
          action: note,
          user: user || 'User'
        }];
        return {
          ...req,
          stage: newStage,
          lastUpdate: 'Just now',
          activity,
          aiAlert: null
        };
      }
      return req;
    }));

    // Also update selectedRequest if it's the one being updated
    if (selectedRequest?.id === requestId) {
      const updated = requests.find(r => r.id === requestId);
      if (updated) {
        setSelectedRequest({
          ...updated,
          stage: newStage,
          lastUpdate: 'Just now',
          aiAlert: null
        });
      }
    }
  };

  /**
   * View request details (opens detail view)
   */
  const viewRequestDetail = (request: Request) => {
    console.log('viewRequestDetail called for:', request.id);
    setSelectedRequest(request);
  };

  /**
   * Close request detail view
   */
  const closeRequestDetail = () => {
    setSelectedRequest(null);
  };

  /**
   * Dismiss AI alert on a request
   */
  const dismissAlert = (requestId: string) => {
    setRequests(requests.map(r =>
      r.id === requestId ? { ...r, aiAlert: null } : r
    ));

    if (selectedRequest?.id === requestId) {
      setSelectedRequest({ ...selectedRequest, aiAlert: null });
    }
  };

  return {
    // State
    requests,
    selectedRequest,

    // Setters
    setRequests,
    setSelectedRequest,

    // Actions
    addRequest,
    submitRequest,
    updateRequestStage,
    viewRequestDetail,
    closeRequestDetail,
    dismissAlert
  };
}
