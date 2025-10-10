import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import type { UserMode, DocType, GeneratedDocs, ChatMessage, Request, ViewType } from '../types';
import { api } from '../services/api';

/**
 * Custom hook for managing document generation state and operations
 */
export function useDocuments() {
  const [userMode, setUserMode] = useState<UserMode | null>(null);
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDocs | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeDocTab, setActiveDocTab] = useState<DocType>('brd');
  const [docChatMessages, setDocChatMessages] = useState<ChatMessage[]>([]);
  const [docUserInput, setDocUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const requestIdRef = useRef<string | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSaveRef = useRef<GeneratedDocs | null>(null);

  const cancelPendingSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    pendingSaveRef.current = null;
  };

  const persistDocuments = async (docs: GeneratedDocs, requestId?: string) => {
    const targetId = requestId ?? requestIdRef.current;
    if (!targetId) return;
    try {
      await api.saveDocuments(targetId, docs);
    } catch (error) {
      console.error('Failed to persist documents:', error);
    }
  };

  /**
   * Generate all requirement documents (BRD, FSD, Tech Spec) - sequential generation
   */
  const generateDocuments = async (request: Request, mode: UserMode) => {
    // console.log('generateDocuments called');
    if (!request || !mode) return;

    setIsProcessing(true);
    setIsGenerating(true);
    setStreamingText('');

    try {
      // Step 0: Preparing context
      setStreamingText('step:0');
      await new Promise(resolve => setTimeout(resolve, 300));

      // Steps 1-3: Generate each document sequentially with progress updates
      const docs = await api.generateDocuments(request, mode, (docType) => {
        // Map docType to step number
        const stepMap: Record<DocType, number> = {
          brd: 1,
          fsd: 2,
          techSpec: 3
        };
        setStreamingText(`step:${stepMap[docType]}`);
      });

      // Step 4: Initializing approval workflow
      setStreamingText('step:4');
      // console.log('Documents generated successfully');

      // Initialize with approval state
      const docsWithApprovals: GeneratedDocs = {
        ...docs,
        approvals: {
          brd: { approved: false },
          fsd: { approved: false },
          techSpec: { approved: false }
        }
      };

      await new Promise(resolve => setTimeout(resolve, 300));
      setGeneratedDocs(docsWithApprovals);
      setStreamingText('');
      setIsGenerating(false);
      requestIdRef.current = request.id;
      cancelPendingSave();
      await persistDocuments(docsWithApprovals, request.id);
    } catch (error) {
      console.error('Requirements generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to generate requirements: ${errorMessage}`, {
        duration: 5000,
        icon: '⚠️',
      });
      setGeneratedDocs(null);
      setUserMode(null);
      setStreamingText('');
      setIsGenerating(false);
    }

    setIsProcessing(false);
  };

  /**
   * Approve a document
   * @param docType - Type of document to approve (brd, fsd, techSpec)
   * @param approver - Name of the person approving
   * @param approverRole - Role/view type of the approver (for audit trail)
   */
  const approveDocument = async (docType: DocType, approver: string, approverRole: ViewType) => {
    if (!generatedDocs) {
      console.warn('Cannot approve document: No documents generated');
      return;
    }

    const updatedApprovals = {
      brd: generatedDocs.approvals?.brd || { approved: false },
      fsd: generatedDocs.approvals?.fsd || { approved: false },
      techSpec: generatedDocs.approvals?.techSpec || { approved: false }
    };

    updatedApprovals[docType] = {
      approved: true,
      approver,
      approverRole, // Track which role approved (for audit trail)
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    const nextDocs: GeneratedDocs = {
      ...generatedDocs,
      approvals: updatedApprovals
    };

    setGeneratedDocs(nextDocs);
    cancelPendingSave();
    await persistDocuments(nextDocs);
  };

  /**
   * Check if all documents are approved
   */
  const areAllDocsApproved = (): boolean => {
    if (!generatedDocs?.approvals) return false;
    return (
      generatedDocs.approvals.brd.approved &&
      generatedDocs.approvals.fsd.approved &&
      generatedDocs.approvals.techSpec.approved
    );
  };

  /**
   * Refine/update a document based on user feedback
   */
  const refineDocument = async () => {
    if (!docUserInput.trim() || !generatedDocs) return;

    const userMessage: ChatMessage = { role: 'user', content: docUserInput };
    const updatedMessages = [...docChatMessages, userMessage];
    setDocChatMessages(updatedMessages);
    setDocUserInput('');
    setIsProcessing(true);

    try {
      const updatedDoc = await api.refineDocument(
        generatedDocs[activeDocTab],
        activeDocTab,
        docUserInput
      );

      const nextDocs: GeneratedDocs = {
        ...generatedDocs,
        [activeDocTab]: updatedDoc
      };

      setGeneratedDocs(nextDocs);
      cancelPendingSave();
      await persistDocuments(nextDocs);

      setDocChatMessages([...updatedMessages, {
        role: 'assistant',
        content: 'I\'ve updated the document based on your feedback. Review the changes above.'
      }]);
    } catch (error) {
      console.error('Document refinement error:', error);
      setDocChatMessages([...updatedMessages, {
        role: 'assistant',
        content: 'I had trouble updating the document. Please try again.'
      }]);
    }

    setIsProcessing(false);
  };

  /**
   * Update document content directly (for textarea edits)
   */
  const updateDocumentContent = (docType: DocType, content: string) => {
    if (!generatedDocs) return;

    const nextDocs: GeneratedDocs = {
      ...generatedDocs,
      [docType]: content
    };

    setGeneratedDocs(nextDocs);
    pendingSaveRef.current = nextDocs;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveTimeoutRef.current = null;
      const docsToPersist = pendingSaveRef.current;
      pendingSaveRef.current = null;
      if (!docsToPersist) return;
      void persistDocuments(docsToPersist);
    }, 500);
  };

  /**
   * Load persisted documents for a request (if available)
   */
  const loadDocuments = async (requestId: string): Promise<GeneratedDocs | null> => {
    try {
      const docs = await api.getDocuments(requestId);
      if (docs) {
        cancelPendingSave();
        requestIdRef.current = requestId;
        setGeneratedDocs(docs);
        return docs;
      }
    } catch (error) {
      console.error('Failed to load persisted documents:', error);
    }
    return null;
  };

  /**
   * Reset all document-related state
   */
  const resetDocuments = () => {
    cancelPendingSave();
    setUserMode(null);
    setGeneratedDocs(null);
    setIsGenerating(false);
    setActiveDocTab('brd');
    setDocChatMessages([]);
    setDocUserInput('');
    setIsProcessing(false);
    requestIdRef.current = null;
  };

  /**
   * Export a single document
   */
  const exportDocument = (request: Request) => {
    if (!generatedDocs || !request) return;

    const docNames: Record<DocType, string> = {
      brd: 'Business Requirements Document',
      fsd: 'Functional Specification Document',
      techSpec: 'Technical Specification'
    };

    const blob = new Blob([generatedDocs[activeDocTab]], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = request.id + '-' + docNames[activeDocTab] + '.md';
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Export all documents as a single file
   */
  const exportAllDocuments = (request: Request) => {
    if (!generatedDocs || !request) return;

    const header = '# ' + request.id + ' - Complete Requirements Package\n\n';
    const brdSection = '## Business Requirements Document\n\n' + generatedDocs.brd + '\n\n';
    const fsdSection = '## Functional Specification Document\n\n' + generatedDocs.fsd + '\n\n';
    const techSection = '## Technical Specification\n\n' + generatedDocs.techSpec;
    const allDocs = header + brdSection + fsdSection + techSection;

    const blob = new Blob([allDocs], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = request.id + '-Complete-Requirements.md';
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    // State
    userMode,
    generatedDocs,
    isGenerating,
    activeDocTab,
    docChatMessages,
    docUserInput,
    isProcessing,
    streamingText,

    // Setters
    setUserMode,
    setActiveDocTab,
    setDocUserInput,

    // Actions
    generateDocuments,
    refineDocument,
    updateDocumentContent,
    resetDocuments,
    exportDocument,
    exportAllDocuments,
    approveDocument,
    areAllDocsApproved,
    loadDocuments
  };
}
