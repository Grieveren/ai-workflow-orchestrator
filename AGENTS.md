# Repository Guidelines

## Project Structure & Module Organization
The Vite-powered React client lives in `src/`, with feature-oriented folders: `components/` for reusable UI, `features/` and `pages/` for workflows, `services/` for API helpers, `contexts/` and `hooks/` for shared state, plus `utils/` and `constants/` for cross-cutting logic. Tests and fixtures sit under `src/test/` alongside component-level `*.test.tsx`. The Express proxy in `server.js` handles Anthropic API calls; static assets built by Vite land in `dist/`. Place reference material and diagrams in `docs/`.

## Build, Test, and Development Commands
Run `npm run dev:full` to launch the Express proxy and Vite dev server together. Use `npm run server` when touching the proxy alone, and `npm run dev` for client-only work. Provide `ANTHROPIC_API_KEY` in `.env` before hitting `/api/chat`. Build output with `npm run build` (TypeScript check + production bundle) and preview via `npm run preview`. Quality gates: `npm run lint` runs ESLint, while `npm test` executes Vitest in watch mode; append `--run` (or `npm run test:run`) for CI-style runs, and `npm run test:ui` to inspect failures in the Vitest UI.

## Coding Style & Naming Conventions
TypeScript and modern React (hooks, function components) are required. Prefer feature-folder organization and the `@/` alias for cross-feature imports. Use Tailwind 4 utility classes in JSX; co-locate component styles via `index.css` tokens when utilities fall short. Follow ESLint/TypeScript recommendations shipped in `eslint.config.mjs`; respect 2-space indentation, semicolons, and camelCase for variables/functions with PascalCase for components. Format with Prettier defaults (`npx prettier --check .`) before pushing.

## Testing Guidelines
Write component and hook tests with Vitest plus Testing Library helpers. Name files `*.test.ts(x)` and colocate near the code under test or in `src/test/`. Extend shared mocks in `src/test/setup.ts` instead of redefining. Keep coverage high on routing flows, Anthropic request handling, and stream parsing; exercise the stream handler via mocked fetch responses.

## Commit & Pull Request Guidelines
Commit subjects follow the style seen in `git log`—concise, imperative, and scoped (e.g., `Improve UX: hide examples instantly`). Bundle related changes per commit. PRs must describe the change, list impacted routes/services, and link issues or tasks. Include screenshots or terminal output for UI and CLI updates, and confirm lint/tests ran (`npm run lint && npm run test:run`). Surface security-sensitive configuration changes (`.env`, `server.js`) explicitly.
