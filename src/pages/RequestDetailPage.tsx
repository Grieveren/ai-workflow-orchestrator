import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppContext } from '../contexts/AppContext';
import { LoadingIndicator } from '../features/chat/components/LoadingIndicator';
import { ModeSelector } from '../features/documents/components/ModeSelector';
import { DocumentViewer } from '../features/documents/components/DocumentViewer';
import { DocumentChat } from '../features/documents/components/DocumentChat';
import { SLABadge, Modal, ImpactBadge, ImpactAdjustmentModal } from '../components/ui';
import { calculateSLA } from '../utils/slaCalculator';
import { canGenerateDocuments, canUpdateStage } from '../utils/permissions';
import { getCurrentUser } from '../utils/requestFilters';
import type { RequestStage, DocType } from '../types';

export function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { view, requests: requestsHook, documents } = useAppContext();
  const documentsRef = useRef<HTMLDivElement>(null);

  // Modal state for rejection/status/feedback inputs
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    placeholder: string;
    onSubmit: (value: string) => void;
  }>({
    isOpen: false,
    title: '',
    placeholder: '',
    onSubmit: () => {}
  });

  // Modal state for impact adjustment
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);

  const {
    requests,
    selectedRequest,
    updateRequestStage,
    viewRequestDetail,
    closeRequestDetail,
    adjustImpactScore
  } = requestsHook;

  const {
    userMode,
    generatedDocs,
    isGenerating,
    activeDocTab,
    isProcessing: docIsProcessing,
    streamingText,
    docChatMessages,
    docUserInput,
    setUserMode,
    setActiveDocTab,
    setDocUserInput,
    generateDocuments: generateDocsAction,
    updateDocumentContent,
    resetDocuments,
    exportDocument,
    exportAllDocuments,
    refineDocument,
    approveDocument,
    areAllDocsApproved
  } = documents;

  // Find and set the selected request
  useEffect(() => {
    if (id) {
      const request = requests.find(r => r.id === id);
      if (request) {
        // Reset documents when switching to a different request
        resetDocuments();
        viewRequestDetail(request);
      } else {
        console.error('Request not found:', id);
        navigate('/dashboard');
      }
    }
     
  }, [id, requests]);

  // Auto-scroll to documents section when mode is selected or docs are generated
  useEffect(() => {
    if (userMode || isGenerating || generatedDocs) {
      setTimeout(() => {
        documentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [userMode, isGenerating, generatedDocs]);

  // Cleanup when unmounting
  useEffect(() => {
    return () => {
      closeRequestDetail();
      resetDocuments();
    };
     
  }, []);

  const handleClose = () => {
    closeRequestDetail();
    resetDocuments();
    navigate('/dashboard');
  };

  const handleUpdateRequestStage = (requestId: string, newStage: RequestStage, note: string) => {
    const user = getCurrentUser(view) || 'User';
    updateRequestStage(requestId, newStage, note, user);
  };

  const generateRequirements = async () => {
    if (!selectedRequest || !userMode) return;
    await generateDocsAction(selectedRequest, userMode);
  };

  const handleExportDocument = () => {
    if (!selectedRequest) return;
    exportDocument(selectedRequest);
  };

  const handleExportAll = () => {
    if (!selectedRequest) return;
    exportAllDocuments(selectedRequest);
  };

  const handleApprove = (docType: DocType) => {
    const currentUser = getCurrentUser(view);
    if (!currentUser) {
      toast.error('Unable to approve: Current user not identified');
      return;
    }
    approveDocument(docType, currentUser, view);
  };

  const allDocsApproved = areAllDocsApproved();

  const getStageColor = (stage: RequestStage): string => {
    const colors: Record<RequestStage, string> = {
      'Intake': 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200',
      'Scoping': 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
      'Ready for Dev': 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
      'In Progress': 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
      'Review': 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
      'Completed': 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
    };
    return colors[stage] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200';
  };

  if (!selectedRequest) {
    return (
      <div className="bg-[var(--surface-elevated)] rounded-xl shadow-xs border border-[var(--border-subtle)] p-6">
        <p className="text-[var(--text-secondary)]">Loading request...</p>
      </div>
    );
  }

  const sla = selectedRequest.sla || calculateSLA(selectedRequest);

  return (
    <div className="space-y-4">
      <div className="bg-[var(--surface-elevated)] rounded-xl shadow-xs border border-[var(--border-subtle)] p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">{selectedRequest.id}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStageColor(selectedRequest.stage)}`}>
                {selectedRequest.stage}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedRequest.priority === 'High' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' :
                'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
              }`}>
                {selectedRequest.priority}
              </span>
              <SLABadge sla={sla} />
              {selectedRequest.impactAssessment && (
                <ImpactBadge request={selectedRequest} size="sm" />
              )}
            </div>
            <h3 className="text-xl text-[var(--text-secondary)] mb-2">{selectedRequest.title}</h3>
            <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
              <span>Owner: {selectedRequest.owner}</span>
              <span>•</span>
              <span>Opened {selectedRequest.daysOpen} days ago</span>
              <span>•</span>
              <span>Last update: {selectedRequest.lastUpdate}</span>
            </div>

            {selectedRequest.aiAlert && (
              <div className="mt-3 flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <AlertCircle className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" size={16} />
                <div className="flex-1">
                  <div className="text-sm font-medium text-red-800 dark:text-red-300">AI Alert</div>
                  <div className="text-sm text-red-700 dark:text-red-400">{selectedRequest.aiAlert}</div>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => {
                        toast.success('Reminder sent to Jennifer Kim', {
                          icon: '📧',
                        });
                      }}
                      className="text-xs px-3 py-1 bg-red-600 text-white rounded-sm hover:bg-red-700"
                    >
                      Send Reminder
                    </button>
                    <button
                      onClick={() => {
                        if (selectedRequest) {
                          requestsHook.dismissAlert(selectedRequest.id);
                        }
                      }}
                      className="text-xs px-3 py-1 bg-white text-red-700 border border-red-300 rounded-sm hover:bg-red-50"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Product Owner: Impact Score Adjustment */}
            {view === 'product-owner' && selectedRequest.impactAssessment && (
              <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-purple-900 dark:text-purple-300 mb-2">
                      Impact Assessment
                    </div>
                    <div className="text-sm text-purple-700 dark:text-purple-400 mb-3">
                      {selectedRequest.impactAssessment.tier === 1 && 'AI-generated score (Tier 1)'}
                      {selectedRequest.impactAssessment.tier === 2 && 'Manually adjusted score (Tier 2)'}
                      {selectedRequest.impactAssessment.tier === 3 && 'Business case validated (Tier 3)'}
                    </div>
                  </div>
                  <button
                    onClick={() => setAdjustmentModalOpen(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
                  >
                    {selectedRequest.impactAssessment.tier === 1 ? 'Adjust Score' : 'Edit Adjustment'}
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          >
            ✕
          </button>
        </div>

        {view === 'dev' && selectedRequest.stage === 'Ready for Dev' && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="font-medium text-blue-900 dark:text-blue-300 mb-2">This request is ready for you to start</div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  handleUpdateRequestStage(selectedRequest.id, 'In Progress', 'Dev accepted and started work');
                  toast.success('Request accepted! Status changed to "In Progress"', {
                    icon: '✅',
                  });
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Accept & Start Work
              </button>
              <button
                onClick={() => {
                  setModalState({
                    isOpen: true,
                    title: 'Reject Request',
                    placeholder: 'Why are you rejecting this request? (e.g., "Needs more technical details" or "Requirements unclear")',
                    onSubmit: (reason) => {
                      handleUpdateRequestStage(selectedRequest.id, 'Scoping', `Dev rejected: ${reason}`);
                      toast('Request sent back to Product Owner for clarification', {
                        icon: '↩️',
                      });
                    }
                  });
                }}
                className="px-4 py-2 bg-white text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50"
              >
                Reject / Need Clarification
              </button>
            </div>
          </div>
        )}

        {view === 'dev' && selectedRequest.stage === 'In Progress' && (
          <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <div className="font-medium text-purple-900 dark:text-purple-300 mb-3">Update Progress</div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setModalState({
                    isOpen: true,
                    title: 'Add Status Update',
                    placeholder: 'Status update (e.g., "70% complete - testing phase")',
                    onSubmit: (update) => {
                      handleUpdateRequestStage(selectedRequest.id, 'In Progress', update);
                    }
                  });
                }}
                className="px-4 py-2 bg-white text-purple-700 border border-purple-300 rounded-lg hover:bg-purple-50"
              >
                Add Status Update
              </button>
              <button
                onClick={() => {
                  handleUpdateRequestStage(selectedRequest.id, 'Review', 'Dev completed work - ready for review');
                  toast.success('Request moved to Review. Product Owner will be notified.', {
                    icon: '🎯',
                  });
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Mark Complete → Send for Review
              </button>
            </div>
          </div>
        )}

        {view === 'requester' && selectedRequest.stage === 'Review' && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="font-medium text-green-900 dark:text-green-300 mb-3">Ready for your review</div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  handleUpdateRequestStage(selectedRequest.id, 'Completed', 'Review approved - request completed');
                  toast.success('Request completed successfully!', {
                    icon: '🎉',
                    duration: 4000,
                  });
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Approve & Close
              </button>
              <button
                onClick={() => {
                  setModalState({
                    isOpen: true,
                    title: 'Request Changes',
                    placeholder: 'What needs to be changed? (e.g., "Add error handling in user authentication flow")',
                    onSubmit: (feedback) => {
                      handleUpdateRequestStage(selectedRequest.id, 'In Progress', `Feedback from review: ${feedback}`);
                      toast('Feedback sent to dev. Status changed back to "In Progress"', {
                        icon: '💬',
                      });
                    }
                  });
                }}
                className="px-4 py-2 bg-white text-green-700 border border-green-300 rounded-lg hover:bg-green-50"
              >
                Request Changes
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-[var(--border-subtle)]">
          <h4 className="font-semibold text-[var(--text-primary)] mb-4">Activity Timeline</h4>
          <div className="space-y-3">
            {(selectedRequest.activity || []).map((item, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="shrink-0 w-2 h-2 bg-purple-400 dark:bg-purple-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="text-sm text-[var(--text-primary)]">{item.action}</div>
                  <div className="text-xs text-[var(--text-muted)]">{item.user} • {item.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Read-only banner for requesters viewing Scoping requests */}
      {view === 'requester' && selectedRequest.stage === 'Scoping' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mt-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                Pending Product Owner Review
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Your request is currently being reviewed by {selectedRequest.owner}. Requirements documents
                (BRD, FSD, Tech Spec) will be generated and approved before moving to development.
                You'll be notified when this is ready for the development team.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Document generation and approval - only for Product Owner in Scoping stage */}
      {canGenerateDocuments(view, selectedRequest.stage) && (
        <div ref={documentsRef}>
          {isGenerating ? (
            <LoadingIndicator streamingText={streamingText} />
          ) : generatedDocs ? (
            <>
              <DocumentViewer
                documents={generatedDocs}
                activeTab={activeDocTab}
                onTabChange={setActiveDocTab}
                onDocumentChange={(content) => updateDocumentContent(activeDocTab, content)}
                onExport={handleExportDocument}
                onExportAll={handleExportAll}
                onApprove={handleApprove}
                showApprovalUI={true}
              />
              <DocumentChat
                messages={docChatMessages}
                userInput={docUserInput}
                onInputChange={setDocUserInput}
                onSubmit={refineDocument}
                isProcessing={docIsProcessing}
              />

              {/* Move to Ready for Dev button - only for Product Owner */}
              {canUpdateStage(view, selectedRequest.stage, 'Ready for Dev') && (
                <div className="bg-[var(--surface-elevated)] rounded-xl shadow-xs border border-[var(--border-subtle)] p-6 mt-4">
                  <h4 className="font-semibold text-[var(--text-primary)] mb-3">Ready to hand off to development?</h4>
                  {!allDocsApproved ? (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-4">
                      <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        ⚠️ All documents must be approved before moving to development
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        handleUpdateRequestStage(selectedRequest.id, 'Ready for Dev', 'All documents approved - ready for development');
                        toast.success('Request moved to "Ready for Dev". Developers will be notified.', {
                          icon: '🚀',
                          duration: 4000,
                        });
                      }}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                    >
                      Move to Ready for Dev
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <ModeSelector
              selectedMode={userMode}
              onModeSelect={setUserMode}
              onGenerate={generateRequirements}
              isGenerating={docIsProcessing}
            />
          )}
        </div>
      )}

      {selectedRequest.stage !== 'Scoping' && generatedDocs && (
        <>
          <DocumentViewer
            documents={generatedDocs}
            activeTab={activeDocTab}
            onTabChange={setActiveDocTab}
            onDocumentChange={(content) => updateDocumentContent(activeDocTab, content)}
            onExport={handleExportDocument}
            onExportAll={handleExportAll}
          />
          <DocumentChat
            messages={docChatMessages}
            userInput={docUserInput}
            onInputChange={setDocUserInput}
            onSubmit={refineDocument}
            isProcessing={docIsProcessing}
          />
        </>
      )}

      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onSubmit={modalState.onSubmit}
        title={modalState.title}
        placeholder={modalState.placeholder}
      />

      {/* Impact Score Adjustment Modal */}
      {selectedRequest && (
        <ImpactAdjustmentModal
          isOpen={adjustmentModalOpen}
          onClose={() => setAdjustmentModalOpen(false)}
          onSubmit={(adjustedAssessment) => {
            const user = getCurrentUser(view) || 'Product Owner';
            adjustImpactScore(selectedRequest.id, adjustedAssessment, user);
            toast.success('Impact score adjusted successfully', {
              icon: '✅',
            });
          }}
          currentAssessment={selectedRequest.impactAssessment}
          assessedBy={getCurrentUser(view) || 'Product Owner'}
        />
      )}
    </div>
  );
}
