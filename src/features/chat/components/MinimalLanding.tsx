import { Search, FolderOpen, Workflow } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MinimalLandingProps {
  onExampleClick: (example: string) => void;
  onExpand: () => void;
}

/**
 * Minimal landing page component (Google-inspired)
 * Shows a clean, centered interface with a single input box
 * Expands to full chat interface on interaction
 */
export function MinimalLanding({ onExampleClick, onExpand }: MinimalLandingProps) {
  const headline = "What can we do for you today?";
  const subtitle = "Describe your request in plain English, and our AI will guide you through the details.";

  const examples = [
    "Bug: Investigate why the order export job times out after 5 minutes",
    "Feature request: Add a dark mode toggle to the analytics dashboard",
    "Incident: Customers cannot reset passwords in the mobile app",
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="w-full max-w-2xl px-4">
        {/* RevOps Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl">
              <Workflow className="h-8 w-8 text-white" />
            </div>
            <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              RevOps
            </span>
          </div>
        </div>

        {/* Headline */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            {headline}
          </h1>
          <p className="text-lg text-gray-600">
            {subtitle}
          </p>
        </div>

        {/* Main Input Box */}
        <div onClick={onExpand} className="block mb-8">
          <div className="group cursor-pointer transition-all duration-300 hover:shadow-2xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-gray-400 group-hover:text-purple-500 transition-colors" />
              </div>
              <input
                type="text"
                readOnly
                placeholder="Click here to describe your request..."
                className="w-full pl-14 pr-6 py-6 text-lg rounded-2xl border-2 border-gray-200 bg-white shadow-lg
                         focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-400
                         group-hover:border-purple-300 transition-all cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Example Requests */}
        <div className="text-center mb-8">
          <p className="text-sm text-gray-500 mb-4">Or try an example:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => {
                  onExampleClick(example);
                  onExpand();
                }}
                className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm text-gray-700
                         hover:border-purple-400 hover:bg-purple-50 hover:text-purple-700
                         transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Link */}
        <div className="text-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border-2 border-gray-200 text-gray-700
                     hover:border-purple-400 hover:bg-purple-50 hover:text-purple-700
                     transition-all duration-200 shadow-sm hover:shadow-md font-medium"
          >
            <FolderOpen className="h-5 w-5" />
            View My Requests
          </Link>
        </div>
      </div>
    </div>
  );
}
