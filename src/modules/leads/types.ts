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

export type ScoreTier = 'hot' | 'warm' | 'cold';

export type EngineStatus =
  | 'discovered'
  | 'filtered'
  | 'enriched'
  | 'audited'
  | 'pitch_ready'
  | 'verified'
  | 'disqualified'
  | 'error';

export type EmailReachability = 'safe' | 'risky' | 'invalid' | 'unknown';

export type ContactAuthority = 'owner' | 'authority' | 'unverified';

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

  // Lead Engine Autonomous Additions
  business_name?: string | null;
  category?: string | null;
  subcategory?: string | null;
  niche_id?: string | null;
  location_id?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  dedupe_key?: string | null;
  lighthouse_mobile?: number | null;
  lighthouse_desktop?: number | null;
  has_ssl?: boolean;
  cms_detected?: string | null;
  audit_signals?: string[];
  tech_stack_raw?: Record<string, unknown>;
  decision_maker_name?: string | null;
  decision_maker_title?: string | null;
  email_reachability?: EmailReachability;
  phone_formatted?: string | null;
  contact_authority?: ContactAuthority;
  recommended_service?: string | null;
  tailored_pitch?: string | null;
  score_tier?: ScoreTier;
  engine_status?: EngineStatus;
  engine_disqualify_reason?: string | null;
  engine_batch_id?: string | null;
  engine_last_processed_at?: string | null;

  // Joined relations (optional)
  niche?: LeadNiche;
  lead_location?: LeadLocation;
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

  // Lead Engine fields
  business_name?: string | null;
  category?: string | null;
  subcategory?: string | null;
  niche_id?: string | null;
  location_id?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  dedupe_key?: string | null;
  lighthouse_mobile?: number | null;
  lighthouse_desktop?: number | null;
  has_ssl?: boolean;
  cms_detected?: string | null;
  audit_signals?: string[];
  tech_stack_raw?: Record<string, unknown>;
  decision_maker_name?: string | null;
  decision_maker_title?: string | null;
  email_reachability?: EmailReachability;
  phone_formatted?: string | null;
  contact_authority?: ContactAuthority;
  recommended_service?: string | null;
  tailored_pitch?: string | null;
  score_tier?: ScoreTier;
  engine_status?: EngineStatus;
  engine_disqualify_reason?: string | null;
  engine_batch_id?: string | null;
  engine_last_processed_at?: string | null;
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

  // Lead Engine fields
  business_name?: string | null;
  category?: string | null;
  subcategory?: string | null;
  niche_id?: string | null;
  location_id?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  dedupe_key?: string | null;
  lighthouse_mobile?: number | null;
  lighthouse_desktop?: number | null;
  has_ssl?: boolean;
  cms_detected?: string | null;
  audit_signals?: string[];
  tech_stack_raw?: Record<string, unknown>;
  decision_maker_name?: string | null;
  decision_maker_title?: string | null;
  email_reachability?: EmailReachability;
  phone_formatted?: string | null;
  contact_authority?: ContactAuthority;
  recommended_service?: string | null;
  tailored_pitch?: string | null;
  score_tier?: ScoreTier;
  engine_status?: EngineStatus;
  engine_disqualify_reason?: string | null;
  engine_batch_id?: string | null;
  engine_last_processed_at?: string | null;
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
  niche_id?: string;
  location_id?: string;
  score_tier?: ScoreTier;
  engine_status?: EngineStatus;
  limit?: number;
  offset?: number;
}

// ----------------------------------------------------------------------------
// Targeting & Engine Entities
// ----------------------------------------------------------------------------

export interface LeadNiche {
  id: string;
  user_id: string;
  name: string;
  vertical: string;
  osm_tags: string[];
  default_pitch_angle?: string | null;
  avg_deal_value_cents: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateLeadNicheDTO {
  name: string;
  vertical: string;
  osm_tags?: string[];
  default_pitch_angle?: string | null;
  avg_deal_value_cents?: number;
  is_active?: boolean;
}

export interface UpdateLeadNicheDTO {
  name?: string;
  vertical?: string;
  osm_tags?: string[];
  default_pitch_angle?: string | null;
  avg_deal_value_cents?: number;
  is_active?: boolean;
}

export interface LeadLocation {
  id: string;
  user_id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  radius_km: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface CreateLeadLocationDTO {
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  radius_km?: number;
  status?: 'active' | 'inactive';
}

export interface UpdateLeadLocationDTO {
  name?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  radius_km?: number;
  status?: 'active' | 'inactive';
}

export interface LeadCoveragePlan {
  id: string;
  user_id: string;
  niche_id: string;
  location_id: string;
  frequency_days: number;
  last_run_at?: string | null;
  next_eligible_at?: string | null;
  status: 'active' | 'paused' | 'completed';
  created_at: string;
  updated_at: string;
  niche?: LeadNiche;
  location?: LeadLocation;
}

export interface CreateLeadCoveragePlanDTO {
  niche_id: string;
  location_id: string;
  frequency_days?: number;
  status?: 'active' | 'paused' | 'completed';
}

export interface UpdateLeadCoveragePlanDTO {
  frequency_days?: number;
  last_run_at?: string | null;
  next_eligible_at?: string | null;
  status?: 'active' | 'paused' | 'completed';
}

export interface LeadQueryQueue {
  id: string;
  user_id: string;
  coverage_plan_id?: string | null;
  niche_id: string;
  location_id: string;
  overpass_query?: string | null;
  query_string?: string | null;
  source: string;
  priority: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  attempts: number;
  max_attempts: number;
  leads_discovered: number;
  leads_qualified: number;
  error_message?: string | null;
  dispatched_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  niche?: LeadNiche;
  location?: LeadLocation;
}

export interface CreateLeadQueryQueueDTO {
  coverage_plan_id?: string | null;
  niche_id: string;
  location_id: string;
  overpass_query?: string | null;
  query_string?: string | null;
  source?: string;
  priority?: number;
  max_attempts?: number;
}

export interface UpdateLeadQueryQueueDTO {
  status?: 'pending' | 'running' | 'completed' | 'failed';
  attempts?: number;
  leads_discovered?: number;
  leads_qualified?: number;
  error_message?: string | null;
  dispatched_at?: string | null;
  completed_at?: string | null;
}

export interface LeadEngineLog {
  id: string;
  user_id: string;
  event_type: string;
  component: string;
  execution_id?: string | null;
  details: Record<string, unknown>;
  duration_ms?: number | null;
  created_at: string;
}

export interface LeadEngineStats {
  total_leads: number;
  pitch_ready: number;
  contacted: number;
  converted: number;
  hot_leads: number;
  pending_queue_jobs: number;
  active_niches: number;
  active_locations: number;
}

export interface BatchIngestLeadsDTO {
  leads: CreateLeadDTO[];
  batch_id?: string;
  component?: string;
}
