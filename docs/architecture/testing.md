# Testing Philosophy

## Overview

The application uses Vitest with React Testing Library for a fast, maintainable testing approach focused on user behavior rather than implementation details.

## Testing Stack

```
┌─────────────────────────────────────────┐
│         Test Framework                   │
│                                          │
│  Vitest (fast, Vite-native)             │
│  - Test runner                           │
│  - Assertions (expect)                   │
│  - Mocking (vi.fn, vi.mock)             │
└─────────────────────────────────────────┘
              ▲
              │
┌─────────────────────────────────────────┐
│    React Testing Library                │
│                                          │
│  - render() components                   │
│  - screen queries (getByRole, etc.)     │
│  - userEvent interactions                │
│  - Accessibility-focused                 │
└─────────────────────────────────────────┘
              ▲
              │
┌─────────────────────────────────────────┐
│      Test Setup                          │
│                                          │
│  src/test/setup.ts                       │
│  - jsdom (browser environment)           │
│  - @testing-library/jest-dom matchers   │
└─────────────────────────────────────────┘
```

## Test Setup

**File**: `src/test/setup.ts`

```typescript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});
```

**Configuration**: `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

## Testing Principles

### 1. Test Behavior, Not Implementation

```typescript
// ❌ WRONG - Testing implementation details
it('sets isLoading state to true', () => {
  const { result } = renderHook(() => useChat());
  expect(result.current.isLoading).toBe(true);  // Internal state
});

// ✅ CORRECT - Testing user-visible behavior
it('shows loading spinner while processing', () => {
  render(<ChatInterface />);
  expect(screen.getByRole('status')).toHaveTextContent('Loading');
});
```

**Why**: Implementation can change without changing user experience. Tests should verify user experience.

### 2. Use Accessible Queries

**Query Priority** (from React Testing Library):

1. **getByRole** (best) - Queries by ARIA role
2. **getByLabelText** - Form inputs
3. **getByPlaceholderText** - Form inputs without labels
4. **getByText** - Non-interactive text
5. **getByTestId** (last resort) - When no other query works

```typescript
// ✅ CORRECT - Accessible queries
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText(/email address/i);
screen.getByText(/welcome/i);

// ❌ WRONG - Fragile queries
screen.getByClassName('submit-btn');
container.querySelector('.email-input');
```

### 3. Co-locate Tests

```
src/
├── components/
│   └── ui/
│       ├── Button.tsx
│       └── Button.test.tsx  ← Next to component
```

**Benefits**:
- Easy to find tests
- Clear what's tested
- Encourages writing tests

### 4. Test User Interactions

Use `userEvent` for realistic user interactions:

```typescript
import userEvent from '@testing-library/user-event';

it('submits form when button clicked', async () => {
  const user = userEvent.setup();
  const handleSubmit = vi.fn();

  render(<Form onSubmit={handleSubmit} />);

  await user.type(screen.getByLabelText(/name/i), 'John Doe');
  await user.click(screen.getByRole('button', { name: /submit/i }));

  expect(handleSubmit).toHaveBeenCalledWith({ name: 'John Doe' });
});
```

## Test Patterns

### Pattern 1: UI Component Tests

**What to test**:
- Renders correctly with different props
- Handles user interactions
- Applies correct CSS classes/variants
- Accessibility (roles, labels)

**Example**: `Button.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders button text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Click</Button>);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant classes', () => {
    render(<Button variant="primary">Primary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-primary');
  });

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Pattern 2: Feature Component Tests

**What to test**:
- Renders with context data
- Updates context when interacting
- Handles loading/error states
- Business logic

**Example**: `RequestTable.test.tsx`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppProvider } from '../../../contexts/AppContext';
import { RequestTable } from './RequestTable';

function renderWithContext(component: React.ReactElement) {
  return render(<AppProvider>{component}</AppProvider>);
}

describe('RequestTable', () => {
  it('displays all requests', () => {
    renderWithContext(<RequestTable />);

    expect(screen.getByText('REQ-001')).toBeInTheDocument();
    expect(screen.getByText('REQ-002')).toBeInTheDocument();
  });

  it('shows high priority badge for high priority requests', () => {
    renderWithContext(<RequestTable />);

    const highPriorityBadges = screen.getAllByText('High');
    expect(highPriorityBadges.length).toBeGreaterThan(0);
  });

  it('calls viewRequestDetail when row clicked', async () => {
    const user = userEvent.setup();
    renderWithContext(<RequestTable />);

    await user.click(screen.getByText('REQ-001'));

    // Verify navigation or state change
    expect(screen.getByText(/request detail/i)).toBeInTheDocument();
  });
});
```

### Pattern 3: Page Tests

**What to test**:
- Renders all sections
- Route parameters work
- Navigation works
- Integration of features

**Example**: `SubmitPage.test.tsx`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '../contexts/AppContext';
import { SubmitPage } from './SubmitPage';

function renderPage(component: React.ReactElement) {
  return render(
    <BrowserRouter>
      <AppProvider>
        {component}
      </AppProvider>
    </BrowserRouter>
  );
}

describe('SubmitPage', () => {
  it('renders page title', () => {
    renderPage(<SubmitPage />);
    expect(screen.getByText(/submit new request/i)).toBeInTheDocument();
  });

  it('shows chat interface', () => {
    renderPage(<SubmitPage />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('shows example requests', () => {
    renderPage(<SubmitPage />);
    expect(screen.getByText(/example requests/i)).toBeInTheDocument();
  });
});
```

### Pattern 4: Hook Tests

**What to test**:
- State updates correctly
- Async operations work
- Error handling
- Side effects

**Example**: `useChat.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useChat } from './useChat';

// Mock the API
vi.mock('../services/api', () => ({
  api: {
    startIntakeConversation: vi.fn(() =>
      Promise.resolve({
        message: 'Hello, how can I help?',
        options: ['Option 1', 'Option 2']
      })
    )
  }
}));

describe('useChat', () => {
  it('starts conversation successfully', async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.startConversation('Help with exports');
    });

    await waitFor(() => {
      expect(result.current.chatMessages).toHaveLength(2);
      expect(result.current.currentOptions).toHaveLength(2);
    });
  });

  it('handles errors gracefully', async () => {
    const mockApi = await import('../services/api');
    mockApi.api.startIntakeConversation = vi.fn(() =>
      Promise.reject(new Error('API error'))
    );

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.startConversation('Test');
    });

    expect(result.current.error).toBeDefined();
  });
});
```

## Running Tests

### Watch Mode (Development)
```bash
npm test
```

**When to use**: During development, auto-runs on file changes

### Run Once (CI/CD)
```bash
npm run test:run
```

**When to use**: In CI/CD pipelines, pre-commit hooks

### UI Mode
```bash
npm run test:ui
```

**When to use**: Debugging tests, visual test exploration

### Single Test File
```bash
npm test -- Button.test.tsx
```

**When to use**: Focused testing during development

### Watch Specific Pattern
```bash
npm test -- components/ui
```

**When to use**: Test specific directory during refactoring

## Mocking

### Mocking API Calls

```typescript
import { vi } from 'vitest';

// Mock entire module
vi.mock('../services/api', () => ({
  api: {
    startIntakeConversation: vi.fn(() =>
      Promise.resolve({ message: 'Hello', options: [] })
    )
  }
}));

// Mock fetch globally
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ content: [{ text: 'Response' }] })
  })
);
```

### Mocking Context

```typescript
// Create custom provider with test values
function renderWithMockContext(
  component: React.ReactElement,
  contextValue: Partial<AppContextType>
) {
  const defaultValue = {
    view: 'requester',
    setView: vi.fn(),
    chat: {
      chatMessages: [],
      startConversation: vi.fn(),
      // ...
    },
    ...contextValue  // Override with test values
  };

  return render(
    <AppContext.Provider value={defaultValue as AppContextType}>
      {component}
    </AppContext.Provider>
  );
}
```

### Mocking Router

```typescript
import { vi } from 'vitest';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: 'REQ-001' })
  };
});
```

## Coverage Goals

### Current Coverage
- **20 tests** (100% passing)
- Focus: UI components, critical user flows

### Coverage Targets
- **UI Components**: 100% (all tested)
- **Feature Components**: 80%+ (main flows tested)
- **Pages**: 70%+ (render + routing tested)
- **Hooks**: 80%+ (state logic tested)
- **Utils/Helpers**: 90%+ (pure functions tested)

### What NOT to Test
- ❌ Third-party libraries (React, React Router)
- ❌ Browser APIs (already tested by browsers)
- ❌ Type definitions (TypeScript checks this)
- ❌ Constants/configuration
- ❌ Trivial getters/setters

## Test Organization

### File Structure
```
src/
├── components/
│   └── ui/
│       ├── Button.tsx
│       ├── Button.test.tsx       ← Co-located
│       ├── Card.tsx
│       ├── Card.test.tsx         ← Co-located
│       └── index.ts
├── hooks/
│   ├── useChat.ts
│   └── useChat.test.ts           ← Co-located
└── test/
    └── setup.ts                  ← Global setup only
```

### Test Naming
```typescript
// ✅ CORRECT - Descriptive test names
describe('Button', () => {
  it('renders button text', () => {});
  it('calls onClick when clicked', () => {});
  it('disables button when disabled prop is true', () => {});
});

// ❌ WRONG - Vague test names
describe('Button', () => {
  it('works', () => {});
  it('test 1', () => {});
  it('should render', () => {});  // "should" is redundant
});
```

## Debugging Tests

### Use screen.debug()
```typescript
it('debugs component output', () => {
  render(<Button>Click me</Button>);
  screen.debug();  // Prints DOM to console
});
```

### Use logRoles()
```typescript
import { logRoles } from '@testing-library/react';

it('shows available roles', () => {
  const { container } = render(<Button>Click me</Button>);
  logRoles(container);  // Shows queryable roles
});
```

### Run Single Test
```typescript
it.only('runs only this test', () => {
  // Temporarily focus on one test
});
```

## Common Testing Pitfalls

### ❌ Pitfall 1: Not Waiting for Async

```typescript
// ❌ WRONG - Doesn't wait for async
it('loads data', () => {
  render(<DataComponent />);
  expect(screen.getByText('Data loaded')).toBeInTheDocument();
  // Fails - data hasn't loaded yet
});

// ✅ CORRECT - Waits for async
it('loads data', async () => {
  render(<DataComponent />);
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

### ❌ Pitfall 2: Testing Implementation

```typescript
// ❌ WRONG - Tests state variable name
expect(component.state.isOpen).toBe(true);

// ✅ CORRECT - Tests visible behavior
expect(screen.getByRole('dialog')).toBeVisible();
```

### ❌ Pitfall 3: Fragile Selectors

```typescript
// ❌ WRONG - Fragile
container.querySelector('.btn-submit');

// ✅ CORRECT - Semantic
screen.getByRole('button', { name: /submit/i });
```

## Summary

The testing philosophy provides:

✅ **Confidence** - Tests verify real user behavior
✅ **Maintainability** - Tests don't break on refactors
✅ **Speed** - Vitest is extremely fast (Vite-native)
✅ **Accessibility** - Tests encourage accessible markup
✅ **Developer Experience** - Watch mode, UI mode, great errors

**Key takeaway**: Test what users see and do, not implementation details. Use accessible queries that mirror how users interact with the app.
