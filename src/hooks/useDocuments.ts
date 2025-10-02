import { useState } from 'react';
import type { UserMode, DocType, GeneratedDocs, ChatMessage, Request } from '../types';
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

  /**
   * Generate all requirement documents (BRD, FSD, Tech Spec)
   */
  const generateDocuments = async (request: Request, mode: UserMode) => {
    console.log('generateDocuments called');
    if (!request || !mode) return;

    setIsProcessing(true);
    setIsGenerating(true);

    try {
      const docs = await api.generateDocuments(request, mode);

      console.log('Documents generated successfully');
      setGeneratedDocs(docs);
      setIsGenerating(false);
    } catch (error) {
      console.error('Requirements generation error:', error);
      alert('Failed to generate requirements. Please try again.');
      setGeneratedDocs(null);
      setUserMode(null);
      setIsGenerating(false);
    }

    setIsProcessing(false);
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

      setGeneratedDocs({
        ...generatedDocs,
        [activeDocTab]: updatedDoc
      });

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
    if (generatedDocs) {
      setGeneratedDocs({
        ...generatedDocs,
        [docType]: content
      });
    }
  };

  /**
   * Reset all document-related state
   */
  const resetDocuments = () => {
    setUserMode(null);
    setGeneratedDocs(null);
    setIsGenerating(false);
    setActiveDocTab('brd');
    setDocChatMessages([]);
    setDocUserInput('');
    setIsProcessing(false);
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
    exportAllDocuments
  };
}
