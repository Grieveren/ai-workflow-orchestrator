# Component Location Strategy

## Overview

The application follows a strict component organization strategy with clear rules for where components belong based on their purpose and coupling.

## Directory Structure

```
src/
├── components/
│   ├── ui/                 # Generic, reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   ├── Skeleton.tsx
│   │   └── index.ts       # Barrel export
│   └── layout/            # App-wide layout components
│       ├── Header.tsx
│       ├── TabNavigation.tsx
│       └── index.ts       # Barrel export
├── features/              # Feature-specific components
│   ├── chat/
│   │   └── components/
│   │       ├── ChatMessage.tsx
│   │       ├── OptionSelector.tsx
│   │       ├── LoadingIndicator.tsx
│   │       └── InputArea.tsx
│   ├── dashboard/
│   │   └── components/
│   │       ├── StatsBar.tsx
│   │       ├── RequestTable.tsx
│   │       └── KanbanBoard.tsx
│   └── documents/
│       └── components/
│           ├── ModeSelector.tsx
│           ├── DocumentViewer.tsx
│           └── DocumentChat.tsx
└── pages/                 # Route-level page components
    ├── SubmitPage.tsx
    ├── DashboardPage.tsx
    ├── KanbanPage.tsx
    ├── RequestDetailPage.tsx
    ├── NotFoundPage.tsx
    └── index.ts           # Barrel export
```

## Decision Tree

When creating a new component, follow this decision tree:

```
Is this a route-level component that composes features?
│
├─ YES → pages/
│
└─ NO → Does it contain business logic or use AppContext?
         │
         ├─ YES → Which feature domain?
         │        │
         │        ├─ Chat/Conversation → features/chat/components/
         │        ├─ Dashboard/Requests → features/dashboard/components/
         │        └─ Documents/Generation → features/documents/components/
         │
         └─ NO → Is it used app-wide (header, nav, footer)?
                  │
                  ├─ YES → components/layout/
                  │
                  └─ NO → components/ui/
```

## Component Categories

### 1. UI Components (`src/components/ui/`)

**Definition**: Generic, reusable components with NO business logic

**Characteristics**:
- ✅ Accept props for all data and behavior
- ✅ Purely presentational
- ✅ No `useAppContext()` usage
- ✅ Can be used anywhere in the app
- ✅ Could be extracted to a component library

**Examples**:
```typescript
// ✅ CORRECT - Generic UI component
export function Button({ variant, size, children, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`btn btn-${variant} btn-${size}`}
    >
      {children}
    </button>
  );
}

// ✅ CORRECT - Generic Card component
export function Card({ title, children, footer }: CardProps) {
  return (
    <div className="card">
      {title && <h3>{title}</h3>}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}

// ❌ WRONG - Has business logic, belongs in features/
export function RequestCard() {
  const { requests } = useAppContext();  // Context usage!
  return <Card>{/* request-specific logic */}</Card>;
}
```

**Current UI components**:
- `Button` - Buttons with variants (primary, secondary, danger)
- `Card` - Content container
- `Badge` - Status/priority indicators
- `Input` - Form inputs
- `Skeleton` - Loading placeholders

### 2. Layout Components (`src/components/layout/`)

**Definition**: App-wide structural components

**Characteristics**:
- ✅ Define app structure (header, navigation, footer)
- ✅ Used across multiple pages
- ✅ May use AppContext for view/tab state
- ✅ Handle routing/navigation

**Examples**:
```typescript
// ✅ CORRECT - App-wide header
export function Header() {
  const { view, setView } = useAppContext();

  return (
    <header>
      <h1>AI Workflow Orchestrator</h1>
      <ViewToggle view={view} setView={setView} />
    </header>
  );
}

// ✅ CORRECT - App-wide navigation
export function TabNavigation() {
  const { activeTab, setActiveTab, view } = useAppContext();

  return (
    <nav>
      <Link to="/">Submit</Link>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/kanban">Kanban</Link>
    </nav>
  );
}
```

**Current layout components**:
- `Header` - App header with title and view toggle
- `TabNavigation` - Main navigation tabs

### 3. Feature Components (`src/features/[feature]/components/`)

**Definition**: Components tightly coupled to specific features

**Characteristics**:
- ✅ Contain business logic
- ✅ May use AppContext (specific hooks)
- ✅ Domain-specific (chat, dashboard, documents)
- ✅ Not easily reusable outside their feature
- ✅ Compose UI components

**Examples by feature**:

#### Chat Feature (`features/chat/components/`)
```typescript
// ✅ CORRECT - Chat-specific component
export function ChatMessage({ message }: { message: ChatMessage }) {
  return (
    <Card>
      <div className={`message-${message.role}`}>
        {message.role === 'user' ? <User /> : <Bot />}
        <p>{message.content}</p>
      </div>
    </Card>
  );
}

// ✅ CORRECT - Uses chat context
export function OptionSelector() {
  const { chat } = useAppContext();
  const { currentOptions, selectOption } = chat;

  return (
    <div>
      {currentOptions.map(option => (
        <Button key={option} onClick={() => selectOption(option)}>
          {option}
        </Button>
      ))}
    </div>
  );
}
```

#### Dashboard Feature (`features/dashboard/components/`)
```typescript
// ✅ CORRECT - Dashboard-specific stats
export function StatsBar() {
  const { requests } = useAppContext();
  const { requests: requestList } = requests;

  const stats = {
    total: requestList.length,
    inProgress: requestList.filter(r => r.stage === 'In Progress').length,
    // ...
  };

  return (
    <div className="stats">
      <Card><strong>{stats.total}</strong> Total</Card>
      <Card><strong>{stats.inProgress}</strong> In Progress</Card>
    </div>
  );
}

// ✅ CORRECT - Request table with business logic
export function RequestTable() {
  const { requests } = useAppContext();
  const { requests: requestList, viewRequestDetail } = requests;

  return (
    <table>
      {requestList.map(request => (
        <tr key={request.id} onClick={() => viewRequestDetail(request)}>
          <td>{request.title}</td>
          <td><Badge variant={request.priority}>{request.priority}</Badge></td>
        </tr>
      ))}
    </table>
  );
}
```

#### Documents Feature (`features/documents/components/`)
```typescript
// ✅ CORRECT - Document generation mode selector
export function ModeSelector() {
  const { documents } = useAppContext();
  const { userMode, setUserMode } = documents;

  return (
    <div>
      <Button
        variant={userMode === 'guided' ? 'primary' : 'secondary'}
        onClick={() => setUserMode('guided')}
      >
        Guided
      </Button>
      {/* Other modes... */}
    </div>
  );
}
```

### 4. Pages (`src/pages/`)

**Definition**: Route-level components that compose features

**Characteristics**:
- ✅ Map to URL routes (/, /dashboard, /kanban, etc.)
- ✅ Compose multiple features and components
- ✅ Use React Router hooks (useNavigate, useParams)
- ✅ May use AppContext
- ✅ Handle page-level logic and layout

**Examples**:
```typescript
// ✅ CORRECT - Page composes features
export function SubmitPage() {
  const navigate = useNavigate();
  const { chat, requests } = useAppContext();

  return (
    <div className="submit-page">
      <h1>Submit New Request</h1>

      {/* Feature: Chat */}
      <ChatMessage messages={chat.chatMessages} />
      <OptionSelector />
      <InputArea />

      {/* Feature: Request submission */}
      <Button onClick={submitRequest}>Submit</Button>
    </div>
  );
}

// ✅ CORRECT - Page with route params
export function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { requests, documents } = useAppContext();

  useEffect(() => {
    const request = requests.requests.find(r => r.id === id);
    if (!request) {
      navigate('/404');
    } else {
      requests.viewRequestDetail(request);
    }
  }, [id]);

  return (
    <div className="request-detail">
      {/* Composes dashboard + documents features */}
      <RequestHeader request={selectedRequest} />
      <ModeSelector />
      <DocumentViewer docs={documents.generatedDocs} />
    </div>
  );
}
```

**Current pages**:
- `SubmitPage` - New request submission with chat
- `DashboardPage` - Request list with stats
- `KanbanPage` - Kanban board view
- `RequestDetailPage` - Individual request detail
- `NotFoundPage` - 404 error page

## Component Patterns

### Barrel Exports

Each component directory has an `index.ts` that exports all components:

```typescript
// src/components/ui/index.ts
export { Button } from './Button';
export { Card } from './Card';
export { Badge } from './Badge';
export { Input } from './Input';
export { Skeleton } from './Skeleton';

// Usage
import { Button, Card, Badge } from '@/components/ui';
```

**Benefits**:
- Clean imports
- Easy to see what's exported
- Refactoring-friendly (internal moves don't break imports)

### Co-located Tests

Tests live next to components:

```
Button.tsx
Button.test.tsx  ← Co-located test
```

**Benefits**:
- Easy to find tests
- Clear what's tested
- Encourages writing tests (visible)

### Lazy Loading (Pages)

Pages are lazy-loaded for performance:

```typescript
// src/App.tsx
const SubmitPage = lazy(() => import('./pages/SubmitPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

function App() {
  return (
    <Suspense fallback={<Skeleton />}>
      <Routes>
        <Route path="/" element={<SubmitPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Suspense>
  );
}
```

**Result**: Smaller initial bundle, faster first load

## Common Mistakes

### ❌ Mistake 1: Business Logic in UI Components

```typescript
// ❌ WRONG - UI component accessing context
// src/components/ui/RequestCard.tsx
export function RequestCard() {
  const { requests } = useAppContext();  // Don't do this!
  return <Card>{/* ... */}</Card>;
}

// ✅ CORRECT - Feature component
// src/features/dashboard/components/RequestCard.tsx
export function RequestCard() {
  const { requests } = useAppContext();  // OK here
  return <Card>{/* ... */}</Card>;
}
```

### ❌ Mistake 2: Feature-Specific Code in UI

```typescript
// ❌ WRONG - Request-specific in UI
// src/components/ui/Badge.tsx
export function Badge({ request }: { request: Request }) {
  const color = request.priority === 'High' ? 'red' : 'green';
  return <span className={color}>{request.priority}</span>;
}

// ✅ CORRECT - Generic Badge
// src/components/ui/Badge.tsx
export function Badge({ variant, children }: BadgeProps) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}

// Usage in feature component
<Badge variant={request.priority.toLowerCase()}>
  {request.priority}
</Badge>
```

### ❌ Mistake 3: Pages with Too Much Logic

```typescript
// ❌ WRONG - Page doing too much
export function DashboardPage() {
  // Lots of state and logic here...
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [sortBy, setSortBy] = useState('date');
  // 200 lines of code...

  return (/* complex JSX */);
}

// ✅ CORRECT - Extract to feature component
// features/dashboard/components/RequestList.tsx
export function RequestList() {
  // Logic here
}

// pages/DashboardPage.tsx
export function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <RequestList />  {/* Feature handles complexity */}
    </div>
  );
}
```

## Refactoring Guide

### When to Extract a Component

Extract when:
- ✅ Component file exceeds ~200 lines
- ✅ Logic repeated in multiple places
- ✅ Component has distinct responsibility
- ✅ Testing would be easier in isolation

### How to Extract

1. **Identify the boundary**: What props does it need?
2. **Determine location**: UI, Layout, Feature, or Page?
3. **Create file**: Follow naming conventions
4. **Move code**: Copy JSX and necessary state
5. **Define props interface**: TypeScript types
6. **Update imports**: Export from index.ts
7. **Write test**: Co-locate test file
8. **Refactor original**: Use new component

## File Naming Conventions

```
✅ CORRECT
- PascalCase for components: Button.tsx, RequestCard.tsx
- Co-located tests: Button.test.tsx
- Barrel exports: index.ts
- Hooks: useChat.ts (camelCase with 'use' prefix)

❌ WRONG
- button.tsx (should be PascalCase)
- Button.component.tsx (unnecessary suffix)
- ButtonTest.tsx (should be Button.test.tsx)
```

## Summary

The component strategy provides:

✅ **Clear boundaries** - Know exactly where components belong
✅ **Predictability** - Consistent structure across codebase
✅ **Reusability** - UI components highly reusable
✅ **Maintainability** - Easy to find and update components
✅ **Testability** - Components with clear responsibilities
✅ **Scalability** - Structure supports growth

**Key takeaway**: Component location is determined by coupling (generic vs feature-specific) and scope (app-wide vs feature vs route).
