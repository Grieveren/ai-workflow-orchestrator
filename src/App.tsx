import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

function AppContent() {
  const { view, setView, requests } = useAppContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-5xl mx-auto">
        <Header view={view} onViewChange={setView} />
        <TabNavigation requestCount={requests.requests.length} />

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
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
