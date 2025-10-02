import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge, StageBadge, PriorityBadge } from './Badge';

describe('Badge', () => {
  it('renders badge with text', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Badge className="custom-class">Badge</Badge>);
    const badge = screen.getByText('Badge');
    expect(badge).toHaveClass('custom-class');
  });
});

describe('StageBadge', () => {
  it('renders Scoping stage with yellow styling', () => {
    render(<StageBadge stage="Scoping" />);
    const badge = screen.getByText('Scoping');
    expect(badge).toHaveClass('bg-yellow-100');
    expect(badge).toHaveClass('text-yellow-700');
  });

  it('renders Ready for Dev stage with blue styling', () => {
    render(<StageBadge stage="Ready for Dev" />);
    const badge = screen.getByText('Ready for Dev');
    expect(badge).toHaveClass('bg-blue-100');
    expect(badge).toHaveClass('text-blue-700');
  });

  it('renders Completed stage with green styling', () => {
    render(<StageBadge stage="Completed" />);
    const badge = screen.getByText('Completed');
    expect(badge).toHaveClass('bg-green-100');
    expect(badge).toHaveClass('text-green-700');
  });
});

describe('PriorityBadge', () => {
  it('renders High priority with red styling', () => {
    render(<PriorityBadge priority="High" />);
    const badge = screen.getByText('High');
    expect(badge).toHaveClass('bg-red-100');
    expect(badge).toHaveClass('text-red-700');
  });

  it('renders Medium priority with yellow styling', () => {
    render(<PriorityBadge priority="Medium" />);
    const badge = screen.getByText('Medium');
    expect(badge).toHaveClass('bg-yellow-100');
    expect(badge).toHaveClass('text-yellow-700');
  });

  it('renders Low priority with green styling', () => {
    render(<PriorityBadge priority="Low" />);
    const badge = screen.getByText('Low');
    expect(badge).toHaveClass('bg-green-100');
    expect(badge).toHaveClass('text-green-700');
  });
});
