import { describe, it, expect } from 'vitest';
import {
  canGenerateDocuments,
  canApproveDocuments,
  canUpdateStage,
  isReadOnly
} from './permissions';
import type { ViewType, RequestStage } from '../types';

describe('permissions', () => {
  describe('canGenerateDocuments', () => {
    it('allows Product Owner to generate documents in Scoping stage', () => {
      expect(canGenerateDocuments('product-owner', 'Scoping')).toBe(true);
    });

    it('denies Requester from generating documents in Scoping stage', () => {
      expect(canGenerateDocuments('requester', 'Scoping')).toBe(false);
    });

    it('denies Developer from generating documents in Scoping stage', () => {
      expect(canGenerateDocuments('dev', 'Scoping')).toBe(false);
    });

    it('denies Management from generating documents in Scoping stage', () => {
      expect(canGenerateDocuments('management', 'Scoping')).toBe(false);
    });

    it('denies Product Owner from generating documents in other stages', () => {
      const otherStages: RequestStage[] = [
        'Intake',
        'Ready for Dev',
        'In Progress',
        'Review',
        'Completed'
      ];

      otherStages.forEach(stage => {
        expect(canGenerateDocuments('product-owner', stage)).toBe(false);
      });
    });
  });

  describe('canApproveDocuments', () => {
    it('allows Product Owner to approve documents in Scoping stage', () => {
      expect(canApproveDocuments('product-owner', 'Scoping')).toBe(true);
    });

    it('denies Requester from approving documents in Scoping stage', () => {
      expect(canApproveDocuments('requester', 'Scoping')).toBe(false);
    });

    it('denies Developer from approving documents in Scoping stage', () => {
      expect(canApproveDocuments('dev', 'Scoping')).toBe(false);
    });

    it('denies Management from approving documents in Scoping stage', () => {
      expect(canApproveDocuments('management', 'Scoping')).toBe(false);
    });

    it('denies Product Owner from approving documents in other stages', () => {
      const otherStages: RequestStage[] = [
        'Intake',
        'Ready for Dev',
        'In Progress',
        'Review',
        'Completed'
      ];

      otherStages.forEach(stage => {
        expect(canApproveDocuments('product-owner', stage)).toBe(false);
      });
    });
  });

  describe('canUpdateStage', () => {
    describe('Product Owner transitions', () => {
      it('allows PO to move from Scoping to Ready for Dev', () => {
        expect(canUpdateStage('product-owner', 'Scoping', 'Ready for Dev')).toBe(true);
      });

      it('denies PO from making other stage transitions', () => {
        expect(canUpdateStage('product-owner', 'Intake', 'Scoping')).toBe(false);
        expect(canUpdateStage('product-owner', 'Ready for Dev', 'In Progress')).toBe(false);
        expect(canUpdateStage('product-owner', 'In Progress', 'Review')).toBe(false);
      });
    });

    describe('Developer transitions', () => {
      it('allows Dev to move from Ready for Dev to In Progress', () => {
        expect(canUpdateStage('dev', 'Ready for Dev', 'In Progress')).toBe(true);
      });

      it('allows Dev to move from In Progress to Review', () => {
        expect(canUpdateStage('dev', 'In Progress', 'Review')).toBe(true);
      });

      it('allows Dev to move from Review to Completed', () => {
        expect(canUpdateStage('dev', 'Review', 'Completed')).toBe(true);
      });

      it('denies Dev from making PO stage transitions', () => {
        expect(canUpdateStage('dev', 'Scoping', 'Ready for Dev')).toBe(false);
      });

      it('denies Dev from making invalid transitions', () => {
        expect(canUpdateStage('dev', 'Completed', 'In Progress')).toBe(false);
        expect(canUpdateStage('dev', 'Review', 'In Progress')).toBe(false);
      });
    });

    describe('Requester transitions', () => {
      it('denies Requester from making any stage transitions', () => {
        const stages: RequestStage[] = [
          'Intake',
          'Scoping',
          'Ready for Dev',
          'In Progress',
          'Review',
          'Completed'
        ];

        stages.forEach(fromStage => {
          stages.forEach(toStage => {
            if (fromStage !== toStage) {
              expect(canUpdateStage('requester', fromStage, toStage)).toBe(false);
            }
          });
        });
      });
    });

    describe('Management transitions', () => {
      it('denies Management from making any stage transitions', () => {
        const stages: RequestStage[] = [
          'Intake',
          'Scoping',
          'Ready for Dev',
          'In Progress',
          'Review',
          'Completed'
        ];

        stages.forEach(fromStage => {
          stages.forEach(toStage => {
            if (fromStage !== toStage) {
              expect(canUpdateStage('management', fromStage, toStage)).toBe(false);
            }
          });
        });
      });
    });
  });

  describe('isReadOnly', () => {
    it('returns true for Management view in all stages', () => {
      const allStages: RequestStage[] = [
        'Intake',
        'Scoping',
        'Ready for Dev',
        'In Progress',
        'Review',
        'Completed'
      ];

      allStages.forEach(stage => {
        expect(isReadOnly('management', stage)).toBe(true);
      });
    });

    it('returns true for Requester view in all stages', () => {
      const allStages: RequestStage[] = [
        'Intake',
        'Scoping',
        'Ready for Dev',
        'In Progress',
        'Review',
        'Completed'
      ];

      allStages.forEach(stage => {
        expect(isReadOnly('requester', stage)).toBe(true);
      });
    });

    it('returns false for Product Owner in Scoping stage', () => {
      expect(isReadOnly('product-owner', 'Scoping')).toBe(false);
    });

    it('returns true for Product Owner in non-Scoping stages', () => {
      const otherStages: RequestStage[] = [
        'Intake',
        'Ready for Dev',
        'In Progress',
        'Review',
        'Completed'
      ];

      otherStages.forEach(stage => {
        expect(isReadOnly('product-owner', stage)).toBe(true);
      });
    });

    it('returns false for Developer in their workflow stages', () => {
      expect(isReadOnly('dev', 'Ready for Dev')).toBe(false);
      expect(isReadOnly('dev', 'In Progress')).toBe(false);
      expect(isReadOnly('dev', 'Review')).toBe(false);
    });

    it('returns true for Developer in non-workflow stages', () => {
      expect(isReadOnly('dev', 'Intake')).toBe(true);
      expect(isReadOnly('dev', 'Scoping')).toBe(true);
      expect(isReadOnly('dev', 'Completed')).toBe(true);
    });
  });

  describe('exhaustive view type coverage', () => {
    it('handles all view types', () => {
      const allViews: ViewType[] = ['requester', 'dev', 'management', 'product-owner'];

      // Ensure we're testing all view types (TypeScript will catch if ViewType expands)
      allViews.forEach(view => {
        expect(() => canGenerateDocuments(view, 'Scoping')).not.toThrow();
        expect(() => canApproveDocuments(view, 'Scoping')).not.toThrow();
        expect(() => canUpdateStage(view, 'Scoping', 'Ready for Dev')).not.toThrow();
        expect(() => isReadOnly(view, 'Scoping')).not.toThrow();
      });
    });
  });
});
