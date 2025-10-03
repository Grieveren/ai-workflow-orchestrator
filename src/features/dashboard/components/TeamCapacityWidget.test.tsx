import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TeamCapacityWidget } from './TeamCapacityWidget';

describe('TeamCapacityWidget', () => {
  it('renders the component with header and average utilization', () => {
    render(<TeamCapacityWidget />);

    expect(screen.getByText('Team Capacity')).toBeInTheDocument();
    expect(screen.getByText(/Avg:/)).toBeInTheDocument();
    expect(screen.getByText(/55%/)).toBeInTheDocument(); // Average of 60, 40, 80, 40
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
    expect(screen.getByText('Systems Specialist')).toBeInTheDocument();
  });

  it('displays request counts and utilization percentages', () => {
    render(<TeamCapacityWidget />);

    expect(screen.getByText('3/5 requests')).toBeInTheDocument();
    expect(screen.getAllByText('2/5 requests').length).toBe(2); // Mike and Alex both have 2/5
    expect(screen.getByText('4/5 requests')).toBeInTheDocument();

    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getAllByText('40%').length).toBe(2); // Mike and Alex both have 40%
    expect(screen.getByText('80%')).toBeInTheDocument();
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
