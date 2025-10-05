import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import type { Request, ViewType } from '../../../types';

interface StatsBarProps {
  requests: Request[];
  view: ViewType;
  currentUser?: string;
}

export function StatsBar({ requests, view, currentUser }: StatsBarProps) {
  const activeRequests = requests.filter(r => r.stage !== 'Completed').length;
  const completedToday = requests.filter(r => r.stage === 'Completed' && r.lastUpdate === 'Just now').length;

  // Scope "Needs Attention" based on view
  let needsAttention = 0;
  if (view === 'requester') {
    // Requesters see only their requests with alerts
    needsAttention = requests.filter(r => r.aiAlert && r.submittedBy === currentUser).length;
  } else if (view === 'dev') {
    // Developers see their assigned requests with alerts
    needsAttention = requests.filter(r => r.aiAlert && r.owner === currentUser).length;
  } else {
    // Management sees all requests with alerts
    needsAttention = requests.filter(r => r.aiAlert).length;
  }

  // Determine label text based on view
  const getStatLabel = (baseName: string): string => {
    if (view === 'dev' && baseName !== 'Needs Attention') {
      return `My ${baseName}`;
    }
    return baseName;
  };

  return (
    <div className="grid grid-cols-3 gap-6 mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{getStatLabel('Active Requests')}</p>
            <p className="text-3xl font-bold text-gray-800 dark:text-slate-100">{activeRequests}</p>
          </div>
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-xl flex items-center justify-center">
            <Clock className="text-purple-600 dark:text-purple-400" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{getStatLabel('Completed Today')}</p>
            <p className="text-3xl font-bold text-gray-800 dark:text-slate-100">{completedToday}</p>
          </div>
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center">
            <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Needs Attention</p>
            <p className="text-3xl font-bold text-gray-800 dark:text-slate-100">{needsAttention}</p>
          </div>
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center">
            <AlertCircle className="text-red-600 dark:text-red-400" size={24} />
          </div>
        </div>
      </div>
    </div>
  );
}
