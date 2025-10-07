import { Users, Bot, ArrowDown } from 'lucide-react';
import { StageBadge, SLABadge, ImpactBadge } from '../../../components/ui';
import { calculateSLA } from '../../../utils/slaCalculator';
import type { Request, ViewType } from '../../../types';

interface RequestTableProps {
  requests: Request[];
  onRequestClick: (request: Request) => void;
  view?: ViewType;
}

export function RequestTable({ requests, onRequestClick, view }: RequestTableProps) {
  const showSubmittedBy = view === 'dev' || view === 'management';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">ID</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Request</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Stage</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <span>Impact</span>
                  <ArrowDown
                    size={14}
                    className="text-purple-500 dark:text-purple-400"
                    aria-label="Sorted by impact (high to low)"
                  />
                </div>
              </th>
              {showSubmittedBy && (
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Requester</th>
              )}
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Owner</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">SLA</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Days Open</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {requests.map((req) => {
              const sla = req.sla || calculateSLA(req);
              return (
                <tr
                  key={req.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer"
                  onClick={() => onRequestClick(req)}
                >
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 font-mono">{req.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-800 dark:text-slate-100 font-medium">{req.title}</td>
                  <td className="px-6 py-4">
                    <StageBadge stage={req.stage} />
                  </td>
                  <td className="px-6 py-4">
                    <ImpactBadge request={req} size="sm" />
                  </td>
                  {showSubmittedBy && (
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-gray-400 dark:text-gray-500" />
                        {req.submittedBy || 'Unknown'}
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      {req.owner === 'AI Agent' ?
                        <Bot size={16} className="text-purple-500 dark:text-purple-400" /> :
                        <Users size={16} className="text-gray-400 dark:text-gray-500" />
                      }
                      {req.owner}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      req.priority === 'High' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' :
                      req.priority === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300' :
                      'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                    }`}>
                      {req.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <SLABadge sla={sla} size="sm" />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{req.daysOpen} days</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
