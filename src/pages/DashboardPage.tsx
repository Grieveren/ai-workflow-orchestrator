import { useAppContext } from '../contexts/AppContext';
import { StatsBar } from '../features/dashboard/components/StatsBar';
import { RequestTable } from '../features/dashboard/components/RequestTable';
import { TeamCapacityWidget } from '../features/dashboard/components/TeamCapacityWidget';
import { useNavigate } from 'react-router-dom';
import { filterRequestsByView, getCurrentUser, sortRequestsByPriority } from '../utils/requestFilters';
import type { Request } from '../types';

export function DashboardPage() {
  const navigate = useNavigate();
  const { view, requests: requestsHook, documents } = useAppContext();
  const { requests } = requestsHook;
  const { resetDocuments } = documents;

  const handleViewRequestDetail = (request: Request) => {
    requestsHook.viewRequestDetail(request);
    resetDocuments();
    navigate(`/request/${request.id}`);
  };

  // Get current user, filter, and sort requests by priority
  const currentUser = getCurrentUser(view);
  const filteredRequests = sortRequestsByPriority(
    filterRequestsByView(requests, view)
  );

  return (
    <div className={`grid grid-cols-1 ${view !== 'requester' ? 'lg:grid-cols-3' : ''} gap-6`}>
      <div className={`${view !== 'requester' ? 'lg:col-span-2' : ''} space-y-4`}>
        <StatsBar requests={filteredRequests} view={view} currentUser={currentUser} />
        <RequestTable requests={filteredRequests} onRequestClick={handleViewRequestDetail} view={view} />
      </div>
      {view !== 'requester' && (
        <div className="lg:col-span-1">
          <TeamCapacityWidget />
        </div>
      )}
    </div>
  );
}
