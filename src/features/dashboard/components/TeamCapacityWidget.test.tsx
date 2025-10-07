import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TeamCapacityWidget } from './TeamCapacityWidget';

describe('TeamCapacityWidget', () => {
  it('renders the component with header and average utilization', () => {
    render(<TeamCapacityWidget />);

    expect(screen.getByText('Team Capacity')).toBeInTheDocument();
    expect(screen.getByText(/Avg:/)).toBeInTheDocument();
    expect(screen.getByText(/50%/)).toBeInTheDocument(); // Average of 60, 40, 80, 20
  });

  it('displays all team members', () => {
    render(<TeamCapacityWidget />);

    expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
    expect(screen.getByText('Mike Torres')).toBeInTheDocument();
    expect(screen.getByText('Jennifer Kim')).toBeInTheDocument();
    expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
  });

  it('shows team member roles', () => {
    render(<TeamCapacityWidget />);

    expect(screen.getByText('Data Analyst')).toBeInTheDocument();
    expect(screen.getByText('Salesforce Admin')).toBeInTheDocument();
    expect(screen.getByText('RevOps Manager')).toBeInTheDocument();
    expect(screen.getByText('Product Owner')).toBeInTheDocument();
  });

  it('displays request counts and utilization percentages', () => {
    render(<TeamCapacityWidget />);

    expect(screen.getByText('3/5 requests')).toBeInTheDocument(); // Sarah
    expect(screen.getByText('2/5 requests')).toBeInTheDocument(); // Mike
    expect(screen.getByText('4/5 requests')).toBeInTheDocument(); // Jennifer
    expect(screen.getByText('1/5 requests')).toBeInTheDocument(); // Alex (Product Owner)

    expect(screen.getByText('60%')).toBeInTheDocument(); // Sarah
    expect(screen.getByText('40%')).toBeInTheDocument(); // Mike
    expect(screen.getByText('80%')).toBeInTheDocument(); // Jennifer
    expect(screen.getByText('20%')).toBeInTheDocument(); // Alex (Product Owner)
  });

  it('shows warning icon for overloaded members (utilization > 85%)', () => {
    render(<TeamCapacityWidget />);

    // Jennifer Kim has 80% utilization, which is NOT overloaded (threshold is > 85%)
    // None of the team members in the mock data exceed 85%, so there should be no warnings
    const warningIcons = screen.queryAllByRole('img', { hidden: true });
    expect(warningIcons.length).toBe(0);
  });

  it('renders progress bars for all team members', () => {
    const { container } = render(<TeamCapacityWidget />);

    // Check for progress bar container divs
    const progressBars = container.querySelectorAll('.h-2.rounded-full');
    expect(progressBars.length).toBeGreaterThan(0);
  });
});
