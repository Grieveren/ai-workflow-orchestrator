import { Link } from 'react-router-dom';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 dark:bg-red-900/40 rounded-full mb-6">
          <AlertCircle className="text-red-600 dark:text-red-400" size={48} />
        </div>

        <h1 className="text-6xl font-bold text-gray-800 dark:text-slate-100 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-slate-200 mb-4">Page Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex gap-4 justify-center">
          <Link to="/">
            <Button variant="primary" className="flex items-center gap-2">
              <Home size={18} />
              Go Home
            </Button>
          </Link>
          <Button
            variant="secondary"
            className="flex items-center gap-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={18} />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
