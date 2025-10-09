/**
 * ImpactBadge Usage Examples
 *
 * This file demonstrates various usage patterns for the ImpactBadge component.
 * Not included in production builds - for documentation purposes only.
 */

import { ImpactBadge } from './ImpactBadge';
import type { Request } from '../../types';

// Example 1: High Impact Request (score >= 80)
const highImpactRequest: Request = {
  id: 'REQ-001',
  title: 'Implement Payment Gateway Integration',
  status: 'Open',
  owner: 'Sarah Chen',
  priority: 'High',
  clarityScore: 9,
  daysOpen: 2,
  stage: 'Scoping',
  lastUpdate: '2025-01-15',
  impactAssessment: {
    totalScore: 85,
    breakdown: {
      revenueImpact: 25,
      userReach: 20,
      strategicAlignment: 18,
      urgency: 15,
      quickWinBonus: 7
    },
    tier: 1,
    assessedAt: '2025-01-15T10:00:00Z',
    assessedBy: 'AI',
    justification: 'Direct revenue impact with broad user reach. Critical for Q1 goals.'
  }
};

// Example 2: Medium Impact Request (score 60-79)
const mediumImpactRequest: Request = {
  id: 'REQ-002',
  title: 'Add Export to PDF Feature',
  status: 'Open',
  owner: 'Mike Johnson',
  priority: 'Medium',
  clarityScore: 7,
  daysOpen: 5,
  stage: 'Ready for Dev',
  lastUpdate: '2025-01-14',
  impactAssessment: {
    totalScore: 68,
    breakdown: {
      revenueImpact: 15,
      userReach: 18,
      strategicAlignment: 15,
      urgency: 10,
      quickWinBonus: 10
    },
    tier: 2,
    assessedAt: '2025-01-14T14:30:00Z',
    assessedBy: 'AI',
    justification: 'Enhances user experience with moderate strategic value. Quick win opportunity.'
  }
};

// Example 3: Low Impact Request (score < 60)
const lowImpactRequest: Request = {
  id: 'REQ-003',
  title: 'Update Footer Copyright Year',
  status: 'Open',
  owner: 'Emily Davis',
  priority: 'Low',
  clarityScore: 10,
  daysOpen: 10,
  stage: 'Scoping',
  lastUpdate: '2025-01-10',
  impactAssessment: {
    totalScore: 25,
    breakdown: {
      revenueImpact: 5,
      userReach: 8,
      strategicAlignment: 5,
      urgency: 7,
      quickWinBonus: 0
    },
    tier: 3,
    assessedAt: '2025-01-10T09:00:00Z',
    assessedBy: 'AI',
    justification: 'Minor cosmetic update with minimal business impact.'
  }
};

// Example 4: Unassessed Request
const unassessedRequest: Request = {
  id: 'REQ-004',
  title: 'New Feature Request',
  status: 'Open',
  owner: 'TBD',
  priority: 'Medium',
  clarityScore: 6,
  daysOpen: 1,
  stage: 'Intake',
  lastUpdate: '2025-01-15'
  // No impactAssessment
};

// Usage Examples Component
export function ImpactBadgeExamples() {
  return (
    <div className="p-8 space-y-8">
      <section>
        <h2 className="text-xl font-bold mb-4">Default (Medium Size, Show Score)</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-48">High Impact (85):</span>
            <ImpactBadge request={highImpactRequest} />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-48">Medium Impact (68):</span>
            <ImpactBadge request={mediumImpactRequest} />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-48">Low Impact (25):</span>
            <ImpactBadge request={lowImpactRequest} />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-48">Not Assessed:</span>
            <ImpactBadge request={unassessedRequest} />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Hide Score (Icon + Tier Only)</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-48">High Impact:</span>
            <ImpactBadge request={highImpactRequest} showScore={false} />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-48">Medium Impact:</span>
            <ImpactBadge request={mediumImpactRequest} showScore={false} />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-48">Low Impact:</span>
            <ImpactBadge request={lowImpactRequest} showScore={false} />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Size Variants</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="w-24">Small:</span>
            <ImpactBadge request={highImpactRequest} size="sm" />
            <ImpactBadge request={mediumImpactRequest} size="sm" />
            <ImpactBadge request={lowImpactRequest} size="sm" />
          </div>
          <div className="flex items-center gap-4">
            <span className="w-24">Medium:</span>
            <ImpactBadge request={highImpactRequest} size="md" />
            <ImpactBadge request={mediumImpactRequest} size="md" />
            <ImpactBadge request={lowImpactRequest} size="md" />
          </div>
          <div className="flex items-center gap-4">
            <span className="w-24">Large:</span>
            <ImpactBadge request={highImpactRequest} size="lg" />
            <ImpactBadge request={mediumImpactRequest} size="lg" />
            <ImpactBadge request={lowImpactRequest} size="lg" />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">In Table Context</h2>
        <table className="min-w-full border border-[var(--border-subtle)]">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left">Request</th>
              <th className="px-4 py-2 text-left">Impact</th>
              <th className="px-4 py-2 text-left">Priority</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-[var(--border-subtle)]">
              <td className="px-4 py-2">{highImpactRequest.title}</td>
              <td className="px-4 py-2">
                <ImpactBadge request={highImpactRequest} size="sm" />
              </td>
              <td className="px-4 py-2">{highImpactRequest.priority}</td>
            </tr>
            <tr className="border-t border-[var(--border-subtle)]">
              <td className="px-4 py-2">{mediumImpactRequest.title}</td>
              <td className="px-4 py-2">
                <ImpactBadge request={mediumImpactRequest} size="sm" />
              </td>
              <td className="px-4 py-2">{mediumImpactRequest.priority}</td>
            </tr>
            <tr className="border-t border-[var(--border-subtle)]">
              <td className="px-4 py-2">{lowImpactRequest.title}</td>
              <td className="px-4 py-2">
                <ImpactBadge request={lowImpactRequest} size="sm" />
              </td>
              <td className="px-4 py-2">{lowImpactRequest.priority}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Custom Styling</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-48">With margin:</span>
            <ImpactBadge request={highImpactRequest} className="ml-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-48">With shadow:</span>
            <ImpactBadge request={mediumImpactRequest} className="shadow-md" />
          </div>
        </div>
      </section>
    </div>
  );
}
