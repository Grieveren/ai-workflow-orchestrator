import { Users, Bot } from 'lucide-react';
import { StageBadge, SLABadge } from '../../../components/ui';
import { calculateSLA } from '../../../utils/slaCalculator';
import type { Request } from '../../../types';

interface RequestTableProps {
  requests: Request[];
  onRequestClick: (request: Request) => void;
}

export function RequestTable({ requests, onRequestClick }: RequestTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Request</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stage</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Owner</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SLA</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Days Open</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {requests.map((req) => {
              const sla = req.sla || calculateSLA(req);
              return (
                <tr
                  key={req.id}
                  className="hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => onRequestClick(req)}
                >
                  <td className="px-6 py-4 text-sm text-gray-600 font-mono">{req.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium">{req.title}</td>
                  <td className="px-6 py-4">
                    <StageBadge stage={req.stage} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      {req.owner === 'AI Agent' ?
                        <Bot size={16} className="text-purple-500" /> :
                        <Users size={16} className="text-gray-400" />
                      }
                      {req.owner}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      req.priority === 'High' ? 'bg-red-100 text-red-700' :
                      req.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {req.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <SLABadge sla={sla} size="sm" />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{req.daysOpen} days</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
