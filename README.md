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
   VITE_ANTHROPIC_API_KEY=your_actual_api_key_here
   ```

4. **Update the component to use environment variable**

   In `src/AIWorkflowOrchestrator.tsx`, replace hardcoded API calls with:
   ```typescript
   const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

   // Then in fetch headers:
   headers: {
     "Content-Type": "application/json",
     "x-api-key": ANTHROPIC_API_KEY,
     "anthropic-version": "2023-06-01"
   }
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```
The app will open at `http://localhost:3000`

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
├── index.html                       # HTML template
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── vite.config.ts                   # Vite config
├── tailwind.config.js               # Tailwind CSS config
├── postcss.config.js                # PostCSS config
├── .env.example                     # Environment template
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

## Notes

- The API key is required for AI functionality
- All API calls use Claude Sonnet 4.5 model
- Keep your `.env` file secure and never commit it to version control
