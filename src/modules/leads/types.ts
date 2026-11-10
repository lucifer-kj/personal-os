export type LeadStatus = 'lead' | 'contacted' | 'qualified' | 'converted' | 'lost';

export type LeadSource =
  | 'apollo'
  | 'hunter'
  | 'linkedin'
  | 'website'
  | 'inbound_email'
  | 'referral'
  | 'manual'
  | 'n8n_scraper';

export type LeadActivityType =
  | 'email_sent'
  | 'email_received'
  | 'call'
  | 'meeting'
  | 'note_added'
  | 'status_changed'
  | 'enrichment'
  | 'n8n_trigger';

export interface Lead {
  id: string;
  user_id: string;
  status: LeadStatus;
  source: LeadSource;
  first_name?: string | null;
  last_name?: string | null;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  job_title?: string | null;
  website?: string | null;
  linkedin_url?: string | null;
  location?: string | null;
  score: number; // 0 - 100
  estimated_value_cents: number;
  enrichment_data: Record<string, unknown>;
  notes?: string | null;
  converted_project_id?: string | null;
  converted_at?: string | null;
  last_contacted_at?: string | null;
  archived_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadActivity {
  id: string;
  user_id: string;
  lead_id: string;
  activity_type: LeadActivityType;
  summary: string;
  details: Record<string, unknown>;
  created_at: string;
}

export interface CreateLeadDTO {
  full_name: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  job_title?: string | null;
  website?: string | null;
  linkedin_url?: string | null;
  location?: string | null;
  source?: LeadSource;
  score?: number;
  estimated_value_cents?: number;
  enrichment_data?: Record<string, unknown>;
  notes?: string | null;
}

export interface UpdateLeadDTO {
  status?: LeadStatus;
  source?: LeadSource;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  job_title?: string | null;
  website?: string | null;
  linkedin_url?: string | null;
  location?: string | null;
  score?: number;
  estimated_value_cents?: number;
  enrichment_data?: Record<string, unknown>;
  notes?: string | null;
  last_contacted_at?: string | null;
  archived_at?: string | null;
}

export interface ConvertLeadDTO {
  project_name?: string;
  project_description?: string;
  estimated_value_cents?: number;
}

export interface ConvertLeadResult {
  success: boolean;
  lead_id: string;
  project_id: string;
  task_id: string;
  already_converted: boolean;
}

export interface LeadFilter {
  status?: LeadStatus;
  source?: LeadSource;
  search?: string;
  min_score?: number;
  limit?: number;
  offset?: number;
}
