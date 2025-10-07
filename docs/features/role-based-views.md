# Role-Based View System

The AI Workflow Orchestrator provides four distinct user experiences with automatic request filtering, scoped data display, and role-specific navigation. Each view is tailored to a specific workflow role, ensuring users only see relevant information and can only perform authorized actions.

## Overview

**View Types:**
- **Requester**: Submit and track personal requests (read-only after submission)
- **Product Owner**: Review and refine requirements in Scoping stage
- **Developer**: Manage assigned work and team workflow
- **Management**: Full portfolio oversight with analytics (read-only)

**Key Features:**
- Automatic request filtering based on role
- Role-specific navigation options
- Scoped statistics and dashboard widgets
- Permission-based action controls
- Auto-navigation on view change (all redirect to Dashboard)

## Requester View

**Demo User:** Jessica Martinez

### Navigation
- **Dashboard** → New Request
- Limited to submission and tracking pages

### Request Filtering
Shows only requests submitted by the current user (matched by `submittedBy` field).

**Example:** Jessica Martinez sees only her own requests (REQ-001, REQ-005), not Alex Rivera's or Sarah Chen's requests.

### Stats Display
- **"Needs Attention"**: Shows only alerts for the user's own requests
- **Standard Counts**: Request counts by stage and priority (limited to owned requests)

### Widget Visibility
- **TeamCapacityWidget**: Hidden (not relevant to requesters)

### Table Columns
- **"Requester" column**: Hidden (viewing only own requests, so column is redundant)

### Capabilities
- ✅ Submit new requests via chatbot
- ✅ View status of submitted requests
- ✅ Read request details and activity log
- ❌ Cannot modify requests after submission
- ❌ Cannot generate or approve documents (Product Owner responsibility)
- ❌ Cannot change request stage or priority

### Access Restrictions
- Read-only access to all submitted requests
- Cannot access other users' requests
- Cannot perform Product Owner or Developer actions

### Auto-navigation
Switches to Dashboard when view changes (e.g., switching from Requester → Product Owner redirects to `/dashboard`).

## Product Owner View

**Demo User:** Alex Rivera

### Navigation
- **Dashboard** → Kanban Board → Analytics
- Full navigation menu access

### Request Filtering
Shows only requests in **"Scoping" stage** (PO work queue).

**Rationale:** Product Owners focus on requirements gathering and document approval. Once a request moves to "Ready for Dev", it exits the PO's queue and becomes the Developer's responsibility.

### Stats Display
- **"Pending Review"**: Scoping requests without all three approved documents
- **"Approved Today"**: Requests moved to "Ready for Dev" today (successful completions)
- **"Needs Attention"**: Alerts only for Scoping stage requests

### Widget Visibility
- **TeamCapacityWidget**: Displayed (helps PO understand dev capacity before approving work)

### Table Columns
- **"Requester" column**: Visible (shows request origins for stakeholder context)

### Kanban Cards
Display `submittedBy` field to show request origins.

### Capabilities
- ✅ Generate BRD/FSD/Tech Spec documents (exclusive right during Scoping)
- ✅ Approve all three documents (sequential quality gates)
- ✅ Move requests from Scoping → Ready for Dev (only after all docs approved)
- ✅ Refine documents based on stakeholder feedback
- ✅ Adjust AI impact scores (Tier 2 manual refinement via `ImpactAdjustmentModal`)
- ❌ Cannot see requests outside Scoping stage
- ❌ Cannot perform Developer actions (assign work, update implementation status)

### Access Restrictions
**Stage-based scoping:**
- Can only see/modify requests in "Scoping" stage
- Cannot access "Ready for Dev", "In Progress", "Review", or "Completed" stages
- Cannot change request stages except Scoping → Ready for Dev (with approval gate)

**Permission checks** (`src/utils/permissions.ts`):
- `canGenerateDocuments(view, stage)` → True only for Product Owner in Scoping
- `canApproveDocuments(view, stage)` → True only for Product Owner in Scoping
- `canUpdateStage(view, fromStage, toStage)` → Validates PO can only move Scoping → Ready for Dev

### Auto-navigation
Switches to Dashboard when view changes.

## Developer View

**Demo User:** Sarah Chen

### Navigation
- **Dashboard** → Kanban Board → Analytics
- Full navigation menu access

### Request Filtering
Shows **"Ready for Dev" + assigned requests** (available work pool).

**Rationale:** Developers see work that's ready to be picked up (approved by Product Owner) plus any requests already assigned to them (In Progress, Review stages).

### Stats Display
- **"My Active Requests"**: Currently assigned work (In Progress + Review)
- **"My Completed Today"**: Requests completed today by the developer
- **"Needs Attention"**: Alerts only for assigned requests

### Widget Visibility
- **TeamCapacityWidget**: Displayed (helps developers understand team load)

### Table Columns
- **"Requester" column**: Visible (shows request origins for context)

### Kanban Cards
Display `submittedBy` field to show request origins.

### Capabilities
- ✅ Pick up work from "Ready for Dev" pool
- ✅ Update status: Ready for Dev → In Progress → Review → Completed
- ✅ View approved documents (BRD/FSD/Tech Spec are read-only)
- ✅ Complete implementation work
- ❌ Cannot see requests in "Scoping" stage (Product Owner responsibility)
- ❌ Cannot generate or approve documents (Product Owner responsibility)
- ❌ Can only work on requests after PO has approved all documents

### Access Restrictions
**Stage-based scoping:**
- Cannot see "Scoping" stage requests (PO-owned)
- Can only see "Ready for Dev" + personally assigned requests

**Permission checks** (`src/utils/permissions.ts`):
- `canGenerateDocuments(view, stage)` → False (developer cannot generate docs)
- `canApproveDocuments(view, stage)` → False (developer cannot approve docs)
- `canUpdateStage(view, fromStage, toStage)` → Validates developer can move Ready for Dev → Completed

### Automatic Assignment
When a developer transitions a request to "In Progress" stage, the `owner` field automatically updates to the current developer. This ensures the request remains visible in the developer's view filtering (assigned requests).

**Example:**
```typescript
// Before transition: owner = "Alex Rivera" (PO)
// After transition to In Progress: owner = "Sarah Chen" (Dev)
```

### Auto-navigation
Switches to Dashboard when view changes.

## Management View

**Demo User:** Management persona (full oversight)

### Navigation
- **Dashboard** → Kanban Board → Analytics
- Full navigation menu access

### Request Filtering
Shows **ALL requests across all stages** (no filtering).

**Rationale:** Management needs complete portfolio visibility for strategic decision-making and resource allocation.

### Stats Display
- **"Needs Attention"**: Shows all alerts across entire portfolio
- **Full Portfolio Statistics**: All stages, all priorities, all team members

### Widget Visibility
- **TeamCapacityWidget**: Displayed (critical for resource management)

### Table Columns
- **"Requester" column**: Visible (full transparency)

### Kanban Cards
Display `submittedBy` field for complete context.

### Capabilities
- ✅ Read-only oversight of entire workflow
- ✅ View all requests regardless of stage
- ✅ Monitor team capacity and SLA compliance
- ✅ Access analytics and portfolio metrics
- ❌ Cannot modify requests (read-only)
- ❌ Cannot generate, approve, or update documents
- ❌ Cannot change request stages or assignments

### Access Restrictions
**Read-only access:**
- Can view all data but cannot make modifications
- All action buttons disabled (Generate Documents, Approve, Update Stage)
- Activity log shows "View-only access" warnings for management users

**Permission checks** (`src/utils/permissions.ts`):
- `isReadOnly(view, stage)` → Always returns `true` for Management view

### Auto-navigation
Switches to Dashboard when view changes.

## Implementation Details

### View State Management
View state is managed in `AppContext` (src/contexts/AppContext.tsx):

```typescript
const [view, setView] = useState<ViewType>('requester');
```

**ViewType enum:**
```typescript
type ViewType = 'requester' | 'product-owner' | 'dev' | 'management';
```

### Permission Logic
Centralized in `src/utils/permissions.ts`:

**Core Functions:**
- **`canGenerateDocuments(view, stage)`**: Returns `true` only for Product Owner in Scoping stage
- **`canApproveDocuments(view, stage)`**: Returns `true` only for Product Owner in Scoping stage
- **`canUpdateStage(view, fromStage, toStage)`**: Validates role-based stage transition permissions
  - PO: Scoping → Ready for Dev (only after all docs approved)
  - Dev: Ready for Dev → In Progress → Review → Completed
- **`isReadOnly(view, stage)`**: Returns `true` for:
  - Management (always read-only)
  - Requester (always read-only after submission)
  - Roles outside their workflow ownership

**Example Usage:**
```typescript
// RequestDetailPage.tsx
const canGenerate = canGenerateDocuments(view, request.status);
const canApprove = canApproveDocuments(view, request.status);
const isReadOnlyView = isReadOnly(view, request.status);

{canGenerate && (
  <Button onClick={handleGenerateDocuments}>Generate Documents</Button>
)}
```

### Filtering Logic
Request filtering implemented in:
- **DashboardPage.tsx**: Filters table rows based on view
- **KanbanPage.tsx**: Filters kanban cards based on view
- **App.tsx**: Global filtering for stats calculations

**Example (DashboardPage.tsx):**
```typescript
const filteredRequests = requests.filter(request => {
  if (view === 'requester') {
    return request.submittedBy === currentUser.name;
  } else if (view === 'product-owner') {
    return request.status === RequestStage.Scoping;
  } else if (view === 'dev') {
    return request.status === RequestStage.ReadyForDev ||
           request.owner === currentUser.name;
  } else {
    return true; // management sees all
  }
});
```

### Dynamic UI Components

**StatsBar Component:**
- Adapts displayed metrics based on `view` prop
- Shows role-specific statistics (e.g., "My Active Requests" for Dev, "Pending Review" for PO)

**RequestTable Component:**
- Adjusts column visibility based on view context
- Hides "Requester" column in Requester view (redundant)

**TeamCapacityWidget:**
- Conditionally rendered based on view type:
  ```typescript
  {view !== 'requester' && <TeamCapacityWidget />}
  ```

**RequestDetailPage:**
- Enforces permissions using `permissions.ts` utilities
- Disables action buttons for read-only views
- Shows appropriate UI for each role

### Stage Badges
Use `whitespace-nowrap` CSS class to prevent text wrapping in table cells:

```typescript
<Badge className="whitespace-nowrap">{request.status}</Badge>
```

## Navigation Flow

### Auto-Navigation on View Change
When a user switches views (via Header dropdown), the application automatically redirects to the Dashboard page:

```typescript
// AppContext.tsx
const handleViewChange = (newView: ViewType) => {
  setView(newView);
  navigate('/dashboard'); // Auto-redirect to Dashboard
};
```

**Rationale:** Each view has different filtered data. Redirecting to Dashboard ensures users see the correct filtered results immediately, avoiding confusion from stale data on other pages.

## User Experience Enhancements

### Lazy Loading
All pages use React lazy loading with code splitting for optimal performance:

```typescript
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
```

### Error Boundaries
Error boundary wraps the entire application to catch and display errors gracefully.

### Skeleton Loaders
Skeleton components display during lazy loading to improve perceived performance.

### Toast Notifications
Modern toast notifications (React Hot Toast) provide user feedback for all actions:
- Document generation started
- Document approved
- Stage transition completed
- Permission denied actions

## Testing

### Test Coverage
- **Permission utilities**: 18 tests (`permissions.test.ts`)
- **Request filtering**: 36 tests (`requestFilters.test.ts`)
- **Component rendering**: Tests for each page verify correct filtering and UI

### Key Test Scenarios
- ✅ Requester sees only own requests
- ✅ Product Owner sees only Scoping requests
- ✅ Developer sees Ready for Dev + assigned requests
- ✅ Management sees all requests
- ✅ Permission checks prevent unauthorized actions
- ✅ Stats display role-specific metrics
- ✅ Widget visibility respects view type
- ✅ Auto-navigation works on view change

## Related Documentation

- [Impact Assessment](impact-assessment.md) - How roles interact with impact scoring (PO manual adjustments)
- [State Management](../architecture/state-management.md) - View state in AppContext
- [Component Strategy](../architecture/component-strategy.md) - Permission-based component rendering
