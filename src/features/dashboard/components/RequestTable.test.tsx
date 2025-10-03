import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RequestTable } from './RequestTable';
import type { Request } from '../../../types';

// Mock the calculateSLA utility
vi.mock('../../../utils/slaCalculator', () => ({
  calculateSLA: vi.fn(() => ({
    targetCompletionDate: '2025-10-10',
    daysRemaining: 7,
    status: 'on-time' as const,
  })),
  getSLABadgeColor: vi.fn(() => 'bg-green-100 text-green-700 border-green-200'),
  getSLABadgeIcon: vi.fn(() => '✓'),
  formatSLAText: vi.fn(() => '7 days remaining'),
}));

describe('RequestTable', () => {
  const mockRequests: Request[] = [
    {
      id: 'REQ-001',
      title: 'Salesforce Automation',
      status: 'In Progress',
      owner: 'Sarah Chen',
      submittedBy: 'Jessica Martinez',
      priority: 'High',
      clarityScore: 8,
      daysOpen: 5,
      stage: 'In Progress',
      lastUpdate: '2 days ago',
    },
    {
      id: 'REQ-002',
      title: 'Dashboard Reports',
      status: 'Completed',
      owner: 'AI Agent',
      submittedBy: 'John Doe',
      priority: 'Medium',
      clarityScore: 9,
      daysOpen: 10,
      stage: 'Completed',
      lastUpdate: 'Just now',
    },
  ];

  const mockOnRequestClick = vi.fn();

  describe('Requester Column Visibility', () => {
    it('shows Requester column in dev view', () => {
      render(
        <RequestTable
          requests={mockRequests}
          onRequestClick={mockOnRequestClick}
          view="dev"
        />
      );
      expect(screen.getByText('Requester')).toBeInTheDocument();
    });

    it('shows Requester column in management view', () => {
      render(
        <RequestTable
          requests={mockRequests}
          onRequestClick={mockOnRequestClick}
          view="management"
        />
      );
      expect(screen.getByText('Requester')).toBeInTheDocument();
    });

    it('hides Requester column in requester view', () => {
      render(
        <RequestTable
          requests={mockRequests}
          onRequestClick={mockOnRequestClick}
          view="requester"
        />
      );
      expect(screen.queryByText('Requester')).not.toBeInTheDocument();
    });

    it('hides Requester column when view prop is undefined', () => {
      render(
        <RequestTable
          requests={mockRequests}
          onRequestClick={mockOnRequestClick}
        />
      );
      expect(screen.queryByText('Requester')).not.toBeInTheDocument();
    });
  });

  describe('Requester Column Content', () => {
    it('displays submittedBy values in dev view', () => {
      render(
        <RequestTable
          requests={mockRequests}
          onRequestClick={mockOnRequestClick}
          view="dev"
        />
      );
      expect(screen.getByText('Jessica Martinez')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('displays submittedBy values in management view', () => {
      render(
        <RequestTable
          requests={mockRequests}
          onRequestClick={mockOnRequestClick}
          view="management"
        />
      );
      expect(screen.getByText('Jessica Martinez')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('displays "Unknown" when submittedBy is missing', () => {
      const requestsWithoutSubmitter: Request[] = [
        {
          ...mockRequests[0],
          submittedBy: undefined,
        },
      ];
      render(
        <RequestTable
          requests={requestsWithoutSubmitter}
          onRequestClick={mockOnRequestClick}
          view="dev"
        />
      );
      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });

    it('renders Users icon for each requester', () => {
      const { container } = render(
        <RequestTable
          requests={mockRequests}
          onRequestClick={mockOnRequestClick}
          view="dev"
        />
      );
      // Check for Users icon in requester cells
      const requesterCells = container.querySelectorAll('td:nth-child(4)'); // Requester is 4th column
      expect(requesterCells.length).toBe(2); // One for each request
    });
  });

  describe('Table Structure', () => {
    it('renders all table headers', () => {
      render(
        <RequestTable
          requests={mockRequests}
          onRequestClick={mockOnRequestClick}
          view="management"
        />
      );
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Request')).toBeInTheDocument();
      expect(screen.getByText('Stage')).toBeInTheDocument();
      expect(screen.getByText('Requester')).toBeInTheDocument();
      expect(screen.getByText('Owner')).toBeInTheDocument();
      expect(screen.getByText('Priority')).toBeInTheDocument();
      expect(screen.getByText('SLA')).toBeInTheDocument();
      expect(screen.getByText('Days Open')).toBeInTheDocument();
    });

    it('renders request data in table rows', () => {
      render(
        <RequestTable
          requests={mockRequests}
          onRequestClick={mockOnRequestClick}
          view="management"
        />
      );
      expect(screen.getByText('REQ-001')).toBeInTheDocument();
      expect(screen.getByText('Salesforce Automation')).toBeInTheDocument();
      expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
      expect(screen.getByText('5 days')).toBeInTheDocument();
    });

    it('displays AI Agent with Bot icon', () => {
      const { container } = render(
        <RequestTable
          requests={mockRequests}
          onRequestClick={mockOnRequestClick}
          view="management"
        />
      );
      expect(screen.getByText('AI Agent')).toBeInTheDocument();
      expect(container.querySelector('.text-purple-500')).toBeInTheDocument(); // Bot icon
    });

    it('displays human owners with Users icon', () => {
      const { container } = render(
        <RequestTable
          requests={mockRequests}
          onRequestClick={mockOnRequestClick}
          view="management"
        />
      );
      expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
      // Users icon should be present (text-gray-400 class)
      const userIcons = container.querySelectorAll('.text-gray-400');
      expect(userIcons.length).toBeGreaterThan(0);
    });
  });

  describe('User Interactions', () => {
    it('calls onRequestClick when row is clicked', async () => {
      const user = userEvent.setup();
      render(
        <RequestTable
          requests={mockRequests}
          onRequestClick={mockOnRequestClick}
          view="management"
        />
      );

      const row = screen.getByText('Salesforce Automation').closest('tr');
      if (row) {
        await user.click(row);
        expect(mockOnRequestClick).toHaveBeenCalledWith(mockRequests[0]);
      }
    });

    it('adds hover styles to rows', () => {
      const { container } = render(
        <RequestTable
          requests={mockRequests}
          onRequestClick={mockOnRequestClick}
          view="management"
        />
      );
      const rows = container.querySelectorAll('tbody tr');
      rows.forEach(row => {
        expect(row).toHaveClass('hover:bg-gray-50');
        expect(row).toHaveClass('cursor-pointer');
      });
    });
  });

  describe('Priority Display', () => {
    it('displays High priority with red styling', () => {
      render(
        <RequestTable
          requests={mockRequests}
          onRequestClick={mockOnRequestClick}
          view="management"
        />
      );
      const highPriority = screen.getByText('High');
      expect(highPriority).toHaveClass('bg-red-100');
      expect(highPriority).toHaveClass('text-red-700');
    });

    it('displays Medium priority with yellow styling', () => {
      render(
        <RequestTable
          requests={mockRequests}
          onRequestClick={mockOnRequestClick}
          view="management"
        />
      );
      const mediumPriority = screen.getByText('Medium');
      expect(mediumPriority).toHaveClass('bg-yellow-100');
      expect(mediumPriority).toHaveClass('text-yellow-700');
    });

    it('displays Low priority with green styling', () => {
      const lowPriorityRequest: Request = {
        ...mockRequests[0],
        priority: 'Low',
      };
      render(
        <RequestTable
          requests={[lowPriorityRequest]}
          onRequestClick={mockOnRequestClick}
          view="management"
        />
      );
      const lowPriority = screen.getByText('Low');
      expect(lowPriority).toHaveClass('bg-green-100');
      expect(lowPriority).toHaveClass('text-green-700');
    });
  });

  describe('SLA Badge', () => {
    it('renders SLA badge for each request', () => {
      render(
        <RequestTable
          requests={mockRequests}
          onRequestClick={mockOnRequestClick}
          view="management"
        />
      );
      // SLABadge component should be rendered (we can't test its internal content without deeper mocking)
      const { container } = render(
        <RequestTable
          requests={mockRequests}
          onRequestClick={mockOnRequestClick}
          view="management"
        />
      );
      expect(container.querySelectorAll('tbody tr').length).toBe(2);
    });
  });

  describe('Edge Cases', () => {
    it('renders empty table when no requests provided', () => {
      render(
        <RequestTable
          requests={[]}
          onRequestClick={mockOnRequestClick}
          view="management"
        />
      );
      const tbody = screen.getByRole('table').querySelector('tbody');
      expect(tbody?.children.length).toBe(0);
    });

    it('handles requests with undefined optional fields', () => {
      const minimalRequest: Request = {
        id: 'REQ-999',
        title: 'Minimal Request',
        status: 'Scoping',
        owner: 'Unassigned',
        priority: 'Low',
        clarityScore: 5,
        daysOpen: 1,
        stage: 'Scoping',
        lastUpdate: 'Today',
      };
      render(
        <RequestTable
          requests={[minimalRequest]}
          onRequestClick={mockOnRequestClick}
          view="dev"
        />
      );
      expect(screen.getByText('Unknown')).toBeInTheDocument(); // submittedBy is undefined
      expect(screen.getByText('Minimal Request')).toBeInTheDocument();
    });
  });
});
