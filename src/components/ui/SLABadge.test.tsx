import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SLABadge } from './SLABadge';
import type { SLAData } from '../../types';

describe('SLABadge', () => {
  it('renders on-time SLA correctly', () => {
    const sla: SLAData = {
      targetCompletionDate: 'Jan 15, 2025',
      daysRemaining: 5,
      status: 'on-time'
    };

    render(<SLABadge sla={sla} />);
    expect(screen.getByText('✓')).toBeInTheDocument();
    expect(screen.getByText('5 days remaining')).toBeInTheDocument();
  });

  it('renders at-risk SLA correctly', () => {
    const sla: SLAData = {
      targetCompletionDate: 'Jan 12, 2025',
      daysRemaining: 2,
      status: 'at-risk'
    };

    render(<SLABadge sla={sla} />);
    expect(screen.getByText('⚠')).toBeInTheDocument();
    expect(screen.getByText('Due in 2 days')).toBeInTheDocument();
  });

  it('renders overdue SLA correctly', () => {
    const sla: SLAData = {
      targetCompletionDate: 'Jan 5, 2025',
      daysRemaining: -3,
      daysOverdue: 3,
      status: 'overdue'
    };

    render(<SLABadge sla={sla} />);
    expect(screen.getByText('✕')).toBeInTheDocument();
    expect(screen.getByText('3 days overdue')).toBeInTheDocument();
  });

  it('renders small size correctly', () => {
    const sla: SLAData = {
      targetCompletionDate: 'Jan 15, 2025',
      daysRemaining: 5,
      status: 'on-time'
    };

    const { container } = render(<SLABadge sla={sla} size="sm" />);
    const badge = container.querySelector('span');
    expect(badge).toHaveClass('text-xs', 'py-0.5', 'px-2');
  });

  it('renders medium size by default', () => {
    const sla: SLAData = {
      targetCompletionDate: 'Jan 15, 2025',
      daysRemaining: 5,
      status: 'on-time'
    };

    const { container } = render(<SLABadge sla={sla} />);
    const badge = container.querySelector('span');
    expect(badge).toHaveClass('text-sm', 'py-1', 'px-3');
  });

  it('returns null when SLA is undefined', () => {
    const { container } = render(<SLABadge sla={undefined as any} />);
    expect(container.firstChild).toBeNull();
  });

  it('applies custom className', () => {
    const sla: SLAData = {
      targetCompletionDate: 'Jan 15, 2025',
      daysRemaining: 5,
      status: 'on-time'
    };

    const { container } = render(<SLABadge sla={sla} className="custom-class" />);
    const badge = container.querySelector('span');
    expect(badge).toHaveClass('custom-class');
  });
});
