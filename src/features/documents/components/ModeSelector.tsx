import { Button } from '../../../components/ui';
import type { UserMode } from '../../../types';

interface ModeSelectorProps {
  selectedMode: UserMode | null;
  onModeSelect: (mode: UserMode) => void;
  onGenerate: () => void;
  isGenerating?: boolean;
}

export function ModeSelector({ selectedMode, onModeSelect, onGenerate, isGenerating = false }: ModeSelectorProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">
            Generate Requirements Documents
          </h3>
          <p className="text-gray-600">
            AI will create BRD, FSD, and Technical Spec based on the request details
          </p>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            How would you like me to assist you?
          </label>
          <div className="space-y-3">
            <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 ${
              selectedMode === 'guided' ? 'border-blue-500 bg-blue-50' : ''
            }`}>
              <input
                type="radio"
                name="mode"
                value="guided"
                checked={selectedMode === 'guided'}
                onChange={(e) => onModeSelect(e.target.value as UserMode)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-800">🎓 Guided Mode</div>
                <div className="text-sm text-gray-600 mt-1">
                  Perfect if: You're new to writing specs or want to learn best practices. I'll explain concepts and guide you step-by-step.
                </div>
              </div>
            </label>

            <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 ${
              selectedMode === 'collaborative' ? 'border-blue-500 bg-blue-50' : ''
            }`}>
              <input
                type="radio"
                name="mode"
                value="collaborative"
                checked={selectedMode === 'collaborative'}
                onChange={(e) => onModeSelect(e.target.value as UserMode)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-800">🤝 Collaborative Mode</div>
                <div className="text-sm text-gray-600 mt-1">
                  Perfect if: You've done this before and want AI to draft for you to review. I'll generate complete documents with key decisions explained.
                </div>
              </div>
            </label>

            <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 ${
              selectedMode === 'expert' ? 'border-blue-500 bg-blue-50' : ''
            }`}>
              <input
                type="radio"
                name="mode"
                value="expert"
                checked={selectedMode === 'expert'}
                onChange={(e) => onModeSelect(e.target.value as UserMode)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-800">⚡ Expert Mode</div>
                <div className="text-sm text-gray-600 mt-1">
                  Perfect if: You're experienced and want maximum speed. I'll generate detailed technical specs with minimal explanation.
                </div>
              </div>
            </label>
          </div>
        </div>

        <Button
          onClick={onGenerate}
          disabled={!selectedMode || isGenerating}
          variant="primary"
          size="lg"
          className="w-full"
        >
          {isGenerating ? 'Generating Documents...' : 'Generate Requirements Documents'}
        </Button>

        <p className="text-sm text-gray-500 text-center mt-4">
          💡 This will take about 30 seconds. You can refine the documents with AI after generation.
        </p>
      </div>
    </div>
  );
}
