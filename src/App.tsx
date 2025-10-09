import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './contexts/AppContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppLayout } from './components/layout/AppLayout';
import { SkeletonCard } from './components/ui/Skeleton';

// Lazy load pages for code splitting
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
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
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-[#070d18] dark:via-[#0b1220] dark:to-[#101a2c] p-6 transition-colors duration-200">
      <div className="max-w-5xl mx-auto">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Landing page - no layout */}
            <Route path="/" element={<LandingPage />} />

            {/* All other routes - with AppLayout */}
            <Route element={<AppLayout />}>
              <Route path="/submit" element={<SubmitPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/kanban" element={<KanbanPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/request/:id" element={<RequestDetailPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
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
        <ThemeProvider>
          <AppProvider>
            <AppContent />
            <ThemedToaster />
          </AppProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

function ThemedToaster() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: 'var(--toast-surface)',
          color: 'var(--toast-text)',
          border: `1px solid var(--toast-border)`,
          borderRadius: '0.75rem',
          boxShadow: 'var(--shadow-toast)',
          padding: '1rem',
          maxWidth: '500px'
        },
        success: {
          iconTheme: {
            primary: isDark ? '#22c55e' : '#10B981',
            secondary: '#ffffff'
          }
        },
        error: {
          iconTheme: {
            primary: isDark ? '#f87171' : '#EF4444',
            secondary: '#ffffff'
          }
        }
      }}
    />
  );
}
