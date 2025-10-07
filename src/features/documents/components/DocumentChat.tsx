import { Bot } from 'lucide-react';
import { Input, Button } from '../../../components/ui';
import type { ChatMessage } from '../../../types';

interface DocumentChatProps {
  messages: ChatMessage[];
  userInput: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  isProcessing?: boolean;
}

export function DocumentChat({
  messages,
  userInput,
  onInputChange,
  onSubmit,
  isProcessing = false
}: DocumentChatProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isProcessing) {
      onSubmit();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-100 dark:border-gray-700 p-6">
      <h4 className="font-medium text-gray-800 dark:text-slate-100 mb-4">Refine with AI</h4>

      {messages.length > 0 && (
        <div className="mb-4 max-h-48 overflow-y-auto space-y-3">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex items-start gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="shrink-0 w-6 h-6 bg-linear-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Bot className="text-white" size={12} />
                </div>
              )}
              <div
                className={`px-3 py-2 rounded-lg text-sm ${
                  msg.role === 'user'
                    ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-900 dark:text-purple-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-slate-100'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          value={userInput}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="e.g. Add a risk analysis section or Expand the technical approach"
          disabled={isProcessing}
          className="flex-1"
        />
        <Button
          onClick={onSubmit}
          disabled={isProcessing || !userInput.trim()}
          variant="primary"
        >
          {isProcessing ? 'Updating...' : 'Update'}
        </Button>
      </div>
    </div>
  );
}
