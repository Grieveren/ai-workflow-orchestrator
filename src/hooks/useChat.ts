import { useState } from 'react';
import type { ChatMessage, RequestData } from '../types';
import { api } from '../services/api';

/**
 * Custom hook for managing chat state and conversation with AI
 */
export function useChat() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [requestData, setRequestData] = useState<RequestData>({});
  const [showExamples, setShowExamples] = useState(false);
  const [showOtherInput, setShowOtherInput] = useState(false);

  /**
   * Start a new conversation with the AI
   */
  const startConversation = async (initialMessage: string | null = null) => {
    const firstMessage = initialMessage || userInput;
    if (!firstMessage.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: firstMessage };
    setChatMessages([userMessage]);
    setUserInput('');
    setIsProcessing(true);
    setShowExamples(false);

    try {
      const { message, options } = await api.startIntakeConversation(firstMessage);

      setCurrentOptions(options);
      setChatMessages([userMessage, { role: 'assistant', content: message }]);
      setShowOtherInput(false);
    } catch (error) {
      console.error('AI clarification error:', error);
      setChatMessages([userMessage, {
        role: 'assistant',
        content: 'I encountered an error. Please try again or rephrase your request.'
      }]);
    }

    setIsProcessing(false);
  };

  /**
   * Continue an existing conversation with custom input or selected option
   */
  const continueConversation = async (customInput: string | null = null) => {
    const messageText = customInput || userInput;
    if (!messageText.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: messageText };
    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setUserInput('');
    setIsProcessing(true);

    try {
      const { message, options, isComplete } = await api.continueConversation(updatedMessages);

      // console.log('Continue conversation response:', { message, options, isComplete });
      setCurrentOptions(options);

      if (isComplete) {
        try {
          const extracted = await api.extractRequestData(updatedMessages);
          setRequestData(extracted);

          setChatMessages([...updatedMessages, {
            role: 'assistant',
            content: `Perfect! I have everything I need. Here's what I understand:\n\n**What you need:** ${extracted.title}\n\n**The problem:** ${extracted.problem}\n\n**Success looks like:** ${extracted.success}\n\n**Systems involved:** ${extracted.systems?.join(', ') || 'N/A'}\n\n**Urgency:** ${extracted.urgency}\n\nClick "Submit Request" below and I'll route this to the right person on your team!`
          }]);
          setCurrentOptions([]);
        } catch (e) {
          console.error('Failed to extract request data:', e);
          // Even if extraction fails, set a minimal requestData so Submit button appears
          setRequestData({
            title: 'New Request',
            problem: 'See conversation above',
            success: 'To be determined'
          });
          setChatMessages([...updatedMessages, {
            role: 'assistant',
            content: message + '\n\nI think I have enough information now! Click "Submit Request" to continue.'
          }]);
          setCurrentOptions([]);
        }
      } else {
        setChatMessages([...updatedMessages, { role: 'assistant', content: message }]);
      }
      setShowOtherInput(false);
    } catch (error) {
      console.error('AI conversation error:', error);
      setChatMessages([...updatedMessages, {
        role: 'assistant',
        content: 'I had trouble processing that. Could you rephrase your answer?'
      }]);
    }

    setIsProcessing(false);
  };

  /**
   * Reset chat state to initial values
   */
  const resetChat = () => {
    setChatMessages([]);
    setRequestData({});
    setUserInput('');
    setShowExamples(false);
    setShowOtherInput(false);
    setCurrentOptions([]);
  };

  /**
   * Handle option click (convenience wrapper)
   */
  const handleOptionClick = (option: string) => {
    continueConversation(option);
  };

  return {
    // State
    chatMessages,
    userInput,
    isProcessing,
    currentOptions,
    requestData,
    showExamples,
    showOtherInput,

    // Setters
    setUserInput,
    setShowExamples,
    setShowOtherInput,
    setRequestData,

    // Actions
    startConversation,
    continueConversation,
    resetChat,
    handleOptionClick
  };
}
