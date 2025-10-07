# Impact Scoring Examples

Real-world examples showing how the AI scores different types of requests.

## Example 1: High-Impact Sales Dashboard

**Conversation**:
```
User: I need a sales dashboard to track regional performance
AI: What specific problem are you trying to solve?
User: Our sales team of 50+ reps has no visibility into conversion rates by region
AI: How is this impacting your work?
User: Sales managers waste 10+ hours per week pulling manual reports. Missing revenue opportunities.
AI: What systems are involved?
User: Salesforce and our analytics platform
AI: How urgent is this?
User: High - the VP of Sales needs this for quarterly business review next week
```

**Extracted Request Data**:
```json
{
  "title": "Create regional sales conversion dashboard",
  "problem": "No visibility into regional sales performance",
  "success": "Sales team can identify underperforming regions",
  "systems": ["Salesforce", "Analytics"],
  "urgency": "High - quarterly review next week",
  "stakeholders": ["Sales VP", "Regional Managers", "50+ sales reps"]
}
```

**AI-Generated Impact Assessment**:
```json
{
  "totalScore": 78,
  "breakdown": {
    "revenueImpact": 24,      // Efficiency gains: 10 hrs/week × $100/hr × 52/12 = $4,333/month
    "userReach": 23,          // 50+ users (20 pts) + daily use bonus (3 pts)
    "strategicAlignment": 15, // VP mention + quarterly review
    "urgency": 12,            // Hard deadline (next week)
    "quickWinBonus": 4        // Medium effort + high impact
  },
  "tier": 1,
  "assessedAt": "2025-10-06T10:30:00Z",
  "assessedBy": "AI",
  "justification": "High-impact analytics request affecting 50+ sales users with daily usage. Direct efficiency gains of $4K+/month from automated reporting. Hard deadline for executive quarterly review drives urgency."
}
```

**Why This Score?**:
- **Revenue Impact (24/30)**: Strong efficiency gains calculation
- **User Reach (23/25)**: Large team (50+) + daily frequency
- **Strategic Alignment (15/20)**: VP involvement signals importance
- **Urgency (12/15)**: Specific deadline next week
- **Quick Win (4/10)**: Moderate complexity dashboard work

---

## Example 2: Low-Impact Cosmetic Change

**Conversation**:
```
User: Can we change the button color on the dashboard?
AI: What problem is this solving?
User: Just think it would look nicer
AI: How urgent is this?
User: No rush, whenever you have time
```

**Extracted Request Data**:
```json
{
  "title": "Change dashboard button color",
  "problem": "Current button color is not preferred",
  "success": "Button looks nicer",
  "systems": ["Dashboard"],
  "urgency": "Low - no deadline",
  "stakeholders": ["One user"]
}
```

**AI-Generated Impact Assessment**:
```json
{
  "totalScore": 18,
  "breakdown": {
    "revenueImpact": 3,       // No revenue impact
    "userReach": 4,           // Single user, infrequent
    "strategicAlignment": 2,  // No strategy mention
    "urgency": 1,             // No deadline
    "quickWinBonus": 8        // Simple change + low impact
  },
  "tier": 1,
  "assessedAt": "2025-10-06T10:35:00Z",
  "assessedBy": "AI",
  "justification": "Cosmetic UI change with no business impact. Single user request with no deadline. Quick win bonus awarded for simple effort, but overall low priority."
}
```

**Why This Score?**:
- **Revenue Impact (3/30)**: Purely cosmetic, no revenue effect
- **User Reach (4/25)**: Single user, no frequency mentioned
- **Strategic Alignment (2/20)**: No strategic context
- **Urgency (1/15)**: Explicitly "no rush"
- **Quick Win (8/10)**: Simple change (CSS update) earns quick-win points

---

## Example 3: Medium-Impact Automation

**Conversation**:
```
User: I need to automate our lead assignment process
AI: What is the current pain point?
User: Our team of 10 SDRs manually assigns leads, taking 2 hours per day total
AI: How urgent is this?
User: Medium - would like it done this quarter to improve response time
```

**Extracted Request Data**:
```json
{
  "title": "Automate lead assignment workflow",
  "problem": "Manual lead assignment is time-consuming",
  "success": "Leads automatically assigned based on territory",
  "systems": ["Salesforce"],
  "urgency": "Medium - this quarter",
  "stakeholders": ["10 SDRs", "Sales Manager"]
}
```

**AI-Generated Impact Assessment**:
```json
{
  "totalScore": 52,
  "breakdown": {
    "revenueImpact": 18,      // Efficiency: 2 hrs/day × $100/hr × 260 days / 12 = $4,333/month
    "userReach": 17,          // 10 users (15 pts) + daily use (2 pts)
    "strategicAlignment": 8,  // Improves sales response time
    "urgency": 6,             // Soft deadline (this quarter)
    "quickWinBonus": 3        // Medium complexity automation
  },
  "tier": 1,
  "assessedAt": "2025-10-06T10:40:00Z",
  "assessedBy": "AI",
  "justification": "Workflow automation saving 2 hours daily across 10-person SDR team. Moderate efficiency gains with quarterly timeline. Medium complexity reduces quick-win potential."
}
```

**Why This Score?**:
- **Revenue Impact (18/30)**: Good efficiency savings (2 hrs/day)
- **User Reach (17/25)**: Medium team size (10) with daily use
- **Strategic Alignment (8/20)**: Improves sales process but no explicit strategy
- **Urgency (6/15)**: Soft deadline (this quarter)
- **Quick Win (3/10)**: Medium effort automation work

---

## Example 4: Strategic OKR Initiative

**Conversation**:
```
User: We need a customer health score dashboard
AI: What is driving this request?
User: This is directly tied to our Q1 OKR for reducing churn by 15%
AI: Who will use this?
User: Our entire customer success team of 25 people
AI: How urgent is this?
User: Critical - we need this by end of month to start tracking progress
```

**Extracted Request Data**:
```json
{
  "title": "Customer health score dashboard",
  "problem": "No visibility into at-risk customers",
  "success": "Reduce churn by 15% (Q1 OKR)",
  "systems": ["CRM"],
  "urgency": "Critical - end of month",
  "stakeholders": ["25 CS team members", "VP of Customer Success"]
}
```

**AI-Generated Impact Assessment**:
```json
{
  "totalScore": 82,
  "breakdown": {
    "revenueImpact": 28,      // Revenue protection: 15% churn reduction
    "userReach": 21,          // 25 users (18 pts) + daily (3 pts)
    "strategicAlignment": 18, // Explicit Q1 OKR mention
    "urgency": 11,            // Hard deadline + critical priority
    "quickWinBonus": 4        // Medium effort + high impact
  },
  "tier": 1,
  "assessedAt": "2025-10-06T10:45:00Z",
  "assessedBy": "AI",
  "justification": "Strategic Q1 OKR initiative focused on revenue protection through churn reduction. Entire 25-person CS team will use daily. Hard end-of-month deadline with executive visibility."
}
```

**Why This Score?**:
- **Revenue Impact (28/30)**: Revenue protection (churn reduction)
- **User Reach (21/25)**: Medium team + daily use
- **Strategic Alignment (18/20)**: Explicit OKR mention
- **Urgency (11/15)**: Hard deadline + "critical" language
- **Quick Win (4/10)**: Dashboard work with high impact

---

## Example 5: Compliance/Regulatory Request

**Conversation**:
```
User: We need to update our data retention policy in the system
AI: Why is this needed?
User: New GDPR compliance requirement. Must be implemented by March 15th or we face penalties.
AI: Who will be affected?
User: All users of the platform - this is a legal requirement
```

**Extracted Request Data**:
```json
{
  "title": "Implement GDPR data retention policy",
  "problem": "Not compliant with new GDPR regulations",
  "success": "System automatically deletes data per retention policy",
  "systems": ["Database", "Application"],
  "urgency": "Critical - regulatory deadline March 15th",
  "stakeholders": ["Legal", "Engineering", "All users"]
}
```

**AI-Generated Impact Assessment**:
```json
{
  "totalScore": 71,
  "breakdown": {
    "revenueImpact": 25,      // Revenue protection: avoiding penalties
    "userReach": 15,          // All users affected
    "strategicAlignment": 12, // Compliance requirement
    "urgency": 15,            // Hard regulatory deadline
    "quickWinBonus": 4        // Complex implementation
  },
  "tier": 1,
  "assessedAt": "2025-10-06T10:50:00Z",
  "assessedBy": "AI",
  "justification": "Critical GDPR compliance requirement with hard regulatory deadline (March 15th). Revenue protection from avoiding penalties. Affects entire user base. Complex implementation scope."
}
```

**Why This Score?**:
- **Revenue Impact (25/30)**: Revenue protection (avoiding penalties)
- **User Reach (15/25)**: All users affected, but passive impact
- **Strategic Alignment (12/20)**: Compliance requirement
- **Urgency (15/15)**: Maximum urgency (regulatory deadline)
- **Quick Win (4/10)**: Complex database/application changes

---

## Example 6: Quick Win Scenario

**Conversation**:
```
User: Can we add a field to track competitor mentions in deals?
AI: Why is this needed?
User: Sales leadership wants to track competitive win rates. Simple field addition.
AI: How many people will use this?
User: All 60 sales reps will use it daily on every deal
AI: How urgent is this?
User: High - VP wants to see data by next monthly review
```

**Extracted Request Data**:
```json
{
  "title": "Add competitor field to deal records",
  "problem": "No way to track competitive intelligence",
  "success": "Sales team can analyze competitive win rates",
  "systems": ["Salesforce"],
  "urgency": "High - monthly review deadline",
  "stakeholders": ["60 sales reps", "Sales leadership"]
}
```

**AI-Generated Impact Assessment**:
```json
{
  "totalScore": 76,
  "breakdown": {
    "revenueImpact": 20,      // Competitive intelligence → revenue impact
    "userReach": 24,          // 60 users (20 pts) + daily (4 pts)
    "strategicAlignment": 14, // Competitive positioning
    "urgency": 10,            // Hard deadline (monthly review)
    "quickWinBonus": 8        // Simple field + high impact
  },
  "tier": 1,
  "assessedAt": "2025-10-06T10:55:00Z",
  "assessedBy": "AI",
  "justification": "Quick win: simple field addition with high impact. 60 sales reps will use daily for competitive intelligence. Strategic value in competitive positioning. Hard deadline for monthly executive review."
}
```

**Why This Score?**:
- **Revenue Impact (20/30)**: Competitive intelligence enables better selling
- **User Reach (24/25)**: Large team (60) + daily frequency
- **Strategic Alignment (14/20)**: Competitive positioning
- **Urgency (10/15)**: Hard deadline for monthly review
- **Quick Win (8/10)**: Simple field addition + high user reach

---

## Scoring Patterns to Notice

### High Scores (70-100):
- Large user counts (50+)
- Daily usage frequency
- Hard deadlines with dates
- Executive visibility
- Revenue protection or generation

### Medium Scores (40-70):
- Medium teams (10-49 users)
- Weekly/monthly usage
- Soft deadlines (this quarter)
- Process improvements
- Efficiency gains

### Low Scores (0-40):
- Single user or small teams (<5)
- No urgency
- Cosmetic changes
- No revenue impact
- No strategic alignment

### Quick Win Patterns:
- Simple field additions + large teams = High quick-win
- UI changes with no logic = High quick-win (if low overall score)
- Complex integrations = Low quick-win (regardless of impact)

## Testing Your Understanding

Try scoring these scenarios yourself before running the API:

1. **Request**: "Change report header font size" by single user, no deadline
   - **Expected Score**: ~15-25 (cosmetic, no impact)

2. **Request**: "Automate weekly revenue report for 100-person sales org, CEO requested, due this Friday"
   - **Expected Score**: ~75-85 (high impact, high urgency, strategic)

3. **Request**: "Add email validation to form field, affects 5 support reps, would save 30 mins/day"
   - **Expected Score**: ~40-50 (medium impact, small team, good efficiency)
