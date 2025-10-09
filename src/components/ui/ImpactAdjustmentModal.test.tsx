import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImpactAdjustmentModal } from './ImpactAdjustmentModal';
import type { ImpactAssessment } from '../../types';

describe('ImpactAdjustmentModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit,
    assessedBy: 'Test User'
  };

  const mockTier1Assessment: ImpactAssessment = {
    totalScore: 75,
    breakdown: {
      revenueImpact: 20,
      userReach: 18,
      strategicAlignment: 15,
      urgency: 12,
      quickWinBonus: 10
    },
    tier: 1,
    assessedAt: '2025-01-01T00:00:00Z',
    assessedBy: 'AI',
    justification: 'High revenue impact with broad user reach and strategic alignment.',
    dependencies: ['API v2 release', 'Database migration'],
    risks: ['Complex data migration required', 'Performance concerns'],
    customerCommitment: true,
    competitiveIntel: 'Competitor X launched similar feature last quarter'
  };

  const mockTier2Assessment: ImpactAssessment = {
    ...mockTier1Assessment,
    tier: 2,
    assessedBy: 'Product Owner'
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Rendering & Visibility
  describe('Rendering & Visibility', () => {
    it('should not render when isOpen is false', () => {
      render(<ImpactAdjustmentModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Adjust Impact Score')).not.toBeInTheDocument();
    });

    it('should render modal when isOpen is true', () => {
      render(<ImpactAdjustmentModal {...defaultProps} />);
      expect(screen.getByText('Adjust Impact Score')).toBeInTheDocument();
    });

    it('should show modal title and subtitle', () => {
      render(<ImpactAdjustmentModal {...defaultProps} />);
      expect(screen.getByText('Adjust Impact Score')).toBeInTheDocument();
      expect(screen.getByText('Override AI scores with insider knowledge')).toBeInTheDocument();
    });

    it('should show AI reference card when currentAssessment has tier 1', () => {
      render(<ImpactAdjustmentModal {...defaultProps} currentAssessment={mockTier1Assessment} />);
      expect(screen.getByText(/AI-Generated Score: 75\/100/)).toBeInTheDocument();

      // Check for AI reference card container with blue styling
      const aiReferenceCard = screen.getByTestId('ai-reference-card');
      expect(aiReferenceCard).toBeInTheDocument();
      expect(aiReferenceCard).toHaveTextContent(mockTier1Assessment.justification);
    });

    it('should not show AI reference card when currentAssessment has tier 2', () => {
      render(<ImpactAdjustmentModal {...defaultProps} currentAssessment={mockTier2Assessment} />);
      expect(screen.queryByText(/AI-Generated Score:/)).not.toBeInTheDocument();
    });

    it('should not show AI reference card when no currentAssessment', () => {
      render(<ImpactAdjustmentModal {...defaultProps} />);
      expect(screen.queryByText(/AI-Generated Score:/)).not.toBeInTheDocument();
    });
  });

  // Score Breakdown Inputs
  describe('Score Breakdown Inputs', () => {
    it('should render all 5 score input fields with labels', () => {
      render(<ImpactAdjustmentModal {...defaultProps} />);

      expect(screen.getByText('Revenue Impact')).toBeInTheDocument();
      expect(screen.getByText('User Reach')).toBeInTheDocument();
      expect(screen.getByText('Strategic Alignment')).toBeInTheDocument();
      expect(screen.getByText('Urgency')).toBeInTheDocument();
      expect(screen.getByText('Quick Win Bonus')).toBeInTheDocument();
    });

    it('should show max range hints for each score input', () => {
      render(<ImpactAdjustmentModal {...defaultProps} />);

      expect(screen.getByText('0-30')).toBeInTheDocument(); // Revenue Impact
      expect(screen.getByText('0-25')).toBeInTheDocument(); // User Reach
      expect(screen.getByText('0-20')).toBeInTheDocument(); // Strategic Alignment
      expect(screen.getByText('0-15')).toBeInTheDocument(); // Urgency
      expect(screen.getByText('0-10')).toBeInTheDocument(); // Quick Win Bonus
    });

    it('should display total score as 0/100 by default', () => {
      render(<ImpactAdjustmentModal {...defaultProps} />);
      expect(screen.getByText('0/100')).toBeInTheDocument();
    });

    it('should calculate total score correctly when breakdown changes', async () => {
      const user = userEvent.setup();
      render(<ImpactAdjustmentModal {...defaultProps} />);

      // Get all number inputs (5 score fields)
      const inputs = screen.getAllByRole('spinbutton');

      // Set Revenue Impact to 20
      await user.clear(inputs[0]);
      await user.type(inputs[0], '20');

      // Set User Reach to 15
      await user.clear(inputs[1]);
      await user.type(inputs[1], '15');

      // Total should be 35
      expect(screen.getByText('35/100')).toBeInTheDocument();
    });

    it('should initialize with currentAssessment scores if provided', () => {
      render(<ImpactAdjustmentModal {...defaultProps} currentAssessment={mockTier1Assessment} />);

      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs[0]).toHaveValue(20); // Revenue Impact
      expect(inputs[1]).toHaveValue(18); // User Reach
      expect(inputs[2]).toHaveValue(15); // Strategic Alignment
      expect(inputs[3]).toHaveValue(12); // Urgency
      expect(inputs[4]).toHaveValue(10); // Quick Win Bonus

      expect(screen.getByText('75/100')).toBeInTheDocument();
    });

    it('should initialize with zeros if no currentAssessment', () => {
      render(<ImpactAdjustmentModal {...defaultProps} />);

      const inputs = screen.getAllByRole('spinbutton');
      inputs.forEach(input => {
        expect(input).toHaveValue(0);
      });
    });
  });

  // Manual Context Fields
  describe('Manual Context Fields', () => {
    it('should render dependencies textarea', () => {
      render(<ImpactAdjustmentModal {...defaultProps} />);
      expect(screen.getByPlaceholderText(/One dependency per line/)).toBeInTheDocument();
    });

    it('should render risks textarea', () => {
      render(<ImpactAdjustmentModal {...defaultProps} />);
      expect(screen.getByPlaceholderText(/One risk per line/)).toBeInTheDocument();
    });

    it('should render customer commitment checkbox', () => {
      render(<ImpactAdjustmentModal {...defaultProps} />);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
      expect(screen.getByText(/Customer Commitment/)).toBeInTheDocument();
    });

    it('should render competitive intelligence textarea', () => {
      render(<ImpactAdjustmentModal {...defaultProps} />);
      expect(screen.getByPlaceholderText(/Competitive positioning notes/)).toBeInTheDocument();
    });

    it('should render justification textarea as required', () => {
      render(<ImpactAdjustmentModal {...defaultProps} />);
      expect(screen.getByText(/Justification/)).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument(); // Required indicator
    });

    it('should pre-fill manual fields with currentAssessment data', () => {
      render(<ImpactAdjustmentModal {...defaultProps} currentAssessment={mockTier1Assessment} />);

      expect(screen.getByDisplayValue(mockTier1Assessment.justification)).toBeInTheDocument();
      expect(screen.getByDisplayValue(/API v2 release/)).toBeInTheDocument();
      expect(screen.getByDisplayValue(/Complex data migration/)).toBeInTheDocument();
      if (mockTier1Assessment.competitiveIntel) {
        expect(screen.getByDisplayValue(mockTier1Assessment.competitiveIntel)).toBeInTheDocument();
      }
      expect(screen.getByRole('checkbox')).toBeChecked();
    });
  });

  // Validation
  describe('Validation', () => {
    it('should disable submit button when justification is empty', () => {
      render(<ImpactAdjustmentModal {...defaultProps} />);
      const saveButton = screen.getByRole('button', { name: /Save Adjustment/ });
      expect(saveButton).toBeDisabled();
    });

    it('should disable submit button when totalScore is 0', async () => {
      const user = userEvent.setup();
      render(<ImpactAdjustmentModal {...defaultProps} />);

      const justificationTextarea = screen.getByPlaceholderText(/Explain your scoring rationale/);
      await user.type(justificationTextarea, 'Some justification');

      const saveButton = screen.getByRole('button', { name: /Save Adjustment/ });
      expect(saveButton).toBeDisabled(); // Still disabled because score is 0
    });

    it('should enable submit button when justification is provided and score > 0', async () => {
      const user = userEvent.setup();
      render(<ImpactAdjustmentModal {...defaultProps} />);

      // Add score
      const inputs = screen.getAllByRole('spinbutton');
      await user.clear(inputs[0]);
      await user.type(inputs[0], '20');

      // Add justification
      const justificationTextarea = screen.getByPlaceholderText(/Explain your scoring rationale/);
      await user.type(justificationTextarea, 'Valid justification');

      const saveButton = screen.getByRole('button', { name: /Save Adjustment/ });
      expect(saveButton).not.toBeDisabled();
    });

    it('should trim whitespace from justification for validation', async () => {
      const user = userEvent.setup();
      render(<ImpactAdjustmentModal {...defaultProps} />);

      // Add score
      const inputs = screen.getAllByRole('spinbutton');
      await user.clear(inputs[0]);
      await user.type(inputs[0], '20');

      // Add only whitespace to justification
      const justificationTextarea = screen.getByPlaceholderText(/Explain your scoring rationale/);
      await user.type(justificationTextarea, '   ');

      const saveButton = screen.getByRole('button', { name: /Save Adjustment/ });
      expect(saveButton).toBeDisabled(); // Still disabled - whitespace doesn't count
    });
  });

  // User Interactions
  describe('User Interactions', () => {
    it('should call onClose when Cancel button clicked', async () => {
      const user = userEvent.setup();
      render(<ImpactAdjustmentModal {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: /Cancel/ });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledOnce();
    });

    it('should call onClose when X button clicked', async () => {
      const user = userEvent.setup();
      render(<ImpactAdjustmentModal {...defaultProps} />);

      // X button is not a role="button", it's a plain button element
      const closeButtons = screen.getAllByRole('button');
      const xButton = closeButtons.find(btn => btn.querySelector('svg')); // Find button with icon

      if (xButton) {
        await user.click(xButton);
      }

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onSubmit with correct data structure when Save clicked', async () => {
      const user = userEvent.setup();
      render(<ImpactAdjustmentModal {...defaultProps} />);

      // Set scores
      const inputs = screen.getAllByRole('spinbutton');
      await user.clear(inputs[0]);
      await user.type(inputs[0], '25');
      await user.clear(inputs[1]);
      await user.type(inputs[1], '20');

      // Set justification
      const justificationTextarea = screen.getByPlaceholderText(/Explain your scoring rationale/);
      await user.type(justificationTextarea, 'Increased Q1 sales alignment');

      // Click save
      const saveButton = screen.getByRole('button', { name: /Save Adjustment/ });
      await user.click(saveButton);

      expect(mockOnSubmit).toHaveBeenCalledOnce();

      const submittedData = mockOnSubmit.mock.calls[0][0];
      expect(submittedData).toMatchObject({
        totalScore: 45,
        breakdown: {
          revenueImpact: 25,
          userReach: 20,
          strategicAlignment: 0,
          urgency: 0,
          quickWinBonus: 0
        },
        justification: 'Increased Q1 sales alignment',
        tier: 2,
        assessedBy: 'Test User'
      });
      expect(submittedData.assessedAt).toBeDefined();
    });

    it('should close modal after successful submit', async () => {
      const user = userEvent.setup();
      render(<ImpactAdjustmentModal {...defaultProps} />);

      // Set minimum required data
      const inputs = screen.getAllByRole('spinbutton');
      await user.clear(inputs[0]);
      await user.type(inputs[0], '10');

      const justificationTextarea = screen.getByPlaceholderText(/Explain your scoring rationale/);
      await user.type(justificationTextarea, 'Justification');

      const saveButton = screen.getByRole('button', { name: /Save Adjustment/ });
      await user.click(saveButton);

      expect(mockOnClose).toHaveBeenCalledOnce();
    });

    it('should split dependencies by newlines into array', async () => {
      const user = userEvent.setup();
      render(<ImpactAdjustmentModal {...defaultProps} />);

      // Set minimum required data
      const inputs = screen.getAllByRole('spinbutton');
      await user.clear(inputs[0]);
      await user.type(inputs[0], '10');

      const justificationTextarea = screen.getByPlaceholderText(/Explain your scoring rationale/);
      await user.type(justificationTextarea, 'Justification');

      // Add dependencies
      const dependenciesTextarea = screen.getByPlaceholderText(/One dependency per line/);
      await user.type(dependenciesTextarea, 'Dependency 1\nDependency 2\nDependency 3');

      const saveButton = screen.getByRole('button', { name: /Save Adjustment/ });
      await user.click(saveButton);

      const submittedData = mockOnSubmit.mock.calls[0][0];
      expect(submittedData.dependencies).toEqual(['Dependency 1', 'Dependency 2', 'Dependency 3']);
    });

    it('should split risks by newlines into array', async () => {
      const user = userEvent.setup();
      render(<ImpactAdjustmentModal {...defaultProps} />);

      // Set minimum required data
      const inputs = screen.getAllByRole('spinbutton');
      await user.clear(inputs[0]);
      await user.type(inputs[0], '10');

      const justificationTextarea = screen.getByPlaceholderText(/Explain your scoring rationale/);
      await user.type(justificationTextarea, 'Justification');

      // Add risks
      const risksTextarea = screen.getByPlaceholderText(/One risk per line/);
      await user.type(risksTextarea, 'Risk 1\nRisk 2');

      const saveButton = screen.getByRole('button', { name: /Save Adjustment/ });
      await user.click(saveButton);

      const submittedData = mockOnSubmit.mock.calls[0][0];
      expect(submittedData.risks).toEqual(['Risk 1', 'Risk 2']);
    });

    it('should filter out empty lines from dependencies and risks', async () => {
      const user = userEvent.setup();
      render(<ImpactAdjustmentModal {...defaultProps} />);

      // Set minimum required data
      const inputs = screen.getAllByRole('spinbutton');
      await user.clear(inputs[0]);
      await user.type(inputs[0], '10');

      const justificationTextarea = screen.getByPlaceholderText(/Explain your scoring rationale/);
      await user.type(justificationTextarea, 'Justification');

      // Add dependencies with empty lines
      const dependenciesTextarea = screen.getByPlaceholderText(/One dependency per line/);
      await user.type(dependenciesTextarea, 'Dep 1\n\nDep 2\n  \nDep 3');

      const saveButton = screen.getByRole('button', { name: /Save Adjustment/ });
      await user.click(saveButton);

      const submittedData = mockOnSubmit.mock.calls[0][0];
      expect(submittedData.dependencies).toEqual(['Dep 1', 'Dep 2', 'Dep 3']);
    });

    it('should handle customer commitment checkbox', async () => {
      const user = userEvent.setup();
      render(<ImpactAdjustmentModal {...defaultProps} />);

      // Set minimum required data
      const inputs = screen.getAllByRole('spinbutton');
      await user.clear(inputs[0]);
      await user.type(inputs[0], '10');

      const justificationTextarea = screen.getByPlaceholderText(/Explain your scoring rationale/);
      await user.type(justificationTextarea, 'Justification');

      // Check customer commitment
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      const saveButton = screen.getByRole('button', { name: /Save Adjustment/ });
      await user.click(saveButton);

      const submittedData = mockOnSubmit.mock.calls[0][0];
      expect(submittedData.customerCommitment).toBe(true);
    });

    it('should set competitiveIntel to undefined when empty', async () => {
      const user = userEvent.setup();
      render(<ImpactAdjustmentModal {...defaultProps} />);

      // Set minimum required data
      const inputs = screen.getAllByRole('spinbutton');
      await user.clear(inputs[0]);
      await user.type(inputs[0], '10');

      const justificationTextarea = screen.getByPlaceholderText(/Explain your scoring rationale/);
      await user.type(justificationTextarea, 'Justification');

      const saveButton = screen.getByRole('button', { name: /Save Adjustment/ });
      await user.click(saveButton);

      const submittedData = mockOnSubmit.mock.calls[0][0];
      expect(submittedData.competitiveIntel).toBeUndefined();
    });

    it('should trim and include competitiveIntel when provided', async () => {
      const user = userEvent.setup();
      render(<ImpactAdjustmentModal {...defaultProps} />);

      // Set minimum required data
      const inputs = screen.getAllByRole('spinbutton');
      await user.clear(inputs[0]);
      await user.type(inputs[0], '10');

      const justificationTextarea = screen.getByPlaceholderText(/Explain your scoring rationale/);
      await user.type(justificationTextarea, 'Justification');

      // Add competitive intel
      const competitiveTextarea = screen.getByPlaceholderText(/Competitive positioning notes/);
      await user.type(competitiveTextarea, '  Competitor info  ');

      const saveButton = screen.getByRole('button', { name: /Save Adjustment/ });
      await user.click(saveButton);

      const submittedData = mockOnSubmit.mock.calls[0][0];
      expect(submittedData.competitiveIntel).toBe('Competitor info');
    });
  });

  // Edge Cases
  describe('Edge Cases', () => {
    it('should handle modal with no currentAssessment (new adjustment)', () => {
      render(<ImpactAdjustmentModal {...defaultProps} />);

      expect(screen.getByText('Adjust Impact Score')).toBeInTheDocument();
      expect(screen.getByText('0/100')).toBeInTheDocument();

      // All inputs should be empty/default
      const inputs = screen.getAllByRole('spinbutton');
      inputs.forEach(input => expect(input).toHaveValue(0));
    });

    it('should handle modal with tier 1 currentAssessment (editing AI score)', () => {
      render(<ImpactAdjustmentModal {...defaultProps} currentAssessment={mockTier1Assessment} />);

      // Should show AI reference card
      expect(screen.getByText(/AI-Generated Score: 75\/100/)).toBeInTheDocument();
      expect(screen.getByText('75/100')).toBeInTheDocument();
    });

    it('should handle modal with tier 2 currentAssessment (editing manual adjustment)', () => {
      render(<ImpactAdjustmentModal {...defaultProps} currentAssessment={mockTier2Assessment} />);

      // Should NOT show AI reference card
      expect(screen.queryByText(/AI-Generated Score:/)).not.toBeInTheDocument();
      // Should still show the score
      expect(screen.getByText('75/100')).toBeInTheDocument();
    });

    it('should handle empty dependencies gracefully', async () => {
      const user = userEvent.setup();
      render(<ImpactAdjustmentModal {...defaultProps} />);

      // Set minimum required data
      const inputs = screen.getAllByRole('spinbutton');
      await user.clear(inputs[0]);
      await user.type(inputs[0], '10');

      const justificationTextarea = screen.getByPlaceholderText(/Explain your scoring rationale/);
      await user.type(justificationTextarea, 'Justification');

      const saveButton = screen.getByRole('button', { name: /Save Adjustment/ });
      await user.click(saveButton);

      const submittedData = mockOnSubmit.mock.calls[0][0];
      expect(submittedData.dependencies).toEqual([]);
    });

    it('should handle empty risks gracefully', async () => {
      const user = userEvent.setup();
      render(<ImpactAdjustmentModal {...defaultProps} />);

      // Set minimum required data
      const inputs = screen.getAllByRole('spinbutton');
      await user.clear(inputs[0]);
      await user.type(inputs[0], '10');

      const justificationTextarea = screen.getByPlaceholderText(/Explain your scoring rationale/);
      await user.type(justificationTextarea, 'Justification');

      const saveButton = screen.getByRole('button', { name: /Save Adjustment/ });
      await user.click(saveButton);

      const submittedData = mockOnSubmit.mock.calls[0][0];
      expect(submittedData.risks).toEqual([]);
    });

    it('should handle decimal scores correctly', async () => {
      const user = userEvent.setup();
      render(<ImpactAdjustmentModal {...defaultProps} />);

      const inputs = screen.getAllByRole('spinbutton');
      await user.clear(inputs[0]);
      await user.type(inputs[0], '15.5');
      await user.clear(inputs[1]);
      await user.type(inputs[1], '10.75');

      expect(screen.getByText('26.25/100')).toBeInTheDocument();
    });

    it('should handle invalid number input gracefully', async () => {
      const user = userEvent.setup();
      render(<ImpactAdjustmentModal {...defaultProps} />);

      const inputs = screen.getAllByRole('spinbutton');
      await user.clear(inputs[0]);
      await user.type(inputs[0], 'abc');

      // Invalid input should be treated as 0
      expect(screen.getByText('0/100')).toBeInTheDocument();
    });
  });

  // Accessibility & Styling
  describe('Accessibility & Styling', () => {
    it('should have dark mode classes', () => {
      render(<ImpactAdjustmentModal {...defaultProps} />);

      // Check for dark: classes in the modal container
      const modalContent = screen.getByTestId('impact-modal-content');
      expect(modalContent.className).toContain('bg-[var(--surface-elevated)]');
      expect(modalContent.className).toContain('border-[var(--border-subtle)]');
    });

    it('should display labels for all form fields', () => {
      render(<ImpactAdjustmentModal {...defaultProps} />);

      expect(screen.getByText('Revenue Impact')).toBeInTheDocument();
      expect(screen.getByText('User Reach')).toBeInTheDocument();
      expect(screen.getByText('Strategic Alignment')).toBeInTheDocument();
      expect(screen.getByText('Urgency')).toBeInTheDocument();
      expect(screen.getByText('Quick Win Bonus')).toBeInTheDocument();
      expect(screen.getByText(/Justification/)).toBeInTheDocument();
      expect(screen.getByText('Dependencies')).toBeInTheDocument();
      expect(screen.getByText('Risks')).toBeInTheDocument();
      expect(screen.getByText(/Customer Commitment/)).toBeInTheDocument();
      expect(screen.getByText('Competitive Intelligence')).toBeInTheDocument();
    });

    it('should show required indicator for justification field', () => {
      render(<ImpactAdjustmentModal {...defaultProps} />);

      // The asterisk (*) should be visible next to Justification label
      const justificationLabel = screen.getByText(/Justification/);
      const requiredIndicator = justificationLabel.querySelector('.text-red-500');
      expect(requiredIndicator).toBeInTheDocument();
    });

    it('should have proper button roles', () => {
      render(<ImpactAdjustmentModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Cancel/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Save Adjustment/ })).toBeInTheDocument();
    });
  });
});
