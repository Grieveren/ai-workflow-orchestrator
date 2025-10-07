# MCP Servers Guide

This project has **6 configured MCP servers** that extend Claude Code's capabilities. These tools are loaded at session startup and should be used proactively for appropriate tasks.

## Available Servers

### 1. GitHub (`@modelcontextprotocol/server-github`)

**Purpose:** Repository management, PR/issue creation, code reviews

**When to use:**
- Creating pull requests
- Managing GitHub issues
- Reviewing GitHub activity
- Searching repositories

**Example:**
```typescript
mcp__github__create_pull_request({
  owner: "username",
  repo: "ai-workflow-orchestrator",
  title: "Add new feature",
  body: "Description",
  head: "feature-branch",
  base: "main"
})
```

**Common Operations:**
- `mcp__github__create_pull_request` - Create PRs
- `mcp__github__create_issue` - Create issues
- `mcp__github__get_pull_request` - Get PR details
- `mcp__github__list_commits` - View commit history

---

### 2. Puppeteer (`@modelcontextprotocol/server-puppeteer`)

**Purpose:** Browser automation and visual inspection of the running application

**When to use proactively:**
- **BEFORE making UI/styling changes** → Screenshot `localhost:3000` to see current state
- **AFTER UI changes** → Screenshot to verify the changes worked correctly
- **When user reports visual bugs** → Screenshot to see the actual issue
- **Testing responsive design** → Capture screenshots at different viewport sizes

**Integration:**
- Always verify both frontend (3000) and backend (3001) are running first
- Use `npm run dev:full` to start both servers

**Agent synergy:**
- The `ux-reviewer` agent can request screenshots to validate visual changes and accessibility

**Example Workflow:**
```typescript
// 1. Navigate to the application
mcp__puppeteer__puppeteer_navigate({
  url: "http://localhost:3000"
})

// 2. Take a screenshot
mcp__puppeteer__puppeteer_screenshot({
  name: "dashboard-before-changes",
  width: 1920,
  height: 1080
})

// 3. Make code changes...

// 4. Take another screenshot to verify
mcp__puppeteer__puppeteer_screenshot({
  name: "dashboard-after-changes",
  width: 1920,
  height: 1080
})
```

**Available Actions:**
- `puppeteer_navigate` - Navigate to a URL
- `puppeteer_screenshot` - Capture full page or element screenshot
- `puppeteer_click` - Click an element
- `puppeteer_fill` - Fill input fields
- `puppeteer_hover` - Hover over elements
- `puppeteer_evaluate` - Execute JavaScript in browser console

---

### 3. Memory (`@modelcontextprotocol/server-memory`)

**Purpose:** Persist knowledge and decisions across Claude Code sessions

**When to use proactively:**
- Store architectural decisions made during the session
- Remember user preferences (e.g., "always use Tailwind class X for Y")
- Track project-specific patterns discovered during development
- Save important context about requests, workflows, or team dynamics
- Document why certain approaches were chosen

**Integration:**
- Check memory at session start for relevant context
- Update memory at session end with new learnings

**Example:**
```typescript
// Store architectural decision
mcp__memory__create_entities({
  entities: [{
    name: "Document Generation Strategy",
    entityType: "architecture-decision",
    observations: [
      "We chose sequential document generation (3 separate API calls) over parallel generation",
      "Rationale: Better error recovery, real-time progress tracking, no JSON parsing errors",
      "Trade-off: Slightly slower total time (9-15s vs 3-5s) but better UX"
    ]
  }]
})

// Remember user preference
mcp__memory__create_entities({
  entities: [{
    name: "UI Styling Preferences",
    entityType: "user-preference",
    observations: [
      "User prefers Tailwind utility classes over custom CSS",
      "Always use dark mode compatible colors (slate/zinc palette)",
      "Consistent spacing: p-4 for cards, p-6 for pages"
    ]
  }]
})
```

**Common Operations:**
- `mcp__memory__create_entities` - Store new knowledge
- `mcp__memory__add_observations` - Add to existing entity
- `mcp__memory__search_nodes` - Find relevant context
- `mcp__memory__read_graph` - View all stored knowledge

---

### 4. Filesystem (`@modelcontextprotocol/server-filesystem`)

**Purpose:** Enhanced file operations on the `./src` directory

**When to use:**
- Advanced file watching and monitoring for changes
- Bulk file operations
- Recursive directory operations

**Scope:** Limited to `./src` directory for safety

**Example:**
```typescript
mcp__filesystem__watch({
  path: "./src/components"
})
```

**Note:** For most file operations, prefer the built-in `Read`, `Write`, `Edit` tools. Use MCP filesystem for advanced scenarios.

---

### 5. Sequential Thinking (`@modelcontextprotocol/server-sequential-thinking`)

**Purpose:** Advanced reasoning for complex multi-step architectural decisions

**When to use proactively:**
- Planning major refactoring (e.g., adding database persistence)
- Analyzing workflow bottlenecks in the RevOps features
- Evaluating trade-offs for architectural changes
- Breaking down complex features into implementation phases
- Solving complex bugs that require step-by-step reasoning

**Example Use Cases:**
- "Add real-time collaboration" - requires WebSocket architecture, state synchronization, conflict resolution
- "Migrate to database persistence" - requires schema design, migration strategy, backward compatibility
- "Optimize API performance" - requires analysis of bottlenecks, caching strategy, load testing approach

**Example:**
```typescript
mcp__sequential_thinking__sequentialthinking({
  thought: "Step 1: Analyze current client-side state structure in AppContext",
  thoughtNumber: 1,
  totalThoughts: 5,
  nextThoughtNeeded: true
})
```

---

### 6. SQLite (`mcp-server-sqlite-npx`)

**Purpose:** Persistent data storage for the workflow orchestrator

**Database:** `./workflow.db` (created automatically on first use)

**When to use proactively:**
- Offer to migrate mock data to persistent storage
- When user requests "save requests between sessions"
- For analytics that require historical data tracking
- Multi-user collaboration scenarios

**Integration Opportunities:**
- Store `Request` objects permanently (replace client-side state)
- Track document generation history
- Persist user preferences and view settings
- Enable multi-user collaboration with shared database

**Example Schema Design:**
```sql
CREATE TABLE requests (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  owner TEXT NOT NULL,
  submitted_by TEXT NOT NULL,
  clarity_score INTEGER,
  days_open INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE impact_assessments (
  request_id TEXT PRIMARY KEY,
  total_score INTEGER NOT NULL,
  revenue_impact INTEGER,
  user_reach INTEGER,
  strategic_alignment INTEGER,
  urgency INTEGER,
  quick_win_bonus INTEGER,
  tier INTEGER NOT NULL,
  assessed_at TEXT NOT NULL,
  assessed_by TEXT NOT NULL,
  justification TEXT,
  FOREIGN KEY (request_id) REFERENCES requests(id)
);

CREATE TABLE activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  user TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  FOREIGN KEY (request_id) REFERENCES requests(id)
);
```

**Example Usage:**
```typescript
// Create tables matching src/types/index.ts schemas
mcp__sqlite__create_table({
  query: "CREATE TABLE requests (id TEXT PRIMARY KEY, ...)"
})

// Query data
mcp__sqlite__read_query({
  query: "SELECT * FROM requests WHERE status = 'Scoping'"
})

// Insert data
mcp__sqlite__write_query({
  query: "INSERT INTO requests (id, title, ...) VALUES (?, ?, ...)"
})
```

---

## Proactive Usage Patterns

### UI Development Workflow

**Purpose:** Visual validation of UI changes

**Steps:**
1. Screenshot `localhost:3000` BEFORE changes (if servers running)
2. Make UI modifications
3. Screenshot AFTER to verify changes
4. Store design decisions in Memory for future consistency

**Example:**
```typescript
// 1. Before changes
await mcp__puppeteer__puppeteer_navigate({
  url: "http://localhost:3000/dashboard"
});
await mcp__puppeteer__puppeteer_screenshot({
  name: "dashboard-before-dark-mode",
  width: 1920,
  height: 1080
});

// 2. Make changes to ThemeToggle.tsx...

// 3. After changes
await mcp__puppeteer__puppeteer_screenshot({
  name: "dashboard-after-dark-mode",
  width: 1920,
  height: 1080
});

// 4. Store decision
await mcp__memory__create_entities({
  entities: [{
    name: "Dark Mode Implementation",
    entityType: "ui-pattern",
    observations: [
      "Using Tailwind dark: variant with .dark class on <html>",
      "Persistent preference in localStorage",
      "System preference detection via prefers-color-scheme"
    ]
  }]
});
```

---

### Feature Planning Workflow

**Purpose:** Plan complex features with thorough analysis

**Steps:**
1. Use Sequential Thinking for complex features
2. Check Memory for related past decisions
3. Store the implementation plan in Memory
4. Execute with appropriate specialized agents

**Example:**
```typescript
// 1. Use sequential thinking
await mcp__sequential_thinking__sequentialthinking({
  thought: "Analyzing requirements for real-time collaboration feature",
  thoughtNumber: 1,
  totalThoughts: 8,
  nextThoughtNeeded: true
});

// 2. Check memory
await mcp__memory__search_nodes({
  query: "real-time collaboration"
});

// 3. Store plan
await mcp__memory__create_entities({
  entities: [{
    name: "Real-Time Collaboration Plan",
    entityType: "feature-plan",
    observations: [
      "Phase 1: WebSocket server setup (Express + Socket.io)",
      "Phase 2: State synchronization (broadcast updates)",
      "Phase 3: Conflict resolution (operational transforms)",
      "Phase 4: User presence indicators"
    ]
  }]
});

// 4. Execute with agents (technical-architect, security-reviewer, etc.)
```

---

### Database Migration Workflow

**Purpose:** Migrate from client-side state to persistent SQLite storage

**Steps:**
1. Analyze current mock data structure in `AppContext.tsx`
2. Design SQLite schema matching `src/types/index.ts`
3. Create migration script to preserve existing data
4. Offer persistence layer as enhancement to user

**Example:**
```typescript
// 1. Analyze current structure (use Read tool)
// 2. Design schema (see SQLite section above)

// 3. Create tables
await mcp__sqlite__create_table({
  query: `CREATE TABLE requests (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    status TEXT NOT NULL,
    priority TEXT NOT NULL,
    owner TEXT NOT NULL,
    submitted_by TEXT NOT NULL,
    clarity_score INTEGER,
    days_open INTEGER,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`
});

// 4. Migrate existing data
const existingRequests = [/* from AppContext.tsx */];
for (const request of existingRequests) {
  await mcp__sqlite__write_query({
    query: `INSERT INTO requests VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    params: [request.id, request.title, /* ... */]
  });
}
```

---

### Session Start Checklist

**Purpose:** Leverage MCP tools for context-aware development

**Checklist:**
- ☑️ Check Memory for relevant project context
- ☑️ If UI work expected, verify servers running and take baseline screenshot
- ☑️ Store new learnings in Memory at session end

**Example:**
```typescript
// Session start
await mcp__memory__search_nodes({
  query: "recent architecture decisions"
});

// During session
await mcp__puppeteer__puppeteer_navigate({
  url: "http://localhost:3000"
});

// Session end
await mcp__memory__add_observations({
  observations: [{
    entityName: "Project Context",
    contents: [
      "Completed dark mode implementation - Oct 7, 2025",
      "Fixed Phase 2 validation issues with impact scoring",
      "All hooks passing, zero ESLint warnings"
    ]
  }]
});
```

---

## Important Notes

- **MCP tools availability**: MCP tools only become available in NEW sessions after configuration. If tools are missing, verify with `claude mcp list` and restart the session.

- **Server prerequisites**: Puppeteer requires the development servers to be running (`npm run dev:full`). Always check server status before using Puppeteer tools.

- **Memory persistence**: The Memory MCP stores data in a local graph database. This data persists across sessions but is local to your machine.

- **SQLite database location**: The SQLite database is created at `./workflow.db` in the project root. This file is gitignored by default.

- **Filesystem scope**: The Filesystem MCP is intentionally limited to the `./src` directory for security. Use built-in tools for operations outside this scope.

## Related Documentation

- [Impact Assessment](../docs/features/impact-assessment.md) - Feature that could benefit from SQLite persistence
- [Role-Based Views](../docs/features/role-based-views.md) - View state could be stored in SQLite
- [Testing Philosophy](../docs/architecture/testing.md) - How to test MCP integrations
