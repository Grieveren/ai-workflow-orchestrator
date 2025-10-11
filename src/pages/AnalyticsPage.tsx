import { useAppContext } from '../contexts/AppContext';
import { TrendingDown, AlertTriangle, BarChart3, ArrowRight } from 'lucide-react';
import type { RequestStage } from '../types';
import { SkeletonCard } from '../components/ui/Skeleton';
import { Button } from '../components/ui';

export function AnalyticsPage() {
  const { requests: requestsHook } = useAppContext();
  const { requests, loading, error, reloadRequests } = requestsHook;

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[var(--surface-elevated)] rounded-xl shadow-xs border border-[var(--border-subtle)] p-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Analytics unavailable</h2>
        <p className="text-[var(--text-secondary)] mb-4">{error}</p>
        <Button variant="primary" onClick={() => reloadRequests()}>
          Refresh data
        </Button>
      </div>
    );
  }

  // Calculate funnel counts from actual requests
  const funnelData: { stage: RequestStage; count: number }[] = [
    { stage: 'Intake', count: requests.filter(r => r.stage === 'Intake').length },
    { stage: 'Scoping', count: requests.filter(r => r.stage === 'Scoping').length },
    { stage: 'Ready for Dev', count: requests.filter(r => r.stage === 'Ready for Dev').length },
    { stage: 'In Progress', count: requests.filter(r => r.stage === 'In Progress').length },
    { stage: 'Review', count: requests.filter(r => r.stage === 'Review').length },
    { stage: 'Completed', count: requests.filter(r => r.stage === 'Completed').length }
  ];

  const activeStages = funnelData.filter(item => item.stage !== 'Completed');
  const bottleneckStage = activeStages.reduce<{ stage: RequestStage | null; count: number }>(
    (acc, item) => {
      if (item.count > acc.count) {
        return { stage: item.stage, count: item.count };
      }
      return acc;
    },
    { stage: null, count: 0 }
  );

  const bottleneckRequests = bottleneckStage.stage
    ? requests.filter(r => r.stage === bottleneckStage.stage)
    : [];

  const averageStageDuration = (() => {
    const stageDurations = bottleneckRequests
      .map(r => r.sla?.stageDurations?.[bottleneckStage.stage as RequestStage])
      .filter((value): value is number => typeof value === 'number');

    if (stageDurations.length > 0) {
      return stageDurations.reduce((sum, value) => sum + value, 0) / stageDurations.length;
    }

    if (bottleneckRequests.length > 0) {
      return bottleneckRequests.reduce((sum, request) => sum + request.daysOpen, 0) / bottleneckRequests.length;
    }

    return null;
  })();

  const completedRequests = requests.filter(r => r.stage === 'Completed');
  const getCycleTimeDays = (request: typeof completedRequests[number]) => {
    const stageDurations = request.sla?.stageDurations;
    if (stageDurations) {
      return Object.values(stageDurations).reduce((sum, value) => sum + value, 0);
    }
    return request.daysOpen;
  };

  const averageCompletionTime = completedRequests.length > 0
    ? completedRequests.reduce((sum, request) => sum + getCycleTimeDays(request), 0) / completedRequests.length
    : null;

  const activeRequests = requests.filter(r => r.stage !== 'Completed');
  const averageActiveAge = activeRequests.length > 0
    ? activeRequests.reduce((sum, request) => sum + request.daysOpen, 0) / activeRequests.length
    : null;

  const completionRate = requests.length > 0
    ? (completedRequests.length / requests.length) * 100
    : null;

  const requestsWithSLA = requests.filter(r => r.sla);
  const onTimeRequests = requestsWithSLA.filter(r => r.sla?.status === 'on-time');
  const slaAdherence = requestsWithSLA.length > 0
    ? (onTimeRequests.length / requestsWithSLA.length) * 100
    : null;

  const formatNumber = (value: number | null, suffix = '') => {
    if (value === null || Number.isNaN(value)) {
      return '—';
    }
    if (suffix === '%') {
      return `${Math.round(value)}${suffix}`;
    }
    return `${Math.round(value * 10) / 10}${suffix}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Portfolio Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Executive dashboard showing portfolio health and workflow efficiency</p>
      </div>

      {/* Section 1: Funnel */}
      <div className="bg-[var(--surface-elevated)] rounded-xl shadow-xs border border-[var(--border-subtle)] p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Request Flow</h2>
        </div>

        <div className="space-y-3">
          {funnelData.map((item, index) => {
            const maxCount = Math.max(...funnelData.map(d => d.count));
            const widthPercent = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
            const isHighCount = item.count >= 2;

            return (
              <div key={item.stage} className="flex items-center gap-4">
                <div className="w-32 shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {item.stage}
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <div
                    className={`h-10 rounded transition-all ${
                      isHighCount ? 'bg-yellow-400 dark:bg-yellow-500' : 'bg-blue-500 dark:bg-blue-600'
                    }`}
                    style={{ width: `${Math.max(widthPercent, 5)}%` }}
                  />
                  <span className="text-lg font-semibold text-gray-900 dark:text-slate-100 min-w-8">
                    {item.count}
                  </span>
                </div>
                {index < funnelData.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Total Active Requests</span>
            <span className="font-semibold text-gray-900 dark:text-slate-100">
              {funnelData.reduce((sum, item) => sum + item.count, 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Section 2: Bottleneck */}
      <div className="bg-[var(--surface-elevated)] rounded-xl shadow-xs border border-[var(--border-subtle)] p-6">
        <div className="flex items-center gap-2 mb-6">
          <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Bottleneck Detection</h2>
        </div>

        {bottleneckStage.stage ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2">
                  Highest workload in <span className="font-bold">{bottleneckStage.stage}</span>
                </div>
                <div className="space-y-1 text-sm text-yellow-800 dark:text-yellow-400">
                  <div className="flex items-center justify-between">
                    <span>Requests waiting here:</span>
                    <span className="font-semibold">{bottleneckStage.count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Average time in stage:</span>
                    <span className="font-semibold">
                      {averageStageDuration === null ? '—' : `${Math.round(averageStageDuration * 10) / 10} days`}
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-yellow-200 dark:border-yellow-800 text-sm text-yellow-900 dark:text-yellow-300">
                  <span className="font-semibold">Suggestion:</span> Shift reviewer capacity or move the next ready item forward.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[var(--surface-muted)] border border-[var(--border-subtle)] rounded-lg p-4 text-sm text-[var(--text-secondary)]">
            All stages are currently clear — no bottlenecks detected.
          </div>
        )}
      </div>

      {/* Section 3: Operational Metrics */}
      <div className="bg-[var(--surface-elevated)] rounded-xl shadow-xs border border-[var(--border-subtle)] p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingDown className="w-6 h-6 text-green-600 dark:text-green-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Operational Metrics</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Average Completion Time */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="text-sm text-blue-700 dark:text-blue-400 mb-1">Average completion time</div>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-300">
              {formatNumber(averageCompletionTime, ' days')}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">based on completed requests</div>
          </div>

          {/* Average Active Age */}
          <div className="bg-gray-50 dark:bg-gray-900 border border-[var(--border-subtle)] rounded-lg p-4">
            <div className="text-sm text-gray-700 dark:text-gray-400 mb-1">Average active age</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-slate-100">
              {formatNumber(averageActiveAge, ' days')}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">current in-progress workload</div>
          </div>

          {/* Completion Rate */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="text-sm text-green-700 dark:text-green-400 mb-1">Completed vs total</div>
            <div className="text-3xl font-bold text-green-900 dark:text-green-300">
              {formatNumber(completionRate, '%')}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              proportion of requests delivered
            </div>
          </div>

          {/* SLA Adherence */}
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <div className="text-sm text-purple-700 dark:text-purple-400 mb-1">SLA Adherence</div>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-300">
              {formatNumber(slaAdherence, '%')}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              based on requests with SLA tracking
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] text-sm text-gray-600 dark:text-gray-400">
          Metrics above are calculated directly from the current request portfolio.
        </div>
      </div>
    </div>
  );
}
