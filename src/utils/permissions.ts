import type { ViewType, RequestStage } from '../types';

/**
 * Role-based permission utilities
 *
 * Centralizes access control logic for the four-view system.
 * These pure functions determine what actions each role can perform
 * based on request stage and user view type.
 */

/**
 * Check if the current view can generate documents for a request
 *
 * @param view - Current user's view type
 * @param stage - Request's current workflow stage
 * @returns true if user can generate BRD/FSD/Tech Spec documents
 *
 * @example
 * canGenerateDocuments('product-owner', 'Scoping') // true
 * canGenerateDocuments('requester', 'Scoping') // false
 */
export function canGenerateDocuments(view: ViewType, stage: RequestStage): boolean {
  // Only Product Owners can generate documents, and only during Scoping stage
  return view === 'product-owner' && stage === 'Scoping';
}

/**
 * Check if the current view can approve documents for a request
 *
 * @param view - Current user's view type
 * @param stage - Request's current workflow stage
 * @returns true if user can approve BRD/FSD/Tech Spec documents
 *
 * @example
 * canApproveDocuments('product-owner', 'Scoping') // true
 * canApproveDocuments('requester', 'Scoping') // false
 */
export function canApproveDocuments(view: ViewType, stage: RequestStage): boolean {
  // Only Product Owners can approve documents, and only during Scoping stage
  return view === 'product-owner' && stage === 'Scoping';
}

/**
 * Check if the current view can update a request's stage
 *
 * @param view - Current user's view type
 * @param fromStage - Request's current stage
 * @param toStage - Target stage for transition
 * @returns true if user can perform the stage transition
 *
 * @example
 * canUpdateStage('product-owner', 'Scoping', 'Ready for Dev') // true
 * canUpdateStage('requester', 'Scoping', 'Ready for Dev') // false
 * canUpdateStage('dev', 'In Progress', 'Review') // true
 */
export function canUpdateStage(
  view: ViewType,
  fromStage: RequestStage,
  toStage: RequestStage
): boolean {
  // Product Owner can move from Scoping → Ready for Dev (after doc approval)
  if (fromStage === 'Scoping' && toStage === 'Ready for Dev') {
    return view === 'product-owner';
  }

  // Developers can move requests forward in their workflow stages
  if (view === 'dev') {
    // Dev can start work: Ready for Dev → In Progress
    if (fromStage === 'Ready for Dev' && toStage === 'In Progress') {
      return true;
    }
    // Dev can submit for review: In Progress → Review
    if (fromStage === 'In Progress' && toStage === 'Review') {
      return true;
    }
    // Dev can complete after review: Review → Completed
    if (fromStage === 'Review' && toStage === 'Completed') {
      return true;
    }
  }

  // Management view is read-only (no stage transitions)
  // Requester view is read-only after submission (no stage transitions)
  return false;
}

/**
 * Check if the current view has read-only access to a request
 *
 * @param view - Current user's view type
 * @param stage - Request's current workflow stage
 * @returns true if user can only view the request (no modifications)
 *
 * @example
 * isReadOnly('requester', 'Scoping') // true (PO owns Scoping)
 * isReadOnly('management', 'In Progress') // true (management is always read-only)
 */
export function isReadOnly(view: ViewType, stage: RequestStage): boolean {
  // Management view is always read-only
  if (view === 'management') {
    return true;
  }

  // Requesters can only view their requests after submission
  // (They cannot modify requests in Scoping, Ready for Dev, etc.)
  if (view === 'requester') {
    return true;
  }

  // Product Owners have full access in Scoping stage
  if (view === 'product-owner' && stage === 'Scoping') {
    return false; // NOT read-only
  }

  // Developers have full access in their workflow stages
  if (view === 'dev' && ['Ready for Dev', 'In Progress', 'Review'].includes(stage)) {
    return false; // NOT read-only
  }

  // All other combinations are read-only
  return true;
}
