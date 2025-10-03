import { Link, useLocation } from 'react-router-dom';

interface TabNavigationProps {
  requestCount: number;
}

export function TabNavigation({ requestCount }: TabNavigationProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const getClassName = (path: string) => {
    return `px-6 py-2.5 rounded-xl font-medium transition shadow-sm ${
      isActive(path)
        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
        : 'bg-white text-gray-700 hover:bg-gray-50'
    }`;
  };

  return (
    <div className="flex gap-3 justify-center mb-6">
      <Link to="/" className={getClassName('/')}>
        New Request
      </Link>
      <Link to="/dashboard" className={getClassName('/dashboard')}>
        Dashboard ({requestCount})
      </Link>
      <Link to="/kanban" className={getClassName('/kanban')}>
        Kanban Board
      </Link>
      <Link to="/analytics" className={getClassName('/analytics')}>
        Analytics
      </Link>
    </div>
  );
}
