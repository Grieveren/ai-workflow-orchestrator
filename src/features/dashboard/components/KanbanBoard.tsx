import { AlertCircle } from 'lucide-react';
import { SLABadge } from '../../../components/ui';
import { calculateSLA } from '../../../utils/slaCalculator';
import type { Request, RequestStage } from '../../../types';

interface KanbanBoardProps {
  requests: Request[];
  onRequestClick: (request: Request) => void;
}

const stages: RequestStage[] = ['Scoping', 'Ready for Dev', 'In Progress', 'Review', 'Completed'];

export function KanbanBoard({ requests, onRequestClick }: KanbanBoardProps) {
  return (
    <div className="grid grid-cols-5 gap-4">
      {stages.map(stage => (
        <div key={stage} className="flex flex-col">
          <div className="mb-3">
            <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-1">{stage}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {requests.filter(r => r.stage === stage).length} requests
            </p>
          </div>

          <div className="space-y-3">
            {requests
              .filter(r => r.stage === stage)
              .map(req => {
                const sla = req.sla || calculateSLA(req);
                return (
                  <div
                    key={req.id}
                    onClick={() => onRequestClick(req)}
                    className="bg-[var(--surface-elevated)] p-4 rounded-lg border border-[var(--border-subtle)] hover:border-purple-300 dark:hover:border-purple-500 hover:shadow-md transition cursor-pointer"
                    data-kanban-card
                  >
                    {req.aiAlert && (
                      <div className="flex items-center gap-1 mb-2 text-xs text-red-600 dark:text-red-400">
                        <AlertCircle size={12} />
                        <span>AI Alert</span>
                      </div>
                    )}
                    <div className="font-medium text-gray-800 dark:text-slate-100 text-sm mb-2">{req.title}</div>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                      <span className="font-mono">{req.id}</span>
                      <span>{req.daysOpen}d</span>
                    </div>
                    {req.submittedBy && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        <span className="text-gray-400 dark:text-gray-500">By:</span> {req.submittedBy}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        req.priority === 'High' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' :
                        req.priority === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300' :
                        'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                      }`}>
                        {req.priority}
                      </span>
                      <SLABadge sla={sla} size="sm" />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
