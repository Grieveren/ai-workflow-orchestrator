# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI-powered workflow orchestrator built with React, TypeScript, and the Anthropic Claude API. The application manages workflow requests through an intelligent chatbot interface with automated routing, requirement generation (BRD/FSD/Tech Specs), and **four distinct role-based views** (Requester/Product Owner/Developer/Management).

**Key Features:**
- AI-powered conversational intake that guides users through requirement gathering
- Smart routing to team members based on request type
- **AI Impact Assessment**: Automated 0-100 scoring based on revenue potential, user reach, strategic alignment, urgency, and quick-win potential for data-driven prioritization
- Automated generation of Business Requirements Document (BRD), Functional Specification Document (FSD), and Technical Specifications
- **SQLite Database Persistence**: Server-side data storage with optimistic UI updates for instant responsiveness
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

### Pre-Work Phase

1. **Use TodoWrite** for multi-step tasks (3+ actions) or complex tasks
2. **Identify Relevant Agents** in `.claude/agents/`
3. **Review Hooks** in `.claude/hooks.json` for automated validation

**Exception:** Documentation-only changes (`*.md` files) - TodoWrite optional if <3 changes, skip code checks

### During Work Phase

**Auto-Invoke Specialized Agents** (without asking permission):
- `technical-architect`: >20 lines changed in `src/`, architectural decisions
- `test-writer`: New components in `src/components/` or `src/features/`
- `security-reviewer`: `src/services/api.ts`, `server.js`, auth, user input
- `ux-reviewer`: UI/UX changes, Tailwind styling
- `doc-updater`: Changes to core architecture files
- `dependency-auditor`: `package.json` modified
- `route-optimizer`: New routes, `src/App.tsx` router changes
- `prompt-engineer`: Prompt modifications in `src/services/api.ts`

**Agent Parallelization:** Run review agents simultaneously (50-70% faster):
- UI changes: `test-writer` + `ux-reviewer` + `security-reviewer` + `code-reviewer` (parallel), then `doc-updater`
- API changes: `security-reviewer` + `api-integration` + `technical-architect` (parallel)

**Hook Compliance:** Trust automated hooks, address failures immediately

### Post-Work Phase

1. Run tests: `npm run test:run`
2. TypeScript check: `npx tsc --noEmit`
3. ESLint: `npm run lint`
4. Final review: Invoke `technical-architect`

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
├── pages/              # Route pages
├── components/
│   ├── ui/            # Reusable UI (Button, Card, Badge, Modal, etc.)
│   └── layout/        # Layout (Header, TabNavigation, AppLayout)
├── features/          # Feature-specific components
│   ├── chat/
│   ├── dashboard/
│   └── documents/
├── hooks/             # Custom React hooks
├── contexts/          # React Context providers
├── types/             # TypeScript definitions (index.ts)
├── services/          # API service layer (api.ts)
├── utils/             # Utility functions
├── constants/         # Application constants
└── test/              # Test setup
```

### Type System

All types defined in `src/types/index.ts`. See [State Management](docs/architecture/state-management.md#type-system) for details.

### API Service Layer
All Claude API interactions and database operations are centralized in `src/services/api.ts`:

**AI Methods:**
- `api.startIntakeConversation()` - Initial request intake
- `api.continueConversation()` - Multi-turn conversation
- `api.extractRequestData()` - Extract structured data from chat
- `api.routeRequest()` - Route to team member
- `api.calculateImpactScore()` - AI-powered impact assessment (Tier 1: 0-100 scoring across 5 dimensions)
- `api.generateDocuments()` - Create BRD/FSD/Tech Spec (sequential, 3 separate API calls)
- `api.generateSingleDocument()` - Create one document (BRD, FSD, or Tech Spec)
- `api.refineDocument()` - Update documents based on feedback

**Database Methods:**
- `api.getAllRequests()` - Fetch all requests from database
- `api.getRequestById(id)` - Fetch single request with activities and impact assessment
- `api.createRequest(request)` - Persist new request to database
- `api.updateRequest(id, updates)` - Update request with transaction support
- `api.deleteRequest(id)` - Remove request from database

**Note**: Manual impact score adjustments (Tier 2) are handled client-side via `useRequests.adjustImpactScore()` - no AI call needed.

The service layer handles all HTTP requests to the backend proxy at `http://localhost:3001`, which provides both Claude API forwarding (`/api/chat` → Claude Sonnet 4.5) and REST API endpoints for database operations (`/api/requests`).

**Document Generation Strategy**: Documents are generated sequentially using 3 smaller API calls (1000 tokens each) instead of 1 large call (4000 tokens). This provides:
- Faster individual responses (~3-5s per document)
- Better error recovery (single doc failure doesn't lose all docs)
- Real-time progress tracking (user sees which document is being generated)
- No JSON parsing errors (returns markdown directly)
- Concise, demo-friendly content (<200 words per document)

### State Management
Uses React Context (`AppProvider`, `ThemeProvider`) with custom hooks and **server-side SQLite persistence**:
- **`useChat` hook**: `chatMessages`, `userInput`, `isProcessing`, `currentOptions`
- **`useRequests` hook**: `requests`, `selectedRequest`, `requestData`, `adjustImpactScore()` (Tier 2 manual adjustments)
  - **Database integration**: All CRUD operations persist to SQLite via REST API
  - **Optimistic updates**: UI updates immediately while database operations run async
  - **Error handling**: Automatic rollback to previous state on database failures
  - **Loading state**: `loading` and `error` states for database operations
- **`useDocuments` hook**: `generatedDocs`, `userMode`, `isGenerating`, `activeDocTab`, `docChatMessages`
- **`useTheme` hook**: `theme`, `setTheme`, `toggleTheme` - manages dark/light mode with localStorage persistence
- **View control**: `view` (requester/product-owner/dev/management) - controls role-based access and filtering
- **Navigation**: React Router DOM for URL-based routing with auto-navigation on view change
- **Permission checks**: Centralized in `src/utils/permissions.ts` for role-based feature access

**Database Persistence**: All request data (requests, impact assessments, activities) stored in SQLite database (`./workflow.db`). The `useRequests` hook implements optimistic updates: UI changes apply immediately, database operations execute asynchronously, and changes rollback automatically if persistence fails.

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

AI-powered impact scoring (0-100) with 5 dimensions: revenue impact, user reach, strategic alignment, urgency, quick-win bonus. Includes 3-tier workflow (AI auto, manual refinement, business case validation).

**See:** [Impact Assessment Documentation](docs/features/impact-assessment.md)

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

Four distinct views (Requester/Product Owner/Developer/Management) with role-based filtering, scoped stats, and permission controls.

**See:** [Role-Based Views Documentation](docs/features/role-based-views.md)


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
- **better-sqlite3** for server-side database persistence
- **React Context** for state management with custom hooks
- **Vitest** for testing with React Testing Library
- **ESLint 9** with TypeScript plugin for code quality (zero warnings policy)
- **Prettier** for consistent code formatting
- **Proxied API calls** through Express backend for security
- **Code splitting** with lazy loading for optimal performance

## Known Patterns

**Critical Non-Obvious Patterns:**
- **Modal component**: Replaces native `prompt()` with dark mode, keyboard shortcuts (⌘+Enter), validation
- **Badge component**: Size variants (sm/md/lg), 6 style variants with dark mode styling
- **Sequential document approval**: FSD locked until BRD approved, Tech Spec locked until FSD approved
- **Automatic dev assignment**: Owner updates to dev when transitioning to "In Progress" (maintains filtering)
- **SessionStorage exception**: `pendingExample` uses sessionStorage for navigation handoff (acceptable exception)
- **Impact assessments**: Optional/nullable field on Request objects
- **Dashboard sorting**: Impact-assessed requests first, then descending by score
- **Optimistic updates**: `useRequests` hook captures previous state before mutations, rolls back on database errors
- **Database transactions**: All PATCH operations wrapped in `db.transaction()` for atomicity
- **N+1 query prevention**: Batch-fetch all activities once, group in memory by request_id

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

This project has **6 configured MCP servers**: GitHub, Puppeteer, Memory, Filesystem, Sequential Thinking, SQLite.

**See:** [MCP Servers Guide](.claude/mcp-guide.md)
