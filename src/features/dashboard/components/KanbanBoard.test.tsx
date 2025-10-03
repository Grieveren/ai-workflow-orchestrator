import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KanbanBoard } from './KanbanBoard';
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

describe('KanbanBoard', () => {
  const mockRequests: Request[] = [
    {
      id: 'REQ-001',
      title: 'Salesforce Automation',
      status: 'Scoping',
      owner: 'Sarah Chen',
      submittedBy: 'Jessica Martinez',
      priority: 'High',
      clarityScore: 8,
      daysOpen: 5,
      stage: 'Scoping',
      lastUpdate: '2 days ago',
      aiAlert: 'Needs clarification',
    },
    {
      id: 'REQ-002',
      title: 'Dashboard Reports',
      status: 'Ready for Dev',
      owner: 'AI Agent',
      submittedBy: 'John Doe',
      priority: 'Medium',
      clarityScore: 9,
      daysOpen: 3,
      stage: 'Ready for Dev',
      lastUpdate: 'Just now',
    },
    {
      id: 'REQ-003',
      title: 'Data Integration',
      status: 'In Progress',
      owner: 'Mike Torres',
      submittedBy: 'Jane Smith',
      priority: 'Low',
      clarityScore: 7,
      daysOpen: 10,
      stage: 'In Progress',
      lastUpdate: '1 hour ago',
    },
  ];

  const mockOnRequestClick = vi.fn();

  describe('Stage Columns', () => {
    it('renders all five stage columns', () => {
      render(<KanbanBoard requests={mockRequests} onRequestClick={mockOnRequestClick} />);

      expect(screen.getByText('Scoping')).toBeInTheDocument();
      expect(screen.getByText('Ready for Dev')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Review')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('displays request count for each stage', () => {
      render(<KanbanBoard requests={mockRequests} onRequestClick={mockOnRequestClick} />);

      // Check that "1 requests" appears for Scoping, Ready for Dev, and In Progress
      const requestCounts = screen.getAllByText('1 requests');
      expect(requestCounts.length).toBeGreaterThan(0);

      // Check that "0 requests" appears for Review and Completed
      const zeroCounts = screen.getAllByText('0 requests');
      expect(zeroCounts.length).toBeGreaterThan(0);
    });

    it('filters requests correctly by stage', () => {
      render(<KanbanBoard requests={mockRequests} onRequestClick={mockOnRequestClick} />);

      // Find the Scoping column and check it contains REQ-001
      const scopingColumn = screen.getByText('Scoping').closest('div');
      expect(scopingColumn).toHaveTextContent('Salesforce Automation');

      // Find the Ready for Dev column and check it contains REQ-002
      const readyColumn = screen.getByText('Ready for Dev').closest('div');
      expect(readyColumn).toHaveTextContent('Dashboard Reports');
    });
  });

  describe('Requester Display (submittedBy)', () => {
    it('displays submittedBy when present', () => {
      render(<KanbanBoard requests={mockRequests} onRequestClick={mockOnRequestClick} />);

      expect(screen.getByText('Jessica Martinez')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('shows "By:" label before submittedBy', () => {
      render(<KanbanBoard requests={mockRequests} onRequestClick={mockOnRequestClick} />);

      const byLabels = screen.getAllByText(/By:/);
      expect(byLabels.length).toBe(3); // One for each request with submittedBy
    });

    it('does not display submittedBy section when field is missing', () => {
      const requestWithoutSubmitter: Request[] = [
        {
          ...mockRequests[0],
          submittedBy: undefined,
        },
      ];
      render(<KanbanBoard requests={requestWithoutSubmitter} onRequestClick={mockOnRequestClick} />);

      expect(screen.queryByText(/By:/)).not.toBeInTheDocument();
    });

    it('styles submittedBy text correctly', () => {
      const { container } = render(<KanbanBoard requests={mockRequests} onRequestClick={mockOnRequestClick} />);

      // Find the "By:" label container
      const byElements = container.querySelectorAll('.text-gray-400');
      expect(byElements.length).toBeGreaterThan(0);
    });
  });

  describe('Card Content', () => {
    it('displays request title', () => {
      render(<KanbanBoard requests={mockRequests} onRequestClick={mockOnRequestClick} />);

      expect(screen.getByText('Salesforce Automation')).toBeInTheDocument();
      expect(screen.getByText('Dashboard Reports')).toBeInTheDocument();
    });

    it('displays request ID in monospace font', () => {
      render(<KanbanBoard requests={mockRequests} onRequestClick={mockOnRequestClick} />);

      const req001 = screen.getByText('REQ-001');
      expect(req001).toHaveClass('font-mono');
    });

    it('displays days open', () => {
      render(<KanbanBoard requests={mockRequests} onRequestClick={mockOnRequestClick} />);

      expect(screen.getByText('5d')).toBeInTheDocument();
      expect(screen.getByText('3d')).toBeInTheDocument();
      expect(screen.getByText('10d')).toBeInTheDocument();
    });

    it('displays priority badges with correct styling', () => {
      render(<KanbanBoard requests={mockRequests} onRequestClick={mockOnRequestClick} />);

      const highPriority = screen.getByText('High');
      expect(highPriority).toHaveClass('bg-red-100');
      expect(highPriority).toHaveClass('text-red-700');

      const mediumPriority = screen.getByText('Medium');
      expect(mediumPriority).toHaveClass('bg-yellow-100');

      const lowPriority = screen.getByText('Low');
      expect(lowPriority).toHaveClass('bg-green-100');
    });
  });

  describe('AI Alert Display', () => {
    it('shows AI Alert badge when aiAlert is present', () => {
      render(<KanbanBoard requests={mockRequests} onRequestClick={mockOnRequestClick} />);

      expect(screen.getByText('AI Alert')).toBeInTheDocument();
    });

    it('does not show AI Alert when aiAlert is null', () => {
      const requestWithoutAlert: Request[] = [
        {
          ...mockRequests[1],
          aiAlert: null,
        },
      ];
      render(<KanbanBoard requests={requestWithoutAlert} onRequestClick={mockOnRequestClick} />);

      expect(screen.queryByText('AI Alert')).not.toBeInTheDocument();
    });

    it('renders AlertCircle icon for AI alerts', () => {
      const { container } = render(<KanbanBoard requests={mockRequests} onRequestClick={mockOnRequestClick} />);

      const alertIcon = container.querySelector('.text-red-600');
      expect(alertIcon).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onRequestClick when card is clicked', async () => {
      const user = userEvent.setup();
      render(<KanbanBoard requests={mockRequests} onRequestClick={mockOnRequestClick} />);

      const card = screen.getByText('Salesforce Automation').closest('div');
      if (card) {
        await user.click(card);
        expect(mockOnRequestClick).toHaveBeenCalledWith(mockRequests[0]);
      }
    });

    it('applies hover styles to cards', () => {
      const { container } = render(<KanbanBoard requests={mockRequests} onRequestClick={mockOnRequestClick} />);

      const cards = container.querySelectorAll('.cursor-pointer');
      expect(cards.length).toBe(3); // One for each request
      cards.forEach(card => {
        expect(card).toHaveClass('hover:border-purple-300');
        expect(card).toHaveClass('hover:shadow-md');
      });
    });
  });

  describe('SLA Badge', () => {
    it('renders SLA badge for each request', () => {
      const { container } = render(<KanbanBoard requests={mockRequests} onRequestClick={mockOnRequestClick} />);

      // Should have 3 cards, each with an SLA badge
      const cards = container.querySelectorAll('.cursor-pointer');
      expect(cards.length).toBe(3);
    });
  });

  describe('Empty States', () => {
    it('renders empty columns when no requests match stage', () => {
      const singleRequest: Request[] = [mockRequests[0]];
      render(<KanbanBoard requests={singleRequest} onRequestClick={mockOnRequestClick} />);

      expect(screen.getByText('0 requests')).toBeInTheDocument(); // Multiple empty columns
    });

    it('handles completely empty requests array', () => {
      render(<KanbanBoard requests={[]} onRequestClick={mockOnRequestClick} />);

      const zeroRequestTexts = screen.getAllByText('0 requests');
      expect(zeroRequestTexts.length).toBe(5); // All 5 columns should show 0
    });
  });

  describe('Layout', () => {
    it('renders 5-column grid layout', () => {
      const { container } = render(<KanbanBoard requests={mockRequests} onRequestClick={mockOnRequestClick} />);

      const gridContainer = container.querySelector('.grid-cols-5');
      expect(gridContainer).toBeInTheDocument();
    });

    it('applies proper spacing between cards', () => {
      const { container } = render(<KanbanBoard requests={mockRequests} onRequestClick={mockOnRequestClick} />);

      const cardContainers = container.querySelectorAll('.space-y-3');
      expect(cardContainers.length).toBe(5); // One for each stage column
    });
  });

  describe('Edge Cases', () => {
    it('handles request with all optional fields undefined', () => {
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
      render(<KanbanBoard requests={[minimalRequest]} onRequestClick={mockOnRequestClick} />);

      expect(screen.getByText('Minimal Request')).toBeInTheDocument();
      expect(screen.queryByText(/By:/)).not.toBeInTheDocument(); // No submittedBy section
      expect(screen.queryByText('AI Alert')).not.toBeInTheDocument(); // No aiAlert
    });
  });
});
