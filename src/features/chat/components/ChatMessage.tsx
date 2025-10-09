import { Bot } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '../../../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-3 mb-6 ${isUser ? 'justify-end' : 'max-w-[85%]'}`}>
      {!isUser && (
        <div className="shrink-0 w-8 h-8 bg-linear-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <Bot className="text-white" size={16} />
        </div>
      )}

      <div
        className={`rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-br-sm shadow-md'
            : 'bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-tl-sm shadow-xs text-[var(--text-primary)]'
        }`}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
      </div>
    </div>
  );
}
