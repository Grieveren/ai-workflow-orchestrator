import { useAppContext } from '../contexts/AppContext';
import { StatsBar } from '../features/dashboard/components/StatsBar';
import { RequestTable } from '../features/dashboard/components/RequestTable';
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
    <div className="space-y-4">
      <StatsBar requests={requests} />
      <RequestTable requests={requests} onRequestClick={handleViewRequestDetail} />
    </div>
  );
}
