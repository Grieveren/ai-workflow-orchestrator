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

  describe('variants', () => {
    it('renders default variant', () => {
      render(<Badge variant="default">Default</Badge>);
      const badge = screen.getByText('Default');
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-700');
    });

    it('renders primary variant', () => {
      render(<Badge variant="primary">Primary</Badge>);
      const badge = screen.getByText('Primary');
      expect(badge).toHaveClass('bg-purple-100', 'text-purple-700');
    });

    it('renders success variant', () => {
      render(<Badge variant="success">Success</Badge>);
      const badge = screen.getByText('Success');
      expect(badge).toHaveClass('bg-green-100', 'text-green-700');
    });

    it('renders warning variant', () => {
      render(<Badge variant="warning">Warning</Badge>);
      const badge = screen.getByText('Warning');
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-700');
    });

    it('renders danger variant', () => {
      render(<Badge variant="danger">Danger</Badge>);
      const badge = screen.getByText('Danger');
      expect(badge).toHaveClass('bg-red-100', 'text-red-700');
    });

    it('renders info variant', () => {
      render(<Badge variant="info">Info</Badge>);
      const badge = screen.getByText('Info');
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-700');
    });
  });

  describe('sizes', () => {
    it('renders small size', () => {
      render(<Badge size="sm">Small</Badge>);
      const badge = screen.getByText('Small');
      expect(badge).toHaveClass('px-2', 'py-0.5', 'text-xs');
    });

    it('renders medium size (default)', () => {
      render(<Badge size="md">Medium</Badge>);
      const badge = screen.getByText('Medium');
      expect(badge).toHaveClass('px-3', 'py-1', 'text-xs');
    });

    it('renders medium size when no size specified', () => {
      render(<Badge>Default Size</Badge>);
      const badge = screen.getByText('Default Size');
      expect(badge).toHaveClass('px-3', 'py-1', 'text-xs');
    });

    it('renders large size', () => {
      render(<Badge size="lg">Large</Badge>);
      const badge = screen.getByText('Large');
      expect(badge).toHaveClass('px-4', 'py-1.5', 'text-sm');
    });
  });

  describe('combined props', () => {
    it('applies both variant and size styles', () => {
      render(<Badge variant="success" size="lg">Success Large</Badge>);
      const badge = screen.getByText('Success Large');
      expect(badge).toHaveClass('bg-green-100', 'text-green-700', 'px-4', 'py-1.5', 'text-sm');
    });

    it('combines variant, size, and custom className', () => {
      render(<Badge variant="danger" size="sm" className="custom">Danger Small</Badge>);
      const badge = screen.getByText('Danger Small');
      expect(badge).toHaveClass('bg-red-100', 'text-red-700', 'px-2', 'py-0.5', 'custom');
    });
  });

  describe('dark mode', () => {
    it('includes dark mode classes for primary variant', () => {
      render(<Badge variant="primary">Primary</Badge>);
      const badge = screen.getByText('Primary');
      expect(badge.className).toContain('dark:bg-purple-900/40');
      expect(badge.className).toContain('dark:text-purple-300');
    });

    it('includes dark mode classes for success variant', () => {
      render(<Badge variant="success">Success</Badge>);
      const badge = screen.getByText('Success');
      expect(badge.className).toContain('dark:bg-green-900/40');
      expect(badge.className).toContain('dark:text-green-300');
    });
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
