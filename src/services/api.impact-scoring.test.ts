import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from './api';
import type { ChatMessage, RequestData } from '../types';

/**
 * Impact Scoring Test Suite
 *
 * Tests the calculateImpactScore function with various conversation scenarios
 * to validate scoring accuracy and consistency.
 */

describe('api.calculateImpactScore', () => {
  beforeEach(() => {
    // Mock the backend proxy server response
    vi.clearAllMocks();
  });

  /**
   * Test Case 1: High-Impact Sales Dashboard Request
   * Expected: ~70-80 score (high revenue, high user reach, strategic)
   */
  it('should score high-impact sales dashboard request correctly', async () => {
    const conversation: ChatMessage[] = [
      { role: 'user', content: 'I need a sales dashboard to track regional performance' },
      { role: 'assistant', content: 'What specific problem are you trying to solve?' },
      {
        role: 'user',
        content: 'Our sales team of 50+ reps has no visibility into conversion rates by region'
      },
      { role: 'assistant', content: 'How is this impacting your work?' },
      {
        role: 'user',
        content: 'Sales managers waste 10+ hours per week pulling manual reports. Missing revenue opportunities.'
      },
      { role: 'assistant', content: 'What systems are involved?' },
      { role: 'user', content: 'Salesforce and our analytics platform' },
      { role: 'assistant', content: 'How urgent is this?' },
      {
        role: 'user',
        content: 'High - the VP of Sales needs this for quarterly business review next week'
      }
    ];

    const requestData: RequestData = {
      title: 'Create regional sales conversion dashboard',
      problem: 'No visibility into regional sales performance',
      success: 'Sales team can identify underperforming regions and optimize strategy',
      systems: ['Salesforce', 'Analytics'],
      urgency: 'High - quarterly review next week',
      stakeholders: ['Sales VP', 'Regional Managers', '50+ sales reps']
    };

    // Note: This would call the real API in integration tests
    // For unit tests, you'd mock the fetch response
    const result = await api.calculateImpactScore(conversation, requestData);

    // Validate structure
    expect(result).toHaveProperty('totalScore');
    expect(result).toHaveProperty('breakdown');
    expect(result).toHaveProperty('tier');
    expect(result).toHaveProperty('assessedAt');
    expect(result).toHaveProperty('assessedBy');
    expect(result).toHaveProperty('justification');

    // Validate scoring ranges for high-impact request
    expect(result.totalScore).toBeGreaterThan(60);
    expect(result.totalScore).toBeLessThanOrEqual(100);

    // Validate breakdown
    expect(result.breakdown.revenueImpact).toBeGreaterThan(10); // Efficiency gains
    expect(result.breakdown.userReach).toBeGreaterThan(15); // 50+ users, daily use
    expect(result.breakdown.strategicAlignment).toBeGreaterThan(5); // VP mention
    expect(result.breakdown.urgency).toBeGreaterThan(8); // Hard deadline next week

    // Validate sum equals total
    const sum =
      result.breakdown.revenueImpact +
      result.breakdown.userReach +
      result.breakdown.strategicAlignment +
      result.breakdown.urgency +
      result.breakdown.quickWinBonus;
    expect(Math.abs(sum - result.totalScore)).toBeLessThan(0.1);

    // Validate tier and metadata
    expect(result.tier).toBe(1); // AI-generated
    expect(result.assessedBy).toBe('AI');
    expect(result.justification).toContain('sales'); // Should reference the domain
  }, 30000); // 30 second timeout for API call

  /**
   * Test Case 2: Low-Impact Cosmetic Request
   * Expected: ~15-30 score (no revenue, low user reach, no urgency)
   */
  it('should score low-impact cosmetic request conservatively', async () => {
    const conversation: ChatMessage[] = [
      { role: 'user', content: 'Can we change the button color on the dashboard?' },
      { role: 'assistant', content: 'What problem is this solving?' },
      { role: 'user', content: 'Just think it would look nicer' },
      { role: 'assistant', content: 'How urgent is this?' },
      { role: 'user', content: 'No rush, whenever you have time' }
    ];

    const requestData: RequestData = {
      title: 'Change dashboard button color',
      problem: 'Current button color is not preferred',
      success: 'Button looks nicer',
      systems: ['Dashboard'],
      urgency: 'Low - no deadline',
      stakeholders: ['One user']
    };

    const result = await api.calculateImpactScore(conversation, requestData);

    // Low-impact request should score low
    expect(result.totalScore).toBeLessThan(40);
    expect(result.breakdown.revenueImpact).toBeLessThan(10); // No revenue impact
    expect(result.breakdown.userReach).toBeLessThan(10); // Single user
    expect(result.breakdown.strategicAlignment).toBeLessThan(10); // No strategy
    expect(result.breakdown.urgency).toBeLessThan(5); // No deadline
  }, 30000);

  /**
   * Test Case 3: Medium-Impact Automation Request
   * Expected: ~45-60 score (moderate revenue, medium user reach, some urgency)
   */
  it('should score medium-impact automation request in middle range', async () => {
    const conversation: ChatMessage[] = [
      { role: 'user', content: 'I need to automate our lead assignment process' },
      { role: 'assistant', content: 'What is the current pain point?' },
      {
        role: 'user',
        content: 'Our team of 10 SDRs manually assigns leads, taking 2 hours per day total'
      },
      { role: 'assistant', content: 'How urgent is this?' },
      {
        role: 'user',
        content: 'Medium - would like it done this quarter to improve response time'
      }
    ];

    const requestData: RequestData = {
      title: 'Automate lead assignment workflow',
      problem: 'Manual lead assignment is time-consuming',
      success: 'Leads automatically assigned based on territory',
      systems: ['Salesforce'],
      urgency: 'Medium - this quarter',
      stakeholders: ['10 SDRs', 'Sales Manager']
    };

    const result = await api.calculateImpactScore(conversation, requestData);

    // Medium-impact request
    expect(result.totalScore).toBeGreaterThan(40);
    expect(result.totalScore).toBeLessThan(70);
    expect(result.breakdown.revenueImpact).toBeGreaterThan(5); // Time savings
    expect(result.breakdown.userReach).toBeGreaterThan(10); // 10 users, daily use
  }, 30000);

  /**
   * Test Case 4: Minimal Conversation (Edge Case)
   * Expected: Conservative scoring due to lack of information
   */
  it('should handle minimal conversation with conservative scores', async () => {
    const conversation: ChatMessage[] = [
      { role: 'user', content: 'Need help with reports' },
      { role: 'assistant', content: 'Can you provide more details?' },
      { role: 'user', content: 'Some kind of sales report' }
    ];

    const requestData: RequestData = {
      title: 'Sales report request',
      problem: 'Need reports',
      success: 'Have reports',
      systems: [],
      urgency: '',
      stakeholders: []
    };

    const result = await api.calculateImpactScore(conversation, requestData);

    // Minimal conversation should default to conservative scores
    expect(result.totalScore).toBeLessThan(50);
    expect(result.justification).toBeTruthy(); // Should still have justification
  }, 30000);

  /**
   * Test Case 5: Strategic Initiative with Explicit OKR Mention
   * Expected: High strategic alignment score (15-20 pts)
   */
  it('should detect strategic alignment from OKR mentions', async () => {
    const conversation: ChatMessage[] = [
      { role: 'user', content: 'We need a customer health score dashboard' },
      { role: 'assistant', content: 'What is driving this request?' },
      {
        role: 'user',
        content: 'This is directly tied to our Q1 OKR for reducing churn by 15%'
      },
      { role: 'assistant', content: 'Who will use this?' },
      { role: 'user', content: 'Our entire customer success team of 25 people' }
    ];

    const requestData: RequestData = {
      title: 'Customer health score dashboard',
      problem: 'No visibility into at-risk customers',
      success: 'Reduce churn by 15% (Q1 OKR)',
      systems: ['CRM'],
      urgency: 'High - Q1 OKR',
      stakeholders: ['25 CS team members', 'VP of Customer Success']
    };

    const result = await api.calculateImpactScore(conversation, requestData);

    // Should score high on strategic alignment
    expect(result.breakdown.strategicAlignment).toBeGreaterThan(12); // OKR mention
    expect(result.totalScore).toBeGreaterThan(60); // Overall high impact
  }, 30000);

  /**
   * Test Case 6: Quick Win Scenario
   * Expected: High quick-win bonus for simple + high impact
   */
  it('should award quick win bonus for simple high-impact requests', async () => {
    const conversation: ChatMessage[] = [
      { role: 'user', content: 'Can we add a field to track competitor mentions in deals?' },
      { role: 'assistant', content: 'Why is this needed?' },
      {
        role: 'user',
        content: 'Sales leadership wants to track competitive win rates. Simple field addition.'
      },
      { role: 'assistant', content: 'How many people will use this?' },
      { role: 'user', content: 'All 60 sales reps will use it daily on every deal' }
    ];

    const requestData: RequestData = {
      title: 'Add competitor field to deal records',
      problem: 'No way to track competitive intelligence',
      success: 'Sales team can analyze competitive win rates',
      systems: ['Salesforce'],
      urgency: 'High',
      stakeholders: ['60 sales reps', 'Sales leadership']
    };

    const result = await api.calculateImpactScore(conversation, requestData);

    // Simple + high impact should get quick win bonus
    expect(result.breakdown.quickWinBonus).toBeGreaterThan(5); // High quick-win
    expect(result.breakdown.userReach).toBeGreaterThan(18); // 60 users, daily
  }, 30000);

  /**
   * Test Case 7: Compliance/Regulatory Request
   * Expected: High urgency score due to hard deadline
   */
  it('should score compliance requests with high urgency', async () => {
    const conversation: ChatMessage[] = [
      { role: 'user', content: 'We need to update our data retention policy in the system' },
      { role: 'assistant', content: 'Why is this needed?' },
      {
        role: 'user',
        content: 'New GDPR compliance requirement. Must be implemented by March 15th or we face penalties.'
      }
    ];

    const requestData: RequestData = {
      title: 'Implement GDPR data retention policy',
      problem: 'Not compliant with new GDPR regulations',
      success: 'System automatically deletes data per retention policy',
      systems: ['Database', 'Application'],
      urgency: 'Critical - regulatory deadline March 15th',
      stakeholders: ['Legal', 'Engineering', 'All users']
    };

    const result = await api.calculateImpactScore(conversation, requestData);

    // Compliance should score high on urgency
    expect(result.breakdown.urgency).toBeGreaterThan(10); // Hard deadline + compliance
    expect(result.totalScore).toBeGreaterThan(50); // Overall high priority
  }, 30000);
});
