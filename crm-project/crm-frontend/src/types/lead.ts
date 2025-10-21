// Lead Types based on backend schema

export interface Lead {
  id: number;
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
