import { Check, Lock } from 'lucide-react';
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

// Helper function to determine if a document is locked based on sequential approval workflow
const isDocumentLocked = (docType: DocType, documents: GeneratedDocs): boolean => {
  if (docType === 'brd') return false; // BRD is always unlocked (first in sequence)
  if (docType === 'fsd') return !documents.approvals?.brd?.approved; // FSD locked until BRD approved
  if (docType === 'techSpec') return !documents.approvals?.fsd?.approved; // Tech Spec locked until FSD approved
  return false;
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
  const isLocked = isDocumentLocked(activeTab, documents);

  return (
    <div className="bg-[var(--surface-elevated)] rounded-xl shadow-xs border border-[var(--border-subtle)] mb-8">
      <div className="border-b border-[var(--border-subtle)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-[var(--text-primary)]">Generated Documents</h3>
          <div className="flex gap-2">
            {showApprovalUI && onApprove && (
              <Button
                onClick={() => onApprove(activeTab)}
                variant={isApproved ? "secondary" : "primary"}
                size="sm"
                disabled={isApproved || isLocked}
              >
                {isLocked ? (
                  <><Lock size={16} className="mr-1" /> Locked</>
                ) : isApproved ? (
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
            const tabIsLocked = isDocumentLocked(tab, documents);

            return (
              <button
                key={tab}
                onClick={() => !tabIsLocked && onTabChange(tab)}
                disabled={tabIsLocked}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition flex items-center gap-2 border ${
                  tabIsLocked
                    ? 'text-[var(--text-muted)] border-transparent cursor-not-allowed opacity-60'
                    : activeTab === tab
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)] shadow-sm'
                    : 'text-[var(--text-secondary)] border-transparent hover:bg-[var(--surface-muted)] hover:border-[var(--border-subtle)]'
                }`}
              >
                {tab === 'brd' ? 'BRD' : tab === 'fsd' ? 'FSD' : 'Tech Spec'}
                {tabIsLocked && (
                  <Lock size={14} className="text-[var(--text-muted)]" />
                )}
                {tabIsApproved && !tabIsLocked && (
                  <Check size={14} className="text-green-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        {isLocked && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg flex items-center gap-2">
            <Lock size={18} className="text-yellow-600 dark:text-yellow-400" />
            <div className="flex-1">
              <div className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                Sequential Approval Required
              </div>
              <div className="text-xs text-yellow-600 dark:text-yellow-400">
                {activeTab === 'fsd' && 'Please approve the BRD before reviewing the FSD'}
                {activeTab === 'techSpec' && 'Please approve the FSD before reviewing the Tech Spec'}
              </div>
            </div>
          </div>
        )}

        {isApproved && currentApproval && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/40 border border-green-200 dark:border-green-700 rounded-lg flex items-center gap-2">
            <Check size={18} className="text-green-600 dark:text-green-400" />
            <div className="flex-1">
              <div className="text-sm font-medium text-green-800 dark:text-green-300">
                Approved by {currentApproval.approver}
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">
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
          <p className="text-xs text-[var(--text-muted)] mt-2">
            💡 You can edit the document directly or use AI to refine it below
          </p>
        </div>
      </div>
    </div>
  );
}
