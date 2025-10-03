// Core domain types
export type RequestStage = 'Intake' | 'Scoping' | 'Ready for Dev' | 'In Progress' | 'Review' | 'Completed';
export type Priority = 'High' | 'Medium' | 'Low';
export type UserMode = 'guided' | 'collaborative' | 'expert';
export type DocType = 'brd' | 'fsd' | 'techSpec';
export type ViewType = 'requester' | 'dev' | 'management';
export type TabType = 'submit' | 'dashboard' | 'kanban' | 'detail' | 'analytics';
export type SLAStatus = 'on-time' | 'at-risk' | 'overdue';

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
