# Impact Assessment System

The AI Workflow Orchestrator includes an AI-powered impact scoring system to enable data-driven prioritization of workflow requests. Impact assessments are calculated automatically during request submission using Claude AI to analyze conversation history and request metadata.

## ImpactAssessment Type

```typescript
interface ImpactAssessment {
  totalScore: number;           // 0-100 composite score
  breakdown: {
    revenueImpact: number;      // 0-30 points (direct/indirect revenue)
    userReach: number;          // 0-25 points (number of users affected)
    strategicAlignment: number; // 0-20 points (alignment with goals)
    urgency: number;            // 0-15 points (time sensitivity)
    quickWinBonus: number;      // 0-10 points (high impact + low effort)
  };
  tier: 1 | 2 | 3;             // Approval tier required
  assessedAt: string;          // ISO timestamp
  assessedBy: 'AI' | string;   // AI or human assessor
  justification: string;        // Explanation of score
}
```

## Scoring Dimensions

### Revenue Impact (0-30 points)
Direct revenue generation, cost savings, or efficiency gains. This is the highest-weighted dimension.

**Examples:**
- Direct revenue feature (e.g., new payment method): 25-30 points
- Cost reduction feature (e.g., automation): 15-20 points
- Efficiency improvement: 5-15 points
- No financial impact: 0 points

### User Reach (0-25 points)
Number of users, customers, or stakeholders affected by the request.

**Examples:**
- All users (100%): 20-25 points
- Large segment (50-99%): 15-20 points
- Medium segment (10-49%): 8-15 points
- Small segment (<10%): 0-8 points

### Strategic Alignment (0-20 points)
Alignment with company OKRs, product roadmap, or strategic initiatives.

**Examples:**
- Core strategic initiative: 15-20 points
- Roadmap feature: 10-15 points
- Supports strategy indirectly: 5-10 points
- No strategic alignment: 0 points

### Urgency (0-15 points)
Time sensitivity, regulatory deadlines, or competitive pressure.

**Examples:**
- Legal/regulatory deadline: 12-15 points
- Competitive threat: 8-12 points
- Time-sensitive opportunity: 5-8 points
- No urgency: 0 points

### Quick Win Bonus (0-10 points)
Accelerator for high-impact requests with low complexity/effort.

**Examples:**
- High impact + very low effort: 8-10 points
- High impact + low effort: 5-8 points
- Moderate quick win: 2-5 points
- Not a quick win: 0 points

## Tier System

The impact assessment includes a 3-tier workflow for progressive refinement:

### Tier 1: AI-Generated Assessment
- **Trigger**: Automatically during request submission
- **Process**: Claude AI analyzes conversation history and request data
- **Output**: Initial 0-100 score with breakdown and justification
- **Activity Log**: "AI Impact Score: 85/100 (Tier 1)"

### Tier 2: Product Owner Manual Refinement
- **Trigger**: Product Owner reviews request in Scoping stage
- **Process**: Manual adjustment via `ImpactAdjustmentModal` component
- **Context**: Adds insider knowledge (dependencies, risks, customer commitments, competitive intel)
- **Validation**: Requires justification for all adjustments
- **Activity Log**: "Impact score adjusted: 75/100 (Tier 2) by Alex Rivera"

### Tier 3: Business Case Validation (Future Phase)
- **Planned**: Post-completion outcome tracking
- **Purpose**: Validate scoring accuracy and refine AI model
- **Not yet implemented**

## API Method

```typescript
api.calculateImpactScore(
  conversationHistory: ChatMessage[],
  requestData: RequestData
): Promise<ImpactAssessment>
```

**Parameters:**
- `conversationHistory`: Full chat transcript from intake conversation
- `requestData`: Structured request metadata (title, description, complexity, etc.)

**Returns:** Complete `ImpactAssessment` object with score, breakdown, tier, and justification.

## Workflow Integration

### Tier 1 (AI) - Automatic Scoring

Impact scoring runs automatically during request submission, in parallel with routing:

```typescript
// LandingPage.tsx → useRequests → api.calculateImpactScore()
const impactAssessment = await api.calculateImpactScore(
  conversationHistory,
  requestData
);
```

The score is stored in the optional `request.impactAssessment` field and logged to the activity timeline:

```typescript
request: {
  // ... other fields
  impactAssessment: {
    totalScore: 85,
    breakdown: { /* scores */ },
    tier: 1,
    assessedAt: "2025-10-07T12:00:00Z",
    assessedBy: "AI",
    justification: "High revenue potential..."
  }
}
```

### Tier 2 (Manual) - Product Owner Adjustments

Product Owners can refine AI scores via the `ImpactAdjustmentModal` on the Request Detail Page:

**Features:**
- Editable 5-dimension breakdown with AI scores as reference
- Manual context fields for additional factors
- Required justification for adjustments
- Real-time score calculation (sum of 5 dimensions)
- Tier automatically updated to 2 on save

**Process:**
1. Product Owner opens request in Scoping stage
2. Clicks "Adjust Impact Score" button
3. Reviews AI assessment and modifies scores
4. Adds manual context (dependencies, risks, etc.)
5. Provides justification
6. Saves → Activity log entry created

## Dashboard Display

### Impact Column
The dashboard includes a dedicated "Impact" column with the `ImpactBadge` component:

**Badge Features:**
- Displays score (0-100) with visual indicator
- Tier indicator (T1/T2/T3) shows assessment level
- Color-coded variants:
  - **High** (≥70): Green/emerald styling
  - **Medium** (40-69): Yellow/amber styling
  - **Low** (<40): Red/rose styling
  - **None**: Gray styling for unassessed requests
- Small size (`sm`) optimized for table cells
- Tier 2 badges use purple/violet styling to distinguish manual adjustments

### Sorting Behavior
Dashboard sorts by impact score with the following priority:
1. **Assessed requests first** (any impact assessment exists)
2. **Descending score** (100 → 0)
3. **Unassessed requests last**

Visual sort indicator (ArrowDown icon) displays in the "Impact" column header.

## Utility Functions

Located in `src/utils/impactValidation.ts`:

### Validation
- **`validateImpactScore(assessment)`**: Validates breakdown sums to totalScore (±1 tolerance for rounding)

### Null-Safe Getters
- **`getImpactScore(request)`**: Returns score or 0 if no assessment
- **`getImpactTier(request)`**: Returns tier or undefined if no assessment
- **`hasImpactAssessment(request)`**: Type guard for TypeScript narrowing

### Badge Helpers
- **`getImpactBadgeVariant(score)`**: Maps score to badge variant (high/medium/low/none)

### Business Logic
- **`isQuickWin(request)`**: Identifies high-impact requests with low complexity
- **`sortByImpactScore(requests)`**: Sorts requests with assessed first, then by score descending

## Security & Validation

### Input Validation
- **Conversation length**: 2-50 messages (prevents empty or excessive input)
- **Message size**: <5000 characters per message (prevents DoS attacks)
- **Request data**: All required fields validated before API call

### Output Validation
- **Score ranges**:
  - Total score: 0-100
  - Revenue Impact: 0-30
  - User Reach: 0-25
  - Strategic Alignment: 0-20
  - Urgency: 0-15
  - Quick Win Bonus: 0-10
- **Tier validation**: Must be 1, 2, or 3
- **Breakdown sum**: Must equal totalScore (±1 tolerance)

### Error Handling
- JSON parsing wrapped in try-catch
- Graceful degradation if scoring fails (request proceeds without score)
- API errors logged but don't block request submission

### Sanitization
- All inputs validated before sending to Claude API
- Prevents prompt injection attacks
- Rate limiting on API calls (future enhancement)

## Test Coverage

**Total: 101 tests across 3 test files**

### impactValidation.test.ts (49 tests)
- Score validation (range checks, breakdown sum validation)
- Null-safe getters (getImpactScore, getImpactTier, hasImpactAssessment)
- Badge variant mapping (getImpactBadgeVariant)
- Quick win detection (isQuickWin)
- Sorting logic (sortByImpactScore)

### requestFilters.test.ts (36 tests)
- Request filtering by stage, priority, view
- Sorting by impact score (assessed first, descending order)
- Edge cases (tie-breaking, missing scores)

### ImpactBadge.test.tsx (16 tests)
- Badge rendering for all variants (high/medium/low/none)
- Tier indicator display (T1/T2/T3)
- Size variants (sm/md/lg)
- Dark mode compatibility

## Phase Status

- ✅ **Phase 1 Complete**: AI-driven scoring with automated tier assignment
- ⏸️ **Phase 2 Planned**: Product Owner manual override capability
- ⏸️ **Phase 3 Planned**: Business case workflow for Tier 3 requests

## Related Documentation

- [Role-Based Views](role-based-views.md) - How different roles interact with impact scores
- [State Management](../architecture/state-management.md) - Impact assessment storage in AppContext
- [API Service Layer](../architecture/dual-server.md) - Backend proxy for Claude API calls
