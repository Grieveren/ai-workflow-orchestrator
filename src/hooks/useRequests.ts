import { useState, useEffect, useCallback } from 'react';
import type { Request, RequestStage, RequestData, ChatMessage, ImpactAssessment } from '../types';
import { api } from '../services/api';
import { MOCK_USERS } from '../constants/users';

/**
 * Custom hook for managing requests state and operations with database persistence
 */
export function useRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getAllRequests();
      setRequests(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load requests:', err);
      setError('Failed to load requests from database');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load requests from database on mount
  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  /**
   * Add a new request to the list and persist to database
   */
  const addRequest = async (request: Request) => {
    const previousRequests = requests;

    try {
      // Optimistic update - add to local state immediately
      setRequests([request, ...requests]);

      // Persist to database
      await api.createRequest(request);
    } catch (error) {
      console.error('Failed to create request in database:', error);
      // Rollback optimistic update on error
      setRequests(previousRequests);
    }
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

      await addRequest(newRequest);
      return newRequest;
    } catch (error) {
      console.error('Routing error:', error);
      return null;
    }
  };

  /**
   * Update a request's stage and add activity log entry with database persistence
   * Automatically assigns owner when transitioning to "In Progress"
   */
  const updateRequestStage = async (requestId: string, newStage: RequestStage, note: string, user?: string) => {
    const previousRequests = requests;

    try {
      // Optimistic update - update local state immediately
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

      // Persist to database
      const updatedOwner = newStage === 'In Progress' && user ? user : requests.find(r => r.id === requestId)?.owner;
      await api.updateRequest(requestId, {
        stage: newStage,
        owner: updatedOwner,
        lastUpdate: 'Just now',
        aiAlert: null,
        activity: [{
          timestamp: 'Just now',
          action: note,
          user: user || 'User'
        }]
      });
    } catch (error) {
      console.error('Failed to update request stage:', error);
      // Rollback optimistic update
      setRequests(previousRequests);
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
   * Dismiss AI alert on a request with database persistence
   */
  const dismissAlert = async (requestId: string) => {
    const previousRequests = requests;

    try {
      // Optimistic update
      setRequests(requests.map(r =>
        r.id === requestId ? { ...r, aiAlert: null } : r
      ));

      if (selectedRequest?.id === requestId) {
        setSelectedRequest({ ...selectedRequest, aiAlert: null });
      }

      // Persist to database
      await api.updateRequest(requestId, { aiAlert: null });
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
      // Rollback
      setRequests(previousRequests);
    }
  };

  /**
   * Adjust impact score (Product Owner manual override)
   * Creates Tier 2 assessment and logs activity with database persistence
   */
  const adjustImpactScore = async (requestId: string, adjustedAssessment: Partial<ImpactAssessment>, adjustedBy: string) => {
    const previousRequests = requests;

    try {
      // Optimistic update - update local state immediately
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

      // Persist to database
      await api.updateRequest(requestId, {
        impactAssessment: adjustedAssessment as ImpactAssessment,
        lastUpdate: 'Just now',
        activity: [{
          timestamp: 'Just now',
          action: `Impact score adjusted: ${adjustedAssessment.totalScore}/100 (Tier 2)`,
          user: adjustedBy
        }]
      });
    } catch (error) {
      console.error('Failed to adjust impact score:', error);
      // Rollback optimistic update on error
      setRequests(previousRequests);
    }
  };

  return {
    // State
    requests,
    selectedRequest,
    loading,
    error,

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
    adjustImpactScore,
    reloadRequests: loadRequests
  };
}
