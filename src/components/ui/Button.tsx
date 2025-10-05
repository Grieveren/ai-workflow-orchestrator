import { ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  type = 'button'
}: ButtonProps) {
  const baseStyles = 'rounded-xl font-medium transition shadow-xs disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white disabled:from-gray-300 disabled:to-gray-300',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
    success: 'bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white disabled:from-gray-300 disabled:to-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300',
    ghost: 'bg-transparent text-purple-600 hover:bg-purple-50'
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </button>
  );
}
