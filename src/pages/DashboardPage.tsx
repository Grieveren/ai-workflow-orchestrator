import { useAppContext } from '../contexts/AppContext';
import { StatsBar } from '../features/dashboard/components/StatsBar';
import { RequestTable } from '../features/dashboard/components/RequestTable';
import { TeamCapacityWidget } from '../features/dashboard/components/TeamCapacityWidget';
import { useNavigate } from 'react-router-dom';
import { filterRequestsByView, getCurrentUser, sortRequestsByImpact } from '../utils/requestFilters';
import type { Request } from '../types';
import { SkeletonCard } from '../components/ui/Skeleton';
import { Button } from '../components/ui';

export function DashboardPage() {
  const navigate = useNavigate();
  const { view, requests: requestsHook, documents } = useAppContext();
  const { requests, loading, error, reloadRequests } = requestsHook;
  const { resetDocuments } = documents;

  const handleViewRequestDetail = (request: Request) => {
    requestsHook.viewRequestDetail(request);
    resetDocuments();
    navigate(`/request/${request.id}`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[var(--surface-elevated)] rounded-xl shadow-xs border border-[var(--border-subtle)] p-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">We couldn&apos;t load your requests</h2>
        <p className="text-[var(--text-secondary)] mb-4">{error}</p>
        <Button variant="primary" onClick={() => reloadRequests()}>
          Try again
        </Button>
      </div>
    );
  }

  // Get current user, filter, and sort requests by impact score (with priority fallback)
  const currentUser = getCurrentUser(view);
  const filteredRequests = sortRequestsByImpact(
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
