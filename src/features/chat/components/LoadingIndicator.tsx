import { Bot } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface LoadingIndicatorProps {
  streamingText?: string;
}

export function LoadingIndicator({ streamingText }: LoadingIndicatorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when streaming text updates
  useEffect(() => {
    if (streamingText && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [streamingText]);

  return (
    <div className="text-left mb-6">
      <div className="flex items-start gap-3 w-full">
        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <Bot className="text-white" size={16} />
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex-1 min-w-0">
          {streamingText ? (
            <div
              ref={scrollRef}
              className="text-sm text-gray-700 whitespace-pre-wrap font-mono max-h-96 overflow-y-auto break-words"
            >
              {streamingText}
              <span className="inline-block w-2 h-4 bg-purple-500 ml-1 animate-pulse"></span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-sm">Thinking...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
