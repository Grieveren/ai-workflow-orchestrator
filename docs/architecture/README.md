# Architecture Documentation

This directory contains detailed architectural documentation for the AI Workflow Orchestrator.

## Overview

The AI Workflow Orchestrator uses a modern, production-ready architecture that evolved through a comprehensive 5-phase refactoring (see [Migration History](../history/architectural/MIGRATION_PLAN.md)).

## Architecture Documents

### Core Patterns

- **[Dual-Server Architecture](dual-server.md)** - Backend proxy pattern for secure API key handling
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
- **Frontend**: React 18 + TypeScript + Vite
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend**: Express.js proxy server
- **AI**: Claude Sonnet 4.5
- **Testing**: Vitest + React Testing Library

### Project Statistics
- **Bundle Size**: 227 KB (optimized, code-split)
- **Test Coverage**: 20 tests (100% passing)
- **Components**: 17 reusable components
- **Pages**: 5 route pages
- **Custom Hooks**: 3 (useChat, useRequests, useDocuments)

### Architecture Status

✅ **Production-Ready** - All 5 refactoring phases complete

## Further Reading

- [Project README](../../README.md) - Setup and getting started
- [CLAUDE.md](../../CLAUDE.md) - Claude Code instructions
- [Migration History](../history/) - How we got here
