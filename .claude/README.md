# Claude Code Configuration

This directory contains Claude Code configuration for the AI Workflow Orchestrator project.

## Files

- **`hooks.json`**: Automated checks and validations that run during Claude Code sessions
- **`settings.local.json`**: Local settings (auto-generated, not in git)
- **MCP Servers**: Extended capabilities configured in Claude desktop app (see [CLAUDE.md MCP Servers](../CLAUDE.md#mcp-servers))

## Configured Hooks

The project has **16 automated hooks** configured in `hooks.json`:

### UserPromptSubmit Hooks (3)
1. **Server Status Check**: Checks if both backend (port 3001) and frontend (port 3000) are running
2. **API Key Validation**: Verifies `.env` file exists with valid `ANTHROPIC_API_KEY`
3. **Workflow Reminder**: Displays workflow requirements (TodoWrite, agent invocation, testing)

### PreToolUse Hooks (2)
4. **Enhanced Secret Detection**: Blocks commits of `.env`, `.key`, `.pem` files
5. **Port Conflict Warning**: Warns if ports already in use before starting servers

### PostToolUse Hooks (9)
6. **TypeScript Type Check**: Runs `tsc --noEmit` after `.ts`/`.tsx` edits
7. **Test Suite Execution**: Runs tests after `src/` file changes
8. **Prettier Auto-Formatting**: Formats files automatically after Write/Edit
9. **ESLint Validation**: Lints TypeScript files with zero warnings allowed
10. **Hook Isolation Check**: Ensures custom hooks don't call each other directly
11. **Breaking Change Detection**: Detects export signature changes in core files
12. **Test Coverage Reminder**: Warns when new components lack test files
13. **Documentation Sync Reminder**: Prompts doc updates for core architecture files
14. **Secret Scanning**: Detects hardcoded API keys or secrets in code

### Stop Hooks (2)
15. **Session Summary**: Shows git status and files changed
16. **Workflow Compliance Check**: Displays checklist for workflow verification

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
