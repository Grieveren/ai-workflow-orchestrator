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

### Single Component Design
The entire application is built as one large component (`src/AIWorkflowOrchestrator.tsx`, ~1750 lines). All state, business logic, and UI are contained within this single file.

### State Management
Uses React `useState` hooks for all state management:
- **Chat state**: `chatMessages`, `userInput`, `isProcessing`, `currentOptions`
- **Request management**: `requests`, `selectedRequest`, `requestData`
- **Document generation**: `generatedDocs`, `userMode`, `isGenerating`, `activeDocTab`, `docChatMessages`
- **View control**: `activeTab`, `view` (requester/dev), `showExamples`, `isEditingDoc`

### AI Integration Pattern
The application makes `fetch()` calls to the backend proxy server at `http://localhost:3001/api/chat`, which forwards requests to the Anthropic API using the Claude Sonnet 4.5 model (`claude-sonnet-4-5-20250929`). Key integration points:

1. **Initial request intake** (`startConversation`): Conversational chatbot that extracts requirements through guided questions
2. **Follow-up conversation** (`continueConversation`): Processes user responses with strict prompt instructions to provide bullet-point options
3. **Document generation** (`generateRequirements`): Creates BRD, FSD, and Technical Spec based on collected requirements and user experience level (Guided/Collaborative/Expert)
4. **Document refinement** (`refineDocument`): Allows iterative improvements to generated documents

### Request Workflow
Requests flow through stages: `Scoping` → `Ready for Dev` → `In Progress` → `Review` → `Completed`

Each request includes:
- Basic metadata (id, title, status, owner, priority, daysOpen)
- Clarity score (1-10)
- Activity log with timestamps
- Optional AI alerts for stalled requests

### UI Structure
Three main views controlled by `activeTab`:
- **submit**: Chatbot interface for new requests
- **dashboard**: Table view of all requests with filtering/sorting
- **detail**: Individual request view with document generation and workflow actions

The application toggles between Requester and Developer perspectives (`view` state).

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
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Express.js** backend proxy server (runs on port 3001)
- **No state management library** (all useState hooks)
- **No routing library** (tab-based navigation)
- **Proxied API calls** through Express backend for security

## Known Patterns

- Mock data exists in the initial `requests` state (REQ-001, REQ-002, REQ-003)
- Console.log statements exist for debugging (e.g., in `viewRequestDetail`)
- API responses are parsed by accessing `data.content[0].text`
- Documents are stored as markdown strings in state
- No error boundary or global error handling
- Backend proxy server handles API authentication, frontend handles all application state
- No database (state is stored client-side only)
