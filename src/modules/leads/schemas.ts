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

export const CreateLeadSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(200),
  first_name: z.string().max(100).optional().nullable(),
  last_name: z.string().max(100).optional().nullable(),
  email: z.string().email('Invalid email address').optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  company: z.string().max(200).optional().nullable(),
  job_title: z.string().max(200).optional().nullable(),
  website: z.string().url('Invalid website URL').optional().nullable().or(z.literal('')),
  linkedin_url: z.string().url('Invalid LinkedIn URL').optional().nullable().or(z.literal('')),
  location: z.string().max(200).optional().nullable(),
  source: LeadSourceSchema.default('manual'),
  score: z.number().int().min(0).max(100).default(0),
  estimated_value_cents: z.number().int().min(0).default(0),
  enrichment_data: z.record(z.string(), z.unknown()).default({}),
  notes: z.string().max(5000).optional().nullable(),
});

export const UpdateLeadSchema = CreateLeadSchema.partial().extend({
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
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});
