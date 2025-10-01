# AI Workflow Orchestrator

A modern React application for managing workflow requests with AI-powered assistance. This tool helps teams submit, track, and manage requests through an intelligent chatbot interface with automated routing and requirement generation.

## Features

- **AI-Powered Intake**: Conversational chatbot collects requirements from users
- **Smart Routing**: Automatically routes requests to the right team member
- **Requirement Generation**: AI generates BRD, FSD, and Technical Specifications
- **Dashboard**: Track all requests with status, priority, and clarity scores
- **Kanban Board**: Visual workflow management across stages
- **Dual View**: Switch between Requester and Developer perspectives

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React (icons)
- Express.js (backend proxy server)
- Anthropic Claude API

## Prerequisites

- Node.js 18+
- npm or yarn
- Anthropic API key

## Setup

1. **Clone or navigate to the project directory**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API Key**

   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=your_actual_api_key_here
   ```

   **Security Note**: The API key is used server-side only. The application uses an Express proxy server to keep your API key secure and never exposes it to the browser.

## Running the Application

### Development Mode

You need to run both the backend proxy server and the frontend:

**Option 1: Run both servers simultaneously (recommended)**
```bash
npm run dev:full
```

**Option 2: Run servers in separate terminals**

Terminal 1 - Backend proxy server:
```bash
npm run server
```

Terminal 2 - Frontend dev server:
```bash
npm run dev
```

The backend proxy runs on `http://localhost:3001` and the frontend opens at `http://localhost:3000`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Project Structure

```
ai-workflow-orchestrator/
├── src/
│   ├── AIWorkflowOrchestrator.tsx  # Main component
│   ├── main.tsx                     # App entry point
│   └── index.css                    # Global styles
├── server.js                        # Express proxy server (port 3001)
├── index.html                       # HTML template
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── vite.config.ts                   # Vite config
├── tailwind.config.js               # Tailwind CSS config
├── postcss.config.js                # PostCSS config
├── .env.example                     # Environment template
├── CLAUDE.md                        # Documentation for Claude Code
└── README.md                        # This file
```

## Usage

### Submit a New Request
1. Click "New Request"
2. Describe your need in plain English
3. Answer the AI assistant's questions
4. Submit when complete

### View Dashboard
- See all active requests
- Click any request to view details
- Track progress through stages

### Generate Requirements
1. Open a request in "Scoping" stage
2. Choose your experience level (Guided/Collaborative/Expert)
3. AI generates BRD, FSD, and Technical Spec
4. Refine documents with AI assistance
5. Export or approve for development

### Switch Views
- **Requester View**: Submit and track your requests
- **Dev View**: Accept work, update progress, mark complete

## Architecture Notes

- The application uses a **backend proxy server** (`server.js`) to securely handle Anthropic API calls
- The API key is stored server-side only and never exposed to the browser
- All Claude API requests from the frontend are routed through `http://localhost:3001/api/chat`
- Uses Claude Sonnet 4.5 model (`claude-sonnet-4-5-20250929`)
- Single-component React architecture with all state managed via `useState` hooks
- No database - all state is stored client-side only

## Security

- Keep your `.env` file secure and never commit it to version control
- The `.env` file is already in `.gitignore`
- API key is only accessible server-side via the Express proxy
