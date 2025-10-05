# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI-powered workflow orchestrator built with React, TypeScript, and the Anthropic Claude API. The application manages workflow requests through an intelligent chatbot interface with automated routing, requirement generation (BRD/FSD/Tech Specs), and **three distinct role-based views** (Requester/Developer/Management).

**Key Features:**
- AI-powered conversational intake that guides users through requirement gathering
- Smart routing to team members based on request type
- Automated generation of Business Requirements Document (BRD), Functional Specification Document (FSD), and Technical Specifications
- Dashboard with request tracking, priority levels, clarity scores, and workflow stages
- **Three-view system with role-based access control:**
  - **Requester View**: Submit and track personal requests
  - **Developer View**: Manage assigned work and team workflow
  - **Management View**: Full portfolio oversight with analytics
- **RevOps Optimization Features:**
  - SLA tracking with visual status badges (on-time/at-risk/overdue)
  - Team capacity monitoring with utilization indicators
  - Analytics dashboard with portfolio funnel and cycle time metrics
  - Document approval workflow with quality gates
  - Modern toast notifications for all user feedback

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
│   └── AppContext.tsx
├── types/                       # TypeScript type definitions
│   └── index.ts
├── services/                    # API service layer
│   └── api.ts
├── utils/                       # Utility functions
│   ├── slaCalculator.ts         # SLA calculation logic
│   └── requestFilters.ts        # Request filtering and sorting
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
- **Domain types**: `Request` (includes `submittedBy` for requester tracking), `ChatMessage`, `RequestData`, `GeneratedDocs`, `TeamMember`
- **Enum types**: `RequestStage`, `Priority`, `UserMode`, `DocType`, `ViewType` (`'requester' | 'dev' | 'management'`), `TabType`, `SLAStatus`
- **API types**: `ClaudeApiRequest`, `ClaudeApiResponse`, `RoutingInfo`
- **RevOps types**: `SLAData`, `DocumentApproval`

### API Service Layer
All Claude API interactions are centralized in `src/services/api.ts`:
- `api.startIntakeConversation()` - Initial request intake
- `api.continueConversation()` - Multi-turn conversation
- `api.extractRequestData()` - Extract structured data from chat
- `api.routeRequest()` - Route to team member
- `api.generateDocuments()` - Create BRD/FSD/Tech Spec (sequential, 3 separate API calls)
- `api.generateSingleDocument()` - Create one document (BRD, FSD, or Tech Spec)
- `api.refineDocument()` - Update documents based on feedback

The service layer handles all HTTP requests to the backend proxy at `http://localhost:3001/api/chat`, which forwards to Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`).

**Document Generation Strategy**: Documents are generated sequentially using 3 smaller API calls (1000 tokens each) instead of 1 large call (4000 tokens). This provides:
- Faster individual responses (~3-5s per document)
- Better error recovery (single doc failure doesn't lose all docs)
- Real-time progress tracking (user sees which document is being generated)
- No JSON parsing errors (returns markdown directly)
- Concise, demo-friendly content (<200 words per document)

### State Management
Uses React Context (`AppProvider`) with custom hooks:
- **`useChat` hook**: `chatMessages`, `userInput`, `isProcessing`, `currentOptions`
- **`useRequests` hook**: `requests`, `selectedRequest`, `requestData`
- **`useDocuments` hook**: `generatedDocs`, `userMode`, `isGenerating`, `activeDocTab`, `docChatMessages`
- **View control**: `view` (requester/dev/management) - controls role-based access and filtering
- **Navigation**: React Router DOM for URL-based routing with auto-navigation on view change

**SessionStorage Exception**: The `pendingExample` navigation handoff (LandingPage → SubmitPage) uses sessionStorage instead of Context. This is an acceptable exception for ephemeral routing state that crosses route boundaries. Do NOT use sessionStorage for domain data - only for one-time navigation handoffs.

### AI Integration Pattern
The application uses the API service layer for all Claude interactions:

1. **Initial request intake**: Conversational chatbot that extracts requirements through guided questions
2. **Follow-up conversation**: Processes user responses with strict prompt instructions to provide bullet-point options
3. **Document generation**: Creates BRD, FSD, and Technical Spec based on collected requirements and user experience level (Guided/Collaborative/Expert)
4. **Document refinement**: Allows iterative improvements to generated documents

### Request Workflow
Requests flow through stages: `Scoping` → `Ready for Dev` → `In Progress` → `Review` → `Completed`

Each request includes:
- Basic metadata (id, title, status, owner, priority, daysOpen)
- Clarity score (1-10)
- Activity log with timestamps
- Optional AI alerts for stalled requests

### UI Structure
Page-based routing with React Router using nested route layouts:
- **`/`**: Minimal landing page (LandingPage) with Google-inspired UI - redirects dev/management users to dashboard
- **`/submit`**: New request submission (SubmitPage) with full AI chatbot interface
- **`/dashboard`**: Request list (DashboardPage) with stats, filtering, SLA badges, and team capacity widget
- **`/kanban`**: Kanban board (KanbanPage) with drag-and-drop workflow and SLA badges
- **`/analytics`**: Analytics dashboard (AnalyticsPage) with portfolio funnel, bottleneck detection, and cycle time trends
- **`/request/:id`**: Individual request detail (RequestDetailPage) with document generation and approval workflow
- **`*`**: 404 error page (NotFoundPage)

All routes except `/` use the AppLayout component which provides Header and TabNavigation. The landing page renders without layout for a clean, focused entry experience.

### Role-Based View System
The application provides three distinct user experiences with automatic filtering, scoped data display, and navigation control:

**👤 Requester View** (Demo user: Jessica Martinez)
- **Navigation**: Dashboard → New Request
- **Request Filtering**: Shows only requests submitted by the user (`submittedBy` match)
- **Stats Display**:
  - "Needs Attention" shows only their own alerts
  - Standard request counts (by stage and priority)
- **Widget Visibility**: TeamCapacityWidget is hidden (not relevant to requesters)
- **Table Columns**: "Requester" column hidden (viewing only own requests)
- **Capabilities**: Submit requests, generate documents, review completed work
- **Auto-navigation**: Switches to Dashboard when view changes

**💻 Developer View** (Demo user: Sarah Chen)
- **Navigation**: Dashboard → Kanban Board → Analytics
- **Request Filtering**: Shows assigned requests + "Ready for Dev" stage requests (available work pool)
- **Stats Display**:
  - "My Active Requests" shows currently assigned work
  - "My Completed Today" shows requests completed today
  - "Needs Attention" shows alerts only for assigned requests
- **Widget Visibility**: TeamCapacityWidget displayed
- **Table Columns**: "Requester" column visible (shows request origins)
- **Kanban Cards**: Display `submittedBy` for context
- **Capabilities**: Accept work, update status, complete requests
- **Auto-navigation**: Switches to Dashboard when view changes

**📊 Management View** (Full oversight)
- **Navigation**: Dashboard → Kanban Board → Analytics
- **Request Filtering**: Shows ALL requests (no filtering)
- **Stats Display**:
  - "Needs Attention" shows all alerts across portfolio
  - Full portfolio statistics
- **Widget Visibility**: TeamCapacityWidget displayed
- **Table Columns**: "Requester" column visible (full transparency)
- **Kanban Cards**: Display `submittedBy` for context
- **Capabilities**: Read-only oversight, team capacity monitoring, SLA tracking
- **Auto-navigation**: Switches to Dashboard when view changes

**Implementation Details**:
- View state managed in `AppContext` (src/contexts/AppContext.tsx)
- Filtering logic in `DashboardPage.tsx`, `KanbanPage.tsx`, and `App.tsx`
- Request count updates dynamically based on filtered results
- StatsBar component adapts displayed metrics based on `view` prop
- TeamCapacityWidget conditionally rendered based on view type
- RequestTable adjusts column visibility based on view context
- Stage badges use `whitespace-nowrap` to prevent text wrapping

Features lazy loading with code splitting, error boundaries, skeleton loaders, and toast notifications for optimal performance and UX.

## Key Functions

- `startConversation()`: Initiates new request with AI
- `continueConversation()`: Handles multi-turn conversation with strict prompt engineering for bullet-point options
- `generateRequirements(mode)`: Creates all three specification documents sequentially based on user experience level
- `refineDocument()`: Updates documents based on user feedback
- `viewRequestDetail(request)`: Opens request detail view (resets generation state)
- `updateRequestStage(requestId, newStage, note)`: Manages request workflow transitions
- `calculateSLA(request)`: Calculates SLA status based on complexity and creation date
- `approveDocument(docType, approver)`: Approves a document and enables stage transitions
- `areAllDocsApproved()`: Checks if all three documents are approved before allowing "Ready for Dev"

## Prompt Engineering Notes

The chatbot uses strict prompt instructions to:
- Ask one question at a time
- Provide 2-4 answer choices as bullet points (using "•")
- Avoid asking follow-up questions or explaining technical concepts
- Extract structured JSON summaries after conversation completion

The system includes specific instructions to ensure options are ANSWERS (e.g., "Taking 5+ hours per week") not QUESTIONS (e.g., "How much time?").

## Tech Stack Details

- **React 19.2.0** with TypeScript (Server Components ready)
- **Vite 6.3.6** for build tooling (16% faster builds, configured for port 3000 with auto-open)
- **React Router DOM v7** for URL-based navigation
- **Tailwind CSS 4.1.14** for styling (CSS-first configuration)
- **Lucide React** for icons
- **React Hot Toast** for modern toast notifications
- **Express.js** backend proxy server (runs on port 3001)
- **React Context** for state management with custom hooks
- **Vitest** for testing with React Testing Library
- **ESLint 9.37.0** with flat config for code quality (zero warnings policy)
- **Prettier** for consistent code formatting
- **Proxied API calls** through Express backend for security
- **Code splitting** with lazy loading for optimal performance

**Recent Migration** (October 2025): All major dependencies upgraded - see [MIGRATION_COMPLETE.md](MIGRATION_COMPLETE.md) for details. Build time improved 16%, dev server 74% faster.

## Known Patterns

- Mock data exists in the initial `requests` state (REQ-001, REQ-002, REQ-003)
- Console.log statements exist for debugging
- API responses are parsed in the service layer (`api.ts`)
- Documents are stored as markdown strings in state
- Error boundary wraps the entire application for graceful error handling
- Backend proxy server handles API authentication, frontend handles all application state
- No database (state is stored client-side only)
- Lazy loading with Suspense for code splitting
- Test coverage for UI components and features (11 test files, 119 tests)
- ESLint 9 flat config with TypeScript and React hooks rules (eslint.config.mjs)
- Prettier configuration for code formatting (.prettierrc.json)
- Tailwind 4 CSS-first configuration (src/index.css replaces tailwind.config.js)

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
- `src/components/ui/` → Generic, no business logic
- `src/components/layout/` → App-wide structure
- `src/features/[feature]/components/` → Feature-specific
- `src/pages/` → Route-level composition

**Testing**:
- Co-locate: `Component.test.tsx` next to `Component.tsx`
- Run single test: `npm test -- Component.test.tsx`
- See [testing docs](docs/architecture/testing.md) for patterns

## Migration Status

### Architectural Migration ✅
All architectural phases complete (see [docs/history/MIGRATION_PLAN.md](docs/history/MIGRATION_PLAN.md)). The codebase is production-ready with type safety, modular components, React Router navigation, comprehensive testing, error boundaries, and lazy loading.

### Dependency Migration ✅ (October 2025)
All major dependencies upgraded to latest stable versions. See [MIGRATION_COMPLETE.md](MIGRATION_COMPLETE.md) for comprehensive details.

**Completed Upgrades:**
- ✅ React 18.3.1 → 19.2.0 (Server Components support)
- ✅ ESLint 8.57.1 → 9.37.0 (Flat config migration)
- ✅ Vite 5.4.20 → 6.3.6 (Performance improvements)
- ✅ Tailwind CSS 3.4.17 → 4.1.14 (CSS-first configuration)

**Performance Gains:**
- Build time: 27.52s → 23.13s (-16% faster)
- Dev server: ~8s → 2.09s (-74% faster)
- Bundle gzipped: 95.85 kB (optimized, under 100 kB target)
- Zero breaking changes, all 119 tests passing

**Key Changes:**
- ESLint now uses flat config (eslint.config.mjs)
- Tailwind uses CSS-first config in src/index.css
- All configurations updated for modern tooling

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
