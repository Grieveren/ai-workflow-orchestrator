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
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname.startsWith('/request');
    }
    return location.pathname.startsWith(path);
  };

  const getClassName = (path: string) => {
    return `px-6 py-2.5 rounded-xl font-medium transition shadow-xs ${
      isActive(path)
        ? 'bg-linear-to-r from-purple-500 to-pink-500 text-white shadow-md'
        : 'bg-[var(--surface-elevated)] text-[var(--text-primary)] hover:bg-[var(--surface-muted)]'
    }`;
  };

  return (
    <div className="flex gap-3 justify-center mb-6">
      {/* Requester View: Dashboard first, then New Request */}
      {view === 'requester' && (
        <>
          <Link
            to="/dashboard"
            className={getClassName('/dashboard')}
            aria-current={isActive('/dashboard') ? 'page' : undefined}
          >
            Dashboard ({requestCount})
          </Link>
          <Link
            to="/"
            className={getClassName('/')}
            aria-current={isActive('/') ? 'page' : undefined}
          >
            New Request
          </Link>
        </>
      )}

      {/* Product Owner, Developer, and Management Views */}
      {(view === 'product-owner' || view === 'dev' || view === 'management') && (
        <>
          <Link
            to="/dashboard"
            className={getClassName('/dashboard')}
            aria-current={isActive('/dashboard') ? 'page' : undefined}
          >
            Dashboard ({requestCount})
          </Link>
          <Link
            to="/kanban"
            className={getClassName('/kanban')}
            aria-current={isActive('/kanban') ? 'page' : undefined}
          >
            Kanban Board
          </Link>
          <Link
            to="/analytics"
            className={getClassName('/analytics')}
            aria-current={isActive('/analytics') ? 'page' : undefined}
          >
            Analytics
          </Link>
        </>
      )}
    </div>
  );
}
