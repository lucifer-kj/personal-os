import { ILeadRepository, getLeadRepository } from './lead.repository';
import {
  Lead,
  LeadActivity,
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
  BatchIngestLeadsDTO,
} from './types';
import { SupabaseClient } from '@supabase/supabase-js';

export class LeadService {
  constructor(private repo: ILeadRepository) {}

  async listLeads(userId: string, filter?: LeadFilter): Promise<{ leads: Lead[]; total: number }> {
    return this.repo.findMany(userId, filter);
  }

  async getLead(userId: string, id: string): Promise<Lead | null> {
    return this.repo.findById(userId, id);
  }

  async createLead(userId: string, dto: CreateLeadDTO): Promise<Lead> {
    // Calculate initial lead score if not supplied
    let score = dto.score ?? 0;
    if (score === 0) {
      if (dto.email) score += 20;
      if (dto.phone) score += 20;
      if (dto.company || dto.business_name) score += 20;
      if (dto.linkedin_url) score += 15;
      if (dto.website) score += 10;
      if (dto.job_title) score += 15;
    }

    const lead = await this.repo.create(userId, {
      ...dto,
      score: Math.min(100, Math.max(0, score)),
    });

    // Log initial creation activity
    await this.repo.createActivity(
      userId,
      lead.id,
      'status_changed',
      `Lead created via ${lead.source}`,
      { source: lead.source, initial_score: lead.score }
    );

    return lead;
  }

  async updateLead(userId: string, id: string, dto: UpdateLeadDTO): Promise<Lead | null> {
    const existing = await this.repo.findById(userId, id);
    if (!existing) {
      return null;
    }

    const updated = await this.repo.update(userId, id, dto);

    // If status changed, log activity
    if (dto.status && dto.status !== existing.status) {
      await this.repo.createActivity(
        userId,
        id,
        'status_changed',
        `Status changed from ${existing.status} to ${dto.status}`,
        { previous_status: existing.status, new_status: dto.status }
      );
    }

    return updated;
  }

  async convertLead(userId: string, id: string, dto?: ConvertLeadDTO): Promise<ConvertLeadResult> {
    return this.repo.convert(userId, id, dto);
  }

  async archiveLead(userId: string, id: string): Promise<boolean> {
    return this.repo.delete(userId, id);
  }

  async batchIngest(
    userId: string,
    dto: BatchIngestLeadsDTO
  ): Promise<{ count: number; leads: Lead[] }> {
    const result = await this.repo.upsertBatch(userId, dto.leads);
    await this.repo.createLog(userId, {
      event_type: 'batch_ingest',
      component: dto.component || 'n8n_crawler',
      execution_id: dto.batch_id,
      details: { ingested_count: result.count },
      duration_ms: 0,
    });
    return result;
  }

  async listActivities(userId: string, leadId: string): Promise<LeadActivity[]> {
    return this.repo.findActivities(userId, leadId);
  }

  async addActivity(
    userId: string,
    leadId: string,
    activityType: string,
    summary: string,
    details?: Record<string, unknown>
  ): Promise<LeadActivity> {
    return this.repo.createActivity(userId, leadId, activityType, summary, details);
  }

  // Niches
  async listNiches(userId: string): Promise<LeadNiche[]> {
    return this.repo.findNiches(userId);
  }

  async createNiche(userId: string, dto: CreateLeadNicheDTO): Promise<LeadNiche> {
    return this.repo.createNiche(userId, dto);
  }

  async updateNiche(userId: string, id: string, dto: UpdateLeadNicheDTO): Promise<LeadNiche | null> {
    return this.repo.updateNiche(userId, id, dto);
  }

  async deleteNiche(userId: string, id: string): Promise<boolean> {
    return this.repo.deleteNiche(userId, id);
  }

  // Locations
  async listLocations(userId: string): Promise<LeadLocation[]> {
    return this.repo.findLocations(userId);
  }

  async createLocation(userId: string, dto: CreateLeadLocationDTO): Promise<LeadLocation> {
    return this.repo.createLocation(userId, dto);
  }

  async updateLocation(userId: string, id: string, dto: UpdateLeadLocationDTO): Promise<LeadLocation | null> {
    return this.repo.updateLocation(userId, id, dto);
  }

  async deleteLocation(userId: string, id: string): Promise<boolean> {
    return this.repo.deleteLocation(userId, id);
  }

  // Coverage Plans
  async listCoveragePlans(userId: string): Promise<LeadCoveragePlan[]> {
    return this.repo.findCoveragePlans(userId);
  }

  async createCoveragePlan(userId: string, dto: CreateLeadCoveragePlanDTO): Promise<LeadCoveragePlan> {
    return this.repo.createCoveragePlan(userId, dto);
  }

  async updateCoveragePlan(userId: string, id: string, dto: UpdateLeadCoveragePlanDTO): Promise<LeadCoveragePlan | null> {
    return this.repo.updateCoveragePlan(userId, id, dto);
  }

  // Query Queue
  async listQueue(userId: string, status?: string): Promise<LeadQueryQueue[]> {
    return this.repo.findQueue(userId, status);
  }

  async createQueueItem(userId: string, dto: CreateLeadQueryQueueDTO): Promise<LeadQueryQueue> {
    return this.repo.createQueueItem(userId, dto);
  }

  async claimNextQueueItem(userId: string): Promise<LeadQueryQueue | null> {
    return this.repo.claimNextQueueItem(userId);
  }

  async updateQueueItem(userId: string, id: string, dto: UpdateLeadQueryQueueDTO): Promise<LeadQueryQueue | null> {
    return this.repo.updateQueueItem(userId, id, dto);
  }

  // Telemetry & Stats
  async listLogs(userId: string, limit?: number): Promise<LeadEngineLog[]> {
    return this.repo.findLogs(userId, limit);
  }

  async getStats(userId: string): Promise<LeadEngineStats> {
    return this.repo.getStats(userId);
  }

  // Workflow Push Trigger
  async triggerWorkflow(
    userId: string,
    workflow: 'discovery' | 'filter' | 'audit' | 'pitch' | 'full_run',
    parameters: Record<string, unknown> = {}
  ): Promise<{ triggered: boolean; message: string; executionId?: string }> {
    const executionId = `exec-${Date.now()}`;
    const webhookMap: Record<string, string | undefined> = {
      discovery: process.env.N8N_DISCOVERY_WEBHOOK,
      filter: process.env.N8N_FILTER_WEBHOOK,
      audit: process.env.N8N_AUDIT_WEBHOOK,
      pitch: process.env.N8N_PITCH_WEBHOOK,
      full_run: process.env.N8N_FULL_RUN_WEBHOOK,
    };

    const webhookUrl = webhookMap[workflow];

    let externalDispatched = false;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, workflow, parameters, executionId }),
        });
        externalDispatched = true;
      } catch {
        // Non-blocking fallback
      }
    }

    await this.repo.createLog(userId, {
      event_type: 'workflow_trigger',
      component: `n8n_${workflow}`,
      execution_id: executionId,
      details: {
        workflow,
        parameters,
        dispatched_to_webhook: externalDispatched,
      },
      duration_ms: 0,
    });

    return {
      triggered: true,
      executionId,
      message: externalDispatched
        ? `Dispatched webhook to n8n for ${workflow}`
        : `Registered manual execution trigger for ${workflow}`,
    };
  }
}

export function createLeadService(client?: SupabaseClient | null): LeadService {
  const repo = getLeadRepository(client);
  return new LeadService(repo);
}
