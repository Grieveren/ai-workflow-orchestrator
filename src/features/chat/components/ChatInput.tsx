import { Send, ArrowRight } from 'lucide-react';
import { Input, Button } from '../../../components/ui';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
  submitText?: string;
  submitIcon?: 'send' | 'arrow';
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder = 'Type your answer...',
  submitText = 'Send',
  submitIcon = 'send'
}: ChatInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !disabled) {
      onSubmit();
    }
  };

  const Icon = submitIcon === 'send' ? Send : ArrowRight;

  return (
    <div className="flex gap-3">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1"
      />
      <Button
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        variant="primary"
        className="flex items-center gap-2"
      >
        <Icon size={18} />
        {submitText}
      </Button>
    </div>
  );
}
