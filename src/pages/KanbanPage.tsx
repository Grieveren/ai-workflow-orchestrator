import { useAppContext } from '../contexts/AppContext';
import { KanbanBoard } from '../features/dashboard/components/KanbanBoard';
import { useNavigate } from 'react-router-dom';
import { filterRequestsByView, sortRequestsByPriority } from '../utils/requestFilters';
import type { Request } from '../types';

export function KanbanPage() {
  const navigate = useNavigate();
  const { view, requests: requestsHook, documents } = useAppContext();
  const { requests } = requestsHook;
  const { resetDocuments } = documents;

  const handleViewRequestDetail = (request: Request) => {
    requestsHook.viewRequestDetail(request);
    resetDocuments();
    navigate(`/request/${request.id}`);
  };

  // Filter and sort requests by priority (Kanban only for dev and management)
  const filteredRequests = sortRequestsByPriority(
    filterRequestsByView(requests, view)
  );

  return <KanbanBoard requests={filteredRequests} onRequestClick={handleViewRequestDetail} />;
}
