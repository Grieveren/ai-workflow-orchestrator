# State Management

## Overview

The application uses React Context with composable custom hooks for state management - no external state management libraries (Redux, Zustand, etc.).

## Architecture

```
┌────────────────────────────────────────────────┐
│          AppContext (Provider)                  │
│                                                 │
│  Composes three independent hooks:              │
│  ┌──────────────┐  ┌──────────────┐  ┌────────┐│
│  │   useChat    │  │ useRequests  │  │useDocs ││
│  │              │  │              │  │        ││
│  │ - messages   │  │ - requests   │  │- docs  ││
│  │ - input      │  │ - selected   │  │- mode  ││
│  │ - processing │  │ - requestData│  │- chat  ││
│  └──────────────┘  └──────────────┘  └────────┘│
└────────────────────────────────────────────────┘
                       │
                       │ useAppContext()
                       ▼
          ┌────────────────────────┐
          │      Components        │
          │                        │
          │  - Pages               │
          │  - Feature Components  │
          └────────────────────────┘
```

## Core Pattern

### AppContext (Composition Layer)

**File**: `src/contexts/AppContext.tsx`

```typescript
export function AppProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<ViewType>('requester');
  const [activeTab, setActiveTab] = useState<TabType>('submit');

  // Compose three independent hooks
  const chat = useChat();
  const requests = useRequests();
  const documents = useDocuments();

  const value: AppContextType = {
    view,
    setView,
    activeTab,
    setActiveTab,
    chat,        // All chat state & methods
    requests,    // All request state & methods
    documents    // All document state & methods
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Single hook to access all context
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
```

**Key principles**:
- Context **composes** hooks, doesn't implement business logic
- Each hook is **independent** and testable in isolation
- Hooks don't depend on each other
- Single provider at app root

## Custom Hooks

### 1. useChat Hook

**File**: `src/hooks/useChat.ts`

**Manages**: Conversational chatbot state

**State**:
```typescript
const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
const [userInput, setUserInput] = useState('');
const [isProcessing, setIsProcessing] = useState(false);
const [currentOptions, setCurrentOptions] = useState<string[]>([]);
```

**Methods**:
- `startConversation(message)` - Begin new request intake
- `continueConversation(message)` - Handle user response
- `selectOption(option)` - Select from AI-provided options
- `resetChat()` - Clear conversation for new request

**Usage example**:
```typescript
const { chat } = useAppContext();
const { chatMessages, userInput, setUserInput, startConversation } = chat;

// Start conversation
await startConversation("I need help with exports");

// Continue conversation
await continueConversation(userInput);
```

### 2. useRequests Hook

**File**: `src/hooks/useRequests.ts`

**Manages**: Request CRUD operations and tracking

**State**:
```typescript
const [requests, setRequests] = useState<Request[]>(MOCK_REQUESTS);
const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
const [requestData, setRequestData] = useState<RequestData | null>(null);
```

**Methods**:
- `submitRequest(data)` - Create new request from chat
- `updateRequestStage(id, stage, note)` - Move through workflow
- `viewRequestDetail(request)` - Open detail view
- `closeRequestDetail()` - Close detail view
- `updateRequest(id, updates)` - Update request fields

**Usage example**:
```typescript
const { requests } = useAppContext();
const { requests: requestList, updateRequestStage } = requests;

// Update stage
updateRequestStage('REQ-001', 'In Progress', 'Started development');

// Filter requests
const inProgress = requestList.filter(r => r.stage === 'In Progress');
```

### 3. useDocuments Hook

**File**: `src/hooks/useDocuments.ts`

**Manages**: Document generation and refinement

**State**:
```typescript
const [generatedDocs, setGeneratedDocs] = useState<GeneratedDocs | null>(null);
const [userMode, setUserMode] = useState<UserMode | null>(null);
const [isGenerating, setIsGenerating] = useState(false);
const [activeDocTab, setActiveDocTab] = useState<DocType>('brd');
const [docChatMessages, setDocChatMessages] = useState<ChatMessage[]>([]);
const [isProcessing, setIsProcessing] = useState(false);
```

**Methods**:
- `generateDocuments(data, mode)` - Create BRD/FSD/Tech Spec
- `refineDocument(feedback, docType)` - Update based on user input
- `updateDocumentContent(docType, content)` - Direct edit
- `resetDocuments()` - Clear for new request

**Usage example**:
```typescript
const { documents } = useAppContext();
const { generatedDocs, userMode, setUserMode, generateDocuments } = documents;

// Set mode (Guided/Collaborative/Expert)
setUserMode('collaborative');

// Generate all three documents
await generateDocuments(requestData, 'collaborative');
```

## Hook Independence

Each hook is **fully independent**:

```typescript
// ✅ CORRECT - Hooks are isolated
export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  async function startConversation(message: string) {
    // Uses only local state
    setIsProcessing(true);
    const response = await api.startIntakeConversation(message);
    setMessages([...messages, { role: 'assistant', content: response.message }]);
    setIsProcessing(false);
  }

  return { messages, startConversation /* ... */ };
}

// ❌ WRONG - Don't do this
export function useChat() {
  const { requests } = useRequests();  // Hook dependency!
  // ...
}
```

**Why independence matters**:
- Each hook can be tested in isolation
- No cascading re-renders
- Clear boundaries of responsibility
- Easy to understand data flow

## Data Flow

### Example: Submitting a New Request

```
1. User types in chat (SubmitPage)
   └─> Uses chat.userInput state

2. User clicks Send
   └─> Calls chat.continueConversation()
       └─> Updates chat.chatMessages
       └─> Updates chat.currentOptions

3. Conversation completes
   └─> Calls requests.submitRequest()
       └─> Extracts data from chat
       └─> Creates new Request object
       └─> Adds to requests.requests array

4. Navigate to request detail
   └─> Calls requests.viewRequestDetail()
       └─> Sets requests.selectedRequest

5. Generate documents
   └─> Uses documents.setUserMode()
   └─> Calls documents.generateDocuments()
       └─> Sets documents.generatedDocs
```

**Note**: Chat → Requests flow, but **hooks don't directly reference each other**. The component orchestrates the handoff.

## Client-Side Only

**Important**: There is **no database** or persistence layer.

```typescript
// All state is in-memory
const [requests, setRequests] = useState<Request[]>([
  // Mock data on initial load
  {
    id: 'REQ-001',
    title: 'Fix data export error',
    // ...
  }
]);
```

**Implications**:
- Refresh = lose all data (reverts to mock data)
- No multi-user support (each browser has own state)
- Fast and simple for demo/prototype
- Would need backend API + database for production

## Component Usage

### Pages (Full Context Access)

```typescript
// src/pages/SubmitPage.tsx
export function SubmitPage() {
  const { chat, requests } = useAppContext();

  const {
    chatMessages,
    userInput,
    setUserInput,
    startConversation,
    continueConversation,
    isProcessing
  } = chat;

  const { submitRequest } = requests;

  // Use multiple hooks' state/methods
  const handleSubmit = async () => {
    await continueConversation(userInput);
    // After conversation completes...
    await submitRequest(extractedData);
  };

  return (/* JSX */);
}
```

### Feature Components (Selective Access)

```typescript
// src/features/dashboard/components/StatsBar.tsx
export function StatsBar() {
  const { requests } = useAppContext();
  const { requests: requestList } = requests;

  // Only uses requests, not chat or documents
  const stats = calculateStats(requestList);

  return (/* JSX */);
}
```

### UI Components (No Context)

```typescript
// src/components/ui/Button.tsx
export function Button({ children, onClick, variant }: ButtonProps) {
  // Pure UI component, no context access
  return (
    <button onClick={onClick} className={getVariantClasses(variant)}>
      {children}
    </button>
  );
}
```

## Testing Hooks

### Testing in Isolation

```typescript
// useChat.test.ts
import { renderHook, act } from '@testing-library/react';
import { useChat } from './useChat';

describe('useChat', () => {
  it('starts conversation', async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.startConversation('Help with exports');
    });

    expect(result.current.chatMessages).toHaveLength(2); // User + AI
    expect(result.current.isProcessing).toBe(false);
  });
});
```

### Testing with Context

```typescript
// SubmitPage.test.tsx
import { render } from '@testing-library/react';
import { AppProvider } from '../contexts/AppContext';
import { SubmitPage } from './SubmitPage';

function renderWithContext(component: React.ReactElement) {
  return render(
    <AppProvider>
      {component}
    </AppProvider>
  );
}

describe('SubmitPage', () => {
  it('renders chat interface', () => {
    const { getByText } = renderWithContext(<SubmitPage />);
    expect(getByText('Submit New Request')).toBeInTheDocument();
  });
});
```

## Performance Considerations

### Preventing Unnecessary Re-renders

The current architecture triggers re-renders when:
- Any state in a hook changes
- All components using that hook re-render

**Current approach**: Acceptable because:
- Small component tree
- Infrequent state updates
- No performance bottlenecks measured

**Future optimizations** (if needed):
- Split context into smaller providers
- Use `useMemo` for expensive computations
- Use `React.memo` for expensive components
- Consider state management library for complex apps

### Why No Redux/Zustand?

**Decision rationale**:
- App complexity doesn't justify external library
- Three hooks are sufficient
- Hooks + Context is React-native pattern
- Smaller bundle size
- Easier onboarding (no new concepts)

**When to reconsider**:
- Adding real-time features (WebSocket)
- Complex async state coordination
- Performance issues from prop drilling
- Team familiarity with Redux

## State Persistence (Future)

To add persistence:

### Option 1: localStorage
```typescript
// In hook
useEffect(() => {
  localStorage.setItem('requests', JSON.stringify(requests));
}, [requests]);

// On mount
const [requests, setRequests] = useState<Request[]>(() => {
  const saved = localStorage.getItem('requests');
  return saved ? JSON.parse(saved) : MOCK_REQUESTS;
});
```

### Option 2: Backend API
```typescript
// In hook
async function fetchRequests() {
  const response = await fetch('/api/requests');
  const data = await response.json();
  setRequests(data);
}

async function createRequest(request: Request) {
  await fetch('/api/requests', {
    method: 'POST',
    body: JSON.stringify(request)
  });
  // Update local state
  setRequests([...requests, request]);
}
```

### Option 3: Database + Sync
- Backend: PostgreSQL / Supabase
- Real-time: WebSocket / Server-Sent Events
- Optimistic updates on frontend
- Conflict resolution strategy

## Summary

The state management architecture provides:

✅ **Simplicity** - No external libraries, pure React
✅ **Modularity** - Three independent, testable hooks
✅ **Type Safety** - Full TypeScript coverage
✅ **Composition** - AppContext composes hooks cleanly
✅ **Testability** - Hooks can be tested in isolation
✅ **Performance** - Sufficient for current app complexity

**Key takeaway**: State is organized by domain (chat, requests, documents) into independent hooks composed by a single context provider.
