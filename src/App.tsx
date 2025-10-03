import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './contexts/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/layout/Header';
import { TabNavigation } from './components/layout/TabNavigation';
import { SkeletonCard } from './components/ui/Skeleton';
import { useAppContext } from './contexts/AppContext';

// Lazy load pages for code splitting
const SubmitPage = lazy(() => import('./pages/SubmitPage').then(m => ({ default: m.SubmitPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const KanbanPage = lazy(() => import('./pages/KanbanPage').then(m => ({ default: m.KanbanPage })));
const RequestDetailPage = lazy(() => import('./pages/RequestDetailPage').then(m => ({ default: m.RequestDetailPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

function PageLoader() {
  return (
    <div className="space-y-4">
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}

// For demo purposes, using mock user names
const MOCK_REQUESTER = 'Jessica Martinez';
const MOCK_DEV = 'Sarah Chen';

function AppContent() {
  const navigate = useNavigate();
  const { view, setView, requests } = useAppContext();

  const handleViewChange = (newView: any) => {
    setView(newView);
    navigate('/dashboard');
  };

  // Calculate filtered request count based on view
  const getFilteredRequestCount = () => {
    return requests.requests.filter(request => {
      if (view === 'requester') {
        return request.submittedBy === MOCK_REQUESTER;
      } else if (view === 'dev') {
        return request.owner === MOCK_DEV || request.stage === 'Ready for Dev';
      } else if (view === 'management') {
        return true;
      }
      return true;
    }).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-5xl mx-auto">
        <Header view={view} onViewChange={handleViewChange} />
        <TabNavigation requestCount={getFilteredRequestCount()} view={view} />

        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<SubmitPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/kanban" element={<KanbanPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/request/:id" element={<RequestDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProvider>
          <AppContent />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#fff',
                color: '#374151',
                border: '1px solid #E5E7EB',
                borderRadius: '0.75rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                padding: '1rem',
                maxWidth: '500px',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
