# Documentation Index

Welcome to the AI Workflow Orchestrator documentation. This directory contains all project documentation organized by category.

## 📚 Documentation Structure

```
docs/
├── README.md (this file)        # Documentation index
├── architecture/                # Architecture documentation
│   ├── README.md               # Architecture overview
│   ├── dual-server.md          # Backend proxy pattern
│   ├── state-management.md     # Context + hooks
│   ├── component-strategy.md   # Component organization
│   └── testing.md              # Testing philosophy
└── history/                    # Historical migration docs
    ├── MIGRATION_PLAN.md
    ├── PHASE1_COMPLETE.md
    ├── PHASE2_COMPLETE.md
    ├── PHASE3_COMPLETE.md
    ├── PHASE4_COMPLETE.md
    ├── PHASE5_COMPLETE.md
    └── COMPONENT_INTEGRATION_COMPLETE.md
```

## 🚀 Getting Started

**New to the project?** Start here:

1. **[Project README](../README.md)** - Setup, installation, running the app
2. **[Architecture Overview](architecture/README.md)** - High-level architecture
3. **[CLAUDE.md](../CLAUDE.md)** - Claude Code instructions (for AI assistants)

## 🏗️ Architecture Documentation

Deep dives into architectural patterns and decisions:

### Core Patterns
- **[Dual-Server Architecture](architecture/dual-server.md)** (8.5KB)
  - Why we use a backend proxy
  - Security considerations
  - Request flow examples
  - Development workflow

- **[State Management](architecture/state-management.md)** (12KB)
  - React Context with custom hooks
  - Three independent hooks: useChat, useRequests, useDocuments
  - No external state libraries
  - Testing hooks in isolation

- **[Component Strategy](architecture/component-strategy.md)** (14KB)
  - Component location decision tree
  - UI vs Layout vs Feature vs Pages
  - Strict placement rules
  - Common mistakes and solutions

- **[Testing Philosophy](architecture/testing.md)** (13KB)
  - Vitest + React Testing Library
  - Test behavior, not implementation
  - Co-located tests
  - Testing patterns and examples

## 📖 Historical Documentation

Understanding how we got here:

- **[Migration Plan](history/MIGRATION_PLAN.md)** (15KB)
  - Complete 5-phase refactoring roadmap
  - From 1,544-line monolith to modular architecture
  - Rationale for each phase

- **[Phase Completions](history/)**
  - Detailed reports for each completed phase
  - Phase 1: Type definitions & API layer
  - Phase 2: Hooks & Context
  - Phase 3: Component breakdown
  - Phase 4: Routing & Testing
  - Phase 5: Advanced features

## 🔑 Key Concepts

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Express.js proxy server
- **Routing**: React Router DOM v7
- **Testing**: Vitest, React Testing Library
- **AI**: Claude Sonnet 4.5 API

### Architecture Highlights
- ✅ Production-ready (all 5 phases complete)
- ✅ Type-safe with TypeScript
- ✅ 227 KB optimized bundle with code splitting
- ✅ 20 tests (100% passing)
- ✅ Dual-server security pattern
- ✅ No database (client-side state only)
- ✅ MCP servers for extended AI capabilities

## 📊 Project Statistics

- **Components**: 17 reusable components
- **Pages**: 5 route pages
- **Custom Hooks**: 3 (domain-specific)
- **Lines of Code**: ~4,000 (from 1,544 monolith)
- **Bundle Size**: 227 KB total (optimized, split)
- **Test Coverage**: 20 tests, 100% pass rate

## 🎯 Quick Links

### For Developers
- [Setup Guide](../README.md#setup)
- [Development Commands](../README.md#running-the-application)
- [Component Strategy](architecture/component-strategy.md)
- [Testing Guide](architecture/testing.md)

### For Claude Code
- [CLAUDE.md](../CLAUDE.md) - AI assistant instructions
- [Architecture Patterns](../CLAUDE.md#critical-architecture-patterns)
- [MCP Servers](../CLAUDE.md#mcp-servers) - Extended AI capabilities
- [Component Location Rules](architecture/component-strategy.md#decision-tree)

### For Product/Business
- [Features](../README.md#features)
- [Tech Stack](../README.md#tech-stack)
- [Migration Success](history/MIGRATION_PLAN.md)

## 🔍 Finding Documentation

### By Topic

**Architecture**:
- How does the backend work? → [Dual-Server](architecture/dual-server.md)
- How is state managed? → [State Management](architecture/state-management.md)
- Where do components go? → [Component Strategy](architecture/component-strategy.md)
- How do we test? → [Testing](architecture/testing.md)

**Setup & Development**:
- Getting started → [README](../README.md)
- Environment setup → [README: Setup](../README.md#setup)
- Running tests → [Testing: Running Tests](architecture/testing.md#running-tests)

**History & Context**:
- Why this architecture? → [Migration Plan](history/MIGRATION_PLAN.md)
- How did we refactor? → [Phase Completions](history/)

**AI Tooling**:
- What MCP servers are available? → [CLAUDE.md: MCP Servers](../CLAUDE.md#mcp-servers)
- How to use Puppeteer for UI verification? → [CLAUDE.md: UI Development Workflow](../CLAUDE.md#proactive-usage-patterns)
- Database persistence options? → [CLAUDE.md: SQLite Server](../CLAUDE.md#available-servers)

### By Role

**New Developer**:
1. [README](../README.md) - Get the app running
2. [Architecture Overview](architecture/README.md) - Understand structure
3. [Component Strategy](architecture/component-strategy.md) - Learn where things go
4. [Testing](architecture/testing.md) - Write your first test

**Claude Code / AI Assistant**:
1. [CLAUDE.md](../CLAUDE.md) - Core instructions
2. [Architecture Docs](architecture/) - Deep technical knowledge
3. [Migration History](history/) - Context for decisions

**Product Owner / Manager**:
1. [README](../README.md) - Features and capabilities
2. [Migration Plan](history/MIGRATION_PLAN.md) - Refactoring value delivered

## 📝 Documentation Standards

When adding documentation:
- ✅ Use clear, descriptive headings
- ✅ Include code examples
- ✅ Explain the "why" not just "what"
- ✅ Link to related documents
- ✅ Keep diagrams simple (ASCII art preferred)
- ✅ Update this index when adding new docs

## 🤝 Contributing to Docs

Found a gap in documentation?

1. Identify which category it belongs in
2. Create or update the relevant file
3. Add examples and code snippets
4. Update this index
5. Link from related documents

## 📞 Support

For questions not covered in documentation:
- Check [GitHub Issues](https://github.com/Grieveren/ai-workflow-orchestrator/issues)
- Review [CLAUDE.md](../CLAUDE.md) for architecture rationale
- Explore [Migration History](history/) for decision context

---

**Last Updated**: Documentation reorganized with architecture extraction
**Maintainers**: See git history for contributors
