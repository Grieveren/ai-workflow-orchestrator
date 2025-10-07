import { useState } from 'react';
import type { Request, RequestStage, RequestData, ChatMessage, ImpactAssessment } from '../types';
import { api } from '../services/api';
import { MOCK_USERS } from '../constants/users';

// Mock initial requests data
const initialRequests: Request[] = [
  {
    id: 'REQ-001',
    title: 'Lead conversion report by region',
    status: 'In Progress',
    owner: 'Sarah Chen',
    submittedBy: 'Jessica Martinez',
    priority: 'High',
    clarityScore: 9,
    daysOpen: 3,
    stage: 'In Progress',
    lastUpdate: '2 hours ago',
    complexity: 'medium',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
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
    submittedBy: 'Tom Wilson',
    priority: 'Medium',
    clarityScore: 6,
    daysOpen: 1,
    stage: 'Ready for Dev',
    lastUpdate: '1 day ago',
    complexity: 'simple',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
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
    owner: 'Alex Rivera', // Product Owner for review
    submittedBy: 'Mark Stevens',
    priority: 'High',
    clarityScore: 8,
    daysOpen: 5,
    stage: 'Scoping',
    lastUpdate: '3 days ago',
    complexity: 'complex',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    activity: [
      { timestamp: '5 days ago', action: 'Request submitted', user: 'Mark Stevens' },
      { timestamp: '5 days ago', action: 'Assigned to Alex Rivera (Product Owner) for review', user: 'AI Agent' },
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
   * Submit a new request with AI routing and impact assessment
   * @param requestData - The extracted request data from conversation
   * @param conversationHistory - Optional chat messages for AI impact scoring
   */
  const submitRequest = async (
    requestData: RequestData,
    conversationHistory?: ChatMessage[]
  ): Promise<Request | null> => {
    try {
      // Run routing and impact scoring in parallel for speed
      const [routing, impactAssessment] = await Promise.all([
        api.routeRequest(requestData),
        conversationHistory
          ? api.calculateImpactScore(conversationHistory, requestData)
          : Promise.resolve(undefined)
      ]);

      const newRequest: Request = {
        id: `REQ-${String(requests.length + 1).padStart(3, '0')}`,
        title: requestData.title || 'New Request',
        status: 'Scoping',
        // New workflow: All requests start with Product Owner for review in Scoping stage
        owner: MOCK_USERS.PRODUCT_OWNER,
        submittedBy: MOCK_USERS.REQUESTER, // Track who submitted
        priority: routing.priority,
        clarityScore: 9,
        daysOpen: 0,
        stage: 'Scoping' as RequestStage,
        lastUpdate: 'Just now',
        timeline: routing.timeline,
        complexity: routing.complexity as 'simple' | 'medium' | 'complex',
        createdAt: new Date().toISOString(),
        impactAssessment, // Add AI-generated impact assessment (undefined if not provided)
        activity: [
          { timestamp: 'Just now', action: 'Request submitted', user: MOCK_USERS.REQUESTER },
          { timestamp: 'Just now', action: `Assigned to ${MOCK_USERS.PRODUCT_OWNER} (Product Owner) for review`, user: 'AI Agent' },
          ...(impactAssessment ? [{
            timestamp: 'Just now',
            action: `AI Impact Score: ${impactAssessment.totalScore}/100 (Tier ${impactAssessment.tier})`,
            user: 'AI Agent'
          }] : [])
        ]
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
   * Automatically assigns owner when transitioning to "In Progress"
   */
  const updateRequestStage = (requestId: string, newStage: RequestStage, note: string, user?: string) => {
    setRequests(requests.map(req => {
      if (req.id === requestId) {
        const activity = [...(req.activity || []), {
          timestamp: 'Just now',
          action: note,
          user: user || 'User'
        }];

        // When transitioning to "In Progress", assign owner to the user making the transition
        const updatedOwner = newStage === 'In Progress' && user ? user : req.owner;

        return {
          ...req,
          owner: updatedOwner,
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
        const updatedOwner = newStage === 'In Progress' && user ? user : updated.owner;
        setSelectedRequest({
          ...updated,
          owner: updatedOwner,
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
    // console.log('viewRequestDetail called for:', request.id);
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

  /**
   * Adjust impact score (Product Owner manual override)
   * Creates Tier 2 assessment and logs activity
   */
  const adjustImpactScore = (requestId: string, adjustedAssessment: Partial<ImpactAssessment>, adjustedBy: string) => {
    setRequests(requests.map(req => {
      if (req.id === requestId) {
        const activity = [...(req.activity || []), {
          timestamp: 'Just now',
          action: `Impact score adjusted: ${adjustedAssessment.totalScore}/100 (Tier 2)`,
          user: adjustedBy
        }];

        return {
          ...req,
          impactAssessment: adjustedAssessment as ImpactAssessment,
          activity,
          lastUpdate: 'Just now'
        };
      }
      return req;
    }));

    // Also update selectedRequest if it's the one being adjusted
    if (selectedRequest?.id === requestId) {
      setSelectedRequest({
        ...selectedRequest,
        impactAssessment: adjustedAssessment as ImpactAssessment,
        lastUpdate: 'Just now'
      });
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
    dismissAlert,
    adjustImpactScore
  };
}
