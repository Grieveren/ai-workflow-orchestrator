import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsBar } from './StatsBar';
import type { Request } from '../../../types';

describe('StatsBar', () => {
  const mockRequests: Request[] = [
    {
      id: 'REQ-001',
      title: 'Test Request 1',
      status: 'In Progress',
      owner: 'Sarah Chen',
      submittedBy: 'Jessica Martinez',
      priority: 'High',
      clarityScore: 8,
      daysOpen: 5,
      stage: 'In Progress',
      lastUpdate: '2 days ago',
      aiAlert: 'Stalled for 3 days',
    },
    {
      id: 'REQ-002',
      title: 'Test Request 2',
      status: 'Completed',
      owner: 'Mike Torres',
      submittedBy: 'John Doe',
      priority: 'Medium',
      clarityScore: 9,
      daysOpen: 10,
      stage: 'Completed',
      lastUpdate: 'Just now',
      aiAlert: null,
    },
    {
      id: 'REQ-003',
      title: 'Test Request 3',
      status: 'Scoping',
      owner: 'Sarah Chen',
      submittedBy: 'Jane Smith',
      priority: 'Low',
      clarityScore: 6,
      daysOpen: 2,
      stage: 'Scoping',
      lastUpdate: '1 hour ago',
      aiAlert: 'Needs clarification',
    },
    {
      id: 'REQ-004',
      title: 'Test Request 4',
      status: 'Ready for Dev',
      owner: 'AI Agent',
      submittedBy: 'Jessica Martinez',
      priority: 'High',
      clarityScore: 7,
      daysOpen: 3,
      stage: 'Ready for Dev',
      lastUpdate: 'Just now',
      aiAlert: 'Urgent priority',
    },
  ];

  describe('Active Requests Count', () => {
    it('counts all non-completed requests', () => {
      render(<StatsBar requests={mockRequests} view="management" />);
      const activeLabel = screen.getByText('Active Requests');
      expect(activeLabel).toBeInTheDocument();
      // Check that there's a count displayed (3 active requests)
      const statCards = screen.getAllByText('3');
      expect(statCards.length).toBeGreaterThan(0);
    });

    it('displays as "Active Requests" for requester view', () => {
      render(<StatsBar requests={mockRequests} view="requester" />);
      expect(screen.getByText('Active Requests')).toBeInTheDocument();
    });

    it('displays as "My Active Requests" for dev view', () => {
      render(<StatsBar requests={mockRequests} view="dev" />);
      expect(screen.getByText('My Active Requests')).toBeInTheDocument();
    });

    it('displays as "Active Requests" for management view', () => {
      render(<StatsBar requests={mockRequests} view="management" />);
      expect(screen.getByText('Active Requests')).toBeInTheDocument();
    });
  });

  describe('Completed Today Count', () => {
    it('counts requests completed "Just now"', () => {
      render(<StatsBar requests={mockRequests} view="management" />);
      // Should display "Completed Today" stat with count
      const completedLabel = screen.getByText('Completed Today');
      expect(completedLabel).toBeInTheDocument();
      // Check that count 1 appears in the stats (REQ-002 is the only one completed "Just now")
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('displays as "Completed Today" for requester view', () => {
      render(<StatsBar requests={mockRequests} view="requester" />);
      expect(screen.getByText('Completed Today')).toBeInTheDocument();
    });

    it('displays as "My Completed Today" for dev view', () => {
      render(<StatsBar requests={mockRequests} view="dev" />);
      expect(screen.getByText('My Completed Today')).toBeInTheDocument();
    });

    it('displays as "Completed Today" for management view', () => {
      render(<StatsBar requests={mockRequests} view="management" />);
      expect(screen.getByText('Completed Today')).toBeInTheDocument();
    });
  });

  describe('Needs Attention - Requester View', () => {
    it('filters by submittedBy matching currentUser', () => {
      render(
        <StatsBar
          requests={mockRequests}
          view="requester"
          currentUser="Jessica Martinez"
        />
      );
      // Should show 2 requests (REQ-001 and REQ-004) submitted by Jessica with aiAlert
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('shows 0 when requester has no alerts', () => {
      render(
        <StatsBar
          requests={mockRequests}
          view="requester"
          currentUser="John Doe"
        />
      );
      // John Doe has REQ-002 but it has no aiAlert
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('always displays as "Needs Attention" (no "My" prefix)', () => {
      render(
        <StatsBar
          requests={mockRequests}
          view="requester"
          currentUser="Jessica Martinez"
        />
      );
      expect(screen.getByText('Needs Attention')).toBeInTheDocument();
      expect(screen.queryByText('My Needs Attention')).not.toBeInTheDocument();
    });
  });

  describe('Needs Attention - Developer View', () => {
    it('filters by owner matching currentUser', () => {
      render(
        <StatsBar
          requests={mockRequests}
          view="dev"
          currentUser="Sarah Chen"
        />
      );
      // Should show 2 requests (REQ-001 and REQ-003) owned by Sarah with aiAlert
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('shows 0 when developer has no alerts', () => {
      render(
        <StatsBar
          requests={mockRequests}
          view="dev"
          currentUser="Mike Torres"
        />
      );
      // Mike Torres owns REQ-002 but it has no aiAlert
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('always displays as "Needs Attention" (no "My" prefix)', () => {
      render(
        <StatsBar
          requests={mockRequests}
          view="dev"
          currentUser="Sarah Chen"
        />
      );
      expect(screen.getByText('Needs Attention')).toBeInTheDocument();
      expect(screen.queryByText('My Needs Attention')).not.toBeInTheDocument();
    });
  });

  describe('Needs Attention - Management View', () => {
    it('shows all requests with aiAlert regardless of owner or submitter', () => {
      render(
        <StatsBar
          requests={mockRequests}
          view="management"
        />
      );
      // Should show 3 requests total with aiAlert (REQ-001, REQ-003, REQ-004)
      expect(screen.getByText('Needs Attention')).toBeInTheDocument();
      const needsAttentionCard = screen.getByText('Needs Attention').closest('div');
      expect(needsAttentionCard).toHaveTextContent('3');
    });

    it('always displays as "Needs Attention" (no "My" prefix)', () => {
      render(
        <StatsBar
          requests={mockRequests}
          view="management"
        />
      );
      expect(screen.getByText('Needs Attention')).toBeInTheDocument();
      expect(screen.queryByText('My Needs Attention')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty requests array', () => {
      render(<StatsBar requests={[]} view="management" />);
      const zeros = screen.getAllByText('0');
      expect(zeros.length).toBeGreaterThanOrEqual(3); // All stats should be 0
    });

    it('handles requests without submittedBy field', () => {
      const requestsWithoutSubmitter = mockRequests.map(r => ({ ...r, submittedBy: undefined }));
      render(
        <StatsBar
          requests={requestsWithoutSubmitter}
          view="requester"
          currentUser="Jessica Martinez"
        />
      );
      // Should show 0 since no requests match the submitter
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('handles missing currentUser prop', () => {
      render(<StatsBar requests={mockRequests} view="requester" />);
      // Should show 0 when currentUser is undefined
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Visual Elements', () => {
    it('renders all three stat cards', () => {
      render(<StatsBar requests={mockRequests} view="management" />);
      const cards = screen.getAllByTestId('stats-card');
      expect(cards.length).toBe(3);
    });

    it('renders clock icon for Active Requests', () => {
      const { container } = render(<StatsBar requests={mockRequests} view="management" />);
      expect(container.querySelector('.text-purple-600')).toBeInTheDocument();
    });

    it('renders check circle icon for Completed Today', () => {
      const { container } = render(<StatsBar requests={mockRequests} view="management" />);
      expect(container.querySelector('.text-green-600')).toBeInTheDocument();
    });

    it('renders alert circle icon for Needs Attention', () => {
      const { container } = render(<StatsBar requests={mockRequests} view="management" />);
      expect(container.querySelector('.text-red-600')).toBeInTheDocument();
    });
  });
});
