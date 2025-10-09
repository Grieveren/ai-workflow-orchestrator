import { useState } from 'react';
import { X, Info } from 'lucide-react';
import { Button, Textarea, Input } from './index';
import type { ImpactAssessment } from '../../types';

interface ImpactAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (adjustedAssessment: Partial<ImpactAssessment>) => void;
  currentAssessment?: ImpactAssessment;
  assessedBy: string;
}

export function ImpactAdjustmentModal({
  isOpen,
  onClose,
  onSubmit,
  currentAssessment,
  assessedBy
}: ImpactAdjustmentModalProps) {
  // Initialize with current AI scores or defaults
  const [breakdown, setBreakdown] = useState({
    revenueImpact: currentAssessment?.breakdown.revenueImpact ?? 0,
    userReach: currentAssessment?.breakdown.userReach ?? 0,
    strategicAlignment: currentAssessment?.breakdown.strategicAlignment ?? 0,
    urgency: currentAssessment?.breakdown.urgency ?? 0,
    quickWinBonus: currentAssessment?.breakdown.quickWinBonus ?? 0
  });

  const [justification, setJustification] = useState(currentAssessment?.justification ?? '');
  const [dependencies, setDependencies] = useState(
    currentAssessment?.dependencies?.join('\n') ?? ''
  );
  const [risks, setRisks] = useState(
    currentAssessment?.risks?.join('\n') ?? ''
  );
  const [customerCommitment, setCustomerCommitment] = useState(
    currentAssessment?.customerCommitment ?? false
  );
  const [competitiveIntel, setCompetitiveIntel] = useState(
    currentAssessment?.competitiveIntel ?? ''
  );

  // Calculate total score from breakdown
  const totalScore = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

  const handleBreakdownChange = (dimension: keyof typeof breakdown, value: string, max: number) => {
    const numValue = Math.max(0, Math.min(parseFloat(value) || 0, max));
    setBreakdown(prev => ({ ...prev, [dimension]: numValue }));
  };

  const handleSubmit = () => {
    const adjustedAssessment: Partial<ImpactAssessment> = {
      totalScore,
      breakdown,
      justification: justification.trim(),
      dependencies: dependencies.split('\n').filter(d => d.trim()),
      risks: risks.split('\n').filter(r => r.trim()),
      customerCommitment,
      competitiveIntel: competitiveIntel.trim() || undefined,
      tier: 2, // Manual adjustment
      assessedAt: new Date().toISOString(),
      assessedBy: assessedBy
    };

    onSubmit(adjustedAssessment);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div data-testid="impact-modal-content" className="bg-[var(--surface-elevated)] rounded-xl shadow-2xl max-w-3xl w-full border border-[var(--border-subtle)] max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[var(--surface-elevated)] flex items-center justify-between p-6 border-b border-[var(--border-subtle)]">
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              Adjust Impact Score
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Override AI scores with insider knowledge
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* AI Reference Card */}
          {currentAssessment && currentAssessment.tier === 1 && (
            <div data-testid="ai-reference-card" className="p-4 bg-[var(--accent-soft)] border border-[var(--accent-border)] rounded-lg">
              <div className="flex items-start gap-2">
                <Info size={18} className="text-[var(--accent)] mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-[var(--text-primary)]">
                    AI-Generated Score: {currentAssessment.totalScore}/100
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mt-1">
                    {currentAssessment.justification}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Score Breakdown */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
              Score Breakdown
            </h4>
            <div className="space-y-4">
              <ScoreInput
                label="Revenue Impact"
                value={breakdown.revenueImpact}
                onChange={(val) => handleBreakdownChange('revenueImpact', val, 30)}
                max={30}
                hint="Direct revenue, protection, or efficiency gains"
              />
              <ScoreInput
                label="User Reach"
                value={breakdown.userReach}
                onChange={(val) => handleBreakdownChange('userReach', val, 25)}
                max={25}
                hint="Number of users × frequency × user type"
              />
              <ScoreInput
                label="Strategic Alignment"
                value={breakdown.strategicAlignment}
                onChange={(val) => handleBreakdownChange('strategicAlignment', val, 20)}
                max={20}
                hint="OKRs, competitive positioning, technical debt"
              />
              <ScoreInput
                label="Urgency"
                value={breakdown.urgency}
                onChange={(val) => handleBreakdownChange('urgency', val, 15)}
                max={15}
                hint="Hard deadlines, regulatory, escalation risk"
              />
              <ScoreInput
                label="Quick Win Bonus"
                value={breakdown.quickWinBonus}
                onChange={(val) => handleBreakdownChange('quickWinBonus', val, 10)}
                max={10}
                hint="High impact + low effort combination"
              />
            </div>

            {/* Total Score Display */}
            <div className="mt-4 p-3 bg-[var(--accent-soft)] border border-[var(--accent-border)] rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  Total Score
                </span>
                <span className="text-2xl font-bold text-[var(--accent)]">
                  {totalScore}/100
                </span>
              </div>
            </div>

            {/* Warning when total score exceeds 100 */}
            {totalScore > 100 && (
              <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded text-sm text-red-800 dark:text-red-300">
                ⚠️ Total score exceeds 100. Please adjust individual dimensions.
              </div>
            )}
          </div>

          {/* Justification */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Justification <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={justification}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setJustification(e.target.value)}
              placeholder="Explain your scoring rationale (e.g., 'Increased revenue impact due to Q1 sales OKR alignment')"
              rows={3}
              className="w-full"
            />
          </div>

          {/* Manual Fields */}
          <div className="border-t border-[var(--border-subtle)] pt-6">
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
              Additional Context (Optional)
            </h4>

            <div className="space-y-4">
              {/* Dependencies */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Dependencies
                </label>
                <Textarea
                  value={dependencies}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDependencies(e.target.value)}
                  placeholder="One dependency per line (e.g., 'Waiting for API v2 release')"
                  rows={3}
                  className="w-full"
                />
              </div>

              {/* Risks */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Risks
                </label>
                <Textarea
                  value={risks}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRisks(e.target.value)}
                  placeholder="One risk per line (e.g., 'Complex data migration required')"
                  rows={3}
                  className="w-full"
                />
              </div>

              {/* Customer Commitment */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customerCommitment}
                    onChange={(e) => setCustomerCommitment(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-[var(--text-secondary)]">
                    Customer Commitment (promised feature or contractual obligation)
                  </span>
                </label>
              </div>

              {/* Competitive Intel */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Competitive Intelligence
                </label>
                <Textarea
                  value={competitiveIntel}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCompetitiveIntel(e.target.value)}
                  placeholder="Competitive positioning notes (e.g., 'Competitor X launched similar feature last quarter')"
                  rows={2}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-[var(--surface-elevated)] flex gap-2 justify-end p-6 border-t border-[var(--border-subtle)]">
          <Button onClick={handleClose} variant="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="primary"
            disabled={!justification.trim() || totalScore === 0 || totalScore > 100}
          >
            Save Adjustment
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper component for score inputs
interface ScoreInputProps {
  label: string;
  value: number;
  onChange: (value: string) => void;
  max: number;
  hint: string;
}

function ScoreInput({ label, value, onChange, max, hint }: ScoreInputProps) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-6 gap-y-1">
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[var(--text-secondary)]">
          {label}
        </label>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">{hint}</p>
      </div>
      <div className="w-28 justify-self-end flex flex-col items-end gap-1">
        <Input
          type="number"
          value={String(value)}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          className="text-right"
        />
        <p className="text-xs text-[var(--text-muted)] text-right">
          0-{max}
        </p>
      </div>
    </div>
  );
}
