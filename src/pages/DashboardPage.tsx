import { useAppContext } from '../contexts/AppContext';
import { StatsBar } from '../features/dashboard/components/StatsBar';
import { RequestTable } from '../features/dashboard/components/RequestTable';
import { TeamCapacityWidget } from '../features/dashboard/components/TeamCapacityWidget';
import { useNavigate } from 'react-router-dom';

// For demo purposes, using mock user names
const MOCK_REQUESTER = 'Jessica Martinez'; // Same as first mock request submitter
const MOCK_DEV = 'Sarah Chen'; // Same as first mock developer

export function DashboardPage() {
  const navigate = useNavigate();
  const { view, requests: requestsHook, documents } = useAppContext();
  const { requests } = requestsHook;
  const { resetDocuments } = documents;

  const handleViewRequestDetail = (request: any) => {
    requestsHook.viewRequestDetail(request);
    resetDocuments();
    navigate(`/request/${request.id}`);
  };

  // Filter requests based on view
  const filteredRequests = requests.filter(request => {
    if (view === 'requester') {
      // Requesters see only their submitted requests
      return request.submittedBy === MOCK_REQUESTER;
    } else if (view === 'dev') {
      // Developers see requests assigned to them OR available to pick up (Ready for Dev)
      return request.owner === MOCK_DEV || request.stage === 'Ready for Dev';
    } else if (view === 'management') {
      // Management sees everything
      return true;
    }
    return true;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <StatsBar requests={filteredRequests} />
        <RequestTable requests={filteredRequests} onRequestClick={handleViewRequestDetail} />
      </div>
      <div className="lg:col-span-1">
        <TeamCapacityWidget />
      </div>
    </div>
  );
}
