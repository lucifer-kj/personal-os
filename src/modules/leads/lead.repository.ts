import { SupabaseClient } from '@supabase/supabase-js';
import {
  Lead,
  LeadActivity,
  CreateLeadDTO,
  UpdateLeadDTO,
  ConvertLeadDTO,
  ConvertLeadResult,
  LeadFilter,
} from './types';
import { InfrastructureError } from '@/lib/errors';

export interface ILeadRepository {
  findMany(userId: string, filter?: LeadFilter): Promise<{ leads: Lead[]; total: number }>;
  findById(userId: string, id: string): Promise<Lead | null>;
  create(userId: string, data: CreateLeadDTO): Promise<Lead>;
  update(userId: string, id: string, data: UpdateLeadDTO): Promise<Lead | null>;
  delete(userId: string, id: string): Promise<boolean>;
  convert(userId: string, id: string, data?: ConvertLeadDTO): Promise<ConvertLeadResult>;
  findActivities(userId: string, leadId: string): Promise<LeadActivity[]>;
  createActivity(
    userId: string,
    leadId: string,
    activityType: string,
    summary: string,
    details?: Record<string, unknown>
  ): Promise<LeadActivity>;
}

export class InMemoryLeadRepository implements ILeadRepository {
  private leads: Map<string, Lead> = new Map();
  private activities: Map<string, LeadActivity[]> = new Map();

  clear(): void {
    this.leads.clear();
    this.activities.clear();
  }

  async findMany(userId: string, filter: LeadFilter = {}): Promise<{ leads: Lead[]; total: number }> {
    let result = Array.from(this.leads.values()).filter((l) => l.user_id === userId && !l.archived_at);
    if (filter.status) result = result.filter((l) => l.status === filter.status);
    if (filter.source) result = result.filter((l) => l.source === filter.source);
    if (filter.min_score !== undefined) result = result.filter((l) => l.score >= (filter.min_score ?? 0));
    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (l) =>
          l.full_name.toLowerCase().includes(q) ||
          (l.company && l.company.toLowerCase().includes(q)) ||
          (l.email && l.email.toLowerCase().includes(q))
      );
    }
    result.sort((a, b) => b.score - a.score);
    return { leads: result, total: result.length };
  }

  async findById(userId: string, id: string): Promise<Lead | null> {
    const lead = this.leads.get(id);
    if (!lead || lead.user_id !== userId) return null;
    return lead;
  }

  async create(userId: string, data: CreateLeadDTO): Promise<Lead> {
    const id = `lead-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const lead: Lead = {
      id,
      user_id: userId,
      status: 'lead',
      source: data.source || 'manual',
      first_name: data.first_name || null,
      last_name: data.last_name || null,
      full_name: data.full_name,
      email: data.email || null,
      phone: data.phone || null,
      company: data.company || null,
      job_title: data.job_title || null,
      website: data.website || null,
      linkedin_url: data.linkedin_url || null,
      location: data.location || null,
      score: data.score ?? 0,
      estimated_value_cents: data.estimated_value_cents ?? 0,
      enrichment_data: data.enrichment_data || {},
      notes: data.notes || null,
      created_at: now,
      updated_at: now,
    };
    this.leads.set(id, lead);
    return lead;
  }

  async update(userId: string, id: string, data: UpdateLeadDTO): Promise<Lead | null> {
    const lead = await this.findById(userId, id);
    if (!lead) return null;
    const updated: Lead = {
      ...lead,
      ...data,
      updated_at: new Date().toISOString(),
    };
    this.leads.set(id, updated);
    return updated;
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const lead = await this.findById(userId, id);
    if (!lead) return false;
    lead.archived_at = new Date().toISOString();
    return true;
  }

  async convert(userId: string, id: string, data?: ConvertLeadDTO): Promise<ConvertLeadResult> {
    const lead = await this.findById(userId, id);
    if (!lead) throw new Error('Lead not found');
    const projectId = `proj-${Date.now()}`;
    const taskId = `task-${Date.now()}`;
    lead.status = 'converted';
    lead.converted_project_id = projectId;
    lead.converted_at = new Date().toISOString();
    return {
      success: true,
      lead_id: id,
      project_id: projectId,
      task_id: taskId,
      already_converted: false,
    };
  }

  async findActivities(userId: string, leadId: string): Promise<LeadActivity[]> {
    return this.activities.get(leadId) || [];
  }

  async createActivity(
    userId: string,
    leadId: string,
    activityType: string,
    summary: string,
    details: Record<string, unknown> = {}
  ): Promise<LeadActivity> {
    const activity: LeadActivity = {
      id: `act-${Date.now()}`,
      user_id: userId,
      lead_id: leadId,
      activity_type: activityType as any,
      summary,
      details,
      created_at: new Date().toISOString(),
    };
    const list = this.activities.get(leadId) || [];
    list.unshift(activity);
    this.activities.set(leadId, list);
    return activity;
  }
}

export class SupabaseLeadRepository implements ILeadRepository {
  constructor(private client: SupabaseClient) {}

  async findMany(userId: string, filter: LeadFilter = {}): Promise<{ leads: Lead[]; total: number }> {
    let query = this.client
      .from('leads')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .is('archived_at', null);

    if (filter.status) {
      query = query.eq('status', filter.status);
    }

    if (filter.source) {
      query = query.eq('source', filter.source);
    }

    if (filter.min_score !== undefined) {
      query = query.gte('score', filter.min_score);
    }

    if (filter.search) {
      query = query.or(
        `full_name.ilike.%${filter.search}%,company.ilike.%${filter.search}%,email.ilike.%${filter.search}%`
      );
    }

    const limit = filter.limit || 50;
    const offset = filter.offset || 0;

    query = query
      .order('score', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) {
      throw new InfrastructureError(`Failed to fetch leads: ${error.message}`);
    }

    return { leads: (data as Lead[]) || [], total: count || 0 };
  }

  async findById(userId: string, id: string): Promise<Lead | null> {
    const { data, error } = await this.client
      .from('leads')
      .select('*')
      .eq('user_id', userId)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new InfrastructureError(`Failed to find lead: ${error.message}`);
    }

    return (data as Lead) || null;
  }

  async create(userId: string, data: CreateLeadDTO): Promise<Lead> {
    const payload = {
      ...data,
      user_id: userId,
      source: data.source || 'manual',
      score: data.score ?? 0,
      estimated_value_cents: data.estimated_value_cents ?? 0,
      enrichment_data: data.enrichment_data || {},
    };

    const { data: created, error } = await this.client
      .from('leads')
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw new InfrastructureError(`Failed to create lead: ${error.message}`);
    }

    return created as Lead;
  }

  async update(userId: string, id: string, data: UpdateLeadDTO): Promise<Lead | null> {
    const { data: updated, error } = await this.client
      .from('leads')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      throw new InfrastructureError(`Failed to update lead: ${error.message}`);
    }

    return (updated as Lead) || null;
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const { error } = await this.client
      .from('leads')
      .update({ archived_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('id', id);

    if (error) {
      throw new InfrastructureError(`Failed to archive lead: ${error.message}`);
    }

    return true;
  }

  async convert(userId: string, id: string, data?: ConvertLeadDTO): Promise<ConvertLeadResult> {
    const { data: result, error } = await this.client.rpc('convert_lead_to_project_and_task', {
      p_user_id: userId,
      p_lead_id: id,
      p_project_name: data?.project_name || null,
      p_project_description: data?.project_description || null,
      p_estimated_value_cents: data?.estimated_value_cents || null,
    });

    if (error) {
      throw new InfrastructureError(`Failed to convert lead: ${error.message}`);
    }

    return result as ConvertLeadResult;
  }

  async findActivities(userId: string, leadId: string): Promise<LeadActivity[]> {
    const { data, error } = await this.client
      .from('lead_activities')
      .select('*')
      .eq('user_id', userId)
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new InfrastructureError(`Failed to fetch lead activities: ${error.message}`);
    }

    return (data as LeadActivity[]) || [];
  }

  async createActivity(
    userId: string,
    leadId: string,
    activityType: string,
    summary: string,
    details: Record<string, unknown> = {}
  ): Promise<LeadActivity> {
    const { data, error } = await this.client
      .from('lead_activities')
      .insert({
        user_id: userId,
        lead_id: leadId,
        activity_type: activityType,
        summary,
        details,
      })
      .select()
      .single();

    if (error) {
      throw new InfrastructureError(`Failed to create lead activity: ${error.message}`);
    }

    return data as LeadActivity;
  }
}

const globalInMemoryLeadRepo = new InMemoryLeadRepository();

export function getLeadRepository(client?: SupabaseClient | null): ILeadRepository {
  if (client) {
    return new SupabaseLeadRepository(client);
  }
  if (process.env.NODE_ENV === 'production') {
    throw new InfrastructureError(
      'Supabase client is required in production. In-memory persistence fallback is disabled.'
    );
  }
  return globalInMemoryLeadRepo;
}

export function getInMemoryLeadRepository(): InMemoryLeadRepository {
  return globalInMemoryLeadRepo;
}
