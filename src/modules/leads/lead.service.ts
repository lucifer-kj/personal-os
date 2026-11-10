import { ILeadRepository, getLeadRepository } from './lead.repository';
import {
  Lead,
  LeadActivity,
  CreateLeadDTO,
  UpdateLeadDTO,
  ConvertLeadDTO,
  ConvertLeadResult,
  LeadFilter,
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
      if (dto.company) score += 20;
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
}

export function createLeadService(client?: SupabaseClient | null): LeadService {
  const repo = getLeadRepository(client);
  return new LeadService(repo);
}
