import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnalyticsPage } from './AnalyticsPage';
import { AppProvider } from '../contexts/AppContext';

describe('AnalyticsPage', () => {
  it('renders portfolio analytics heading', () => {
    render(
      <AppProvider>
        <AnalyticsPage />
      </AppProvider>
    );
    expect(screen.getByText('Portfolio Analytics')).toBeInTheDocument();
  });

  it('renders all three main sections', () => {
    render(
      <AppProvider>
        <AnalyticsPage />
      </AppProvider>
    );
    expect(screen.getByText('Request Flow')).toBeInTheDocument();
    expect(screen.getByText('Bottleneck Detection')).toBeInTheDocument();
    expect(screen.getByText('Cycle Time Trends')).toBeInTheDocument();
  });

  it('displays funnel stages', () => {
    render(
      <AppProvider>
        <AnalyticsPage />
      </AppProvider>
    );
    expect(screen.getByText('Intake')).toBeInTheDocument();
    expect(screen.getByText('Scoping')).toBeInTheDocument();
    expect(screen.getByText('Ready for Dev')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('shows bottleneck alert', () => {
    render(
      <AppProvider>
        <AnalyticsPage />
      </AppProvider>
    );
    expect(screen.getByText(/Bottleneck Alert/)).toBeInTheDocument();
  });

  it('displays cycle time metrics', () => {
    render(
      <AppProvider>
        <AnalyticsPage />
      </AppProvider>
    );
    expect(screen.getByText('Current Average')).toBeInTheDocument();
    expect(screen.getByText('Last Month')).toBeInTheDocument();
    expect(screen.getByText('Improvement')).toBeInTheDocument();
    expect(screen.getByText('SLA Adherence')).toBeInTheDocument();
  });
});
