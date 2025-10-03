import { useEffect, useRef } from 'react';
import { Bot, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppContext } from '../contexts/AppContext';
import { ChatMessage } from '../features/chat/components/ChatMessage';
import { LoadingIndicator } from '../features/chat/components/LoadingIndicator';
import { OptionSelector } from '../features/chat/components/OptionSelector';
import { ChatInput } from '../features/chat/components/ChatInput';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const exampleRequests = [
  "We're spending hours every week manually copying data between systems",
  "I need a report to see which marketing campaigns are actually working",
  "Our renewal process is completely manual and things are falling through the cracks",
  "The sales team can't see which leads to prioritize"
];

export function SubmitPage() {
  const navigate = useNavigate();
  const { chat, requests: requestsHook } = useAppContext();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const {
    chatMessages,
    userInput,
    isProcessing: chatIsProcessing,
    currentOptions,
    requestData,
    showExamples,
    showOtherInput,
    setUserInput,
    setShowExamples,
    setShowOtherInput,
    startConversation,
    continueConversation,
    resetChat,
    handleOptionClick
  } = chat;

  const { submitRequest: submitRequestAction } = requestsHook;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatMessages.length > 0) {
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [chatMessages]);

  const submitRequest = async () => {
    const newRequest = await submitRequestAction(requestData);
    if (newRequest) {
      toast.success('Request submitted successfully!', {
        icon: '✅',
        duration: 2000,
      });
      setTimeout(() => {
        navigate('/dashboard');
        resetChat();
      }, 500);
    } else {
      toast.error('Routing failed. Please try again.', {
        icon: '⚠️',
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="text-white" size={24} />
            <h2 className="text-xl font-semibold text-white">AI Assistant</h2>
          </div>
          {chatMessages.length > 0 && (
            <button
              onClick={resetChat}
              className="text-white/80 hover:text-white text-sm transition"
            >
              Start Over
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="bg-gray-50 rounded-xl p-6 mb-4 min-h-[450px] max-h-[450px] overflow-y-auto">
          {chatMessages.length === 0 ? (
            <div className="text-center mt-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-6">
                <Bot className="text-purple-600" size={40} />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                Hi! I'm here to help
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Just describe what you need in plain English. I'll ask you a few questions to make sure we get it right.
              </p>

              {!showExamples ? (
                <button
                  onClick={() => setShowExamples(true)}
                  className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium transition"
                >
                  <Lightbulb size={18} />
                  Show me some examples
                </button>
              ) : (
                <div className="mt-6 text-left max-w-lg mx-auto">
                  <p className="text-sm font-medium text-gray-700 mb-3">Try one of these:</p>
                  <div className="space-y-2">
                    {exampleRequests.map((example, idx) => (
                      <button
                        key={idx}
                        onClick={() => startConversation(example)}
                        className="w-full text-left px-4 py-3 bg-white hover:bg-purple-50 border border-gray-200 hover:border-purple-300 rounded-lg transition text-sm text-gray-700 hover:text-purple-700"
                      >
                        "{example}"
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {chatMessages.map((msg, idx) => (
                <ChatMessage key={idx} message={msg} />
              ))}
              {chatIsProcessing && <LoadingIndicator />}
              <div ref={chatEndRef} />
            </>
          )}
        </div>

        {chatMessages.length === 0 ? (
          <ChatInput
            value={userInput}
            onChange={setUserInput}
            onSubmit={() => startConversation()}
            placeholder="Describe what you need... (e.g. I need a report on sales by region)"
            submitText="Start"
            disabled={chatIsProcessing}
          />
        ) : (
          <div className="space-y-3">
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
                disabled={chatIsProcessing}
                variant="success"
                className="w-full"
              >
                {chatIsProcessing ? 'Submitting...' : '✓ Submit Request'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
