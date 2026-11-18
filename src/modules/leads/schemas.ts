import { z } from 'zod';

export const LeadStatusSchema = z.enum([
  'lead',
  'contacted',
  'qualified',
  'converted',
  'lost',
]);

export const LeadSourceSchema = z.enum([
  'apollo',
  'hunter',
  'linkedin',
  'website',
  'inbound_email',
  'referral',
  'manual',
  'n8n_scraper',
]);

export const LeadActivityTypeSchema = z.enum([
  'email_sent',
  'email_received',
  'call',
  'meeting',
  'note_added',
  'status_changed',
  'enrichment',
  'n8n_trigger',
]);

export const ScoreTierSchema = z.enum(['hot', 'warm', 'cold']);

export const EngineStatusSchema = z.enum([
  'discovered',
  'filtered',
  'enriched',
  'audited',
  'pitch_ready',
  'verified',
  'disqualified',
  'error',
]);

export const EmailReachabilitySchema = z.enum([
  'safe',
  'risky',
  'invalid',
  'unknown',
]);

export const ContactAuthoritySchema = z.enum([
  'owner',
  'authority',
  'unverified',
]);

const leadCoreFields = {
  full_name: z.string().min(1, 'Full name is required').max(200).optional(),
  first_name: z.string().max(100).optional().nullable(),
  last_name: z.string().max(100).optional().nullable(),
  email: z.string().email('Invalid email address').optional().nullable().or(z.literal('')),
  phone: z.string().max(50).optional().nullable(),
  company: z.string().max(200).optional().nullable(),
  job_title: z.string().max(200).optional().nullable(),
  website: z.string().max(500).optional().nullable(),
  linkedin_url: z.string().max(500).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  source: LeadSourceSchema.default('manual'),
  score: z.number().int().min(0).max(100).default(0),
  estimated_value_cents: z.number().int().min(0).default(0),
  enrichment_data: z.record(z.string(), z.unknown()).default({}),
  notes: z.string().max(5000).optional().nullable(),

  // Lead Engine Autonomous Additions
  business_name: z.string().max(250).optional().nullable(),
  category: z.string().max(150).optional().nullable(),
  subcategory: z.string().max(150).optional().nullable(),
  niche_id: z.string().uuid().optional().nullable(),
  location_id: z.string().uuid().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  dedupe_key: z.string().max(255).optional().nullable(),
  lighthouse_mobile: z.number().int().min(0).max(100).optional().nullable(),
  lighthouse_desktop: z.number().int().min(0).max(100).optional().nullable(),
  has_ssl: z.boolean().default(true),
  cms_detected: z.string().max(100).optional().nullable(),
  audit_signals: z.array(z.string()).default([]),
  tech_stack_raw: z.record(z.string(), z.unknown()).default({}),
  decision_maker_name: z.string().max(200).optional().nullable(),
  decision_maker_title: z.string().max(150).optional().nullable(),
  email_reachability: EmailReachabilitySchema.default('unknown'),
  phone_formatted: z.string().max(50).optional().nullable(),
  contact_authority: ContactAuthoritySchema.default('unverified'),
  recommended_service: z.string().max(250).optional().nullable(),
  tailored_pitch: z.string().max(2000).optional().nullable(),
  score_tier: ScoreTierSchema.default('warm'),
  engine_status: EngineStatusSchema.default('discovered'),
  engine_disqualify_reason: z.string().max(500).optional().nullable(),
  engine_batch_id: z.string().max(100).optional().nullable(),
  engine_last_processed_at: z.string().datetime().optional().nullable(),
};

export const CreateLeadBaseSchema = z.object(leadCoreFields);

export const CreateLeadSchema = z.object(leadCoreFields)
  .refine((data) => Boolean(data.full_name || data.business_name), {
    message: 'Full name is required',
    path: ['full_name'],
  })
  .transform((data) => {
    return {
      ...data,
      full_name: data.full_name || data.business_name || 'Prospective Client',
    };
  });

export const UpdateLeadSchema = z.object(leadCoreFields).partial().extend({
  status: LeadStatusSchema.optional(),
  last_contacted_at: z.string().datetime().optional().nullable(),
  archived_at: z.string().datetime().optional().nullable(),
});

export const ConvertLeadSchema = z.object({
  project_name: z.string().max(200).optional(),
  project_description: z.string().max(2000).optional(),
  estimated_value_cents: z.number().int().min(0).optional(),
});

export const CreateLeadActivitySchema = z.object({
  activity_type: LeadActivityTypeSchema,
  summary: z.string().min(1, 'Summary is required').max(500),
  details: z.record(z.string(), z.unknown()).default({}),
});

export const LeadFilterSchema = z.object({
  status: LeadStatusSchema.optional(),
  source: LeadSourceSchema.optional(),
  search: z.string().optional(),
  min_score: z.coerce.number().int().min(0).max(100).optional(),
  niche_id: z.string().uuid().optional(),
  location_id: z.string().uuid().optional(),
  score_tier: ScoreTierSchema.optional(),
  engine_status: EngineStatusSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

// ----------------------------------------------------------------------------
// Targeting & Engine Schemas
// ----------------------------------------------------------------------------

export const CreateLeadNicheSchema = z.object({
  name: z.string().min(1, 'Niche name is required').max(150),
  vertical: z.string().min(1, 'Vertical is required').max(150),
  osm_tags: z.array(z.string()).default([]),
  default_pitch_angle: z.string().max(500).optional().nullable(),
  avg_deal_value_cents: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

export const UpdateLeadNicheSchema = CreateLeadNicheSchema.partial();

export const CreateLeadLocationSchema = z.object({
  name: z.string().min(1, 'Location name is required').max(150),
  city: z.string().min(1, 'City is required').max(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius_km: z.number().min(0.1).max(100).default(3.0),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const UpdateLeadLocationSchema = CreateLeadLocationSchema.partial();

export const CreateLeadCoveragePlanSchema = z.object({
  niche_id: z.string().uuid('Valid niche ID required'),
  location_id: z.string().uuid('Valid location ID required'),
  frequency_days: z.number().int().min(1).max(365).default(14),
  status: z.enum(['active', 'paused', 'completed']).default('active'),
});

export const UpdateLeadCoveragePlanSchema = CreateLeadCoveragePlanSchema.partial().extend({
  last_run_at: z.string().datetime().optional().nullable(),
  next_eligible_at: z.string().datetime().optional().nullable(),
});

export const CreateLeadQueryQueueSchema = z.object({
  coverage_plan_id: z.string().uuid().optional().nullable(),
  niche_id: z.string().uuid('Valid niche ID required'),
  location_id: z.string().uuid('Valid location ID required'),
  overpass_query: z.string().optional().nullable(),
  query_string: z.string().optional().nullable(),
  source: z.string().default('osm'),
  priority: z.number().int().min(1).max(10).default(1),
  max_attempts: z.number().int().min(1).max(10).default(3),
});

export const UpdateLeadQueryQueueSchema = z.object({
  status: z.enum(['pending', 'running', 'completed', 'failed']).optional(),
  attempts: z.number().int().min(0).optional(),
  leads_discovered: z.number().int().min(0).optional(),
  leads_qualified: z.number().int().min(0).optional(),
  error_message: z.string().optional().nullable(),
  dispatched_at: z.string().datetime().optional().nullable(),
  completed_at: z.string().datetime().optional().nullable(),
});

export const BatchIngestLeadsSchema = z.object({
  leads: z.array(CreateLeadSchema).min(1, 'At least one lead is required'),
  batch_id: z.string().optional(),
  component: z.string().default('n8n_crawler'),
});

export const TriggerWorkflowSchema = z.object({
  workflow: z.enum(['discovery', 'filter', 'audit', 'pitch', 'full_run']),
  target_niche_id: z.string().uuid().optional(),
  target_location_id: z.string().uuid().optional(),
  parameters: z.record(z.string(), z.unknown()).default({}),
});
