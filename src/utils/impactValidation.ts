import type { Request, ImpactAssessment } from '../types';

/**
 * Validate that impact score breakdown sums to totalScore
 * Uses float tolerance to handle floating point arithmetic
 */
export function validateImpactScore(assessment: ImpactAssessment): boolean {
  const sum = Object.values(assessment.breakdown).reduce((a, b) => a + b, 0);
  return Math.abs(sum - assessment.totalScore) < 0.01; // Float tolerance
}

/**
 * Null-safe getter for impact score
 * Returns 0 if request has no assessment
 */
export function getImpactScore(request: Request): number {
  return request.impactAssessment?.totalScore ?? 0;
}

/**
 * Null-safe getter for impact tier
 * Returns null if request has no assessment
 */
export function getImpactTier(request: Request): 1 | 2 | 3 | null {
  return request.impactAssessment?.tier ?? null;
}

/**
 * Type guard to check if request has impact assessment
 * Enables TypeScript narrowing for safe access
 */
export function hasImpactAssessment(
  request: Request
): request is Request & { impactAssessment: ImpactAssessment } {
  return request.impactAssessment !== undefined;
}

/**
 * Get impact badge variant based on score
 * Returns 'none' for unassessed requests
 */
export function getImpactBadgeVariant(
  request: Request
): 'high' | 'medium' | 'low' | 'none' {
  if (!request.impactAssessment) return 'none'; // Gray "Not Assessed"

  const score = request.impactAssessment.totalScore;
  if (score >= 80) return 'high'; // Red
  if (score >= 60) return 'medium'; // Yellow
  return 'low'; // Gray
}

/**
 * Check if request is a "quick win" (high impact + low complexity)
 * Quick wins are prioritized for fast delivery
 */
export function isQuickWin(request: Request): boolean {
  if (!request.impactAssessment) return false;

  const score = request.impactAssessment.totalScore;
  const complexity = request.complexity;

  // High impact (>70) + low complexity (simple)
  return score > 70 && complexity === 'simple';
}

/**
 * Sort requests by impact score (descending)
 * Unassessed requests appear at the end
 */
export function sortByImpactScore(requests: Request[]): Request[] {
  const assessed = requests.filter(hasImpactAssessment);
  const unassessed = requests.filter(r => !hasImpactAssessment(r));

  const sortedAssessed = assessed.sort(
    (a, b) => b.impactAssessment.totalScore - a.impactAssessment.totalScore
  );

  return [...sortedAssessed, ...unassessed]; // Assessed first, then unassessed
}
