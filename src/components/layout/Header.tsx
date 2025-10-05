import { Lightbulb } from 'lucide-react';
import type { ViewType } from '../../types';
import { ThemeToggle } from '../ui/ThemeToggle';

interface HeaderProps {
  view: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function Header({ view, onViewChange }: HeaderProps) {
  return (
    <div className="bg-linear-to-r from-purple-600 via-purple-500 to-pink-500 text-white p-8 rounded-2xl mb-8 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Lightbulb size={32} className="text-yellow-300" />
            <h1 className="text-3xl font-bold">AI Workflow Orchestrator</h1>
          </div>
          <p className="text-purple-100">Tell me what you need, and I'll help you get things done</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-2 bg-white/20 backdrop-blur-xs rounded-xl p-1">
            <button
              onClick={() => onViewChange('requester')}
              className={`px-4 py-2.5 rounded-lg font-medium transition text-sm ${
                view === 'requester'
                  ? 'bg-white text-purple-600 shadow-md'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Requester
            </button>
            <button
              onClick={() => onViewChange('dev')}
              className={`px-4 py-2.5 rounded-lg font-medium transition text-sm ${
                view === 'dev'
                  ? 'bg-white text-purple-600 shadow-md'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Developer
            </button>
            <button
              onClick={() => onViewChange('management')}
              className={`px-4 py-2.5 rounded-lg font-medium transition text-sm ${
                view === 'management'
                  ? 'bg-white text-purple-600 shadow-md'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Management
            </button>
          </div>

          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
