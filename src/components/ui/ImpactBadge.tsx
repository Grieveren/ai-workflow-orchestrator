import React from 'react';
import { TrendingUp, Minus, TrendingDown, HelpCircle } from 'lucide-react';
import type { Request } from '../../types';
import { getImpactBadgeVariant, getImpactScore, getImpactTier } from '../../utils/impactValidation';

type ImpactBadgeSize = 'sm' | 'md' | 'lg';

interface ImpactBadgeProps {
  request: Request;
  showScore?: boolean;
  size?: ImpactBadgeSize;
  className?: string;
}

export function ImpactBadge({ request, showScore = true, size = 'md', className = '' }: ImpactBadgeProps) {
  const variant = getImpactBadgeVariant(request);
  const score = getImpactScore(request);
  const tier = getImpactTier(request);
  const justification = request.impactAssessment?.justification;

  // Size-based styling
  const sizeStyles: Record<ImpactBadgeSize, { container: string; icon: string; text: string; tier: string }> = {
    sm: {
      container: 'px-2 py-0.5 gap-1',
      icon: 'w-3 h-3',
      text: 'text-xs',
      tier: 'text-[10px] px-1'
    },
    md: {
      container: 'px-3 py-1 gap-1.5',
      icon: 'w-4 h-4',
      text: 'text-sm',
      tier: 'text-xs px-1.5'
    },
    lg: {
      container: 'px-4 py-1.5 gap-2',
      icon: 'w-5 h-5',
      text: 'text-base',
      tier: 'text-sm px-2'
    }
  };

  // Variant-based styling
  const variantStyles: Record<typeof variant, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
    high: {
      bg: 'bg-red-100 dark:bg-red-900/20',
      text: 'text-red-700 dark:text-red-300',
      icon: <TrendingUp className={sizeStyles[size].icon} />,
      label: 'High Impact'
    },
    medium: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/20',
      text: 'text-yellow-800 dark:text-yellow-300',
      icon: <Minus className={sizeStyles[size].icon} />,
      label: 'Medium Impact'
    },
    low: {
      bg: 'bg-gray-100 dark:bg-gray-700',
      text: 'text-gray-700 dark:text-gray-300',
      icon: <TrendingDown className={sizeStyles[size].icon} />,
      label: 'Low Impact'
    },
    none: {
      bg: 'bg-gray-100 dark:bg-gray-700',
      text: 'text-gray-600 dark:text-gray-400',
      icon: <HelpCircle className={sizeStyles[size].icon} />,
      label: 'Not Assessed'
    }
  };

  const styles = variantStyles[variant];

  // Build aria-label for accessibility
  const ariaLabel = variant === 'none'
    ? 'Impact not yet assessed'
    : `${styles.label}: ${score} out of 100, Tier ${tier}`;

  return (
    <div
      className={`inline-flex items-center rounded-full font-medium ${styles.bg} ${styles.text} ${sizeStyles[size].container} ${className}`}
      aria-label={ariaLabel}
      title={justification || ariaLabel}
    >
      {/* Icon */}
      {styles.icon}

      {/* Content */}
      {variant === 'none' ? (
        <span className={`whitespace-nowrap ${sizeStyles[size].text}`}>Not Assessed</span>
      ) : (
        <>
          {/* Tier badge */}
          {tier && (
            <span className={`inline-block whitespace-nowrap rounded-sm bg-black/15 dark:bg-white/15 font-semibold ${sizeStyles[size].tier}`}>
              T{tier}
            </span>
          )}

          {/* Score display (optional) */}
          {showScore && (
            <span className={`whitespace-nowrap font-semibold ${sizeStyles[size].text}`}>
              {score}
            </span>
          )}
        </>
      )}
    </div>
  );
}
