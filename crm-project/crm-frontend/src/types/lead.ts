// Lead Types based on backend schema

export interface Lead {
  id: number | string; // GraphQL ID type returns string
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  budget?: number;
  location?: string;
  company?: string;
  source?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  interactions?: Interaction[];
  tasks?: Task[];
  summary?: string;
  summaryGeneratedAt?: string;
  activityScore?: number;
  scoreCalculatedAt?: string;
}

export interface Interaction {
  id: number;
  type: InteractionType;
  date: string;
  notes?: string;
  leadId: number;
  createdAt: string;
}

export const InteractionType = {
  CALL: 'call',
  EMAIL: 'email',
  MEETING: 'meeting',
} as const;

export type InteractionType = typeof InteractionType[keyof typeof InteractionType];

export interface CreateLeadInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  budget?: number;
  location?: string;
  company?: string;
  source?: string;
  status?: string;
}

export interface UpdateLeadInput {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  budget?: number;
  location?: string;
  company?: string;
  source?: string;
  status?: string;
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';

export type LeadSource = 'Website' | 'Referral' | 'LinkedIn' | 'Email Campaign' | 'Trade Show' | 'Webinar' | 'Cold Call';

// Task Types
export const TaskSource = {
  MANUAL: 'MANUAL',
  AI_SUGGESTED: 'AI_SUGGESTED',
  DISMISSED: 'DISMISSED',
} as const;

export type TaskSource = typeof TaskSource[keyof typeof TaskSource];

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  source: TaskSource;
  aiReasoning?: string;
  leadId: number;
  createdAt: string;
  updatedAt: string;
}
