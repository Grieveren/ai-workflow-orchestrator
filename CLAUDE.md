# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI-powered workflow orchestrator built with React, TypeScript, and the Anthropic Claude API. The application manages workflow requests through an intelligent chatbot interface with automated routing, requirement generation (BRD/FSD/Tech Specs), and **four distinct role-based views** (Requester/Product Owner/Developer/Management).

**Key Features:**
- AI-powered conversational intake that guides users through requirement gathering
- Smart routing to team members based on request type
- **AI Impact Assessment**: Automated 0-100 scoring based on revenue potential, user reach, strategic alignment, urgency, and quick-win potential for data-driven prioritization
- Automated generation of Business Requirements Document (BRD), Functional Specification Document (FSD), and Technical Specifications
- Dashboard with request tracking, priority levels, clarity scores, impact scores, and workflow stages
- **Four-view system with role-based access control:**
  - **Requester View**: Submit and track personal requests
  - **Product Owner View**: Review and refine requirements in Scoping stage
  - **Developer View**: Manage assigned work and team workflow
  - **Management View**: Full portfolio oversight with analytics
- **Dark Mode with System Preference Support:**
  - WCAG 2.1 AA compliant color palette (4.5:1 contrast ratios)
  - Persistent theme preference with localStorage
  - Automatic system preference detection (prefers-color-scheme)
  - Smooth 150ms transitions between light/dark modes
  - Manual toggle in header navigation
  - Comprehensive dark mode styling across all UI components (document generation, modals, chat interfaces)
- **RevOps Optimization Features:**
  - SLA tracking with visual status badges (on-time/at-risk/overdue)
  - Team capacity monitoring with utilization indicators
  - Analytics dashboard with portfolio funnel and cycle time metrics
  - **Sequential document approval workflow** (BRD → FSD → Tech Spec) with quality gates and locking
  - Modern toast notifications for all user feedback
  - Reusable Modal component replacing native browser prompts

## Claude Code Workflow - MANDATORY PROCESS

**CRITICAL**: This section defines the REQUIRED workflow for Claude Code when working in this repository. Non-compliance is NOT acceptable.

### Pre-Work Phase (REQUIRED)

Before starting ANY task, Claude Code MUST:

1. **Use TodoWrite**: Create a todo list for any multi-step task (3+ distinct actions) or any complex task
2. **Identify Relevant Agents**: Review `.claude/agents/` to determine which specialized agents apply
3. **Review Hooks**: Check `.claude/hooks.json` to understand what automated validation will run

**Exception: Documentation-Only Changes**
For pure documentation updates (`*.md` files only, no code changes):
- TodoWrite is optional if making <3 distinct changes
- Skip `technical-architect` unless architectural documentation changed
- Skip test/TypeScript/ESLint checks (not applicable to markdown)
- Still use `doc-updater` for cross-file consistency verification

### During Work Phase (REQUIRED)

Claude Code MUST proactively invoke specialized agents WITHOUT asking permission:

**Auto-Invoke Triggers:**
- **`technical-architect`**: ANY file in `src/` with >20 lines changed, architectural decisions, or pattern changes
- **`test-writer`**: New component created in `src/components/` or `src/features/`
- **`security-reviewer`**: Modifications to `src/services/api.ts`, `server.js`, authentication, or user input handling
- **`ux-reviewer`**: UI/UX changes to `src/components/`, `src/pages/`, `src/features/*/components/`, or Tailwind styling updates
- **`doc-updater`**: Changes to files listed in "Critical Architecture Patterns" section
- **`dependency-auditor`**: `package.json` modified or new npm packages requested
- **`route-optimizer`**: New routes added or `src/App.tsx` router modified
- **`prompt-engineer`**: Modifying prompts in `src/services/api.ts`

**Agent Parallelization (Critical for Performance):**

Agents can run **simultaneously** to reduce review time by 50-70%. Use parallel invocation patterns:

**After UI Component Changes:**
- **Parallel**: `test-writer` + `ux-reviewer` + `security-reviewer` + `code-reviewer` (all 4 run simultaneously)
- **Sequential**: Then `doc-updater` (after code finalized)

**After API Service Changes:**
- **Parallel**: `security-reviewer` + `api-integration` + `technical-architect` (all 3 run simultaneously)
- **Sequential**: Then `prompt-engineer` + `test-writer` + `doc-updater`

**After New Feature Planning:**
- **Sequential**: `product-owner` (must approve first)
- **Parallel**: `technical-architect` + `project-manager` + `security-reviewer` (all 3 run after approval)
- **Sequential**: Implementation phase

**General Rule**: Review agents (test-writer, security-reviewer, ux-reviewer, code-reviewer) can ALWAYS run in parallel post-implementation. They analyze the same code from different perspectives with no dependencies on each other.

**Hook Compliance:**
- Trust hooks to run automatically (they execute via `.claude/hooks.json`)
- Address hook feedback immediately - do NOT ignore warnings or errors
- If a hook blocks an action, determine root cause before proceeding

**Hook Failure Protocol:**
When hooks fail or produce warnings:
- **TypeScript errors** → Fix immediately, do not proceed with other work
- **Test failures** → Debug and resolve before continuing to next task
- **ESLint warnings** → Address all warnings (zero-warning policy enforced)
- **Git commit blocks** → Review files being committed, fix security issues, retry
- If errors persist → Document in chat, seek user guidance

**Agent Invocation Failure:**
If a specialized agent fails or times out:
1. Review the agent's output for specific error messages
2. Fix any environmental issues (missing files, incorrect paths, etc.)
3. Re-invoke the agent with corrected context
4. If persistent failure → Document the issue in chat and proceed with manual review
5. Never skip agent review silently - always acknowledge when manual review replaces agent review

### Post-Work Phase (REQUIRED)

After completing ANY code changes, Claude Code MUST:

1. **Run Tests**: Execute `npm run test:run` to verify no regressions
2. **TypeScript Check**: Run `npx tsc --noEmit` to ensure type safety
3. **ESLint**: Execute `npm run lint` to verify code quality standards
4. **Agent Review**: Invoke `technical-architect` for final architectural review

### Workflow Enforcement

**These are NOT suggestions - they are REQUIREMENTS:**
- Specialized agents must be used proactively, not reactively
- Tests, TypeScript, and ESLint checks are MANDATORY after changes
- TodoWrite must be used for task tracking and transparency
- Documentation must be updated when architectural patterns change

**Rationale**: This workflow ensures:
- Consistency with established architectural patterns
- Prevention of regressions through automated testing
- Knowledge transfer through documentation
- Quality standards through automated reviews

## Development Commands

```bash
# Start backend proxy server (required for API calls)
node server.js
# OR
npm run server

# Start frontend development server (opens at http://localhost:3000)
npm run dev

# Start both servers simultaneously (runs in background)
npm run dev:full

# Run tests
npm test              # Watch mode
npm run test:run      # Run once
npm run test:ui       # With UI

# Build for production (TypeScript compile + Vite build)
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

**Important**: You must run both the backend proxy (port 3001) and frontend dev server (port 3000) for the application to work properly. Use `npm run dev:full` to start both at once.

## Environment Setup

The application requires an Anthropic API key for the backend proxy server:
1. Copy `.env.example` to `.env`
2. Set `ANTHROPIC_API_KEY` with your API key (note: no `VITE_` prefix)
3. The key is used server-side in `server.js` via `process.env.ANTHROPIC_API_KEY`
4. The frontend makes requests to `http://localhost:3001/api/chat` instead of calling Anthropic directly

**Security Note**: The API key is never exposed to the client. All Claude API requests are proxied through the Express server running on port 3001.

## Architecture

**Status**: ✅ Production-ready architecture (All 5 phases complete)

### Current Structure

```
src/
├── pages/                       # Route pages
│   ├── LandingPage.tsx           # Minimal entry page with view redirects
│   ├── SubmitPage.tsx
│   ├── DashboardPage.tsx
│   ├── KanbanPage.tsx
│   ├── AnalyticsPage.tsx
│   ├── RequestDetailPage.tsx
│   ├── NotFoundPage.tsx
│   └── index.ts
├── components/
│   ├── ui/                      # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   ├── Skeleton.tsx
│   │   ├── SLABadge.tsx
│   │   ├── ImpactBadge.tsx        # Impact score badge component with tier indicators
│   │   ├── ImpactAdjustmentModal.tsx  # Product Owner manual score adjustment UI
│   │   ├── ThemeToggle.tsx        # Dark mode toggle component
│   │   ├── Modal.tsx              # Reusable modal dialog with dark mode
│   │   └── index.ts
│   └── layout/                  # Layout components
│       ├── Header.tsx
│       ├── TabNavigation.tsx
│       ├── AppLayout.tsx         # Nested route layout wrapper
│       └── index.ts
├── features/                    # Feature-specific components
│   ├── chat/
│   │   └── components/          # Chat UI (ChatMessage, ChatInput, MinimalLanding)
│   ├── dashboard/
│   │   └── components/          # Dashboard + TeamCapacityWidget
│   └── documents/
│       └── components/          # Document-specific components
├── hooks/                       # Custom React hooks
│   ├── useChat.ts
│   ├── useRequests.ts
│   └── useDocuments.ts
├── contexts/                    # React Context providers
│   ├── AppContext.tsx
│   └── ThemeContext.tsx          # Theme state management (dark/light mode)
├── types/                       # TypeScript type definitions
│   └── index.ts
├── services/                    # API service layer
│   └── api.ts
├── utils/                       # Utility functions
│   ├── slaCalculator.ts         # SLA calculation logic
│   ├── requestFilters.ts        # Request filtering and sorting
│   ├── impactValidation.ts      # Impact assessment validation and utilities
│   └── permissions.ts           # Role-based access control
├── constants/                   # Application constants
│   └── users.ts                 # Mock user definitions
├── test/                        # Test setup
│   └── setup.ts
├── App.tsx                      # Main router component
├── ErrorBoundary.tsx            # Error boundary wrapper
├── main.tsx                     # Entry point
└── index.css                    # Tailwind styles
```

### Type System
All data structures are defined in `src/types/index.ts`:
- **Domain types**: `Request` (includes `submittedBy` for requester tracking and optional `impactAssessment` field), `ChatMessage`, `RequestData`, `GeneratedDocs`, `TeamMember`
- **Enum types**: `RequestStage`, `Priority`, `UserMode`, `DocType`, `ViewType` (`'requester' | 'product-owner' | 'dev' | 'management'`), `TabType`, `SLAStatus`, `Theme` (`'light' | 'dark'`)
- **API types**: `ClaudeApiRequest`, `ClaudeApiResponse`, `RoutingInfo`
- **RevOps types**: `SLAData`, `DocumentApproval` (includes optional `approverRole` field to track which role approved documents)
- **Impact Assessment types**: `ImpactAssessment` (includes `totalScore` 0-100, `breakdown` with 5 scoring categories, `tier` 1-3, `assessedAt`, `assessedBy`, and `justification`)

### API Service Layer
All Claude API interactions are centralized in `src/services/api.ts`:
- `api.startIntakeConversation()` - Initial request intake
- `api.continueConversation()` - Multi-turn conversation
- `api.extractRequestData()` - Extract structured data from chat
- `api.routeRequest()` - Route to team member
- `api.calculateImpactScore()` - AI-powered impact assessment (Tier 1: 0-100 scoring across 5 dimensions)
- `api.generateDocuments()` - Create BRD/FSD/Tech Spec (sequential, 3 separate API calls)
- `api.generateSingleDocument()` - Create one document (BRD, FSD, or Tech Spec)
- `api.refineDocument()` - Update documents based on feedback

**Note**: Manual impact score adjustments (Tier 2) are handled client-side via `useRequests.adjustImpactScore()` - no AI call needed.

The service layer handles all HTTP requests to the backend proxy at `http://localhost:3001/api/chat`, which forwards to Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`).

**Document Generation Strategy**: Documents are generated sequentially using 3 smaller API calls (1000 tokens each) instead of 1 large call (4000 tokens). This provides:
- Faster individual responses (~3-5s per document)
- Better error recovery (single doc failure doesn't lose all docs)
- Real-time progress tracking (user sees which document is being generated)
- No JSON parsing errors (returns markdown directly)
- Concise, demo-friendly content (<200 words per document)

### State Management
Uses React Context (`AppProvider`, `ThemeProvider`) with custom hooks:
- **`useChat` hook**: `chatMessages`, `userInput`, `isProcessing`, `currentOptions`
- **`useRequests` hook**: `requests`, `selectedRequest`, `requestData`, `adjustImpactScore()` (Tier 2 manual adjustments)
- **`useDocuments` hook**: `generatedDocs`, `userMode`, `isGenerating`, `activeDocTab`, `docChatMessages`
- **`useTheme` hook**: `theme`, `setTheme`, `toggleTheme` - manages dark/light mode with localStorage persistence
- **View control**: `view` (requester/product-owner/dev/management) - controls role-based access and filtering
- **Navigation**: React Router DOM for URL-based routing with auto-navigation on view change
- **Permission checks**: Centralized in `src/utils/permissions.ts` for role-based feature access

**Theme Persistence**: The `ThemeProvider` stores user preference in localStorage and detects system preference (`prefers-color-scheme: dark`) as fallback. Theme state applies the `.dark` class to `<html>` element for Tailwind CSS dark mode.

**SessionStorage Exception**: The `pendingExample` navigation handoff (LandingPage → SubmitPage) uses sessionStorage instead of Context. This is an acceptable exception for ephemeral routing state that crosses route boundaries. Do NOT use sessionStorage for domain data - only for one-time navigation handoffs.

### AI Integration Pattern
The application uses the API service layer for all Claude interactions:

1. **Initial request intake**: Conversational chatbot that extracts requirements through guided questions
2. **Follow-up conversation**: Processes user responses with strict prompt instructions to provide bullet-point options
3. **Impact assessment**: AI analyzes conversation history to calculate a 0-100 impact score across 5 dimensions (revenue potential, user reach, strategic alignment, urgency, quick-win potential) and assigns a tier (1=AI auto, 2=manual review, 3=business case required)
4. **Document generation**: Creates BRD, FSD, and Technical Spec based on collected requirements and user experience level (Guided/Collaborative/Expert)
5. **Document refinement**: Allows iterative improvements to generated documents

### Impact Assessment System

The application includes AI-powered impact scoring to enable data-driven prioritization. Impact assessments are calculated automatically during request submission.

**ImpactAssessment Type**:
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

**Scoring Dimensions**:
- **Revenue Impact (0-30)**: Direct revenue generation, cost savings, or efficiency gains
- **User Reach (0-25)**: Number of users, customers, or stakeholders affected
- **Strategic Alignment (0-20)**: Alignment with company OKRs, roadmap, or strategic initiatives
- **Urgency (0-15)**: Time sensitivity, regulatory deadlines, or competitive pressure
- **Quick Win Bonus (0-10)**: High-impact requests with low complexity/effort (accelerator)

**Tier System** (3-tier assessment workflow):
- **Tier 1**: AI-generated assessment (initial scoring from conversation analysis)
- **Tier 2**: Product Owner manual refinement (insider knowledge adjustments via `ImpactAdjustmentModal`)
- **Tier 3**: Business case validation (future phase - post-completion outcome tracking)

**API Method**:
```typescript
api.calculateImpactScore(
  conversationHistory: ChatMessage[],
  requestData: RequestData
): Promise<ImpactAssessment>
```

**Workflow Integration**:
- **Tier 1 (AI)**: Impact scoring runs automatically during request submission (parallel with routing)
  - Conversation history passed from `LandingPage` → `useRequests` → `api.calculateImpactScore()`
  - Score stored in `request.impactAssessment` field (optional, nullable)
  - Activity log entry created: "AI Impact Score: 85/100 (Tier 1)"
- **Tier 2 (Manual)**: Product Owner adjusts score via `ImpactAdjustmentModal` (RequestDetailPage)
  - Edits 5-dimension breakdown with AI scores as reference
  - Adds manual context (dependencies, risks, customer commitments, competitive intel)
  - Requires justification for all adjustments
  - Activity log entry: "Impact score adjusted: 75/100 (Tier 2) by Alex Rivera"
- Dashboard sorted by impact score (assessed requests first, then by descending score)

**Dashboard Display**:
- New "Impact" column in `RequestTable` with `ImpactBadge` component
- Badge displays score (0-100), tier indicator (T1/T2/T3), and visual variant (high/medium/low/none)
- Visual sort indicator (ArrowDown icon) shows impact-based sorting
- Small badge size (`sm`) optimized for table cells
- Tier 2 badges show purple/violet styling to distinguish manual adjustments from AI scores

**Utility Functions** (`src/utils/impactValidation.ts`):
- `validateImpactScore(assessment)`: Validates breakdown sums to totalScore ±1 tolerance
- `getImpactScore(request)`: Null-safe score getter (returns 0 if undefined)
- `getImpactTier(request)`: Null-safe tier getter (returns undefined if no assessment)
- `hasImpactAssessment(request)`: Type guard for TypeScript narrowing
- `getImpactBadgeVariant(score)`: Maps score to badge variant (high ≥70, medium 40-69, low <40, none if no assessment)
- `isQuickWin(request)`: Identifies high-impact requests with low complexity
- `sortByImpactScore(requests)`: Sorts requests with assessed first, then by score descending

**Security & Validation**:
- Input validation: Conversation length (2-50 messages), message size (<5000 chars)
- Output validation: Score ranges (0-100 total, correct breakdown ranges), tier validation (1-3)
- Error handling: JSON parsing wrapped in try-catch, graceful degradation if scoring fails
- Sanitization: Validated inputs prevent DoS attacks

**Test Coverage**: 101 tests across 3 test files
- `impactValidation.test.ts`: 49 tests for validation utilities
- `requestFilters.test.ts`: 36 tests for sorting/filtering (including impact-based sorting)
- `ImpactBadge.test.tsx`: 16 tests for badge component rendering

**Phase Status**:
- ✅ **Phase 1 Complete**: AI-driven scoring with automated tier assignment
- ⏸️ **Phase 2 Planned**: Product Owner manual override capability
- ⏸️ **Phase 3 Planned**: Business case workflow for Tier 3 requests

### Request Workflow
Requests flow through stages with role-based ownership:

1. **Intake** → Requester submits request via chatbot
2. **Scoping** → Product Owner reviews, generates BRD/FSD/Tech Spec, and approves documents
3. **Ready for Dev** → Developer picks up approved request from work pool
4. **In Progress** → Developer actively working on implementation
5. **Review** → Developer submits for review
6. **Completed** → Request finished and delivered

**Stage Ownership:**
- **Scoping**: Product Owner (Alex Rivera) - exclusive document generation and approval rights
- **Ready for Dev → Completed**: Developer (Sarah Chen) - implementation and delivery
- **All Stages**: Requester (Jessica Martinez) - read-only tracking of their submissions
- **All Stages**: Management - read-only portfolio oversight

Each request includes:
- Basic metadata (id, title, status, owner, priority, daysOpen)
- Clarity score (1-10)
- Optional impact assessment (0-100 score with tier and breakdown)
- Activity log with timestamps
- Optional AI alerts for stalled requests
- Document approval tracking with approver role attribution

### UI Structure
Page-based routing with React Router using nested route layouts:
- **`/`**: Minimal landing page (LandingPage) with Google-inspired UI - redirects product-owner/dev/management users to dashboard
- **`/submit`**: New request submission (SubmitPage) with full AI chatbot interface
- **`/dashboard`**: Request list (DashboardPage) with stats, filtering, SLA badges, and team capacity widget
- **`/kanban`**: Kanban board (KanbanPage) with drag-and-drop workflow and SLA badges
- **`/analytics`**: Analytics dashboard (AnalyticsPage) with portfolio funnel, bottleneck detection, and cycle time trends
- **`/request/:id`**: Individual request detail (RequestDetailPage) with document generation and approval workflow
- **`*`**: 404 error page (NotFoundPage)

All routes except `/` use the AppLayout component which provides Header and TabNavigation. The landing page renders without layout for a clean, focused entry experience.

### Role-Based View System
The application provides four distinct user experiences with automatic filtering, scoped data display, and navigation control:

**👤 Requester View** (Demo user: Jessica Martinez)
- **Navigation**: Dashboard → New Request
- **Request Filtering**: Shows only requests submitted by the user (`submittedBy` match)
- **Stats Display**:
  - "Needs Attention" shows only their own alerts
  - Standard request counts (by stage and priority)
- **Widget Visibility**: TeamCapacityWidget is hidden (not relevant to requesters)
- **Table Columns**: "Requester" column hidden (viewing only own requests)
- **Capabilities**: Submit new requests, view status of submitted requests (read-only after submission)
- **Access Restrictions**: Cannot generate documents or approve documents (Product Owner responsibility)
- **Auto-navigation**: Switches to Dashboard when view changes

**📋 Product Owner View** (Demo user: Alex Rivera)
- **Navigation**: Dashboard → Kanban Board → Analytics
- **Request Filtering**: Shows only requests in "Scoping" stage (PO work queue)
- **Stats Display**:
  - "Pending Review" shows Scoping requests without approved documents
  - "Approved Today" shows requests moved to Ready for Dev today
  - "Needs Attention" shows alerts only for Scoping requests
- **Widget Visibility**: TeamCapacityWidget displayed (to understand dev capacity before approval)
- **Table Columns**: "Requester" column visible (shows request origins for context)
- **Kanban Cards**: Display `submittedBy` for context
- **Capabilities**:
  - Generate BRD/FSD/Tech Spec documents (exclusive right during Scoping)
  - Approve all three documents (quality gates)
  - Move requests from Scoping → Ready for Dev (after all docs approved)
  - Refine documents based on stakeholder feedback
- **Access Restrictions**:
  - Can only see/modify requests in Scoping stage
  - Cannot access requests in Ready for Dev, In Progress, Review, or Completed stages
  - Cannot perform developer actions (assign work, update implementation status)
- **Auto-navigation**: Switches to Dashboard when view changes

**💻 Developer View** (Demo user: Sarah Chen)
- **Navigation**: Dashboard → Kanban Board → Analytics
- **Request Filtering**: Shows "Ready for Dev" + assigned requests (available work pool)
- **Stats Display**:
  - "My Active Requests" shows currently assigned work
  - "My Completed Today" shows requests completed today
  - "Needs Attention" shows alerts only for assigned requests
- **Widget Visibility**: TeamCapacityWidget displayed
- **Table Columns**: "Requester" column visible (shows request origins)
- **Kanban Cards**: Display `submittedBy` for context
- **Capabilities**:
  - Pick up work from "Ready for Dev" pool
  - Update status (Ready for Dev → In Progress → Review → Completed)
  - View approved documents (BRD/FSD/Tech Spec are read-only)
  - Complete implementation work
- **Access Restrictions**:
  - Cannot see requests in "Scoping" stage (Product Owner responsibility)
  - Cannot generate or approve documents (Product Owner responsibility)
  - Can only work on requests after PO has approved all documents
- **Auto-navigation**: Switches to Dashboard when view changes
- **Automatic Assignment**: When transitioning request to "In Progress" stage, `owner` field automatically updates to developer, ensuring request remains visible in dev view filtering

**📊 Management View** (Full oversight)
- **Navigation**: Dashboard → Kanban Board → Analytics
- **Request Filtering**: Shows ALL requests across all stages (no filtering)
- **Stats Display**:
  - "Needs Attention" shows all alerts across portfolio
  - Full portfolio statistics (all stages, all priorities)
- **Widget Visibility**: TeamCapacityWidget displayed
- **Table Columns**: "Requester" column visible (full transparency)
- **Kanban Cards**: Display `submittedBy` for context
- **Capabilities**:
  - Read-only oversight of entire workflow
  - View all requests regardless of stage
  - Monitor team capacity and SLA compliance
  - Access analytics and portfolio metrics
- **Access Restrictions**:
  - Cannot modify requests (read-only)
  - Cannot generate, approve, or update documents
  - Cannot change request stages or assignments
- **Auto-navigation**: Switches to Dashboard when view changes

**Implementation Details**:
- View state managed in `AppContext` (src/contexts/AppContext.tsx)
- Permission logic centralized in `src/utils/permissions.ts`:
  - `canGenerateDocuments(view, stage)` - Controls document generation access
  - `canApproveDocuments(view, stage)` - Controls document approval access
  - `canUpdateStage(view, fromStage, toStage)` - Controls stage transition permissions
  - `isReadOnly(view, stage)` - Determines if view has read-only access
- Filtering logic in `DashboardPage.tsx`, `KanbanPage.tsx`, and `App.tsx`
- Request count updates dynamically based on filtered results
- StatsBar component adapts displayed metrics based on `view` prop
- TeamCapacityWidget conditionally rendered based on view type
- RequestTable adjusts column visibility based on view context
- RequestDetailPage enforces permissions using `permissions.ts` utilities
- Stage badges use `whitespace-nowrap` to prevent text wrapping

Features lazy loading with code splitting, error boundaries, skeleton loaders, and toast notifications for optimal performance and UX.

## Key Functions

**API Service Layer** (`src/services/api.ts`):
- `startConversation()`: Initiates new request with AI
- `continueConversation()`: Handles multi-turn conversation with strict prompt engineering for bullet-point options
- `calculateImpactScore(conversationHistory, requestData)`: AI-powered impact assessment returning 0-100 score with tier and breakdown
- `generateRequirements(mode)`: Creates all three specification documents sequentially based on user experience level
- `refineDocument()`: Updates documents based on user feedback

**Request Management**:
- `viewRequestDetail(request)`: Opens request detail view (resets generation state)
- `updateRequestStage(requestId, newStage, note)`: Manages request workflow transitions (enforces permission checks)
- `submitRequest()`: Submits new request with parallel impact scoring and routing

**Document Workflow**:
- `approveDocument(docType, approver, approverRole)`: Approves a document with role tracking for audit trail
- `areAllDocsApproved()`: Checks if all three documents are approved before allowing Product Owner to move request to "Ready for Dev"
- `isDocumentLocked(docType, generatedDocs)`: Sequential approval helper - FSD locked until BRD approved, Tech Spec locked until FSD approved

**RevOps & Analytics**:
- `calculateSLA(request)`: Calculates SLA status based on complexity and creation date

**Impact Assessment Utilities** (`src/utils/impactValidation.ts`):
- `validateImpactScore(assessment)`: Validates impact score breakdown (tolerance ±1)
- `getImpactScore(request)`: Null-safe getter returning score or 0
- `getImpactTier(request)`: Null-safe tier getter
- `hasImpactAssessment(request)`: Type guard for requests with assessments
- `getImpactBadgeVariant(score)`: Maps score to badge variant (high/medium/low/none)
- `isQuickWin(request)`: Identifies high-impact + low-complexity requests
- `sortByImpactScore(requests)`: Sorts with assessed requests first, then by score descending

**Permission Utilities** (`src/utils/permissions.ts`):
- `canGenerateDocuments(view, stage)`: Returns true only for Product Owner in Scoping stage
- `canApproveDocuments(view, stage)`: Returns true only for Product Owner in Scoping stage
- `canUpdateStage(view, fromStage, toStage)`: Validates role-based stage transition permissions (PO: Scoping → Ready for Dev; Dev: Ready for Dev → Completed)
- `isReadOnly(view, stage)`: Returns true for Management (always read-only), Requester (always read-only after submission), and roles outside their workflow ownership

## Prompt Engineering Notes

The chatbot uses strict prompt instructions to:
- Ask one question at a time
- Provide 2-4 answer choices as bullet points (using "•")
- Avoid asking follow-up questions or explaining technical concepts
- Extract structured JSON summaries after conversation completion

The system includes specific instructions to ensure options are ANSWERS (e.g., "Taking 5+ hours per week") not QUESTIONS (e.g., "How much time?").

## Tech Stack Details

- **React 19** with TypeScript
- **Vite 6** for build tooling (configured for port 3000 with auto-open)
- **React Router DOM v7** for URL-based navigation
- **Tailwind CSS v4** for styling (CSS-first configuration, pure v4 defaults)
- **Lucide React** for icons
- **React Hot Toast** for modern toast notifications
- **Express.js** backend proxy server (runs on port 3001)
- **React Context** for state management with custom hooks
- **Vitest** for testing with React Testing Library
- **ESLint 9** with TypeScript plugin for code quality (zero warnings policy)
- **Prettier** for consistent code formatting
- **Proxied API calls** through Express backend for security
- **Code splitting** with lazy loading for optimal performance

## Known Patterns

- Mock data exists in the initial `requests` state (REQ-001, REQ-002, REQ-003)
- Console.log statements exist for debugging
- API responses are parsed in the service layer (`api.ts`)
- Documents are stored as markdown strings in state
- Impact assessments are optional fields on Request objects (nullable)
- Dashboard sorting prioritizes impact-assessed requests first, then sorts by score descending
- **Modal component** (`src/components/ui/Modal.tsx`) replaces native `prompt()` dialogs with dark mode support, textarea input, keyboard shortcuts (⌘+Enter), and proper validation
- **Badge component** (`src/components/ui/Badge.tsx`) supports size variants (sm/md/lg) and 6 style variants (default/primary/success/warning/danger/info) with consistent dark mode styling across all badge types
- **Sequential document approval**: Documents are locked in order (FSD until BRD approved, Tech Spec until FSD approved) using `isDocumentLocked()` helper
- **Automatic dev assignment**: When request transitions to "In Progress", owner field automatically updates to current developer to maintain view filtering
- Error boundary wraps the entire application for graceful error handling
- Backend proxy server handles API authentication, frontend handles all application state
- No database (state is stored client-side only)
- Lazy loading with Suspense for code splitting
- Test coverage for UI components and features (23 test files, 101 tests for impact assessment alone)
- ESLint configuration with TypeScript and React hooks rules (.eslintrc.json)
- Prettier configuration for code formatting (.prettierrc.json)

## Critical Architecture Patterns

The application follows strict architectural patterns. **Detailed documentation** is available in the [`docs/architecture/`](docs/architecture/) directory:

- **[Dual-Server Architecture](docs/architecture/dual-server.md)** - Backend proxy for secure API key handling
- **[State Management](docs/architecture/state-management.md)** - React Context with composable hooks
- **[Component Strategy](docs/architecture/component-strategy.md)** - Component location rules
- **[Testing Philosophy](docs/architecture/testing.md)** - Testing approach and patterns

### Quick Reference

**Dual-Server** (both must run):
- Backend (port 3001): Express proxy with API key
- Frontend (port 3000): Vite dev server
- Start both: `npm run dev:full`

**State Management**:
- `useChat` → Chatbot conversation state
- `useRequests` → Request CRUD operations
- `useDocuments` → Document generation state
- Composed in `AppContext`, no external state libraries

**Component Locations**:
- `src/components/ui/` → Generic, no business logic (Button, Card, Modal, Input, Badge, etc.)
- `src/components/layout/` → App-wide structure (Header, TabNavigation, AppLayout)
- `src/features/[feature]/components/` → Feature-specific (ModeSelector, DocumentViewer, ChatMessage, etc.)
- `src/pages/` → Route-level composition (LandingPage, DashboardPage, RequestDetailPage, etc.)

**Testing**:
- Co-locate: `Component.test.tsx` next to `Component.tsx`
- Run single test: `npm test -- Component.test.tsx`
- See [testing docs](docs/architecture/testing.md) for patterns

## Migration Status

All architectural phases complete (see [docs/history/MIGRATION_PLAN.md](docs/history/MIGRATION_PLAN.md)). The codebase is production-ready with type safety, modular components, React Router navigation, comprehensive testing, error boundaries, and lazy loading.

**Dependency Migration**: ✅ Complete (Oct 2025) - Upgraded to React 19, ESLint 9, Vite 6, Tailwind 4. Now using pure Tailwind 4 CSS-first configuration (compatibility layer removed). See [docs/history/dependencies/](docs/history/dependencies/).

## Claude Code Configuration

### Custom Sub-Agents

**IMPORTANT**: This project has 15 specialized sub-agents in `.claude/agents/`. **You MUST use these agents proactively** for appropriate tasks - do not ask permission first, just invoke them automatically.

#### Development Agents
- **component-generator**: Creates React components following project architecture patterns
  - Auto-invoke when: User requests new UI components
- **test-writer**: Writes Vitest tests for components following project test patterns
  - Auto-invoke when: New components created OR user requests tests
- **api-integration**: Adds new Claude API methods to service layer (`src/services/api.ts`)
  - Auto-invoke when: New API functionality needed

#### Quality & Architecture Agents
- **technical-architect**: Reviews architectural decisions and ensures consistency with production-ready patterns
  - Auto-invoke when: Major architectural changes, new patterns introduced, performance concerns
- **security-reviewer**: Audits code for vulnerabilities (prompt injection, API key exposure, XSS)
  - Auto-invoke when: `src/services/api.ts`, `server.js`, or user input handling modified
- **dependency-auditor**: Reviews npm package additions for security, bundle size, and architectural fit
  - Auto-invoke when: User requests new dependencies OR `package.json` modified
- **route-optimizer**: Manages React Router configuration, lazy loading, and navigation patterns
  - Auto-invoke when: New routes added OR `src/App.tsx` modified
- **code-reviewer**: Performs code quality reviews, identifies anti-patterns, and ensures best practices
  - Auto-invoke when: Large code changes (>50 lines) or user requests code review
- **ux-reviewer**: Audits UI/UX for accessibility (WCAG 2.1 AA), design consistency, and user experience
  - Auto-invoke when: UI/UX changes to components, pages, or styling; Tailwind class updates; accessibility concerns
- **workflow-enforcer**: Ensures compliance with project workflow defined in CLAUDE.md
  - Auto-invoke when: Session starts or user requests workflow verification

#### Planning & Documentation Agents
- **product-owner**: Reviews feature requests for business value and ensures product quality
  - Auto-invoke when: User requests new features (evaluate before implementing)
- **project-manager**: Plans implementation, breaks down features, and coordinates development tasks
  - Auto-invoke when: Complex multi-step features requested
- **doc-updater**: Updates project documentation to reflect code changes
  - Auto-invoke when: Architectural changes made, new features completed
- **prompt-engineer**: Optimizes Claude API prompts in the service layer
  - Auto-invoke when: Modifying prompts in `src/services/api.ts`
- **revops-expert**: Provides strategic consultation on Revenue Operations workflow optimization
  - Auto-invoke when: User asks about process improvements or workflow optimization

**Agent Usage Philosophy**: Be proactive, not reactive. If a task matches an agent's expertise, delegate to that agent immediately without asking. This provides better focused context and follows the pattern the agent system was designed for.

### Automated Hooks

The `.claude/hooks.json` file configures **16 automated checks** during Claude Code sessions. These hooks execute automatically - trust them to catch issues.

#### UserPromptSubmit Hooks (run before each response)
- **Server validation**: Checks ports 3000/3001 are running
- **API key validation**: Verifies `.env` file exists with valid ANTHROPIC_API_KEY

#### PreToolUse Hooks (run before tool execution)
- **Enhanced secret detection**: Blocks commits of `.env`, `.key`, `.pem` files
- **Port conflict warning**: Warns if ports already in use before starting servers

#### PostToolUse Hooks (run after file edits)
- **TypeScript type checking**: Runs `tsc --noEmit` after `.ts`/`.tsx` edits
- **Test suite execution**: Runs tests after `src/` file changes
- **Prettier auto-formatting**: Formats files automatically after Write/Edit
- **ESLint validation**: Lints TypeScript files with zero warnings allowed
- **Hook isolation check**: Ensures custom hooks don't call each other directly
- **Breaking change detection**: Detects export signature changes in core files
- **Test coverage reminder**: Warns when new components lack test files
- **Documentation sync reminder**: Prompts doc updates for core architecture files
- **Secret scanning**: Detects hardcoded API keys or secrets in code

#### Stop Hooks (run when session ends)
- **Session summary**: Shows git status and files changed

**Hook Philosophy**: Hooks enforce production-ready standards automatically. Don't work around them - they prevent common mistakes and enforce architectural patterns. If a hook blocks or warns, address the underlying issue.

### GitHub Integration

The `.github/workflows/claude.yml` workflow enables @claude mentions in issues and PRs. Claude Code can respond to tasks in GitHub with read access to contents, pull requests, issues, and CI results.

### MCP Servers

This project has **6 configured MCP servers** that extend Claude Code's capabilities. These tools are loaded at session startup and should be used proactively for appropriate tasks.

#### Available Servers

1. **GitHub** (`@modelcontextprotocol/server-github`)
   - **Purpose**: Repository management, PR/issue creation, code reviews
   - **When to use**: Creating PRs, managing issues, reviewing GitHub activity
   - **Example**: Use `mcp__github__create_pull_request` when user requests PR creation

2. **Puppeteer** (`@modelcontextprotocol/server-puppeteer`)
   - **Purpose**: Browser automation and visual inspection of the running application
   - **When to use proactively**:
     - BEFORE making UI/styling changes → screenshot `localhost:3000` to see current state
     - AFTER UI changes → screenshot to verify the changes worked correctly
     - When user reports visual bugs → screenshot to see the actual issue
   - **Example**: `mcp__puppeteer__navigate` to `http://localhost:3000`, then `mcp__puppeteer__screenshot`
   - **Integration**: Always verify both frontend (3000) and backend (3001) are running first
   - **Agent synergy**: The `ux-reviewer` agent can request screenshots to validate visual changes and accessibility

3. **Memory** (`@modelcontextprotocol/server-memory`)
   - **Purpose**: Persist knowledge and decisions across Claude Code sessions
   - **When to use proactively**:
     - Store architectural decisions made during the session
     - Remember user preferences (e.g., "always use Tailwind class X for Y")
     - Track project-specific patterns discovered during development
     - Save important context about requests, workflows, or team dynamics
   - **Example**: After refactoring, store the rationale: `mcp__memory__store` "Why we chose sequential document generation over parallel"
   - **Integration**: Check memory at session start for relevant context, update at session end

4. **Filesystem** (`@modelcontextprotocol/server-filesystem`)
   - **Purpose**: Enhanced file operations on the `./src` directory
   - **When to use**: Advanced file watching, monitoring for changes, bulk operations
   - **Scope**: Limited to `./src` directory for safety
   - **Example**: Use `mcp__filesystem__watch` to monitor component changes during development

5. **Sequential Thinking** (`@modelcontextprotocol/server-sequential-thinking`)
   - **Purpose**: Advanced reasoning for complex multi-step architectural decisions
   - **When to use proactively**:
     - Planning major refactoring (e.g., adding database persistence)
     - Analyzing workflow bottlenecks in the RevOps features
     - Evaluating trade-offs for architectural changes
     - Breaking down complex features into implementation phases
   - **Example**: Use when user requests "add real-time collaboration" or other complex features

6. **SQLite** (`mcp-server-sqlite-npx`)
   - **Purpose**: Persistent data storage for the workflow orchestrator
   - **Database**: `./workflow.db` (created automatically on first use)
   - **When to use proactively**:
     - Offer to migrate mock data to persistent storage
     - When user requests "save requests between sessions"
     - For analytics that require historical data tracking
   - **Integration opportunities**:
     - Store `Request` objects permanently (replace client-side state)
     - Track document generation history
     - Persist user preferences and view settings
     - Enable multi-user collaboration with shared database
   - **Example**: `mcp__sqlite__query` to create tables matching `src/types/index.ts` schemas

#### Proactive Usage Patterns

**UI Development Workflow:**
1. Screenshot `localhost:3000` BEFORE changes (if servers running)
2. Make UI modifications
3. Screenshot AFTER to verify changes
4. Store design decisions in Memory for future consistency

**Feature Planning Workflow:**
1. Use Sequential Thinking for complex features
2. Check Memory for related past decisions
3. Store the implementation plan in Memory
4. Execute with appropriate specialized agents

**Database Migration Workflow:**
1. Analyze current mock data structure in `AppContext.tsx`
2. Design SQLite schema matching `src/types/index.ts`
3. Create migration script to preserve existing data
4. Offer persistence layer as enhancement to user

**Session Start Checklist:**
- Check Memory for relevant project context
- If UI work expected, verify servers running and take baseline screenshot
- Store new learnings in Memory at session end

**Note**: MCP tools only become available in NEW sessions after configuration. If tools are missing, verify with `claude mcp list` and restart the session.
