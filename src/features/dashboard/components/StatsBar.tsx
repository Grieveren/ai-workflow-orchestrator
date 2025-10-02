import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import type { Request } from '../../../types';

interface StatsBarProps {
  requests: Request[];
}

export function StatsBar({ requests }: StatsBarProps) {
  const activeRequests = requests.filter(r => r.stage !== 'Completed').length;
  const completedToday = requests.filter(r => r.stage === 'Completed' && r.lastUpdate === 'Just now').length;
  const needsAttention = requests.filter(r => r.aiAlert).length;

  return (
    <div className="grid grid-cols-3 gap-6 mb-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Active Requests</p>
            <p className="text-3xl font-bold text-gray-800">{activeRequests}</p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Clock className="text-purple-600" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Completed Today</p>
            <p className="text-3xl font-bold text-gray-800">{completedToday}</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <CheckCircle className="text-green-600" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Needs Attention</p>
            <p className="text-3xl font-bold text-gray-800">{needsAttention}</p>
          </div>
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <AlertCircle className="text-red-600" size={24} />
          </div>
        </div>
      </div>
    </div>
  );
}
