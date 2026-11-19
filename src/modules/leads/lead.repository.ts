import { SupabaseClient } from '@supabase/supabase-js';
import {
  Lead,
  LeadActivity,
  LeadActivityType,
  CreateLeadDTO,
  UpdateLeadDTO,
  ConvertLeadDTO,
  ConvertLeadResult,
  LeadFilter,
  LeadNiche,
  CreateLeadNicheDTO,
  UpdateLeadNicheDTO,
  LeadLocation,
  CreateLeadLocationDTO,
  UpdateLeadLocationDTO,
  LeadCoveragePlan,
  CreateLeadCoveragePlanDTO,
  UpdateLeadCoveragePlanDTO,
  LeadQueryQueue,
  CreateLeadQueryQueueDTO,
  UpdateLeadQueryQueueDTO,
  LeadEngineLog,
  LeadEngineStats,
} from './types';
import { InfrastructureError } from '@/lib/errors';

export interface ILeadRepository {
  findMany(userId: string, filter?: LeadFilter): Promise<{ leads: Lead[]; total: number }>;
  findById(userId: string, id: string): Promise<Lead | null>;
  create(userId: string, data: CreateLeadDTO): Promise<Lead>;
  update(userId: string, id: string, data: UpdateLeadDTO): Promise<Lead | null>;
  delete(userId: string, id: string): Promise<boolean>;
  convert(userId: string, id: string, data?: ConvertLeadDTO): Promise<ConvertLeadResult>;
  upsertBatch(userId: string, leads: CreateLeadDTO[]): Promise<{ count: number; leads: Lead[] }>;
  findActivities(userId: string, leadId: string): Promise<LeadActivity[]>;
  createActivity(
    userId: string,
    leadId: string,
    activityType: string,
    summary: string,
    details?: Record<string, unknown>
  ): Promise<LeadActivity>;

  // Targeting & Niches
  findNiches(userId: string): Promise<LeadNiche[]>;
  createNiche(userId: string, data: CreateLeadNicheDTO): Promise<LeadNiche>;
  updateNiche(userId: string, id: string, data: UpdateLeadNicheDTO): Promise<LeadNiche | null>;
  deleteNiche(userId: string, id: string): Promise<boolean>;

  // Targeting & Locations
  findLocations(userId: string): Promise<LeadLocation[]>;
  createLocation(userId: string, data: CreateLeadLocationDTO): Promise<LeadLocation>;
  updateLocation(userId: string, id: string, data: UpdateLeadLocationDTO): Promise<LeadLocation | null>;
  deleteLocation(userId: string, id: string): Promise<boolean>;

  // Coverage Plans
  findCoveragePlans(userId: string): Promise<LeadCoveragePlan[]>;
  createCoveragePlan(userId: string, data: CreateLeadCoveragePlanDTO): Promise<LeadCoveragePlan>;
  updateCoveragePlan(userId: string, id: string, data: UpdateLeadCoveragePlanDTO): Promise<LeadCoveragePlan | null>;

  // Query Queue
  findQueue(userId: string, status?: string): Promise<LeadQueryQueue[]>;
  createQueueItem(userId: string, data: CreateLeadQueryQueueDTO): Promise<LeadQueryQueue>;
  claimNextQueueItem(userId: string): Promise<LeadQueryQueue | null>;
  updateQueueItem(userId: string, id: string, data: UpdateLeadQueryQueueDTO): Promise<LeadQueryQueue | null>;

  // Telemetry & Stats
  createLog(userId: string, log: Omit<LeadEngineLog, 'id' | 'user_id' | 'created_at'>): Promise<LeadEngineLog>;
  findLogs(userId: string, limit?: number): Promise<LeadEngineLog[]>;
  getStats(userId: string): Promise<LeadEngineStats>;
}

export class InMemoryLeadRepository implements ILeadRepository {
  private leads: Map<string, Lead> = new Map();
  private activities: Map<string, LeadActivity[]> = new Map();
  private niches: Map<string, LeadNiche> = new Map();
  private locations: Map<string, LeadLocation> = new Map();
  private coveragePlans: Map<string, LeadCoveragePlan> = new Map();
  private queue: Map<string, LeadQueryQueue> = new Map();
  private logs: LeadEngineLog[] = [];

  constructor() {
    this.seedDefaults();
  }

  clear(): void {
    this.leads.clear();
    this.activities.clear();
    this.niches.clear();
    this.locations.clear();
    this.coveragePlans.clear();
    this.queue.clear();
    this.logs = [];
    this.seedDefaults();
  }

  private seedDefaults() {
    const devUserId = '00000000-0000-0000-0000-000000000001';
    const now = new Date().toISOString();

    const dentalNiche: LeadNiche = {
      id: 'niche-dental-001',
      user_id: devUserId,
      name: 'Dental Clinics',
      vertical: 'Healthcare',
      osm_tags: ['amenity=dentist', 'healthcare=dentist'],
      default_pitch_angle: 'Patient loss from slow mobile LCP & missing online booking',
      avg_deal_value_cents: 3500000,
      is_active: true,
      created_at: now,
      updated_at: now,
    };
    const diagnosticNiche: LeadNiche = {
      id: 'niche-diag-002',
      user_id: devUserId,
      name: 'Diagnostic Centers & Pathology',
      vertical: 'Healthcare',
      osm_tags: ['amenity=diagnostic_centre', 'healthcare=laboratory'],
      default_pitch_angle: 'Automated WhatsApp report dispatch & test booking bot',
      avg_deal_value_cents: 5000000,
      is_active: true,
      created_at: now,
      updated_at: now,
    };
    this.niches.set(dentalNiche.id, dentalNiche);
    this.niches.set(diagnosticNiche.id, diagnosticNiche);

    const saltLake: LeadLocation = {
      id: 'loc-saltlake-001',
      user_id: devUserId,
      name: 'Salt Lake Sector V',
      city: 'Kolkata',
      latitude: 22.5735,
      longitude: 88.4331,
      radius_km: 3.5,
      status: 'active',
      created_at: now,
      updated_at: now,
    };
    const parkStreet: LeadLocation = {
      id: 'loc-parkst-002',
      user_id: devUserId,
      name: 'Park Street Hub',
      city: 'Kolkata',
      latitude: 22.5510,
      longitude: 88.3526,
      radius_km: 2.5,
      status: 'active',
      created_at: now,
      updated_at: now,
    };
    this.locations.set(saltLake.id, saltLake);
    this.locations.set(parkStreet.id, parkStreet);

    const sampleLead: Lead = {
      id: 'lead-sharma-dental-001',
      user_id: devUserId,
      status: 'lead',
      source: 'n8n_scraper',
      full_name: "Dr. Sharma's Dental Care",
      business_name: "Dr. Sharma's Dental Care",
      category: 'Healthcare',
      subcategory: 'Dentist',
      niche_id: dentalNiche.id,
      location_id: saltLake.id,
      email: 'contact@sharmadental.in',
      phone: '+919830123456',
      phone_formatted: '+919830123456',
      website: 'www.sharmadental.in',
      location: 'Salt Lake Sector V, Kolkata',
      score: 85,
      score_tier: 'hot',
      estimated_value_cents: 3500000,
      enrichment_data: {},
      lighthouse_mobile: 34,
      lighthouse_desktop: 62,
      has_ssl: true,
      cms_detected: 'WordPress 5.4',
      audit_signals: ['slow_mobile_lcp', 'missing_viewport_meta', 'no_whatsapp_chat'],
      decision_maker_name: 'Dr. R. Sharma',
      decision_maker_title: 'Chief Dental Surgeon',
      email_reachability: 'safe',
      contact_authority: 'owner',
      recommended_service: 'Fast Mobile Rebuild + WhatsApp Receptionist',
      tailored_pitch: 'Dr. Sharma, noticed your clinic site takes 7.8s to load on mobile phones. Patients bounce before reaching booking. We rebuilt local clinics for sub-1s load + automated WhatsApp booking.',
      engine_status: 'pitch_ready',
      created_at: now,
      updated_at: now,
    };
    this.leads.set(sampleLead.id, sampleLead);
  }

  async findMany(userId: string, filter: LeadFilter = {}): Promise<{ leads: Lead[]; total: number }> {
    let result = Array.from(this.leads.values()).filter((l) => l.user_id === userId && !l.archived_at);
    if (filter.status) result = result.filter((l) => l.status === filter.status);
    if (filter.source) result = result.filter((l) => l.source === filter.source);
    if (filter.min_score !== undefined) result = result.filter((l) => l.score >= (filter.min_score ?? 0));
    if (filter.niche_id) result = result.filter((l) => l.niche_id === filter.niche_id);
    if (filter.location_id) result = result.filter((l) => l.location_id === filter.location_id);
    if (filter.score_tier) result = result.filter((l) => l.score_tier === filter.score_tier);
    if (filter.engine_status) result = result.filter((l) => l.engine_status === filter.engine_status);

    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (l) =>
          l.full_name.toLowerCase().includes(q) ||
          (l.business_name && l.business_name.toLowerCase().includes(q)) ||
          (l.company && l.company.toLowerCase().includes(q)) ||
          (l.email && l.email.toLowerCase().includes(q)) ||
          (l.phone && l.phone.toLowerCase().includes(q)) ||
          (l.category && l.category.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => b.score - a.score);
    const offset = filter.offset || 0;
    const limit = filter.limit || 50;
    const paged = result.slice(offset, offset + limit);

    return { leads: paged, total: result.length };
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
      first_name: data.first_name,
      last_name: data.last_name,
      full_name: data.full_name || data.business_name || 'Prospective Client',
      email: data.email,
      phone: data.phone,
      company: data.company || data.business_name,
      job_title: data.job_title,
      website: data.website,
      linkedin_url: data.linkedin_url,
      location: data.location,
      score: data.score ?? 0,
      estimated_value_cents: data.estimated_value_cents ?? 0,
      enrichment_data: data.enrichment_data || {},
      notes: data.notes,
      business_name: data.business_name,
      category: data.category,
      subcategory: data.subcategory,
      niche_id: data.niche_id,
      location_id: data.location_id,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
      dedupe_key: data.dedupe_key,
      lighthouse_mobile: data.lighthouse_mobile,
      lighthouse_desktop: data.lighthouse_desktop,
      has_ssl: data.has_ssl ?? true,
      cms_detected: data.cms_detected,
      audit_signals: data.audit_signals || [],
      tech_stack_raw: data.tech_stack_raw || {},
      decision_maker_name: data.decision_maker_name,
      decision_maker_title: data.decision_maker_title,
      email_reachability: data.email_reachability || 'unknown',
      phone_formatted: data.phone_formatted || data.phone,
      contact_authority: data.contact_authority || 'unverified',
      recommended_service: data.recommended_service,
      tailored_pitch: data.tailored_pitch,
      score_tier: data.score_tier || (data.score && data.score >= 70 ? 'hot' : 'warm'),
      engine_status: data.engine_status || 'discovered',
      engine_disqualify_reason: data.engine_disqualify_reason,
      engine_batch_id: data.engine_batch_id,
      engine_last_processed_at: data.engine_last_processed_at || now,
      created_at: now,
      updated_at: now,
    };
    this.leads.set(id, lead);
    return lead;
  }

  async update(userId: string, id: string, data: UpdateLeadDTO): Promise<Lead | null> {
    const existing = await this.findById(userId, id);
    if (!existing) return null;
    const updated: Lead = {
      ...existing,
      ...data,
      updated_at: new Date().toISOString(),
    };
    this.leads.set(id, updated);
    return updated;
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const existing = await this.findById(userId, id);
    if (!existing) return false;
    existing.archived_at = new Date().toISOString();
    this.leads.set(id, existing);
    return true;
  }

  async convert(userId: string, id: string): Promise<ConvertLeadResult> {
    const lead = await this.findById(userId, id);
    if (!lead) {
      throw new Error(`Lead ${id} not found or not owned by user`);
    }

    if (lead.status === 'converted' && lead.converted_project_id) {
      return {
        success: true,
        lead_id: id,
        project_id: lead.converted_project_id,
        task_id: 'existing-task',
        already_converted: true,
      };
    }

    const projectId = `project-${Date.now()}`;
    const taskId = `task-${Date.now()}`;

    lead.status = 'converted';
    lead.converted_project_id = projectId;
    lead.converted_at = new Date().toISOString();
    lead.updated_at = new Date().toISOString();
    this.leads.set(id, lead);

    await this.createActivity(
      userId,
      id,
      'status_changed',
      'Lead converted to Client Project',
      { project_id: projectId, task_id: taskId }
    );

    return {
      success: true,
      lead_id: id,
      project_id: projectId,
      task_id: taskId,
      already_converted: false,
    };
  }

  async upsertBatch(userId: string, incoming: CreateLeadDTO[]): Promise<{ count: number; leads: Lead[] }> {
    const results: Lead[] = [];
    for (const item of incoming) {
      // Deduplicate by dedupe_key or email if present
      let match: Lead | undefined;
      if (item.dedupe_key) {
        match = Array.from(this.leads.values()).find(
          (l) => l.user_id === userId && l.dedupe_key === item.dedupe_key
        );
      } else if (item.email) {
        match = Array.from(this.leads.values()).find(
          (l) => l.user_id === userId && l.email === item.email
        );
      }

      if (match) {
        const updated = await this.update(userId, match.id, item as UpdateLeadDTO);
        if (updated) results.push(updated);
      } else {
        const created = await this.create(userId, item);
        results.push(created);
      }
    }
    return { count: results.length, leads: results };
  }

  async findActivities(userId: string, leadId: string): Promise<LeadActivity[]> {
    const list = this.activities.get(leadId) || [];
    return list.filter((a) => a.user_id === userId);
  }

  async createActivity(
    userId: string,
    leadId: string,
    activityType: string,
    summary: string,
    details: Record<string, unknown> = {}
  ): Promise<LeadActivity> {
    const activity: LeadActivity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      lead_id: leadId,
      activity_type: activityType as LeadActivityType,
      summary,
      details,
      created_at: new Date().toISOString(),
    };
    const list = this.activities.get(leadId) || [];
    list.unshift(activity);
    this.activities.set(leadId, list);
    return activity;
  }

  // Targeting: Niches
  async findNiches(userId: string): Promise<LeadNiche[]> {
    return Array.from(this.niches.values()).filter((n) => n.user_id === userId);
  }

  async createNiche(userId: string, data: CreateLeadNicheDTO): Promise<LeadNiche> {
    const id = `niche-${Date.now()}`;
    const now = new Date().toISOString();
    const niche: LeadNiche = {
      id,
      user_id: userId,
      name: data.name,
      vertical: data.vertical,
      osm_tags: data.osm_tags || [],
      default_pitch_angle: data.default_pitch_angle,
      avg_deal_value_cents: data.avg_deal_value_cents ?? 0,
      is_active: data.is_active ?? true,
      created_at: now,
      updated_at: now,
    };
    this.niches.set(id, niche);
    return niche;
  }

  async updateNiche(userId: string, id: string, data: UpdateLeadNicheDTO): Promise<LeadNiche | null> {
    const niche = this.niches.get(id);
    if (!niche || niche.user_id !== userId) return null;
    const updated = { ...niche, ...data, updated_at: new Date().toISOString() };
    this.niches.set(id, updated);
    return updated;
  }

  async deleteNiche(userId: string, id: string): Promise<boolean> {
    const niche = this.niches.get(id);
    if (!niche || niche.user_id !== userId) return false;
    this.niches.delete(id);
    return true;
  }

  // Targeting: Locations
  async findLocations(userId: string): Promise<LeadLocation[]> {
    return Array.from(this.locations.values()).filter((l) => l.user_id === userId);
  }

  async createLocation(userId: string, data: CreateLeadLocationDTO): Promise<LeadLocation> {
    const id = `loc-${Date.now()}`;
    const now = new Date().toISOString();
    const location: LeadLocation = {
      id,
      user_id: userId,
      name: data.name,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
      radius_km: data.radius_km ?? 3.0,
      status: data.status ?? 'active',
      created_at: now,
      updated_at: now,
    };
    this.locations.set(id, location);
    return location;
  }

  async updateLocation(userId: string, id: string, data: UpdateLeadLocationDTO): Promise<LeadLocation | null> {
    const location = this.locations.get(id);
    if (!location || location.user_id !== userId) return null;
    const updated = { ...location, ...data, updated_at: new Date().toISOString() };
    this.locations.set(id, updated);
    return updated;
  }

  async deleteLocation(userId: string, id: string): Promise<boolean> {
    const location = this.locations.get(id);
    if (!location || location.user_id !== userId) return false;
    this.locations.delete(id);
    return true;
  }

  // Coverage Plans
  async findCoveragePlans(userId: string): Promise<LeadCoveragePlan[]> {
    return Array.from(this.coveragePlans.values()).filter((p) => p.user_id === userId);
  }

  async createCoveragePlan(userId: string, data: CreateLeadCoveragePlanDTO): Promise<LeadCoveragePlan> {
    const id = `plan-${Date.now()}`;
    const now = new Date().toISOString();
    const plan: LeadCoveragePlan = {
      id,
      user_id: userId,
      niche_id: data.niche_id,
      location_id: data.location_id,
      frequency_days: data.frequency_days ?? 14,
      status: data.status ?? 'active',
      created_at: now,
      updated_at: now,
      niche: this.niches.get(data.niche_id),
      location: this.locations.get(data.location_id),
    };
    this.coveragePlans.set(id, plan);
    return plan;
  }

  async updateCoveragePlan(userId: string, id: string, data: UpdateLeadCoveragePlanDTO): Promise<LeadCoveragePlan | null> {
    const plan = this.coveragePlans.get(id);
    if (!plan || plan.user_id !== userId) return null;
    const updated = { ...plan, ...data, updated_at: new Date().toISOString() };
    this.coveragePlans.set(id, updated);
    return updated;
  }

  // Queue
  async findQueue(userId: string, status?: string): Promise<LeadQueryQueue[]> {
    let list = Array.from(this.queue.values()).filter((q) => q.user_id === userId);
    if (status) list = list.filter((q) => q.status === status);
    return list;
  }

  async createQueueItem(userId: string, data: CreateLeadQueryQueueDTO): Promise<LeadQueryQueue> {
    const id = `queue-${Date.now()}`;
    const item: LeadQueryQueue = {
      id,
      user_id: userId,
      coverage_plan_id: data.coverage_plan_id,
      niche_id: data.niche_id,
      location_id: data.location_id,
      overpass_query: data.overpass_query,
      query_string: data.query_string,
      source: data.source || 'osm',
      priority: data.priority ?? 1,
      status: 'pending',
      attempts: 0,
      max_attempts: data.max_attempts ?? 3,
      leads_discovered: 0,
      leads_qualified: 0,
      created_at: new Date().toISOString(),
      niche: this.niches.get(data.niche_id),
      location: this.locations.get(data.location_id),
    };
    this.queue.set(id, item);
    return item;
  }

  async claimNextQueueItem(userId: string): Promise<LeadQueryQueue | null> {
    const pending = Array.from(this.queue.values()).find(
      (q) => q.user_id === userId && q.status === 'pending'
    );
    if (!pending) return null;
    pending.status = 'running';
    pending.attempts += 1;
    pending.dispatched_at = new Date().toISOString();
    this.queue.set(pending.id, pending);
    return pending;
  }

  async updateQueueItem(userId: string, id: string, data: UpdateLeadQueryQueueDTO): Promise<LeadQueryQueue | null> {
    const item = this.queue.get(id);
    if (!item || item.user_id !== userId) return null;
    const updated = { ...item, ...data };
    this.queue.set(id, updated);
    return updated;
  }

  // Logs & Stats
  async createLog(userId: string, log: Omit<LeadEngineLog, 'id' | 'user_id' | 'created_at'>): Promise<LeadEngineLog> {
    const entry: LeadEngineLog = {
      id: `log-${Date.now()}`,
      user_id: userId,
      ...log,
      created_at: new Date().toISOString(),
    };
    this.logs.unshift(entry);
    return entry;
  }

  async findLogs(userId: string, limit: number = 20): Promise<LeadEngineLog[]> {
    return this.logs.filter((l) => l.user_id === userId).slice(0, limit);
  }

  async getStats(userId: string): Promise<LeadEngineStats> {
    const userLeads = Array.from(this.leads.values()).filter((l) => l.user_id === userId && !l.archived_at);
    return {
      total_leads: userLeads.length,
      pitch_ready: userLeads.filter((l) => l.engine_status === 'pitch_ready').length,
      contacted: userLeads.filter((l) => l.status === 'contacted').length,
      converted: userLeads.filter((l) => l.status === 'converted').length,
      hot_leads: userLeads.filter((l) => l.score_tier === 'hot' || l.score >= 70).length,
      pending_queue_jobs: Array.from(this.queue.values()).filter((q) => q.user_id === userId && q.status === 'pending').length,
      active_niches: Array.from(this.niches.values()).filter((n) => n.user_id === userId && n.is_active).length,
      active_locations: Array.from(this.locations.values()).filter((l) => l.user_id === userId && l.status === 'active').length,
    };
  }
}

export class SupabaseLeadRepository implements ILeadRepository {
  constructor(private client: SupabaseClient) {}

  async findMany(userId: string, filter: LeadFilter = {}): Promise<{ leads: Lead[]; total: number }> {
    let query = this.client
      .from('leads')
      .select('*, niche:lead_niches(*), lead_location:lead_locations(*)', { count: 'exact' })
      .eq('user_id', userId)
      .is('archived_at', null);

    if (filter.status) query = query.eq('status', filter.status);
    if (filter.source) query = query.eq('source', filter.source);
    if (filter.min_score !== undefined) query = query.gte('score', filter.min_score);
    if (filter.niche_id) query = query.eq('niche_id', filter.niche_id);
    if (filter.location_id) query = query.eq('location_id', filter.location_id);
    if (filter.score_tier) query = query.eq('score_tier', filter.score_tier);
    if (filter.engine_status) query = query.eq('engine_status', filter.engine_status);

    if (filter.search) {
      query = query.textSearch('fts', filter.search, { type: 'websearch', config: 'english' });
    }

    query = query.order('score', { ascending: false });

    const offset = filter.offset || 0;
    const limit = filter.limit || 50;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new InfrastructureError(`Failed to fetch leads: ${error.message}`);
    }

    return { leads: (data as Lead[]) || [], total: count || 0 };
  }

  async findById(userId: string, id: string): Promise<Lead | null> {
    const { data, error } = await this.client
      .from('leads')
      .select('*, niche:lead_niches(*), lead_location:lead_locations(*)')
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

  async upsertBatch(userId: string, leads: CreateLeadDTO[]): Promise<{ count: number; leads: Lead[] }> {
    const records = leads.map((l) => ({
      ...l,
      user_id: userId,
      source: l.source || 'n8n_scraper',
      score: l.score ?? 0,
      estimated_value_cents: l.estimated_value_cents ?? 0,
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await this.client
      .from('leads')
      .upsert(records, { onConflict: 'user_id, dedupe_key' })
      .select();

    if (error) {
      throw new InfrastructureError(`Failed to batch upsert leads: ${error.message}`);
    }

    return { count: data?.length || 0, leads: (data as Lead[]) || [] };
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

  // Targeting: Niches
  async findNiches(userId: string): Promise<LeadNiche[]> {
    const { data, error } = await this.client
      .from('lead_niches')
      .select('*')
      .eq('user_id', userId)
      .order('name');

    if (error) throw new InfrastructureError(`Failed to fetch niches: ${error.message}`);
    if (data && data.length > 0) return data as LeadNiche[];

    // Fallback: Check engine_niches catalog if user-specific lead_niches is empty
    const { data: engineData } = await this.client
      .from('engine_niches')
      .select('*')
      .order('display_name');

    if (engineData && engineData.length > 0) {
      return engineData.map((e) => ({
        id: e.id,
        user_id: userId,
        name: e.display_name || e.niche_id,
        vertical: e.category
          ? e.category.charAt(0).toUpperCase() + e.category.slice(1).replace('_', ' ')
          : 'General',
        osm_tags: typeof e.osm_tags === 'string' ? e.osm_tags.split(',') : (e.osm_tags || []),
        default_pitch_angle: e.default_pitch_angle,
        avg_deal_value_cents: 50000,
        is_active: e.is_active ?? true,
        created_at: e.created_at,
        updated_at: e.created_at,
      })) as LeadNiche[];
    }

    return [];
  }

  async createNiche(userId: string, data: CreateLeadNicheDTO): Promise<LeadNiche> {
    const { data: created, error } = await this.client
      .from('lead_niches')
      .insert({ ...data, user_id: userId })
      .select()
      .single();

    if (error) throw new InfrastructureError(`Failed to create niche: ${error.message}`);
    return created as LeadNiche;
  }

  async updateNiche(userId: string, id: string, data: UpdateLeadNicheDTO): Promise<LeadNiche | null> {
    const { data: updated, error } = await this.client
      .from('lead_niches')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw new InfrastructureError(`Failed to update niche: ${error.message}`);
    return (updated as LeadNiche) || null;
  }

  async deleteNiche(userId: string, id: string): Promise<boolean> {
    const { error } = await this.client
      .from('lead_niches')
      .delete()
      .eq('user_id', userId)
      .eq('id', id);

    if (error) throw new InfrastructureError(`Failed to delete niche: ${error.message}`);
    return true;
  }

  // Targeting: Locations
  async findLocations(userId: string): Promise<LeadLocation[]> {
    const { data, error } = await this.client
      .from('lead_locations')
      .select('*')
      .eq('user_id', userId)
      .order('name');

    if (error) throw new InfrastructureError(`Failed to fetch locations: ${error.message}`);
    if (data && data.length > 0) return data as LeadLocation[];

    // Fallback: Check engine_locations catalog if user-specific lead_locations is empty
    const { data: engineData } = await this.client
      .from('engine_locations')
      .select('*')
      .order('area');

    if (engineData && engineData.length > 0) {
      return engineData.map((l) => ({
        id: l.id,
        user_id: userId,
        name: l.area || l.location_id,
        city: l.city,
        latitude: Number(l.latitude),
        longitude: Number(l.longitude),
        radius_km: Number(l.boundary_radius_km),
        status: (l.status as 'active' | 'paused' | 'completed') || 'active',
        created_at: l.created_at,
        updated_at: l.created_at,
      })) as LeadLocation[];
    }

    return [];
  }

  async createLocation(userId: string, data: CreateLeadLocationDTO): Promise<LeadLocation> {
    const { data: created, error } = await this.client
      .from('lead_locations')
      .insert({ ...data, user_id: userId })
      .select()
      .single();

    if (error) throw new InfrastructureError(`Failed to create location: ${error.message}`);
    return created as LeadLocation;
  }

  async updateLocation(userId: string, id: string, data: UpdateLeadLocationDTO): Promise<LeadLocation | null> {
    const { data: updated, error } = await this.client
      .from('lead_locations')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw new InfrastructureError(`Failed to update location: ${error.message}`);
    return (updated as LeadLocation) || null;
  }

  async deleteLocation(userId: string, id: string): Promise<boolean> {
    const { error } = await this.client
      .from('lead_locations')
      .delete()
      .eq('user_id', userId)
      .eq('id', id);

    if (error) throw new InfrastructureError(`Failed to delete location: ${error.message}`);
    return true;
  }

  // Coverage Plans
  async findCoveragePlans(userId: string): Promise<LeadCoveragePlan[]> {
    const { data, error } = await this.client
      .from('lead_coverage_plans')
      .select('*, niche:lead_niches(*), location:lead_locations(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new InfrastructureError(`Failed to fetch coverage plans: ${error.message}`);
    return (data as LeadCoveragePlan[]) || [];
  }

  async createCoveragePlan(userId: string, data: CreateLeadCoveragePlanDTO): Promise<LeadCoveragePlan> {
    const { data: created, error } = await this.client
      .from('lead_coverage_plans')
      .insert({ ...data, user_id: userId })
      .select('*, niche:lead_niches(*), location:lead_locations(*)')
      .single();

    if (error) throw new InfrastructureError(`Failed to create coverage plan: ${error.message}`);
    return created as LeadCoveragePlan;
  }

  async updateCoveragePlan(userId: string, id: string, data: UpdateLeadCoveragePlanDTO): Promise<LeadCoveragePlan | null> {
    const { data: updated, error } = await this.client
      .from('lead_coverage_plans')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('id', id)
      .select('*, niche:lead_niches(*), location:lead_locations(*)')
      .maybeSingle();

    if (error) throw new InfrastructureError(`Failed to update coverage plan: ${error.message}`);
    return (updated as LeadCoveragePlan) || null;
  }

  // Queue
  async findQueue(userId: string, status?: string): Promise<LeadQueryQueue[]> {
    let q = this.client
      .from('lead_query_queue')
      .select('*, niche:lead_niches(*), location:lead_locations(*)')
      .eq('user_id', userId)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true });

    if (status) q = q.eq('status', status);

    const { data, error } = await q;
    if (error) throw new InfrastructureError(`Failed to fetch queue: ${error.message}`);
    return (data as LeadQueryQueue[]) || [];
  }

  async createQueueItem(userId: string, data: CreateLeadQueryQueueDTO): Promise<LeadQueryQueue> {
    const { data: created, error } = await this.client
      .from('lead_query_queue')
      .insert({ ...data, user_id: userId })
      .select('*, niche:lead_niches(*), location:lead_locations(*)')
      .single();

    if (error) throw new InfrastructureError(`Failed to create queue item: ${error.message}`);
    return created as LeadQueryQueue;
  }

  async claimNextQueueItem(userId: string): Promise<LeadQueryQueue | null> {
    const { data: pending, error: selectErr } = await this.client
      .from('lead_query_queue')
      .select('*, niche:lead_niches(*), location:lead_locations(*)')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (selectErr || !pending) return null;

    const { data: updated, error: updateErr } = await this.client
      .from('lead_query_queue')
      .update({
        status: 'running',
        attempts: (pending.attempts || 0) + 1,
        dispatched_at: new Date().toISOString(),
      })
      .eq('id', pending.id)
      .select('*, niche:lead_niches(*), location:lead_locations(*)')
      .single();

    if (updateErr) return null;
    return updated as LeadQueryQueue;
  }

  async updateQueueItem(userId: string, id: string, data: UpdateLeadQueryQueueDTO): Promise<LeadQueryQueue | null> {
    const { data: updated, error } = await this.client
      .from('lead_query_queue')
      .update(data)
      .eq('user_id', userId)
      .eq('id', id)
      .select('*, niche:lead_niches(*), location:lead_locations(*)')
      .maybeSingle();

    if (error) throw new InfrastructureError(`Failed to update queue item: ${error.message}`);
    return (updated as LeadQueryQueue) || null;
  }

  // Logs & Stats
  async createLog(userId: string, log: Omit<LeadEngineLog, 'id' | 'user_id' | 'created_at'>): Promise<LeadEngineLog> {
    const { data, error } = await this.client
      .from('lead_engine_logs')
      .insert({ ...log, user_id: userId })
      .select()
      .single();

    if (error) throw new InfrastructureError(`Failed to log engine event: ${error.message}`);
    return data as LeadEngineLog;
  }

  async findLogs(userId: string, limit: number = 20): Promise<LeadEngineLog[]> {
    const { data, error } = await this.client
      .from('lead_engine_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new InfrastructureError(`Failed to fetch engine logs: ${error.message}`);
    return (data as LeadEngineLog[]) || [];
  }

  async getStats(userId: string): Promise<LeadEngineStats> {
    const { data: leads } = await this.client
      .from('leads')
      .select('status, score, score_tier, engine_status')
      .eq('user_id', userId)
      .is('archived_at', null);

    const { count: pendingQueue } = await this.client
      .from('lead_query_queue')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'pending');

    const { count: activeNiches } = await this.client
      .from('lead_niches')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true);

    const { count: activeLocs } = await this.client
      .from('lead_locations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'active');

    const list = leads || [];
    return {
      total_leads: list.length,
      pitch_ready: list.filter((l) => l.engine_status === 'pitch_ready').length,
      contacted: list.filter((l) => l.status === 'contacted').length,
      converted: list.filter((l) => l.status === 'converted').length,
      hot_leads: list.filter((l) => l.score_tier === 'hot' || l.score >= 70).length,
      pending_queue_jobs: pendingQueue || 0,
      active_niches: activeNiches || 0,
      active_locations: activeLocs || 0,
    };
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
