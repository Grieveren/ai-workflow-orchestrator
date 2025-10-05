import { Check } from 'lucide-react';
import { Textarea, Button } from '../../../components/ui';
import type { DocType, GeneratedDocs } from '../../../types';

interface DocumentViewerProps {
  documents: GeneratedDocs;
  activeTab: DocType;
  onTabChange: (tab: DocType) => void;
  onDocumentChange: (content: string) => void;
  onExport: () => void;
  onExportAll: () => void;
  onApprove?: (docType: DocType) => void;
  showApprovalUI?: boolean;
}

const docTitles: Record<DocType, string> = {
  brd: 'Business Requirements Document',
  fsd: 'Functional Specification Document',
  techSpec: 'Technical Specification'
};

export function DocumentViewer({
  documents,
  activeTab,
  onTabChange,
  onDocumentChange,
  onExport,
  onExportAll,
  onApprove,
  showApprovalUI = false
}: DocumentViewerProps) {
  const currentApproval = documents.approvals?.[activeTab];
  const isApproved = currentApproval?.approved || false;

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-100 mb-8">
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Generated Documents</h3>
          <div className="flex gap-2">
            {showApprovalUI && onApprove && (
              <Button
                onClick={() => onApprove(activeTab)}
                variant={isApproved ? "secondary" : "primary"}
                size="sm"
                disabled={isApproved}
              >
                {isApproved ? (
                  <><Check size={16} className="mr-1" /> Approved</>
                ) : (
                  `Approve ${activeTab === 'brd' ? 'BRD' : activeTab === 'fsd' ? 'FSD' : 'Tech Spec'}`
                )}
              </Button>
            )}
            <Button onClick={onExport} variant="secondary" size="sm">
              Export {docTitles[activeTab]}
            </Button>
            <Button onClick={onExportAll} variant="primary" size="sm">
              Export All
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          {(Object.keys(docTitles) as DocType[]).map((tab) => {
            const tabApproval = documents.approvals?.[tab];
            const tabIsApproved = tabApproval?.approved || false;

            return (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition flex items-center gap-2 ${
                  activeTab === tab
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab === 'brd' ? 'BRD' : tab === 'fsd' ? 'FSD' : 'Tech Spec'}
                {tabIsApproved && (
                  <Check size={14} className="text-green-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        {isApproved && currentApproval && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <Check size={18} className="text-green-600" />
            <div className="flex-1">
              <div className="text-sm font-medium text-green-800">
                Approved by {currentApproval.approver}
              </div>
              <div className="text-xs text-green-600">
                {currentApproval.date}
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <Textarea
            value={documents[activeTab]}
            onChange={(e) => onDocumentChange(e.target.value)}
            rows={16}
            className="h-96"
          />
          <p className="text-xs text-gray-500 mt-2">
            💡 You can edit the document directly or use AI to refine it below
          </p>
        </div>
      </div>
    </div>
  );
}
