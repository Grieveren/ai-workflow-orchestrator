import { useAppContext } from '../contexts/AppContext';
import { KanbanBoard } from '../features/dashboard/components/KanbanBoard';
import { useNavigate } from 'react-router-dom';

export function KanbanPage() {
  const navigate = useNavigate();
  const { requests: requestsHook, documents } = useAppContext();
  const { requests } = requestsHook;
  const { resetDocuments } = documents;

  const handleViewRequestDetail = (request: any) => {
    requestsHook.viewRequestDetail(request);
    resetDocuments();
    navigate(`/request/${request.id}`);
  };

  return <KanbanBoard requests={requests} onRequestClick={handleViewRequestDetail} />;
}
