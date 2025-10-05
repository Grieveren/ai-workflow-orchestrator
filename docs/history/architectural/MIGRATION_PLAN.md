# Architecture Migration Plan

## Current State Analysis

**Problems:**
- Single 1,544-line component with all logic, state, and UI
- No separation of concerns
- No type safety (using plain objects)
- No state persistence (client-side only)
- No custom hooks
- No component composition
- Testing is nearly impossible
- Hard to maintain and scale

## Target Architecture

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Generic components (Button, Card, Badge, etc.)
│   └── layout/          # Layout components (Header, Sidebar, etc.)
├── features/            # Feature-based modules
│   ├── chat/           # Chat/intake feature
│   │   ├── components/
│   │   ├── hooks/
│   │   └── types.ts
│   ├── dashboard/      # Request dashboard
│   │   ├── components/
│   │   ├── hooks/
│   │   └── types.ts
│   └── documents/      # Document generation
│       ├── components/
│       ├── hooks/
│       └── types.ts
├── services/           # API layer
│   └── api.ts         # All fetch calls
├── types/             # Shared TypeScript types
│   └── index.ts
├── hooks/             # Shared custom hooks
│   └── useRequests.ts
├── contexts/          # React Context providers
│   └── RequestContext.tsx
├── utils/             # Helper functions
│   └── constants.ts
└── App.tsx           # Main app with routing
```

---

## Phase 1: Foundation (No Breaking Changes)

### Step 1.1: Create TypeScript Type Definitions
**Estimated time:** 30 minutes
**Risk:** Low

Create `src/types/index.ts` with all data structures:

```typescript
export type RequestStage = 'Intake' | 'Scoping' | 'Ready for Dev' | 'In Progress' | 'Review' | 'Completed';
export type Priority = 'High' | 'Medium' | 'Low';
export type UserMode = 'guided' | 'collaborative' | 'expert';
export type DocType = 'brd' | 'fsd' | 'techSpec';

export interface ActivityItem {
  timestamp: string;
  action: string;
  user: string;
}

export interface Request {
  id: string;
  title: string;
  status: string;
  owner: string;
  priority: Priority;
  clarityScore: number;
  daysOpen: number;
  stage: RequestStage;
  lastUpdate: string;
  activity?: ActivityItem[];
  aiAlert?: string | null;
  timeline?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface RequestData {
  title?: string;
  problem?: string;
  success?: string;
  systems?: string[];
  urgency?: string;
  stakeholders?: string[];
}

export interface GeneratedDocs {
  brd: string;
  fsd: string;
  techSpec: string;
}
```

**Testing:** Compile TypeScript, verify no errors.

---

### Step 1.2: Extract API Service Layer
**Estimated time:** 45 minutes
**Risk:** Low

Create `src/services/api.ts`:

```typescript
const API_URL = 'http://localhost:3001/api/chat';
const MODEL = 'claude-sonnet-4-5-20250929';

interface ApiRequest {
  messages: { role: string; content: string }[];
  max_tokens?: number;
}

async function callClaude(request: ApiRequest): Promise<string> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: request.max_tokens || 2000,
      messages: request.messages
    })
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

export const api = {
  startIntakeConversation: async (initialMessage: string) => {
    // Move prompt and logic from startConversation() here
    const text = await callClaude({
      messages: [{ role: 'user', content: `...prompt...` }],
      max_tokens: 2000
    });
    return text;
  },

  continueConversation: async (conversationHistory: ChatMessage[]) => {
    // Move logic from continueConversation() here
  },

  generateDocuments: async (request: Request, mode: UserMode) => {
    // Move logic from generateRequirements() here
  },

  refineDocument: async (currentDoc: string, docType: DocType, feedback: string) => {
    // Move logic from refineDocument() here
  },

  routeRequest: async (requestData: RequestData) => {
    // Move logic from submitRequest() here
  }
};
```

**Testing:** Replace fetch calls in main component with `api.*` calls. Verify app still works.

---

## Phase 2: State Management (Moderate Risk)

### Step 2.1: Create Custom Hooks
**Estimated time:** 1 hour
**Risk:** Medium

Create `src/hooks/useChat.ts`:

```typescript
export function useChat() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [requestData, setRequestData] = useState<RequestData>({});

  const startConversation = async (initialMessage: string) => {
    // Move logic here, use api.startIntakeConversation()
  };

  const continueConversation = async (message: string) => {
    // Move logic here
  };

  const resetChat = () => {
    setChatMessages([]);
    setRequestData({});
    setUserInput('');
    setCurrentOptions([]);
  };

  return {
    chatMessages,
    userInput,
    setUserInput,
    isProcessing,
    currentOptions,
    requestData,
    startConversation,
    continueConversation,
    resetChat
  };
}
```

Create `src/hooks/useRequests.ts`:

```typescript
export function useRequests() {
  const [requests, setRequests] = useState<Request[]>([/* mock data */]);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  const addRequest = (request: Request) => {
    setRequests([request, ...requests]);
  };

  const updateRequestStage = (requestId: string, newStage: RequestStage, note: string) => {
    // Move logic here
  };

  const viewRequestDetail = (request: Request) => {
    setSelectedRequest(request);
  };

  return {
    requests,
    selectedRequest,
    addRequest,
    updateRequestStage,
    viewRequestDetail,
    setSelectedRequest
  };
}
```

Create `src/hooks/useDocuments.ts`:

```typescript
export function useDocuments() {
  const [userMode, setUserMode] = useState<UserMode | null>(null);
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDocs | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeDocTab, setActiveDocTab] = useState<DocType>('brd');
  const [docChatMessages, setDocChatMessages] = useState<ChatMessage[]>([]);

  const generateDocuments = async (request: Request, mode: UserMode) => {
    // Move logic here
  };

  const refineDocument = async (feedback: string) => {
    // Move logic here
  };

  const resetDocuments = () => {
    setUserMode(null);
    setGeneratedDocs(null);
    setIsGenerating(false);
    setActiveDocTab('brd');
    setDocChatMessages([]);
  };

  return {
    userMode,
    setUserMode,
    generatedDocs,
    isGenerating,
    activeDocTab,
    setActiveDocTab,
    docChatMessages,
    generateDocuments,
    refineDocument,
    resetDocuments
  };
}
```

**Testing:** Refactor main component to use hooks. Verify all functionality works.

---

### Step 2.2: Create React Context for Global State
**Estimated time:** 45 minutes
**Risk:** Medium

Create `src/contexts/AppContext.tsx`:

```typescript
interface AppContextType {
  view: 'requester' | 'dev';
  setView: (view: 'requester' | 'dev') => void;
  requests: Request[];
  selectedRequest: Request | null;
  updateRequestStage: (id: string, stage: RequestStage, note: string) => void;
  // ... other shared state
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const requestsHook = useRequests();
  const [view, setView] = useState<'requester' | 'dev'>('requester');

  const value = {
    view,
    setView,
    ...requestsHook
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}
```

**Testing:** Wrap app in `<AppProvider>`. Verify state is accessible across components.

---

## Phase 3: Component Breakdown (High Risk)

### Step 3.1: Extract Reusable UI Components
**Estimated time:** 1.5 hours
**Risk:** Low

Create generic components in `src/components/ui/`:

**Button.tsx:**
```typescript
interface ButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', ...props }: ButtonProps) {
  const styles = {
    primary: 'bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
    // ... other variants
  };
  return (
    <button className={`px-6 py-3 rounded-xl font-medium transition ${styles[variant]}`} {...props} />
  );
}
```

**Badge.tsx, Card.tsx, Input.tsx** - Similar pattern

**Testing:** Replace inline elements with components. Visual regression test.

---

### Step 3.2: Break Down into Feature Modules
**Estimated time:** 3 hours
**Risk:** High

#### Create `src/features/chat/`

**ChatInterface.tsx:**
```typescript
export function ChatInterface() {
  const { chatMessages, userInput, setUserInput, isProcessing, startConversation } = useChat();

  return (
    <Card>
      <ChatHeader />
      <MessageList messages={chatMessages} isProcessing={isProcessing} />
      <ChatInput
        value={userInput}
        onChange={setUserInput}
        onSubmit={startConversation}
        disabled={isProcessing}
      />
    </Card>
  );
}
```

**ChatHeader.tsx, MessageList.tsx, ChatInput.tsx, OptionSelector.tsx** - Extracted subcomponents

#### Create `src/features/dashboard/`

**RequestDashboard.tsx:**
```typescript
export function RequestDashboard() {
  const { requests } = useAppContext();

  return (
    <>
      <StatsBar requests={requests} />
      <RequestTable requests={requests} />
    </>
  );
}
```

**StatsBar.tsx, RequestTable.tsx, RequestRow.tsx** - Extracted subcomponents

#### Create `src/features/documents/`

**DocumentGenerator.tsx:**
```typescript
export function DocumentGenerator({ request }: { request: Request }) {
  const { userMode, generatedDocs, isGenerating, generateDocuments } = useDocuments();

  if (isGenerating) return <GeneratingState />;
  if (generatedDocs) return <DocumentViewer docs={generatedDocs} />;
  return <ModeSelector onGenerate={generateDocuments} />;
}
```

**ModeSelector.tsx, DocumentViewer.tsx, DocumentEditor.tsx, DocumentChat.tsx** - Extracted subcomponents

**Testing:** Replace sections of main component with feature components. Test each feature independently.

---

### Step 3.3: Create Request Detail Page
**Estimated time:** 1 hour
**Risk:** Medium

Create `src/features/request-detail/RequestDetail.tsx`:

```typescript
export function RequestDetail() {
  const { selectedRequest } = useAppContext();
  const { view } = useAppContext();

  if (!selectedRequest) return null;

  return (
    <>
      <RequestHeader request={selectedRequest} />
      <RequestActions request={selectedRequest} view={view} />
      <ActivityTimeline activity={selectedRequest.activity} />
      {selectedRequest.stage === 'Scoping' && <DocumentGenerator request={selectedRequest} />}
    </>
  );
}
```

**Testing:** Verify detail view works with all request stages.

---

## Phase 4: Routing & Polish (Low Risk)

### Step 4.1: Add React Router
**Estimated time:** 1 hour
**Risk:** Medium

Install: `npm install react-router-dom`

Update `src/App.tsx`:

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/submit" />} />
            <Route path="/submit" element={<ChatInterface />} />
            <Route path="/dashboard" element={<RequestDashboard />} />
            <Route path="/kanban" element={<KanbanBoard />} />
            <Route path="/request/:id" element={<RequestDetail />} />
          </Routes>
        </Layout>
      </AppProvider>
    </BrowserRouter>
  );
}
```

**Testing:** Navigate between routes. Verify URLs update and state persists.

---

### Step 4.2: Final Refactoring
**Estimated time:** 1 hour
**Risk:** Low

- Remove old `AIWorkflowOrchestrator.tsx`
- Clean up unused code
- Add prop validation
- Improve error handling
- Add loading states
- Update CLAUDE.md with new architecture

**Testing:** Full regression test of all features.

---

## Phase 5: Testing & Documentation (Optional)

### Step 5.1: Add Unit Tests
**Estimated time:** 2 hours
**Risk:** Low

Install: `npm install -D vitest @testing-library/react @testing-library/jest-dom`

Add tests for:
- Custom hooks (`useChat.test.ts`, `useRequests.test.ts`)
- API service (`api.test.ts`)
- UI components (`Button.test.tsx`, `Badge.test.tsx`)

### Step 5.2: Update Documentation
**Estimated time:** 30 minutes
**Risk:** None

- Update README.md with new architecture
- Update CLAUDE.md with new file structure
- Add JSDoc comments to complex functions

---

## Migration Timeline

| Phase | Time Estimate | Risk | Can Deploy? |
|-------|---------------|------|-------------|
| 1.1 - Type definitions | 30 min | Low | ✅ Yes |
| 1.2 - API service | 45 min | Low | ✅ Yes |
| 2.1 - Custom hooks | 1 hour | Medium | ✅ Yes |
| 2.2 - Context providers | 45 min | Medium | ✅ Yes |
| 3.1 - UI components | 1.5 hours | Low | ✅ Yes |
| 3.2 - Feature modules | 3 hours | High | ⚠️ Test thoroughly |
| 3.3 - Request detail | 1 hour | Medium | ✅ Yes |
| 4.1 - React Router | 1 hour | Medium | ✅ Yes |
| 4.2 - Final cleanup | 1 hour | Low | ✅ Yes |
| 5.1 - Testing | 2 hours | Low | ✅ Yes |
| 5.2 - Documentation | 30 min | None | ✅ Yes |

**Total: ~13 hours of work**

---

## Risk Mitigation

1. **Incremental approach:** Each phase can be deployed independently
2. **Git branches:** Create feature branch for each phase
3. **Testing:** Test after each step before moving forward
4. **Rollback plan:** Keep old component until fully migrated
5. **Parallel development:** Don't add new features during migration

---

## Success Metrics

### Before:
- 1 file, 1,544 lines
- No tests
- No type safety
- Hard to maintain

### After:
- ~25-30 focused files
- Proper TypeScript types
- Testable architecture
- Reusable components
- Proper routing
- Clear separation of concerns
- Easy to add features

---

## Next Steps

1. **Review this plan** and adjust priorities
2. **Create git branch:** `git checkout -b refactor/architecture-migration`
3. **Start with Phase 1:** Types and API service (low risk, immediate value)
4. **Test after each step**
5. **Deploy to staging** after each phase
6. **Complete migration** incrementally over 1-2 weeks

**Questions to answer before starting:**
- Do we need state persistence (localStorage/database)?
- Should we add error boundaries?
- Do we want to support multiple themes?
- Should we add user authentication?
- Do we need offline support?
