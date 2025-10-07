import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ImpactBadge } from './ImpactBadge';
import type { Request, ImpactAssessment } from '../../types';

// Mock request factory
const createMockRequest = (impactAssessment?: ImpactAssessment): Request => ({
  id: 'REQ-001',
  title: 'Test Request',
  status: 'Open',
  owner: 'Sarah Chen',
  priority: 'Medium',
  clarityScore: 8,
  daysOpen: 5,
  stage: 'Scoping',
  lastUpdate: '2025-01-15',
  impactAssessment
});

// Mock impact assessment factory
const createMockAssessment = (totalScore: number, tier: 1 | 2 | 3 = 1): ImpactAssessment => ({
  totalScore,
  breakdown: {
    revenueImpact: 20,
    userReach: 15,
    strategicAlignment: 10,
    urgency: 10,
    quickWinBonus: totalScore - 55 // Adjust to match totalScore
  },
  tier,
  assessedAt: '2025-01-15T10:00:00Z',
  assessedBy: 'AI',
  justification: 'High business value with significant user reach'
});

describe('ImpactBadge', () => {
  describe('Variant Display', () => {
    it('renders high impact badge for score >= 80', () => {
      const request = createMockRequest(createMockAssessment(85, 1));
      render(<ImpactBadge request={request} />);

      expect(screen.getByLabelText(/High Impact/i)).toBeInTheDocument();
      expect(screen.getByText('85')).toBeInTheDocument();
      expect(screen.getByText('T1')).toBeInTheDocument();
    });

    it('renders medium impact badge for score 60-79', () => {
      const request = createMockRequest(createMockAssessment(70, 2));
      render(<ImpactBadge request={request} />);

      expect(screen.getByLabelText(/Medium Impact/i)).toBeInTheDocument();
      expect(screen.getByText('70')).toBeInTheDocument();
      expect(screen.getByText('T2')).toBeInTheDocument();
    });

    it('renders low impact badge for score < 60', () => {
      const request = createMockRequest(createMockAssessment(45, 3));
      render(<ImpactBadge request={request} />);

      expect(screen.getByLabelText(/Low Impact/i)).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument();
      expect(screen.getByText('T3')).toBeInTheDocument();
    });

    it('renders "Not Assessed" badge when no impact assessment', () => {
      const request = createMockRequest();
      render(<ImpactBadge request={request} />);

      expect(screen.getByText('Not Assessed')).toBeInTheDocument();
      expect(screen.getByLabelText(/Impact not yet assessed/i)).toBeInTheDocument();
    });
  });

  describe('Score Display', () => {
    it('shows score by default', () => {
      const request = createMockRequest(createMockAssessment(85, 1));
      render(<ImpactBadge request={request} />);

      expect(screen.getByText('85')).toBeInTheDocument();
    });

    it('hides score when showScore is false', () => {
      const request = createMockRequest(createMockAssessment(85, 1));
      render(<ImpactBadge request={request} showScore={false} />);

      expect(screen.queryByText('85')).not.toBeInTheDocument();
      expect(screen.getByText('T1')).toBeInTheDocument(); // Tier still shown
    });

    it('shows tier badge even when score is hidden', () => {
      const request = createMockRequest(createMockAssessment(70, 2));
      render(<ImpactBadge request={request} showScore={false} />);

      expect(screen.getByText('T2')).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('renders small size correctly', () => {
      const request = createMockRequest(createMockAssessment(85, 1));
      const { container } = render(<ImpactBadge request={request} size="sm" />);

      const badge = container.querySelector('.text-xs');
      expect(badge).toBeInTheDocument();
    });

    it('renders medium size by default', () => {
      const request = createMockRequest(createMockAssessment(85, 1));
      const { container } = render(<ImpactBadge request={request} />);

      const badge = container.querySelector('.text-sm');
      expect(badge).toBeInTheDocument();
    });

    it('renders large size correctly', () => {
      const request = createMockRequest(createMockAssessment(85, 1));
      const { container } = render(<ImpactBadge request={request} size="lg" />);

      const badge = container.querySelector('.text-base');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('includes descriptive aria-label for assessed requests', () => {
      const request = createMockRequest(createMockAssessment(85, 1));
      render(<ImpactBadge request={request} />);

      const badge = screen.getByLabelText(/High Impact: 85 out of 100, Tier 1/i);
      expect(badge).toBeInTheDocument();
    });

    it('includes aria-label for unassessed requests', () => {
      const request = createMockRequest();
      render(<ImpactBadge request={request} />);

      const badge = screen.getByLabelText(/Impact not yet assessed/i);
      expect(badge).toBeInTheDocument();
    });

    it('includes title tooltip with justification text', () => {
      const request = createMockRequest(createMockAssessment(85, 1));
      const { container } = render(<ImpactBadge request={request} />);

      const badge = container.querySelector('[title*="High business value"]');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles score of exactly 80 as high impact', () => {
      const request = createMockRequest(createMockAssessment(80, 1));
      render(<ImpactBadge request={request} />);

      expect(screen.getByLabelText(/High Impact/i)).toBeInTheDocument();
    });

    it('handles score of exactly 60 as medium impact', () => {
      const request = createMockRequest(createMockAssessment(60, 2));
      render(<ImpactBadge request={request} />);

      expect(screen.getByLabelText(/Medium Impact/i)).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const request = createMockRequest(createMockAssessment(85, 1));
      const { container } = render(<ImpactBadge request={request} className="custom-class" />);

      const badge = container.querySelector('.custom-class');
      expect(badge).toBeInTheDocument();
    });
  });
});
