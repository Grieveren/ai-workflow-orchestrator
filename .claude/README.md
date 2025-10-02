# Claude Code Configuration

This directory contains Claude Code configuration for the AI Workflow Orchestrator project.

## Files

- **`hooks.json`**: Automated checks and validations that run during Claude Code sessions
- **`settings.local.json`**: Local settings (auto-generated, not in git)

## Configured Hooks

### 1. Server Status Check (UserPromptSubmit)
**When**: Before processing each user prompt
**What**: Checks if both backend (port 3001) and frontend (port 3000) are running
**Why**: Prevents confusing errors from missing servers in dual-server architecture

### 2. Environment File Protection (PreToolUse - Bash)
**When**: Before running git commands
**What**: Blocks commits that include `.env` file
**Why**: Prevents accidental exposure of `ANTHROPIC_API_KEY`

### 3. TypeScript Type Check (PostToolUse - Write/Edit)
**When**: After modifying `.ts` or `.tsx` files
**What**: Runs `tsc --noEmit` to check for type errors
**Why**: Catches type errors immediately instead of at build time

### 4. Automated Test Runner (PostToolUse - Write/Edit)
**When**: After modifying files in `src/` or test files
**What**: Runs test suite with `npm run test:run`
**Why**: Ensures changes don't break existing tests (20 tests)

### 5. Session Summary (Stop)
**When**: When Claude finishes responding
**What**: Shows git status summary
**Why**: Quick overview of what changed during the session

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
