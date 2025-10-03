import type { Request, SLAData, SLAStatus } from '../types';

/**
 * SLA Calculator Utility
 * Calculates SLA deadlines and status based on request complexity and age
 */

// Default SLA days by complexity
const SLA_DAYS: Record<'simple' | 'medium' | 'complex', number> = {
  simple: 5,
  medium: 8,
  complex: 14
};

/**
 * Calculate the number of days between two dates
 */
function daysBetween(date1: Date, date2: Date): number {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.floor((utc2 - utc1) / MS_PER_DAY);
}

/**
 * Determine SLA status based on days remaining
 */
function getSLAStatus(daysRemaining: number): SLAStatus {
  if (daysRemaining < 0) return 'overdue';
  if (daysRemaining <= 2) return 'at-risk';
  return 'on-time';
}

/**
 * Calculate SLA data for a request
 */
export function calculateSLA(request: Request): SLAData {
  const complexity = request.complexity || 'medium';
  const slaDays = SLA_DAYS[complexity];

  // Parse created date or use daysOpen to estimate
  const createdAt = request.createdAt ? new Date(request.createdAt) : new Date();
  if (!request.createdAt) {
    // If no createdAt, estimate from daysOpen
    createdAt.setDate(createdAt.getDate() - request.daysOpen);
  }

  const targetDate = new Date(createdAt);
  targetDate.setDate(targetDate.getDate() + slaDays);

  const today = new Date();
  const daysRemaining = daysBetween(today, targetDate);
  const status = getSLAStatus(daysRemaining);

  const slaData: SLAData = {
    targetCompletionDate: targetDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    daysRemaining,
    status
  };

  // Add overdue days if applicable
  if (status === 'overdue') {
    slaData.daysOverdue = Math.abs(daysRemaining);
  }

  return slaData;
}

/**
 * Get SLA badge color classes based on status
 */
export function getSLABadgeColor(status: SLAStatus): string {
  const colors: Record<SLAStatus, string> = {
    'on-time': 'bg-green-100 text-green-700 border-green-200',
    'at-risk': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'overdue': 'bg-red-100 text-red-700 border-red-200'
  };
  return colors[status];
}

/**
 * Get SLA badge icon based on status
 */
export function getSLABadgeIcon(status: SLAStatus): string {
  const icons: Record<SLAStatus, string> = {
    'on-time': '✓',
    'at-risk': '⚠',
    'overdue': '✕'
  };
  return icons[status];
}

/**
 * Format SLA display text
 */
export function formatSLAText(sla: SLAData): string {
  if (sla.status === 'overdue') {
    return `${sla.daysOverdue} ${sla.daysOverdue === 1 ? 'day' : 'days'} overdue`;
  }
  if (sla.status === 'at-risk') {
    return `Due in ${sla.daysRemaining} ${sla.daysRemaining === 1 ? 'day' : 'days'}`;
  }
  return `${sla.daysRemaining} ${sla.daysRemaining === 1 ? 'day' : 'days'} remaining`;
}
