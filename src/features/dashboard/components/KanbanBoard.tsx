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
            <h3 className="font-semibold text-gray-800 mb-1">{stage}</h3>
            <p className="text-sm text-gray-500">
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
                    className="bg-white p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition cursor-pointer"
                  >
                    {req.aiAlert && (
                      <div className="flex items-center gap-1 mb-2 text-xs text-red-600">
                        <AlertCircle size={12} />
                        <span>AI Alert</span>
                      </div>
                    )}
                    <div className="font-medium text-gray-800 text-sm mb-2">{req.title}</div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span className="font-mono">{req.id}</span>
                      <span>{req.daysOpen}d</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        req.priority === 'High' ? 'bg-red-100 text-red-700' :
                        req.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
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
