// Core domain types
export type RequestStage = 'Intake' | 'Scoping' | 'Ready for Dev' | 'In Progress' | 'Review' | 'Completed';
export type Priority = 'High' | 'Medium' | 'Low';
export type UserMode = 'guided' | 'collaborative' | 'expert';
export type DocType = 'brd' | 'fsd' | 'techSpec';
// TODO: When adding 5th+ view, refactor to RoleConfig pattern (see docs/architecture/state-management.md)
export type ViewType = 'requester' | 'dev' | 'management' | 'product-owner';
export type TabType = 'submit' | 'dashboard' | 'kanban' | 'detail' | 'analytics';
export type SLAStatus = 'on-time' | 'at-risk' | 'overdue';
export type Theme = 'light' | 'dark';

// Activity log entry
export interface ActivityItem {
  timestamp: string;
  action: string;
  user: string;
}

// SLA tracking data
export interface SLAData {
  targetCompletionDate: string;
  daysRemaining: number;
  status: SLAStatus;
  daysOverdue?: number;
  stageDurations?: Record<RequestStage, number>;
}

// Impact assessment data (Phase 1: AI-driven scoring)
export interface ImpactAssessment {
  // Core scoring
  totalScore: number;           // 0-100 composite score

  // Score breakdown (must sum to totalScore)
  breakdown: {
    revenueImpact: number;      // 0-30 points
    userReach: number;          // 0-25 points
    strategicAlignment: number; // 0-20 points
    urgency: number;            // 0-15 points
    quickWinBonus: number;      // 0-10 points
  };

  // Assessment metadata
  tier: 1 | 2 | 3;             // 1=auto (AI), 2=manual (Product Owner), 3=business case
  assessedAt: string;          // ISO 8601 timestamp
  assessedBy: 'AI' | string;   // 'AI' or user ID
  justification: string;        // AI-generated summary or manual notes

  // Phase 2 additions (optional for manual assessments)
  dependencies?: string[];      // Blocking factors
  risks?: string[];            // Implementation risks
  customerCommitment?: boolean; // Was this promised to customer?
  competitiveIntel?: string;   // Competitive positioning notes
}

// Main request/ticket entity
export interface Request {
  id: string;
  title: string;
  status: string;
  owner: string; // Developer assigned to work on this
  submittedBy?: string; // Requester who submitted this
  priority: Priority;
  clarityScore: number;
  daysOpen: number;
  stage: RequestStage;
  lastUpdate: string;
  activity?: ActivityItem[];
  aiAlert?: string | null;
  timeline?: string;
  sla?: SLAData;
  createdAt?: string;
  complexity?: 'simple' | 'medium' | 'complex';
  impactAssessment?: ImpactAssessment; // Optional for backward compatibility
}

// Chat message
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Request data collected during intake
export interface RequestData {
  title?: string;
  problem?: string;
  success?: string;
  systems?: string[];
  urgency?: string;
  stakeholders?: string[];
}

// Document approval data
export interface DocumentApproval {
  approved: boolean;
  approver?: string;
  approverRole?: ViewType; // Track which role approved (for audit trail)
  date?: string;
}

// Generated documents
export interface GeneratedDocs {
  brd: string;
  fsd: string;
  techSpec: string;
  approvals?: {
    brd: DocumentApproval;
    fsd: DocumentApproval;
    techSpec: DocumentApproval;
  };
}

// Team member capacity tracking
export interface TeamMember {
  name: string;
  role: string;
  activeRequests: number;
  maxCapacity: number;
  utilization: number;
  skills: string[];
}

// API routing response
export interface RoutingInfo {
  owner: string;
  type: string;
  complexity: string;
  timeline: string;
  priority: Priority;
}

// API request/response types
export interface ClaudeApiRequest {
  model: string;
  max_tokens: number;
  messages: Array<{
    role: string;
    content: string;
  }>;
}

export interface ClaudeApiResponse {
  content: Array<{
    text: string;
  }>;
}
