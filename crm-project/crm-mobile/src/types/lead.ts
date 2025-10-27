/**
 * TypeScript types for Lead Management
 * Matches GraphQL schema from backend
 */

export enum InteractionType {
  CALL = 'call',
  EMAIL = 'email',
  MEETING = 'meeting',
}

export enum TaskSource {
  MANUAL = 'manual',
  AI_SUGGESTED = 'ai_suggested',
  DISMISSED = 'dismissed',
}

export interface Interaction {
  id: string;
  type: InteractionType;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  source: TaskSource;
  aiReasoning?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  budget?: number;
  location?: string;
  company?: string;
  source?: string;
  status: string;
  summary?: string;
  summaryGeneratedAt?: string;
  activityScore?: number;
  scoreCalculatedAt?: string;
  createdAt: string;
  updatedAt: string;
  interactions?: Interaction[];
  tasks?: Task[];
}

export interface LeadListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  budget?: number;
  activityScore?: number;
  status: string;
}
