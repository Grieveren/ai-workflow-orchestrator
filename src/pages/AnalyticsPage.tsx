import { useAppContext } from '../contexts/AppContext';
import { TrendingDown, AlertTriangle, BarChart3, ArrowRight } from 'lucide-react';
import type { RequestStage } from '../types';

export function AnalyticsPage() {
  const { requests: requestsHook } = useAppContext();
  const { requests } = requestsHook;

  // Calculate funnel counts from actual requests
  const funnelData: { stage: RequestStage; count: number }[] = [
    { stage: 'Intake', count: requests.filter(r => r.stage === 'Intake').length },
    { stage: 'Scoping', count: requests.filter(r => r.stage === 'Scoping').length },
    { stage: 'Ready for Dev', count: requests.filter(r => r.stage === 'Ready for Dev').length },
    { stage: 'In Progress', count: requests.filter(r => r.stage === 'In Progress').length },
    { stage: 'Review', count: requests.filter(r => r.stage === 'Review').length },
    { stage: 'Completed', count: requests.filter(r => r.stage === 'Completed').length }
  ];

  // Mock bottleneck data for demo
  const bottleneck = {
    stage: 'Review',
    avgDuration: 3.2,
    targetDuration: 1.5,
    recommendation: 'Add reviewer capacity or implement automated checks'
  };

  // Mock cycle time data for demo
  const cycleTime = {
    current: 8.5,
    previous: 12.0,
    slaAdherence: 92
  };

  const improvement = ((cycleTime.previous - cycleTime.current) / cycleTime.previous * 100).toFixed(0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Portfolio Analytics</h1>
        <p className="text-gray-600 mt-1">Executive dashboard showing portfolio health and workflow efficiency</p>
      </div>

      {/* Section 1: Funnel */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Request Flow</h2>
        </div>

        <div className="space-y-3">
          {funnelData.map((item, index) => {
            const maxCount = Math.max(...funnelData.map(d => d.count));
            const widthPercent = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
            const isHighCount = item.count >= 2;

            return (
              <div key={item.stage} className="flex items-center gap-4">
                <div className="w-32 shrink-0 text-sm font-medium text-gray-700">
                  {item.stage}
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <div
                    className={`h-10 rounded transition-all ${
                      isHighCount ? 'bg-yellow-400' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.max(widthPercent, 5)}%` }}
                  />
                  <span className="text-lg font-semibold text-gray-900 min-w-8">
                    {item.count}
                  </span>
                </div>
                {index < funnelData.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total Active Requests</span>
            <span className="font-semibold text-gray-900">
              {funnelData.reduce((sum, item) => sum + item.count, 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Section 2: Bottleneck */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <AlertTriangle className="w-6 h-6 text-yellow-600" />
          <h2 className="text-xl font-semibold text-gray-900">Bottleneck Detection</h2>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-yellow-900 mb-2">
                Bottleneck Alert: "{bottleneck.stage}" stage
              </div>
              <div className="space-y-1 text-sm text-yellow-800">
                <div className="flex items-center justify-between">
                  <span>Average duration:</span>
                  <span className="font-semibold">{bottleneck.avgDuration} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Target duration:</span>
                  <span className="font-semibold">{bottleneck.targetDuration} days</span>
                </div>
                <div className="flex items-center justify-between text-yellow-900">
                  <span>Performance:</span>
                  <span className="font-bold">
                    {((bottleneck.avgDuration / bottleneck.targetDuration) * 100).toFixed(0)}%
                    <span className="text-xs ml-1">
                      ({(bottleneck.avgDuration / bottleneck.targetDuration).toFixed(1)}x slower)
                    </span>
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-yellow-200">
                <div className="text-sm text-yellow-900">
                  <span className="font-semibold">Recommendation:</span> {bottleneck.recommendation}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Cycle Time */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingDown className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">Cycle Time Trends</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Current Cycle Time */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-700 mb-1">Current Average</div>
            <div className="text-3xl font-bold text-blue-900">{cycleTime.current}</div>
            <div className="text-xs text-blue-600 mt-1">days to complete</div>
          </div>

          {/* Previous Cycle Time */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-700 mb-1">Last Month</div>
            <div className="text-3xl font-bold text-gray-900">{cycleTime.previous}</div>
            <div className="text-xs text-gray-600 mt-1">days to complete</div>
          </div>

          {/* Improvement */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-700 mb-1">Improvement</div>
            <div className="text-3xl font-bold text-green-900">-{improvement}%</div>
            <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              faster than last month
            </div>
          </div>

          {/* SLA Adherence */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-sm text-purple-700 mb-1">SLA Adherence</div>
            <div className="text-3xl font-bold text-purple-900">{cycleTime.slaAdherence}%</div>
            <div className="text-xs text-purple-600 mt-1">on-time delivery</div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Performance trending positively</span>
            <span className="ml-auto text-gray-500">Based on last 30 days</span>
          </div>
        </div>
      </div>
    </div>
  );
}
