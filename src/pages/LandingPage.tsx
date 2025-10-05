import { Navigate, useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { useState, useEffect, useRef } from 'react';
import { Workflow, FolderOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { ChatMessage } from '../features/chat/components/ChatMessage';
import { LoadingIndicator } from '../features/chat/components/LoadingIndicator';
import { OptionSelector } from '../features/chat/components/OptionSelector';
import { ChatInput } from '../features/chat/components/ChatInput';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';

/**
 * Landing page with animated expansion
 * Starts minimal, expands smoothly to full chat interface
 */
export function LandingPage() {
  const navigate = useNavigate();
  const { view, chat, requests: requestsHook, documents } = useAppContext();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  const {
    chatMessages,
    userInput,
    isProcessing: chatIsProcessing,
    currentOptions,
    requestData,
    showOtherInput,
    setUserInput,
    setShowOtherInput,
    startConversation,
    continueConversation,
    resetChat,
    handleOptionClick
  } = chat;

  const { submitRequest: submitRequestAction } = requestsHook;
  const { resetDocuments } = documents;

  const examples = [
    "Bug: Investigate why the order export job times out after 5 minutes",
    "Feature request: Add a dark mode toggle to the analytics dashboard",
    "Incident: Customers cannot reset passwords in the mobile app",
  ];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatMessages.length > 0 && isExpanded) {
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [chatMessages, isExpanded]);

  // Auto-focus input when expanded
  useEffect(() => {
    if (isExpanded && chatMessages.length === 0) {
      setTimeout(() => {
        chatInputRef.current?.focus();
      }, 300); // Wait for animation to complete
    }
  }, [isExpanded, chatMessages.length]);

  // Synchronous redirect - no flash, follows React best practices
  if (view !== 'requester') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleExampleClick = (example: string) => {
    setIsExpanded(true);
    startConversation(example);
  };

  const submitRequest = async () => {
    setIsSubmitting(true);
    const newRequest = await submitRequestAction(requestData);
    if (newRequest) {
      toast.success('Request submitted successfully!', {
        icon: '✅',
        duration: 2000,
      });
      setTimeout(() => {
        navigate('/dashboard');
        resetChat();
        resetDocuments();
        setIsSubmitting(false);
        setIsExpanded(false);
      }, 100);
    } else {
      toast.error('Routing failed. Please try again.', {
        icon: '⚠️',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-2xl mx-auto mt-8">
        {/* Logo - always visible */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 bg-linear-to-br from-purple-600 to-pink-600 rounded-2xl">
              <Workflow className="h-8 w-8 text-white" />
            </div>
            <span className="text-4xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              RevOps
            </span>
          </div>
        </div>

        {/* Headline - always visible */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 pb-2">
            What can we do for you today?
          </h1>
          <p className="text-lg text-gray-600">
            Describe your request in plain English, and our AI will guide you through the details.
          </p>
        </div>

        {/* Main Chat Container - expands smoothly */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-500">
          <div className="p-0">
            {/* Chat messages area - grows when expanded, only shows when there are messages */}
            <div className={`overflow-y-auto transition-all duration-500 ${
              isExpanded && chatMessages.length > 0
                ? 'min-h-[450px] max-h-[450px] opacity-100 bg-gray-50 rounded-xl p-6 mx-6 mt-6 mb-4'
                : 'min-h-0 max-h-0 opacity-0 p-0'
            }`}>
              {chatMessages.map((msg, idx) => (
                <ChatMessage key={idx} message={msg} />
              ))}
              {chatIsProcessing && <LoadingIndicator />}
              <div ref={chatEndRef} />
            </div>

            {/* Input area */}
            {!isExpanded ? (
              <div onClick={handleExpand} className="p-6 cursor-pointer">
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    placeholder="Describe what you need... (e.g. I need a report on sales by region)"
                    className="w-full pl-4 pr-24 py-4 text-base rounded-xl border-2 border-purple-300 bg-gray-50
                             focus:outline-hidden focus:ring-4 focus:ring-purple-200 focus:border-purple-400
                             hover:border-purple-400 transition-all cursor-pointer"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-sm font-medium">Start</span>
                  </div>
                </div>
              </div>
            ) : chatMessages.length === 0 ? (
              <div className="p-6">
                <div className="relative">
                  <input
                    ref={chatInputRef}
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && userInput.trim()) {
                        startConversation();
                      }
                    }}
                    placeholder="Describe what you need... (e.g. I need a report on sales by region)"
                    disabled={chatIsProcessing}
                    className="w-full pl-4 pr-24 py-4 text-base rounded-xl border-2 border-purple-300 bg-gray-50
                             focus:outline-hidden focus:ring-4 focus:ring-purple-200 focus:border-purple-400
                             hover:border-purple-400 transition-all"
                  />
                  <button
                    onClick={() => startConversation()}
                    disabled={chatIsProcessing || !userInput.trim()}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 text-sm font-medium hover:text-purple-600 transition disabled:opacity-50"
                  >
                    Start
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-6 pb-6 space-y-3">
                {currentOptions.length > 0 && !showOtherInput && (
                  <OptionSelector
                    options={currentOptions}
                    onOptionClick={handleOptionClick}
                    onOtherClick={() => setShowOtherInput(true)}
                    disabled={chatIsProcessing}
                  />
                )}

                {(showOtherInput || currentOptions.length === 0) && (
                  <ChatInput
                    value={userInput}
                    onChange={setUserInput}
                    onSubmit={() => continueConversation()}
                    placeholder="Type your answer..."
                    submitText="Send"
                    disabled={chatIsProcessing}
                  />
                )}

                {Object.keys(requestData).length > 0 && (
                  <Button
                    onClick={submitRequest}
                    disabled={isSubmitting}
                    variant="success"
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Submitting...
                      </span>
                    ) : '✓ Submit Request'}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Examples - always visible */}
        <div className="text-center mb-8 mt-8">
          <p className="text-sm text-gray-500 mb-4">Or try an example:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm text-gray-700
                         hover:border-purple-400 hover:bg-purple-50 hover:text-purple-700
                         transition-all duration-200 shadow-xs hover:shadow-md"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Link - always visible */}
        <div className="text-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border-2 border-gray-200 text-gray-700
                     hover:border-purple-400 hover:bg-purple-50 hover:text-purple-700
                     transition-all duration-200 shadow-xs hover:shadow-md font-medium"
          >
            <FolderOpen className="h-5 w-5" />
            View My Requests
          </Link>
        </div>
      </div>
    </div>
  );
}
