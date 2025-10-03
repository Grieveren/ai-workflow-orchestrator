import type { SLAData } from '../../types';
import { getSLABadgeColor, getSLABadgeIcon, formatSLAText } from '../../utils/slaCalculator';

interface SLABadgeProps {
  sla: SLAData;
  size?: 'sm' | 'md';
  className?: string;
}

export function SLABadge({ sla, size = 'md', className = '' }: SLABadgeProps) {
  // Handle undefined SLA gracefully
  if (!sla) {
    return null;
  }

  const colorClasses = getSLABadgeColor(sla.status);
  const icon = getSLABadgeIcon(sla.status);
  const text = formatSLAText(sla);

  const sizeClasses = {
    sm: 'text-xs py-0.5 px-2',
    md: 'text-sm py-1 px-3'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${colorClasses} ${sizeClasses[size]} ${className}`}
    >
      <span>{icon}</span>
      <span>{text}</span>
    </span>
  );
}
