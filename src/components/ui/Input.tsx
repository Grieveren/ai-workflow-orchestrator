import { ChangeEvent, KeyboardEvent, forwardRef } from 'react';

interface InputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyPress?: (e: KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  autoFocus?: boolean;
  type?: 'text' | 'email' | 'password' | 'number';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({
    value,
    onChange,
    onKeyPress,
    placeholder = '',
    disabled = false,
    className = '',
    autoFocus = false,
    type = 'text'
  }, ref) {
    const baseStyles = 'px-4 py-3 bg-[var(--surface-control)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--accent)] focus:bg-[var(--surface-elevated)] transition disabled:opacity-50 disabled:cursor-not-allowed';

    return (
      <input
        ref={ref}
        type={type}
        value={value}
        onChange={onChange}
        onKeyPress={onKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className={`${baseStyles} ${className}`}
      />
    );
  }
);

// Textarea variant
interface TextareaProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyPress?: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  rows?: number;
}

export function Textarea({
  value,
  onChange,
  onKeyPress,
  placeholder = '',
  disabled = false,
  className = '',
  rows = 4
}: TextareaProps) {
  const baseStyles = 'w-full px-4 py-3 border border-[var(--border-subtle)] rounded-lg font-mono text-sm text-[var(--text-primary)] bg-[var(--surface-control)] focus:outline-hidden focus:border-[var(--accent)] resize-none disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <textarea
      value={value}
      onChange={onChange}
      onKeyPress={onKeyPress}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      className={`${baseStyles} ${className}`}
    />
  );
}
