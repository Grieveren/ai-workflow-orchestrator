import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { LoadingIndicator } from '../features/chat/components/LoadingIndicator';
import { ModeSelector } from '../features/documents/components/ModeSelector';
import { DocumentViewer } from '../features/documents/components/DocumentViewer';
import type { RequestStage } from '../types';

export function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { view, requests: requestsHook, documents } = useAppContext();

  const {
    requests,
    selectedRequest,
    updateRequestStage,
    viewRequestDetail,
    closeRequestDetail
  } = requestsHook;

  const {
    userMode,
    generatedDocs,
    isGenerating,
    activeDocTab,
    isProcessing: docIsProcessing,
    setUserMode,
    setActiveDocTab,
    generateDocuments: generateDocsAction,
    updateDocumentContent,
    resetDocuments,
    exportDocument,
    exportAllDocuments
  } = documents;

  // Find and set the selected request
  useEffect(() => {
    if (id) {
      const request = requests.find(r => r.id === id);
      if (request) {
        viewRequestDetail(request);
      } else {
        navigate('/dashboard');
      }
    }
  }, [id, requests, viewRequestDetail, navigate]);

  const handleClose = () => {
    closeRequestDetail();
    resetDocuments();
    navigate('/dashboard');
  };

  const handleUpdateRequestStage = (requestId: string, newStage: RequestStage, note: string) => {
    const user = view === 'dev' && selectedRequest ? selectedRequest.owner : 'Product Owner';
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

  const getStageColor = (stage: RequestStage): string => {
    const colors: Record<RequestStage, string> = {
      'Intake': 'bg-gray-100 text-gray-700',
      'Scoping': 'bg-yellow-100 text-yellow-700',
      'Ready for Dev': 'bg-blue-100 text-blue-700',
      'In Progress': 'bg-purple-100 text-purple-700',
      'Review': 'bg-orange-100 text-orange-700',
      'Completed': 'bg-green-100 text-green-700'
    };
    return colors[stage] || 'bg-gray-100 text-gray-700';
  };

  if (!selectedRequest) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <p className="text-gray-600">Loading request...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-800">{selectedRequest.id}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStageColor(selectedRequest.stage)}`}>
                {selectedRequest.stage}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedRequest.priority === 'High' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {selectedRequest.priority}
              </span>
            </div>
            <h3 className="text-xl text-gray-700 mb-2">{selectedRequest.title}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Owner: {selectedRequest.owner}</span>
              <span>•</span>
              <span>Opened {selectedRequest.daysOpen} days ago</span>
              <span>•</span>
              <span>Last update: {selectedRequest.lastUpdate}</span>
            </div>

            {selectedRequest.aiAlert && (
              <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
                <div className="flex-1">
                  <div className="text-sm font-medium text-red-800">AI Alert</div>
                  <div className="text-sm text-red-700">{selectedRequest.aiAlert}</div>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => {
                        alert('In production, AI would send: "Hi Jennifer, REQ-003 hasn\'t been updated in 3 days. Do you need help or should we reprioritize?"');
                      }}
                      className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Send Reminder
                    </button>
                    <button
                      onClick={() => {
                        if (selectedRequest) {
                          requestsHook.dismissAlert(selectedRequest.id);
                        }
                      }}
                      className="text-xs px-3 py-1 bg-white text-red-700 border border-red-300 rounded hover:bg-red-50"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {view === 'dev' && selectedRequest.stage === 'Ready for Dev' && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="font-medium text-blue-900 mb-2">This request is ready for you to start</div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  handleUpdateRequestStage(selectedRequest.id, 'In Progress', 'Dev accepted and started work');
                  alert('You accepted the request. Status changed to "In Progress"');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Accept & Start Work
              </button>
              <button
                onClick={() => {
                  const reason = prompt('Why are you rejecting this request?');
                  if (reason) {
                    handleUpdateRequestStage(selectedRequest.id, 'Scoping', `Dev rejected: ${reason}`);
                    alert('Request sent back to Product Owner for clarification');
                  }
                }}
                className="px-4 py-2 bg-white text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50"
              >
                Reject / Need Clarification
              </button>
            </div>
          </div>
        )}

        {view === 'dev' && selectedRequest.stage === 'In Progress' && (
          <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="font-medium text-purple-900 mb-3">Update Progress</div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const update = prompt('Status update (e.g., "70% complete - testing phase")');
                  if (update) {
                    handleUpdateRequestStage(selectedRequest.id, 'In Progress', update);
                  }
                }}
                className="px-4 py-2 bg-white text-purple-700 border border-purple-300 rounded-lg hover:bg-purple-50"
              >
                Add Status Update
              </button>
              <button
                onClick={() => {
                  handleUpdateRequestStage(selectedRequest.id, 'Review', 'Dev completed work - ready for review');
                  alert('Request moved to Review stage. Product Owner will be notified.');
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Mark Complete → Send for Review
              </button>
            </div>
          </div>
        )}

        {view === 'requester' && selectedRequest.stage === 'Review' && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="font-medium text-green-900 mb-3">Ready for your review</div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  handleUpdateRequestStage(selectedRequest.id, 'Completed', 'Review approved - request completed');
                  alert('Request marked as complete! 🎉');
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Approve & Close
              </button>
              <button
                onClick={() => {
                  const feedback = prompt('What needs to be changed?');
                  if (feedback) {
                    handleUpdateRequestStage(selectedRequest.id, 'In Progress', `Feedback from review: ${feedback}`);
                    alert('Feedback sent to dev. Status changed back to "In Progress"');
                  }
                }}
                className="px-4 py-2 bg-white text-green-700 border border-green-300 rounded-lg hover:bg-green-50"
              >
                Request Changes
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-4">Activity Timeline</h4>
          <div className="space-y-3">
            {(selectedRequest.activity || []).map((item, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="flex-shrink-0 w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="text-sm text-gray-800">{item.action}</div>
                  <div className="text-xs text-gray-500">{item.user} • {item.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedRequest.stage === 'Scoping' && view === 'requester' && (
        isGenerating ? (
          <LoadingIndicator />
        ) : generatedDocs ? (
          <DocumentViewer
            documents={generatedDocs}
            activeTab={activeDocTab}
            onTabChange={setActiveDocTab}
            onDocumentChange={(content) => updateDocumentContent(activeDocTab, content)}
            onExport={handleExportDocument}
            onExportAll={handleExportAll}
          />
        ) : (
          <ModeSelector
            selectedMode={userMode}
            onModeSelect={setUserMode}
            onGenerate={generateRequirements}
            isGenerating={docIsProcessing}
          />
        )
      )}

      {selectedRequest.stage !== 'Scoping' && generatedDocs && (
        <DocumentViewer
          documents={generatedDocs}
          activeTab={activeDocTab}
          onTabChange={setActiveDocTab}
          onDocumentChange={(content) => updateDocumentContent(activeDocTab, content)}
          onExport={handleExportDocument}
          onExportAll={handleExportAll}
        />
      )}
    </div>
  );
}
