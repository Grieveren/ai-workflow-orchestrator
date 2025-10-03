import { Bot, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface LoadingIndicatorProps {
  streamingText?: string;
}

interface ProgressStep {
  label: string;
  duration: number; // milliseconds
  status: 'pending' | 'active' | 'complete';
}

export function LoadingIndicator({ streamingText }: LoadingIndicatorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [steps, setSteps] = useState<ProgressStep[]>([
    { label: 'Preparing request context', duration: 300, status: 'pending' },
    { label: 'Generating Business Requirements Document (BRD)', duration: 3000, status: 'pending' },
    { label: 'Generating Functional Specification Document (FSD)', duration: 3000, status: 'pending' },
    { label: 'Generating Technical Specification', duration: 3000, status: 'pending' },
    { label: 'Initializing document approval workflow', duration: 300, status: 'pending' }
  ]);

  // Auto-scroll to bottom when streaming text updates
  useEffect(() => {
    if (streamingText && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [streamingText]);

  // Progress through steps based on actual API calls
  useEffect(() => {
    if (!streamingText) return;

    // Parse step signals from the hook
    if (streamingText.startsWith('step:')) {
      const stepIndex = parseInt(streamingText.split(':')[1], 10);

      setSteps(prevSteps => {
        const newSteps = [...prevSteps];

        // Mark all previous steps as complete
        for (let i = 0; i < stepIndex; i++) {
          newSteps[i].status = 'complete';
        }

        // Mark current step as active
        if (stepIndex < newSteps.length) {
          newSteps[stepIndex].status = 'active';
        }

        return newSteps;
      });
    }
  }, [streamingText]);

  // If no streamingText, show simple loading (for chat)
  if (!streamingText) {
    return (
      <div className="text-left mb-6">
        <div className="flex items-start gap-3 w-full">
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Bot className="text-white" size={16} />
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
              <span className="text-sm text-gray-600">Thinking...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Otherwise show detailed document generation progress
  return (
    <div className="text-left mb-6">
      <div className="flex items-start gap-3 w-full">
        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <Bot className="text-white" size={16} />
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex-1 min-w-0">
          {/* Progress Steps - Claude Code style */}
          <div className="space-y-3 mb-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {step.status === 'complete' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : step.status === 'active' ? (
                    <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-medium ${
                    step.status === 'complete' ? 'text-green-700' :
                    step.status === 'active' ? 'text-purple-700' :
                    'text-gray-400'
                  }`}>
                    {step.label}
                  </p>
                </div>
              </div>
            ))}
          </div>


          {/* Time Estimate */}
          <p className="text-xs text-gray-400 mt-3 text-center">
            Generating 3 documents sequentially (~15-20 seconds)
          </p>
        </div>
      </div>
    </div>
  );
}
