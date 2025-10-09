# Architecture Documentation

This directory contains detailed architectural documentation for the AI Workflow Orchestrator.

## Overview

The AI Workflow Orchestrator uses a modern, production-ready architecture that evolved through a comprehensive 5-phase refactoring (see [Migration History](../history/architectural/MIGRATION_PLAN.md)).

## Architecture Documents

### Core Patterns

- **[Dual-Server Architecture](dual-server.md)** - Backend proxy pattern for secure API key handling
- **[Database Persistence](database-persistence.md)** - SQLite storage with optimistic updates
- **[State Management](state-management.md)** - React Context with composable custom hooks
- **[Component Strategy](component-strategy.md)** - Component location rules and organization
- **[Testing Philosophy](testing.md)** - Testing approach and patterns

### Key Principles

1. **Type Safety** - TypeScript throughout with centralized type definitions
2. **Separation of Concerns** - Clear boundaries between UI, state, and API layers
3. **Testability** - Co-located tests with high coverage
4. **Performance** - Code splitting, lazy loading, optimized bundles
5. **Security** - API keys never exposed to frontend

## Quick Reference

### Tech Stack
- **Frontend**: React 19.2.0 + TypeScript + Vite 6.3.6
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS 4.1.14
- **Icons**: Lucide React
- **Backend**: Express.js proxy server
- **Database**: SQLite (better-sqlite3)
- **AI**: Claude Sonnet 4.5
- **Testing**: Vitest + React Testing Library

### Project Statistics
- **Bundle Size**: 96 KB gzipped (273 KB raw, optimized with code splitting)
- **Test Coverage**: 119 tests across 11 test files (100% passing)
- **Components**: 17 reusable components
- **Pages**: 7 route pages
- **Custom Hooks**: 3 (useChat, useRequests, useDocuments)

### Architecture Status

✅ **Production-Ready** - All 5 refactoring phases complete

## Further Reading

- [Project README](../../README.md) - Setup and getting started
- [CLAUDE.md](../../CLAUDE.md) - Claude Code instructions
- [Migration History](../history/) - How we got here
