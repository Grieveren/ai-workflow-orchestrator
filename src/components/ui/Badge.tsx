import { ReactNode } from 'react';
import type { RequestStage, Priority } from '../../types';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-purple-100 text-purple-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}>
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
    'Intake': 'bg-gray-100 text-gray-700',
    'Scoping': 'bg-yellow-100 text-yellow-700',
    'Ready for Dev': 'bg-blue-100 text-blue-700',
    'In Progress': 'bg-purple-100 text-purple-700',
    'Review': 'bg-orange-100 text-orange-700',
    'Completed': 'bg-green-100 text-green-700'
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
    'High': 'bg-red-100 text-red-700',
    'Medium': 'bg-yellow-100 text-yellow-700',
    'Low': 'bg-green-100 text-green-700'
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[priority]} ${className}`}>
      {priority}
    </span>
  );
}
