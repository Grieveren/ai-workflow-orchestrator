# Claude Code Configuration

This directory contains Claude Code configuration for the AI Workflow Orchestrator project.

## Files

- **`hooks.json`**: Automated checks and validations that run during Claude Code sessions
- **`settings.local.json`**: Local settings (auto-generated, not in git)
- **MCP Servers**: Extended capabilities configured in Claude desktop app (see [CLAUDE.md MCP Servers](../CLAUDE.md#mcp-servers))

## Configured Hooks

The project has **13 automated hooks** configured in `hooks.json` (optimized for performance):

### UserPromptSubmit Hooks (2)
1. **Server Status Check**: Checks if both backend (port 3001) and frontend (port 3000) are running
2. **API Key Validation**: Verifies `.env` file exists with valid `ANTHROPIC_API_KEY`

### PreToolUse Hooks (2)
3. **Enhanced Secret Detection**: Blocks commits of `.env`, `.key`, `.pem` files
4. **Port Conflict Warning**: Warns if ports already in use before starting servers

### PostToolUse Hooks (6)
5. **TypeScript Type Check** (Optimized): Runs `tsc --noEmit` only for critical paths (services/types/contexts)
6. **Test Suite Execution** (Optimized): Runs tests only for `.test.ts`/`.test.tsx` files
7. **Prettier Auto-Formatting**: Formats files automatically after Write/Edit
8. **ESLint Validation**: Lints TypeScript files with zero warnings allowed
9. **Hook Isolation Check** (Enhanced): Validates ALL custom hooks using pattern matching
10. **Breaking Change Detection**: Detects export signature changes in core files
11. **Test Coverage Reminder** (Expanded): Warns for components, features, hooks, and services
12. **Smart Documentation Alert**: Detects which specific docs need updating
13. **Secret Scanning** (Smart): Detects hardcoded API keys (excludes test files and test/ directory)

### Stop Hooks (3)
14. **Session Summary**: Shows git status and files changed
15. **Smart Commit Helper**: Analyzes uncommitted changes and provides ready-to-use git commands with change summary
16. **Workflow Compliance Check**: Interactive checklist for session compliance

## Testing Hooks

To see hook execution in detail:
```bash
claude --debug
```

To view configured hooks:
```bash
/hooks
```

## Disabling Hooks

To temporarily disable hooks, rename or remove `hooks.json`:
```bash
mv .claude/hooks.json .claude/hooks.json.disabled
```

## Modifying Hooks

Edit `hooks.json` directly. The file uses standard JSON format with these event types:
- `UserPromptSubmit` - Before processing user input
- `PreToolUse` - Before Claude uses a tool (can block)
- `PostToolUse` - After a tool completes successfully
- `Stop` - When Claude finishes responding
- `SessionStart` - When starting/resuming a session
- `SessionEnd` - When session ends

See [Claude Code Hooks Documentation](https://docs.claude.com/en/docs/claude-code/hooks) for more details.

## MCP Servers

This project has 6 configured MCP servers (GitHub, Puppeteer, Memory, Filesystem, Sequential Thinking, SQLite) that extend Claude Code's capabilities.

**Configuration**: MCP servers are configured in the Claude desktop app settings, NOT in this directory.

**Documentation**: See [CLAUDE.md - MCP Servers](../CLAUDE.md#mcp-servers) for:
- Purpose of each server
- Proactive usage patterns
- Integration workflows
- Session start checklist

**Verification**: List available MCP tools with:
```bash
claude mcp list
```

**Note**: MCP tools only become available in NEW sessions after configuration.
