import { useAppContext } from '../contexts/AppContext';
import { KanbanBoard } from '../features/dashboard/components/KanbanBoard';
import { useNavigate } from 'react-router-dom';

// For demo purposes, using mock user names
const MOCK_DEV = 'Sarah Chen';

export function KanbanPage() {
  const navigate = useNavigate();
  const { view, requests: requestsHook, documents } = useAppContext();
  const { requests } = requestsHook;
  const { resetDocuments } = documents;

  const handleViewRequestDetail = (request: any) => {
    requestsHook.viewRequestDetail(request);
    resetDocuments();
    navigate(`/request/${request.id}`);
  };

  // Filter requests based on view (Kanban only for dev and management)
  const filteredRequests = requests.filter(request => {
    if (view === 'dev') {
      // Developers see requests assigned to them OR available to pick up
      return request.owner === MOCK_DEV || request.stage === 'Ready for Dev';
    } else if (view === 'management') {
      // Management sees everything
      return true;
    }
    return true;
  });

  return <KanbanBoard requests={filteredRequests} onRequestClick={handleViewRequestDetail} />;
}
