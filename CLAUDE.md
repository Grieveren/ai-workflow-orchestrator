# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI-powered workflow orchestrator built with React, TypeScript, and the Anthropic Claude API. The application manages workflow requests through an intelligent chatbot interface with automated routing, requirement generation (BRD/FSD/Tech Specs), and dual-perspective views (Requester/Developer).

**Key Features:**
- AI-powered conversational intake that guides users through requirement gathering
- Smart routing to team members based on request type
- Automated generation of Business Requirements Document (BRD), Functional Specification Document (FSD), and Technical Specifications
- Dashboard with request tracking, priority levels, clarity scores, and workflow stages
- Dual-view system: Requester view for submitting/tracking requests, Developer view for managing work

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
│   ├── SubmitPage.tsx
│   ├── DashboardPage.tsx
│   ├── KanbanPage.tsx
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
│   │   └── index.ts
│   └── layout/                  # Layout components
│       ├── Header.tsx
│       ├── TabNavigation.tsx
│       └── index.ts
├── features/                    # Feature-specific components
│   ├── chat/
│   │   └── components/          # Chat-specific components
│   ├── dashboard/
│   │   └── components/          # Dashboard-specific components
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
├── test/                        # Test setup
│   └── setup.ts
├── App.tsx                      # Main router component
├── ErrorBoundary.tsx            # Error boundary wrapper
├── main.tsx                     # Entry point
└── index.css                    # Tailwind styles
```

### Type System
All data structures are defined in `src/types/index.ts`:
- **Domain types**: `Request`, `ChatMessage`, `RequestData`, `GeneratedDocs`
- **Enum types**: `RequestStage`, `Priority`, `UserMode`, `DocType`, `ViewType`, `TabType`
- **API types**: `ClaudeApiRequest`, `ClaudeApiResponse`, `RoutingInfo`

### API Service Layer
All Claude API interactions are centralized in `src/services/api.ts`:
- `api.startIntakeConversation()` - Initial request intake
- `api.continueConversation()` - Multi-turn conversation
- `api.extractRequestData()` - Extract structured data from chat
- `api.routeRequest()` - Route to team member
- `api.generateDocuments()` - Create BRD/FSD/Tech Spec
- `api.refineDocument()` - Update documents based on feedback

The service layer handles all HTTP requests to the backend proxy at `http://localhost:3001/api/chat`, which forwards to Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`).

### State Management
Uses React Context (`AppProvider`) with custom hooks:
- **`useChat` hook**: `chatMessages`, `userInput`, `isProcessing`, `currentOptions`
- **`useRequests` hook**: `requests`, `selectedRequest`, `requestData`
- **`useDocuments` hook**: `generatedDocs`, `userMode`, `isGenerating`, `activeDocTab`, `docChatMessages`
- **View control**: `view` (requester/dev)
- **Navigation**: React Router DOM for URL-based routing

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
Page-based routing with React Router:
- **`/`**: New request submission (SubmitPage) with AI chatbot interface
- **`/dashboard`**: Request list (DashboardPage) with stats and filtering
- **`/kanban`**: Kanban board (KanbanPage) with drag-and-drop workflow
- **`/request/:id`**: Individual request detail (RequestDetailPage) with document generation
- **`*`**: 404 error page (NotFoundPage)

The application toggles between Requester and Developer perspectives (`view` state).

Features lazy loading with code splitting, error boundaries, and skeleton loaders for optimal performance.

## Key Functions

- `startConversation()`: Initiates new request with AI
- `continueConversation()`: Handles multi-turn conversation with strict prompt engineering for bullet-point options
- `generateRequirements(mode)`: Creates all three specification documents based on user experience level
- `refineDocument()`: Updates documents based on user feedback
- `viewRequestDetail(request)`: Opens request detail view (resets generation state)
- `updateRequestStage(requestId, newStage, note)`: Manages request workflow transitions

## Prompt Engineering Notes

The chatbot uses strict prompt instructions to:
- Ask one question at a time
- Provide 2-4 answer choices as bullet points (using "•")
- Avoid asking follow-up questions or explaining technical concepts
- Extract structured JSON summaries after conversation completion

The system includes specific instructions to ensure options are ANSWERS (e.g., "Taking 5+ hours per week") not QUESTIONS (e.g., "How much time?").

## Tech Stack Details

- **React 18** with TypeScript
- **Vite** for build tooling (configured for port 3000 with auto-open)
- **React Router DOM v7** for URL-based navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Express.js** backend proxy server (runs on port 3001)
- **React Context** for state management with custom hooks
- **Vitest** for testing with React Testing Library
- **Proxied API calls** through Express backend for security
- **Code splitting** with lazy loading for optimal performance

## Known Patterns

- Mock data exists in the initial `requests` state (REQ-001, REQ-002, REQ-003)
- Console.log statements exist for debugging
- API responses are parsed in the service layer (`api.ts`)
- Documents are stored as markdown strings in state
- Error boundary wraps the entire application for graceful error handling
- Backend proxy server handles API authentication, frontend handles all application state
- No database (state is stored client-side only)
- Lazy loading with Suspense for code splitting
- Test coverage for UI components (Button, Card, Badge, ChatMessage)

## Migration Progress

See [MIGRATION_PLAN.md](MIGRATION_PLAN.md) for the complete refactoring roadmap.

### ✅ Phase 1: Foundation (Complete)
- TypeScript type definitions
- API service layer
- Type-safe component state

### ✅ Phase 2: State Management (Complete)
- Custom hooks for state logic (useChat, useRequests, useDocuments)
- React Context for global state (AppProvider)
- State management separated from UI

### ✅ Phase 3: Component Breakdown (Complete)
- UI component library (Button, Card, Badge, Input, Skeleton)
- Chat feature module (4 components)
- Dashboard feature module (3 components)
- Document feature module (3 components)
- Layout components (Header, TabNavigation)

### ✅ Phase 4: Routing & Testing (Complete)
- React Router DOM v7 with URL-based navigation
- Page-based architecture (5 pages)
- Vitest setup with React Testing Library
- Initial test coverage (20 tests, 100% passing)

### ✅ Phase 5: Advanced Features (Complete)
- Error boundary for graceful error handling
- Lazy loading with code splitting
- Skeleton loading states
- 404 Not Found page
- Production build optimization (227 KB bundle, 5 route chunks)
