# Database Persistence

The AI Workflow Orchestrator uses **SQLite** for server-side data persistence, providing a lightweight yet robust solution for storing workflow requests, impact assessments, and activity logs.

## Architecture Overview

**Storage Layer**: SQLite database (`./workflow.db`) running on the Express backend (port 3001)

**Access Pattern**: REST API endpoints (`/api/requests`) accessed via `src/services/api.ts`

**Client Integration**: `useRequests` hook implements optimistic updates for instant UI responsiveness

**Benefits**:
- Zero-configuration embedded database
- ACID compliance with transaction support
- No external database server required
- Perfect for demo/portfolio projects
- Production-ready for single-server deployments

## Database Schema

### Tables

#### `requests`
Primary table storing workflow request metadata.

```sql
CREATE TABLE requests (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  owner TEXT NOT NULL,
  submitted_by TEXT NOT NULL,
  priority TEXT NOT NULL,
  clarity_score INTEGER,
  days_open INTEGER NOT NULL,
  stage TEXT NOT NULL,
  last_update TEXT NOT NULL,
  complexity TEXT,
  timeline TEXT,
  ai_alert TEXT,
  created_at TEXT NOT NULL
);
```

**Indexes**: `status`, `owner`, `stage`, `created_at`

#### `impact_assessments`
Stores AI-generated and manually-adjusted impact scores (optional 1:1 relationship with requests).

```sql
CREATE TABLE impact_assessments (
  request_id TEXT PRIMARY KEY,
  total_score INTEGER NOT NULL,
  revenue_impact INTEGER NOT NULL,
  user_reach INTEGER NOT NULL,
  strategic_alignment INTEGER NOT NULL,
  urgency INTEGER NOT NULL,
  quick_win_bonus INTEGER NOT NULL,
  tier INTEGER NOT NULL,
  assessed_at TEXT NOT NULL,
  assessed_by TEXT NOT NULL,
  justification TEXT NOT NULL,
  dependencies TEXT,
  risks TEXT,
  customer_commitment INTEGER DEFAULT 0,
  competitive_intel TEXT,
  FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
);
```

**Constraints**:
- `total_score`: 0-100
- Tier: 1 (AI auto), 2 (manual refinement), 3 (business case)
- `customer_commitment`: Boolean stored as INTEGER (0/1)
- `dependencies` and `risks`: Newline-delimited strings

#### `documents`
Stores generated BRD/FSD/Tech Spec documents (currently not populated - future enhancement).

```sql
CREATE TABLE documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id TEXT NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
);
```

**Index**: `request_id`

#### `activities`
Activity timeline for each request (1:many relationship).

```sql
CREATE TABLE activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  action TEXT NOT NULL,
  user TEXT NOT NULL,
  FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
);
```

**Index**: `request_id`

## REST API Endpoints

All endpoints are served by the Express backend at `http://localhost:3001/api/requests`.

### `GET /api/requests`
Fetch all requests with activities and impact assessments.

**Response**:
```json
[
  {
    "id": "REQ-001",
    "title": "...",
    "status": "Scoping",
    "activity": [...],
    "impactAssessment": {...}
  }
]
```

**Performance Optimization**: Fetches all activities in a single query, groups in memory by `request_id` to avoid N+1 query problem.

### `GET /api/requests/:id`
Fetch a single request by ID.

**Response**: Same structure as above, single object.

### `POST /api/requests`
Create a new request.

**Request Body**: Full `Request` object (see `src/types/index.ts`)

**Response**: Created request with server-generated fields

### `PATCH /api/requests/:id`
Update an existing request.

**Request Body**: Partial updates (only fields to change)

```json
{
  "stage": "In Progress",
  "owner": "Sarah Chen",
  "lastUpdate": "Just now",
  "activity": [
    {"timestamp": "Just now", "action": "...", "user": "..."}
  ],
  "impactAssessment": {...}
}
```

**Transaction Handling**: All operations wrapped in `db.transaction()` for atomicity. If any operation fails, entire update rolls back.

**Response**: `{ "success": true }`

### `DELETE /api/requests/:id`
Delete a request (CASCADE deletes impact assessment and activities).

**Response**: `{ "success": true }`

## Helper Functions

Three helper functions in `server.js` ensure consistent data transformation:

### `transformImpactAssessment(row)`
Converts database row to `ImpactAssessment` object.

- Handles nullable fields
- Splits newline-delimited strings (`dependencies`, `risks`)
- Converts INTEGER to boolean (`customer_commitment`)
- Returns `undefined` if no impact assessment exists

### `transformRequest(row, activities, impactAssessment)`
Converts database row to `Request` object with nested relationships.

### `insertActivities(db, requestId, activities)`
Bulk inserts activity log entries for a request. Used by GET, POST, and PATCH endpoints.

## Client Integration

### API Service Layer (`src/services/api.ts`)

Five database methods mirror the REST endpoints:

```typescript
api.getAllRequests(): Promise<Request[]>
api.getRequestById(id: string): Promise<Request>
api.createRequest(request: Request): Promise<Request>
api.updateRequest(id: string, updates: Partial<Request>): Promise<{success: boolean}>
api.deleteRequest(id: string): Promise<{success: boolean}>
```

### Optimistic Updates Pattern

The `useRequests` hook implements optimistic UI updates for instant responsiveness:

```typescript
const updateRequestStage = async (requestId, newStage, note, user) => {
  const previousRequests = requests; // Capture before mutation

  try {
    // 1. Update UI immediately (optimistic)
    setRequests(requests.map(req =>
      req.id === requestId ? { ...req, stage: newStage } : req
    ));

    // 2. Persist to database asynchronously
    await api.updateRequest(requestId, { stage: newStage });
  } catch (error) {
    // 3. Rollback UI on database error
    setRequests(previousRequests);
    console.error('Failed to update request:', error);
  }
};
```

**Critical Pattern**: `previousRequests` must be captured BEFORE the optimistic update. Using `requests` in the catch block would be a no-op (setting current state to current state).

### Loading States

The `useRequests` hook exposes `loading` and `error` states:

```typescript
const { requests, loading, error } = useRequests();

if (loading) return <div>Loading requests...</div>;
if (error) return <div>Error: {error}</div>;
```

## Initialization and Seeding

On server startup, `initializeDatabase()` performs:

1. **Schema creation** (IF NOT EXISTS - safe for restarts)
2. **Index creation** for query performance
3. **Seeding** with 3 mock requests (if database is empty)

Seeded requests demonstrate:
- Different workflow stages (Scoping, Ready for Dev, In Progress)
- Impact assessments with various scores
- Activity logs with multiple entries
- Different owners and priorities

## Security Considerations

### Input Validation
- **Parameterized queries** (`db.prepare()` with `?` placeholders) prevent SQL injection
- **Field whitelisting** in PATCH endpoint (only allowed fields can be updated)
- **CORS restriction** to `http://localhost:3000` only

### Limitations (Demo/Portfolio Context)
- ❌ No rate limiting
- ❌ No authentication/authorization
- ❌ No input sanitization beyond SQL injection prevention
- ❌ No audit logging of database changes

**Note**: These are acceptable for demo/portfolio projects but would be REQUIRED for production.

## Performance Optimizations

### Query Optimization
- **N+1 prevention**: Batch-fetch all activities in single query (GET /api/requests)
- **Indexed columns**: `status`, `owner`, `stage`, `created_at` for fast filtering
- **Transaction batching**: All PATCH operations grouped in single transaction

### Transformation Caching
Helper functions extract transformation logic into reusable functions, reducing code duplication and improving maintainability.

## Database File Management

**Location**: `./workflow.db` (project root)

**Gitignore**: Automatically excluded (`.gitignore` lines 36-40 cover `*.db`, `*.sqlite`, `*.sqlite3`)

**Test Database**: `./workflow.test.db` used when `NODE_ENV=test`

**Reset Database**: Delete `workflow.db` file, restart server → fresh database seeded with mock data

## Migration Path

For production deployment, consider:

1. **Multi-user support**: Add authentication and row-level security
2. **Horizontal scaling**: Migrate to PostgreSQL or MySQL for multi-server deployments
3. **Backup strategy**: Implement automated backups (SQLite supports hot backups)
4. **Document persistence**: Populate `documents` table with generated BRD/FSD/Tech Spec content
5. **Audit logging**: Track who changed what and when for compliance

## Related Documentation

- [Dual-Server Architecture](dual-server.md) - Backend proxy server architecture
- [State Management](state-management.md) - React Context + database integration
- [API Service Layer](../features/impact-assessment.md) - Impact scoring and assessment
