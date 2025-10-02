import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatMessage } from './ChatMessage';
import type { ChatMessage as ChatMessageType } from '../../../types';

describe('ChatMessage', () => {
  it('renders user message with correct styling', () => {
    const message: ChatMessageType = {
      role: 'user',
      content: 'Hello, AI!'
    };

    render(<ChatMessage message={message} />);
    const messageElement = screen.getByText('Hello, AI!');
    expect(messageElement).toBeInTheDocument();
    // User messages have purple gradient background
    expect(messageElement.parentElement).toHaveClass('bg-gradient-to-r');
  });

  it('renders assistant message with correct styling', () => {
    const message: ChatMessageType = {
      role: 'assistant',
      content: 'How can I help you?'
    };

    render(<ChatMessage message={message} />);
    expect(screen.getByText('How can I help you?')).toBeInTheDocument();
  });

  it('preserves whitespace in message content', () => {
    const message: ChatMessageType = {
      role: 'assistant',
      content: 'Line 1\nLine 2\nLine 3'
    };

    const { container } = render(<ChatMessage message={message} />);
    const contentDiv = container.querySelector('.whitespace-pre-wrap');
    expect(contentDiv).toBeInTheDocument();
  });
});
