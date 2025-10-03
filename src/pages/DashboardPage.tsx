import { useAppContext } from '../contexts/AppContext';
import { StatsBar } from '../features/dashboard/components/StatsBar';
import { RequestTable } from '../features/dashboard/components/RequestTable';
import { TeamCapacityWidget } from '../features/dashboard/components/TeamCapacityWidget';
import { useNavigate } from 'react-router-dom';

export function DashboardPage() {
  const navigate = useNavigate();
  const { requests: requestsHook, documents } = useAppContext();
  const { requests } = requestsHook;
  const { resetDocuments } = documents;

  const handleViewRequestDetail = (request: any) => {
    requestsHook.viewRequestDetail(request);
    resetDocuments();
    navigate(`/request/${request.id}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <StatsBar requests={requests} />
        <RequestTable requests={requests} onRequestClick={handleViewRequestDetail} />
      </div>
      <div className="lg:col-span-1">
        <TeamCapacityWidget />
      </div>
    </div>
  );
}
