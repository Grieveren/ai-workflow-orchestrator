# Custom Claude Code Agents

This directory contains specialized sub-agents for the AI Workflow Orchestrator project. Each agent has focused expertise and isolated context for specific tasks.

## MANDATORY USAGE POLICY

**IMPORTANT**: Claude Code MUST use these agents proactively for matching tasks. Do NOT ask permission - invoke them automatically based on the trigger rules below.

### Auto-Invoke Trigger Rules

Claude Code must automatically invoke agents when these conditions are met:

| Agent | Trigger Condition | Required? |
|-------|------------------|-----------|
| `technical-architect` | ANY file in `src/` with >20 lines changed | ✅ MANDATORY |
| `test-writer` | New component created in `src/components/` or `src/features/` | ✅ MANDATORY |
| `security-reviewer` | Changes to `src/services/api.ts`, `server.js`, or authentication | ✅ MANDATORY |
| `doc-updater` | Changes to files in "Critical Architecture Patterns" (see CLAUDE.md) | ✅ MANDATORY |
| `dependency-auditor` | `package.json` modified or new npm packages requested | ✅ MANDATORY |
| `route-optimizer` | New routes added or `src/App.tsx` modified | ✅ MANDATORY |
| `prompt-engineer` | Modifying prompts in `src/services/api.ts` | ✅ MANDATORY |
| `workflow-enforcer` | End of coding session (>5 file changes) | ✅ MANDATORY |

**These are NOT suggestions - they are REQUIREMENTS per CLAUDE.md workflow.**

## Available Agents

Total: **14 specialized agents**

### 1. **test-writer**
**Purpose**: Write comprehensive Vitest tests for React components
**Tools**: All tools available
**Use cases**:
- Generate tests for new components
- Follow existing test patterns
- Ensure 100% test coverage

**Invoke with**: "Write tests for the Button component"

---

### 2. **component-generator**
**Purpose**: Create new React components following project architecture
**Tools**: All tools available
**Use cases**:
- Generate UI components in correct location
- Follow Tailwind CSS patterns
- Create component + test + export

**Invoke with**: "Create a new LoadingSpinner component"

---

### 3. **api-integration**
**Purpose**: Add new Claude API methods to service layer
**Tools**: All tools available
**Use cases**:
- Extend src/services/api.ts
- Follow service layer patterns
- Maintain type safety

**Invoke with**: "Add an API method to summarize documents"

---

### 4. **doc-updater**
**Purpose**: Keep documentation synchronized with code changes
**Tools**: All tools available
**Use cases**:
- Update CLAUDE.md after architecture changes
- Sync README.md with new features
- Maintain hooks documentation

**Invoke with**: "Update documentation to reflect the new dashboard feature"

---

### 5. **prompt-engineer**
**Purpose**: Optimize Claude API prompts in service layer
**Tools**: All tools available
**Use cases**:
- Improve chatbot conversation quality
- Fix JSON extraction reliability
- Enhance document generation prompts

**Invoke with**: "Optimize the intake conversation prompts for better question flow"

---

### 6. **technical-architect**
**Purpose**: Review architectural decisions and ensure pattern consistency
**Tools**: All tools available
**Use cases**:
- Review component placement decisions
- Validate state management changes
- Assess performance impact
- Guard production-ready architecture

**Invoke with**: "Review the architecture for adding WebSocket support"

---

### 7. **product-owner**
**Purpose**: Evaluate features for business value and user experience
**Tools**: All tools available
**Use cases**:
- Prioritize feature requests
- Define acceptance criteria
- Review BRD/FSD completeness
- Ensure user-centric decisions

**Invoke with**: "Evaluate this feature request for priority"

---

### 8. **project-manager**
**Purpose**: Plan implementation and coordinate development tasks
**Tools**: All tools available
**Use cases**:
- Break down features into tasks
- Estimate effort and timeline
- Identify dependencies and risks
- Track progress

**Invoke with**: "Create a project plan for adding authentication"

---

### 9. **revops-expert**
**Purpose**: Revenue Operations expert for workflow optimization and business process improvement
**Tools**: All tools available
**Use cases**:
- Analyze and optimize workflow stages
- Identify process bottlenecks and inefficiencies
- Recommend automation opportunities
- Define success metrics and KPIs
- Provide RevOps strategy consultation

**Invoke with**: "Consult on our workflow optimization strategy"

---

### 10. **dependency-auditor**
**Purpose**: Review and validate third-party dependency additions for security, bundle size, and architectural fit
**Tools**: All tools available
**Use cases**:
- Evaluate new npm package requests
- Check security and maintenance profiles
- Analyze bundle size impact
- Prevent architectural conflicts

**Invoke with**: "Review adding Redux for state management"

---

### 11. **security-reviewer**
**Purpose**: Audit code for security vulnerabilities including prompt injection, API key exposure, and XSS
**Tools**: All tools available
**Use cases**:
- Review API key management
- Detect prompt injection vulnerabilities
- Validate input sanitization
- Check for XSS risks
- Audit dependency vulnerabilities

**Invoke with**: "Review security for new user input feature"

---

### 12. **route-optimizer**
**Purpose**: Manage React Router configuration, ensure lazy loading, and validate navigation patterns
**Tools**: All tools available
**Use cases**:
- Optimize route lazy loading
- Detect route conflicts
- Validate navigation patterns
- Analyze bundle splitting efficiency

**Invoke with**: "Review adding /settings route"

---

### 13. **workflow-enforcer**
**Purpose**: Audit Claude Code sessions for compliance with mandatory workflow (see CLAUDE.md)
**Tools**: All tools available
**Use cases**:
- Verify TodoWrite was used for multi-step tasks
- Check that specialized agents were invoked proactively
- Confirm tests/TypeScript/ESLint were run after changes
- Validate documentation was updated
- Provide compliance score and recommendations

**Invoke with**: "Review workflow compliance for this session"

**Auto-invoke**: End of sessions with >5 file modifications

---

### 14. **code-reviewer**
**Purpose**: Perform comprehensive code quality reviews, identify anti-patterns, and ensure best practices
**Tools**: All tools available
**Use cases**:
- Review large code changes (>50 lines)
- Identify code smells and anti-patterns
- Suggest refactoring opportunities
- Ensure adherence to coding standards
- Check for performance issues

**Invoke with**: "Review code quality for recent changes"

**Auto-invoke**: Large code changes (>50 lines modified)

---

## How to Use Agents

### Automatic Delegation
Claude Code will automatically delegate to the appropriate agent based on your request:

```
User: "Write tests for the Card component"
→ Automatically uses test-writer agent
```

### Explicit Invocation
Mention the agent by name for explicit delegation:

```
User: "Use the component-generator agent to create a StatusBadge component"
```

### Agent Capabilities

Each agent:
- ✅ Has its own context window (no context pollution)
- ✅ Uses specialized system prompts for its task
- ✅ Has access to all tools for maximum flexibility
- ✅ Follows project-specific patterns automatically
- ✅ Returns results to the main Claude instance

## Best Practices

### When to Use Agents

- **Focused tasks**: Single-purpose operations (testing, component creation)
- **Repetitive patterns**: Following established conventions
- **Specialized expertise**: Domain-specific knowledge (prompt engineering)

### When NOT to Use Agents

- **Exploratory work**: Understanding codebase structure
- **Multi-step workflows**: Tasks requiring coordination across domains
- **Simple questions**: General information requests

## Agent Development

### Anatomy of an Agent

Each agent is defined in a Markdown file with YAML frontmatter:

```yaml
---
name: agent-name
description: Brief description of what the agent does
tools: "*"
---

System prompt content here...
```

### Creating New Agents

1. Create `.md` file in this directory
2. Define YAML frontmatter with name, description, tools
3. Write comprehensive system prompt
4. Include project-specific patterns and examples
5. Test with real tasks

### Modifying Existing Agents

Simply edit the `.md` files. Changes take effect immediately (no restart needed).

## Agent Design Philosophy

### Focused Expertise
Each agent knows:
- Project architecture (from CLAUDE.md)
- Specific domain patterns (testing, components, API)
- Common pitfalls and how to avoid them
- Quality standards for their domain

### Context Isolation
Agents work in separate contexts to:
- Prevent context pollution
- Enable parallel task execution
- Maintain focused attention on specific tasks

### Project Knowledge
All agents have access to:
- CLAUDE.md architecture documentation
- Existing code patterns
- Type definitions in src/types/index.ts
- Service layer patterns in src/services/api.ts

## Debugging Agents

If an agent isn't working as expected:

1. **Check the agent definition**
   ```bash
   cat .claude/agents/agent-name.md
   ```

2. **Verify tool permissions**
   - Ensure the agent has necessary tools in frontmatter

3. **Test with explicit invocation**
   ```
   "Use the test-writer agent to write tests for Button.tsx"
   ```

4. **Review agent output**
   - Check if the agent is following its instructions
   - Verify it's using project patterns correctly

## Agent Collaboration Patterns

These agents are designed to work together:

### Feature Development Flow
1. **product-owner** → Evaluates feature request, defines acceptance criteria
2. **technical-architect** → Reviews architectural approach, approves design
3. **project-manager** → Breaks down into tasks, estimates effort
4. **component-generator** → Creates components following architecture
5. **test-writer** → Writes comprehensive tests
6. **doc-updater** → Updates documentation

### Optimization Flow
1. **prompt-engineer** → Optimizes AI prompts in service layer
2. **test-writer** → Adds tests to verify improvements
3. **doc-updater** → Documents prompt changes

### API Integration Flow
1. **technical-architect** → Reviews API design approach
2. **api-integration** → Implements service layer method
3. **test-writer** → Tests API integration
4. **doc-updater** → Documents new API method

## Future Agent Ideas

Consider adding agents for:
- **refactor-assistant**: Safely refactor complex components
- **performance-optimizer**: Analyze and optimize React performance
- **accessibility-auditor**: Check components for a11y compliance
- **migration-helper**: Assist with library upgrades

## Learn More

- [Claude Code Sub-agents Documentation](https://docs.claude.com/en/docs/claude-code/subagents)
- [Main Project Documentation](../../../CLAUDE.md)
- [Hooks Configuration](../hooks.json)
