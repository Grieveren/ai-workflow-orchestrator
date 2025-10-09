import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import type { Request, ViewType } from '../../../types';

interface StatsBarProps {
  requests: Request[];
  view: ViewType;
  currentUser?: string;
}

export function StatsBar({ requests, view, currentUser }: StatsBarProps) {
  // Calculate metrics based on view type
  let activeRequests = 0;
  let completedToday = 0;
  let needsAttention = 0;

  if (view === 'requester') {
    // Requesters see their submitted requests
    activeRequests = requests.filter(r => r.stage !== 'Completed').length;
    completedToday = requests.filter(r => r.stage === 'Completed' && r.lastUpdate === 'Just now').length;
    needsAttention = requests.filter(r => r.aiAlert && r.submittedBy === currentUser).length;
  } else if (view === 'product-owner') {
    // Product Owners see Scoping stage metrics
    activeRequests = requests.filter(r => r.stage === 'Scoping').length; // Pending Review
    completedToday = requests.filter(r => r.stage === 'Ready for Dev' && r.lastUpdate === 'Just now').length; // Approved This Week
    needsAttention = requests.filter(r => r.stage === 'Scoping' && r.aiAlert).length;
  } else if (view === 'dev') {
    // Developers see their assigned requests
    activeRequests = requests.filter(r => r.stage !== 'Completed').length;
    completedToday = requests.filter(r => r.stage === 'Completed' && r.lastUpdate === 'Just now').length;
    needsAttention = requests.filter(r => r.aiAlert && r.owner === currentUser).length;
  } else {
    // Management sees all requests
    activeRequests = requests.filter(r => r.stage !== 'Completed').length;
    completedToday = requests.filter(r => r.stage === 'Completed' && r.lastUpdate === 'Just now').length;
    needsAttention = requests.filter(r => r.aiAlert).length;
  }

  // Determine label text based on view
  const getStatLabel = (baseName: string): string => {
    if (view === 'product-owner') {
      if (baseName === 'Active Requests') return 'Pending Review';
      if (baseName === 'Completed Today') return 'Approved Today';
    }
    if (view === 'dev' && baseName !== 'Needs Attention') {
      return `My ${baseName}`;
    }
    return baseName;
  };

  return (
    <div className="grid grid-cols-3 gap-6 mb-6">
      <div data-testid="stats-card" className="bg-[var(--surface-elevated)] rounded-xl shadow-xs border border-[var(--border-subtle)] p-6">
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

      <div data-testid="stats-card" className="bg-[var(--surface-elevated)] rounded-xl shadow-xs border border-[var(--border-subtle)] p-6">
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

      <div data-testid="stats-card" className="bg-[var(--surface-elevated)] rounded-xl shadow-xs border border-[var(--border-subtle)] p-6">
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
