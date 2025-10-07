import { Link, useLocation } from 'react-router-dom';
import type { ViewType } from '../../types';

interface TabNavigationProps {
  requestCount: number;
  view: ViewType;
}

export function TabNavigation({ requestCount, view }: TabNavigationProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const getClassName = (path: string) => {
    return `px-6 py-2.5 rounded-xl font-medium transition shadow-xs ${
      isActive(path)
        ? 'bg-linear-to-r from-purple-500 to-pink-500 text-white shadow-md'
        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-gray-700'
    }`;
  };

  return (
    <div className="flex gap-3 justify-center mb-6">
      {/* Requester View: Dashboard first, then New Request */}
      {view === 'requester' && (
        <>
          <Link to="/dashboard" className={getClassName('/dashboard')}>
            Dashboard ({requestCount})
          </Link>
          <Link to="/" className={getClassName('/')}>
            New Request
          </Link>
        </>
      )}

      {/* Product Owner, Developer, and Management Views */}
      {(view === 'product-owner' || view === 'dev' || view === 'management') && (
        <>
          <Link to="/dashboard" className={getClassName('/dashboard')}>
            Dashboard ({requestCount})
          </Link>
          <Link to="/kanban" className={getClassName('/kanban')}>
            Kanban Board
          </Link>
          <Link to="/analytics" className={getClassName('/analytics')}>
            Analytics
          </Link>
        </>
      )}
    </div>
  );
}
