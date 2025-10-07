# AI Workflow Orchestrator

A modern React application for managing workflow requests with AI-powered assistance. This tool helps teams submit, track, and manage requests through an intelligent chatbot interface with automated routing and requirement generation.

**Architecture Status**: ✅ **Production-Ready** - Fully refactored with modern patterns

## Features

- **AI-Powered Intake**: Conversational chatbot collects requirements from users
- **Smart Routing**: Automatically routes requests to the right team member
- **AI Impact Assessment**: Automated 0-100 scoring across 5 dimensions (revenue, user reach, strategic alignment, urgency, quick-wins) for data-driven prioritization with 3-tier workflow (AI assessment → Product Owner manual refinement → business case validation)
- **Requirement Generation**: AI generates BRD, FSD, and Technical Specifications
- **Dashboard**: Track all requests with status, priority, clarity scores, and impact scores
- **Kanban Board**: Visual workflow management across stages
- **Four-View System**: Requester, Product Owner, Developer, and Management perspectives
- **Analytics Dashboard**: Portfolio funnel, bottleneck detection, cycle time metrics
- **SLA Tracking**: Visual status badges (on-time/at-risk/overdue)
- **Sequential Document Approval**: BRD → FSD → Tech Spec workflow with quality gates and locking
- **Dark Mode**: System preference support with manual toggle, comprehensive styling across all components
- **Modern UI**: Reusable modal dialogs, toast notifications, smooth transitions
- **URL-Based Navigation**: Shareable links for any view or request
- **Comprehensive Testing**: Vitest setup with 23 test files (101 tests for impact assessment alone)

## Tech Stack

- **Frontend**: React 19.2.0, TypeScript, Vite 6.3.6, Tailwind CSS 4.1.14
- **Routing**: React Router DOM v7
- **Icons**: Lucide React
- **Backend**: Express.js (proxy server)
- **AI**: Anthropic Claude API (Sonnet 4.5)
- **Code Quality**: ESLint 9.37.0 (flat config), Prettier
- **MCP Servers**: 6 configured servers extending Claude Code (GitHub, Puppeteer, Memory, Filesystem, Sequential Thinking, SQLite)
- **Testing**: Vitest, React Testing Library, jsdom

**Recent Upgrade** (October 2025): All major dependencies upgraded. Build time improved 16%, dev server startup 74% faster. See [MIGRATION_COMPLETE.md](docs/history/dependencies/MIGRATION_COMPLETE.md) for details.

## Architecture

This project has undergone a complete architectural refactoring:

- ✅ **Phase 1**: Type definitions & API service layer
- ✅ **Phase 2**: Custom hooks & React Context
- ✅ **Phase 3**: Component extraction (17 reusable components)
- ✅ **Phase 4**: React Router & Vitest testing
- ✅ **Phase 5**: Error boundaries, lazy loading, advanced features

See [MIGRATION_PLAN.md](docs/history/architectural/MIGRATION_PLAN.md) for the complete refactoring strategy.

### Code Organization

```
src/
├── pages/                # Route pages
│   ├── LandingPage.tsx
│   ├── SubmitPage.tsx
│   ├── DashboardPage.tsx
│   ├── KanbanPage.tsx
│   ├── AnalyticsPage.tsx
│   ├── RequestDetailPage.tsx
│   ├── NotFoundPage.tsx
│   └── index.ts
├── components/
│   ├── ErrorBoundary.tsx # Error boundary wrapper
│   ├── layout/           # Header, TabNavigation
│   │   ├── Header.tsx
│   │   ├── TabNavigation.tsx
│   │   └── index.ts
│   └── ui/               # Button, Card, Badge, Input, Skeleton, Modal, ImpactBadge, etc.
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       ├── Input.tsx
│       ├── Skeleton.tsx
│       ├── Modal.tsx
│       ├── ImpactBadge.tsx
│       ├── ImpactAdjustmentModal.tsx
│       └── index.ts
├── features/             # Feature-specific components
│   ├── chat/             # ChatMessage, OptionSelector, etc.
│   ├── dashboard/        # StatsBar, RequestTable, KanbanBoard
│   └── documents/        # ModeSelector, DocumentViewer
├── hooks/                # Custom hooks
│   ├── useChat.ts
│   ├── useRequests.ts
│   └── useDocuments.ts
├── contexts/             # React Context
│   └── AppContext.tsx
├── services/             # API layer
│   └── api.ts
├── types/                # TypeScript types
│   └── index.ts
├── utils/                # Utility functions
│   ├── slaCalculator.ts
│   ├── requestFilters.ts
│   └── impactValidation.ts
├── constants/            # Application constants
│   └── users.ts
├── test/                 # Test setup
│   └── setup.ts
└── App.tsx               # Main router component
```

## Prerequisites

- **Node.js 20+** (required for Tailwind CSS 4 tooling)
- npm or yarn
- Anthropic API key

## Setup

1. **Clone or navigate to the project directory**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API Key**

   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=your_actual_api_key_here
   ```

   **Security Note**: The API key is used server-side only. The application uses an Express proxy server to keep your API key secure and never exposes it to the browser.

## Running the Application

### Development Mode

You need to run both the backend proxy server and the frontend:

**Option 1: Run both servers simultaneously (recommended)**
```bash
npm run dev:full
```

**Option 2: Run servers in separate terminals**

Terminal 1 - Backend proxy server:
```bash
npm run server
```

Terminal 2 - Frontend dev server:
```bash
npm run dev
```

The backend proxy runs on `http://localhost:3001` and the frontend opens at `http://localhost:3000`

### Testing

Run tests:
```bash
npm test          # Run tests in watch mode
npm run test:run  # Run tests once
npm run test:ui   # Run tests with UI
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Available Routes

| Route | Description |
|-------|-------------|
| `/` | Minimal landing page with view redirects and chat interface |
| `/submit` | New request submission with AI chat |
| `/dashboard` | Request list with stats and filtering |
| `/kanban` | Kanban board view by stage |
| `/analytics` | Analytics dashboard with portfolio metrics |
| `/request/:id` | Individual request details |

## Development

### Adding New Components

Components are organized by type:
- **UI components**: `src/components/ui/` (reusable, generic)
- **Layout components**: `src/components/layout/` (app structure)
- **Feature components**: `src/features/[feature]/components/` (feature-specific)

### Adding New Pages

1. Create page component in `src/pages/`
2. Add route in `src/App.tsx`
3. Update navigation in `src/components/layout/TabNavigation.tsx`

### Writing Tests

Tests are co-located with components:
```typescript
// Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders button text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

## Documentation

### Quick Links
- **[Documentation Index](docs/README.md)** - Complete documentation guide
- **[CLAUDE.md](CLAUDE.md)** - Claude Code instructions

### Architecture
- [Dual-Server Architecture](docs/architecture/dual-server.md) - Backend proxy pattern
- [State Management](docs/architecture/state-management.md) - React Context + hooks
- [Component Strategy](docs/architecture/component-strategy.md) - Component organization
- [Testing Philosophy](docs/architecture/testing.md) - Testing approach

### Migration History
- [Migration Plan](docs/history/architectural/MIGRATION_PLAN.md) - Complete refactoring roadmap
- [Phase Completions](docs/history/architectural/) - Detailed phase reports

## Key Improvements

### From Monolith to Modular
- **Before**: 1,544-line monolithic component
- **After**: 18+ reusable components, 6 route pages, 3 custom hooks
- **Result**: 68% reduction in main component size
- **Bundle**: 273 KB total (96 KB gzipped), optimized with code splitting
- **Testing**: 23 test files with 220+ comprehensive tests (101 for impact assessment)
- **Build Performance**: 23.13s production build (16% faster after Vite 6 upgrade)
- **Dev Server**: 2.09s startup (74% faster after Vite 6 upgrade)
- **Recent Improvements**:
  - Sequential document approval workflow (BRD → FSD → Tech Spec locking)
  - Comprehensive dark mode styling (document generation, modals, chat interfaces)
  - Reusable Modal component replacing native browser prompts
  - Automatic developer assignment on stage transitions

### Architecture Benefits
- ✅ Type-safe with TypeScript
- ✅ Modular and reusable components
- ✅ Clean separation of concerns
- ✅ Testable with Vitest (23 test files, 220+ tests)
- ✅ URL-based navigation with React Router
- ✅ State management with React Context
- ✅ API service layer with AI-powered impact assessment
- ✅ Hot module replacement
- ✅ Error boundaries for graceful error handling
- ✅ Lazy loading with code splitting (30% faster initial load)
- ✅ Production-ready with optimized builds
- ✅ Code quality enforced with ESLint 9 (flat config) and Prettier
- ✅ Modern tooling with React 19, Vite 6, Tailwind 4
- ✅ Extended AI capabilities with MCP servers (browser automation, persistent memory, database)
- ✅ Performance optimized: 16% faster builds, 74% faster dev server
- ✅ Data-driven prioritization with AI impact scoring (Phase 1 complete)

## License

MIT

## Contributing

This project follows a modular architecture pattern. When contributing:
1. Keep components small and focused
2. Use TypeScript for all new code
3. Write tests for new features
4. Follow the existing file organization
5. Update documentation as needed
