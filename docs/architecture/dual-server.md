# Dual-Server Architecture

## Overview

The application uses a dual-server architecture to keep the Anthropic API key secure while providing a responsive development experience.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser)                         │
│                                                              │
│  React App (port 3000)                                       │
│  - UI Components                                             │
│  - State Management (Context + Hooks)                        │
│  - API Service Layer (src/services/api.ts)                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                  ┌────┴─────┐
                  │          │
     HTTP POST    │          │  HTTP GET/POST/PATCH/DELETE
     /api/chat    │          │  /api/requests
     (AI calls)   │          │  (Database operations)
                  │          │
                  ▼          ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend Proxy (port 3001)                       │
│                                                              │
│  Express.js Server (server.js)                               │
│  - Claude API forwarding (injects API key)                   │
│  - SQLite database (./workflow.db)                           │
│  - REST API endpoints for CRUD operations                    │
│  - Optimistic update support                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTPS
                       │ (API key in headers)
                       ▼
               ┌───────────────────┐
               │  Anthropic API    │
               │  (Claude Sonnet)  │
               └───────────────────┘
```

## Why This Architecture?

### Security
**Problem**: If the API key is in the frontend code (even in `.env`), it gets bundled and exposed to the browser.

**Solution**: The backend proxy keeps the API key server-side only.

```typescript
// ❌ WRONG - Frontend code
const response = await fetch('https://api.anthropic.com/v1/messages', {
  headers: {
    'x-api-key': process.env.VITE_API_KEY  // Exposed in bundle!
  }
});

// ✅ CORRECT - Frontend code
const response = await fetch('http://localhost:3001/api/chat', {
  // No API key needed here
});
```

### Simplicity
The frontend doesn't need to handle:
- API key management
- Model name configuration
- Anthropic-specific headers
- API versioning

All Claude-specific logic lives in one place: `server.js`

## Components

### Frontend (Vite Dev Server - Port 3000)

**File**: `src/services/api.ts`

```typescript
const API_URL = 'http://localhost:3001/api/chat';

async function callClaude(request: ApiRequest): Promise<string> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,  // Injected by backend, but specified here
      max_tokens: request.max_tokens || 2000,
      messages: request.messages
    })
  });

  const data = await response.json();
  return data.content[0].text;
}
```

**Key points**:
- All API calls go through localhost:3001
- No API key handling
- Simple JSON POST requests
- Error handling for network/API failures

### Backend (Express Server - Port 3001)

**File**: `server.js`

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());  // Allow requests from port 3000
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,  // Injected here!
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',  // Injected here!
        ...req.body
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`API proxy server running on http://localhost:${PORT}`);
});
```

**Key points**:
- Reads API key from `.env` file (never committed to git)
- Injects model name server-side
- Forwards all request body parameters
- Handles errors and returns appropriate status codes
- CORS enabled for localhost:3000

### Database REST Endpoints

The backend also provides REST API endpoints for persistent data storage using SQLite.

**Endpoints**:

```javascript
// Fetch all requests
GET /api/requests
Response: Request[] with activities and impact assessments

// Fetch single request
GET /api/requests/:id
Response: Request object with full details

// Create new request
POST /api/requests
Body: Request object
Response: Created request

// Update request (partial updates)
PATCH /api/requests/:id
Body: Partial<Request> (only fields to update)
Response: { success: true }

// Delete request
DELETE /api/requests/:id
Response: { success: true }
```

**Performance Optimizations**:
- N+1 prevention: Batch-fetches all activities in GET /api/requests
- Transaction support: PATCH operations wrapped in `db.transaction()` for atomicity
- Indexed queries: Fast lookups on `status`, `owner`, `stage`, `created_at`

**See**: [Database Persistence Documentation](database-persistence.md) for full schema and implementation details.

## Development Workflow

### Starting Both Servers

**Option 1: Single command (recommended)**
```bash
npm run dev:full
```

This runs both servers in background:
- Backend: `node server.js` (port 3001)
- Frontend: `npm run dev` (port 3000)

**Option 2: Separate terminals**
```bash
# Terminal 1
npm run server

# Terminal 2
npm run dev
```

### Configuration

**File**: `.env` (not in git)
```
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

**File**: `.env.example` (in git)
```
ANTHROPIC_API_KEY=your_api_key_here
```

## Request Flow Example

### User Action: Submit New Request

1. **User types in chat** → Enters "I need help with data export"

2. **Frontend calls API service**:
   ```typescript
   const response = await api.startIntakeConversation("I need help...");
   ```

3. **Service layer makes HTTP request**:
   ```typescript
   fetch('http://localhost:3001/api/chat', {
     method: 'POST',
     body: JSON.stringify({
       model: 'claude-sonnet-4-5-20250929',
       max_tokens: 2048,
       messages: [{ role: 'user', content: 'I need help...' }]
     })
   })
   ```

4. **Backend proxy receives request**:
   - Extracts body
   - Adds `x-api-key` header from `process.env.ANTHROPIC_API_KEY`
   - Forwards to `https://api.anthropic.com/v1/messages`

5. **Anthropic API processes**:
   - Validates API key
   - Generates response with Claude Sonnet 4.5
   - Returns JSON with content

6. **Backend proxy forwards response**:
   - Passes response through to frontend
   - Includes error handling

7. **Frontend receives response**:
   - Parses JSON
   - Extracts text from `content[0].text`
   - Updates UI with chatbot message

## Security Considerations

### What's Protected ✅
- API key never in frontend bundle
- API key never in git repository
- API key only in server-side `.env` file
- CORS restricts which origins can call backend

### What to Avoid ❌
- Never use `VITE_` prefix for API key (exposes to frontend)
- Never commit `.env` file
- Never call `api.anthropic.com` directly from frontend
- Never log API key to console

### Best Practices
- `.env` in `.gitignore`
- `.env.example` shows structure without real keys
- Backend validates requests (could add rate limiting)
- Error messages don't expose sensitive info

## Production Considerations

For production deployment, this architecture needs modification:

### Option 1: Single Server
Deploy backend and frontend together:
- Build frontend: `npm run build`
- Serve static files from Express
- Single deployment, single domain

### Option 2: Separate Deployments
- Frontend: Deploy to Vercel/Netlify
- Backend: Deploy to Railway/Render
- Update `API_URL` to production backend URL
- Configure CORS for production frontend domain

### Option 3: Serverless
- Frontend: Static hosting (S3/Netlify)
- Backend: Serverless function (Vercel/Lambda)
- Cold starts consideration for API proxy

## Troubleshooting

### "Failed to fetch" errors

**Symptom**: Frontend shows network errors

**Check**:
1. Is backend running? `lsof -ti:3001`
2. Is frontend using correct URL? (localhost:3001)
3. Is CORS configured in backend?

### "API error: 401"

**Symptom**: Unauthorized errors from Anthropic

**Check**:
1. Is `.env` file present?
2. Is `ANTHROPIC_API_KEY` set correctly?
3. Is key valid? (not expired/revoked)
4. Backend reading `.env`? (dotenv.config())

### "Connection refused"

**Symptom**: Can't connect to backend

**Check**:
1. Backend server running?
2. Port 3001 available? (not in use by another process)
3. Firewall blocking localhost:3001?

## Testing

### Manual Testing
```bash
# Test backend directly
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4-5-20250929",
    "max_tokens": 100,
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### Automated Testing
Mock the backend in tests:
```typescript
// In tests
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      content: [{ text: 'Mocked response' }]
    })
  })
);
```

## Future Enhancements

Potential improvements:
- **Rate limiting**: Prevent API abuse
- **Caching**: Reduce redundant API calls
- **Request validation**: Validate inputs before forwarding
- **Monitoring**: Log API usage, errors, latency
- **Authentication**: Add user auth to backend
- **WebSocket**: For real-time features (notifications)

## Summary

The dual-server architecture provides:
- ✅ Security through API key isolation
- ✅ Simple frontend code (no auth logic)
- ✅ Centralized configuration (model, version)
- ✅ Development flexibility (HMR on frontend)
- ✅ Production-ready pattern (easily deployable)

**Key takeaway**: Both servers MUST run for the application to function. Use `npm run dev:full` to start both.
