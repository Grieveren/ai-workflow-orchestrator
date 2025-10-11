import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnalyticsPage } from './AnalyticsPage';
import { AppProvider } from '../contexts/AppContext';

describe('AnalyticsPage', () => {
  it('renders portfolio analytics heading', async () => {
    render(
      <AppProvider>
        <AnalyticsPage />
      </AppProvider>
    );
    expect(await screen.findByText('Portfolio Analytics')).toBeInTheDocument();
  });

  it('renders all primary sections', async () => {
    render(
      <AppProvider>
        <AnalyticsPage />
      </AppProvider>
    );
    expect(await screen.findByText('Request Flow')).toBeInTheDocument();
    expect(screen.getByText('Bottleneck Detection')).toBeInTheDocument();
    expect(screen.getByText('Operational Metrics')).toBeInTheDocument();
  });

  it('displays funnel stages', async () => {
    render(
      <AppProvider>
        <AnalyticsPage />
      </AppProvider>
    );
    expect(await screen.findByText('Intake')).toBeInTheDocument();
    expect(screen.getByText('Scoping')).toBeInTheDocument();
    expect(screen.getByText('Ready for Dev')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('shows bottleneck fallback message when there is no data', async () => {
    render(
      <AppProvider>
        <AnalyticsPage />
      </AppProvider>
    );
    expect(
      await screen.findByText('All stages are currently clear — no bottlenecks detected.')
    ).toBeInTheDocument();
  });

  it('displays operational metric cards', async () => {
    render(
      <AppProvider>
        <AnalyticsPage />
      </AppProvider>
    );
    expect(await screen.findByText('Average completion time')).toBeInTheDocument();
    expect(screen.getByText('Average active age')).toBeInTheDocument();
    expect(screen.getByText('Completed vs total')).toBeInTheDocument();
    expect(screen.getByText('SLA Adherence')).toBeInTheDocument();
  });
});
