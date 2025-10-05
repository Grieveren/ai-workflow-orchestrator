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
    const baseStyles = 'px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-hidden focus:border-purple-400 dark:focus:border-purple-500 focus:bg-white dark:focus:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed';

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
  const baseStyles = 'w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg font-mono text-sm text-gray-800 dark:text-slate-100 dark:bg-gray-900 focus:outline-hidden focus:border-purple-400 dark:focus:border-purple-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed';

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
