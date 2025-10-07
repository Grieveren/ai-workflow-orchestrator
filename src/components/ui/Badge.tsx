import { ReactNode } from 'react';
import type { RequestStage, Priority } from '../../types';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    default: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200',
    primary: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
    success: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
    warning: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
    danger: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
    info: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
  };

  const sizeStyles: Record<BadgeSize, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm'
  };

  return (
    <span className={`rounded-full font-medium ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}

// Stage-specific badge component
interface StageBadgeProps {
  stage: RequestStage;
  className?: string;
}

export function StageBadge({ stage, className = '' }: StageBadgeProps) {
  const stageColors: Record<RequestStage, string> = {
    'Intake': 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200',
    'Scoping': 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
    'Ready for Dev': 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    'In Progress': 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
    'Review': 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
    'Completed': 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${stageColors[stage]} ${className}`}>
      {stage}
    </span>
  );
}

// Priority-specific badge component
interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export function PriorityBadge({ priority, className = '' }: PriorityBadgeProps) {
  const priorityColors: Record<Priority, string> = {
    'High': 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
    'Medium': 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
    'Low': 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
  };

  return (
    <span className={`px-2 py-0.5 rounded-sm text-xs font-medium ${priorityColors[priority]} ${className}`}>
      {priority}
    </span>
  );
}
