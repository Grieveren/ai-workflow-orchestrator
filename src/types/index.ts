// Core domain types
export type RequestStage = 'Intake' | 'Scoping' | 'Ready for Dev' | 'In Progress' | 'Review' | 'Completed';
export type Priority = 'High' | 'Medium' | 'Low';
export type UserMode = 'guided' | 'collaborative' | 'expert';
export type DocType = 'brd' | 'fsd' | 'techSpec';
export type ViewType = 'requester' | 'dev';
export type TabType = 'submit' | 'dashboard' | 'kanban' | 'detail';

// Activity log entry
export interface ActivityItem {
  timestamp: string;
  action: string;
  user: string;
}

// Main request/ticket entity
export interface Request {
  id: string;
  title: string;
  status: string;
  owner: string;
  priority: Priority;
  clarityScore: number;
  daysOpen: number;
  stage: RequestStage;
  lastUpdate: string;
  activity?: ActivityItem[];
  aiAlert?: string | null;
  timeline?: string;
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

// Generated documents
export interface GeneratedDocs {
  brd: string;
  fsd: string;
  techSpec: string;
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
