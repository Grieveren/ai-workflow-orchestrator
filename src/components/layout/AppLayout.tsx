import { Outlet, useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { TabNavigation } from './TabNavigation';
import { useAppContext } from '../../contexts/AppContext';
import { filterRequestsByView } from '../../utils/requestFilters';
import type { ViewType } from '../../types';

/**
 * Layout wrapper that provides Header and TabNavigation for all routes except landing page
 * Uses React Router's Outlet to render child routes
 */
export function AppLayout() {
  const navigate = useNavigate();
  const { view, setView, requests } = useAppContext();

  const handleViewChange = (newView: ViewType) => {
    setView(newView);
    navigate('/dashboard');
  };

  // Calculate filtered request count based on view
  const getFilteredRequestCount = () => {
    return filterRequestsByView(requests.requests, view).length;
  };

  return (
    <>
      <Header view={view} onViewChange={handleViewChange} />
      <TabNavigation requestCount={getFilteredRequestCount()} view={view} />
      <Outlet />
    </>
  );
}
