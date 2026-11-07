import { Project, ProjectMilestone, CreateProjectDTO, UpdateProjectDTO, CreateMilestoneDTO, ProjectFilters } from "./types";
import { SupabaseClient } from "@supabase/supabase-js";

export interface IProjectRepository {
  findMany(userId: string, filters?: ProjectFilters): Promise<{ projects: Project[]; total: number }>;
  findById(userId: string, projectId: string): Promise<Project | null>;
  create(userId: string, data: CreateProjectDTO): Promise<Project>;
  update(
    userId: string,
    projectId: string,
    data: UpdateProjectDTO & { completed_at?: string | null; deleted_at?: string | null; updated_at?: string }
  ): Promise<Project | null>;
  delete(userId: string, projectId: string, hard?: boolean): Promise<boolean>;
  findMilestones(userId: string, projectId: string): Promise<ProjectMilestone[]>;
  createMilestone(userId: string, projectId: string, data: CreateMilestoneDTO): Promise<ProjectMilestone>;
  updateMilestone(userId: string, milestoneId: string, data: Partial<ProjectMilestone>): Promise<ProjectMilestone | null>;
  deleteMilestone(userId: string, milestoneId: string): Promise<boolean>;
}

export class InMemoryProjectRepository implements IProjectRepository {
  private projects: Map<string, Project> = new Map();
  private milestones: Map<string, ProjectMilestone> = new Map();

  async findMany(
    userId: string,
    filters: ProjectFilters = {}
  ): Promise<{ projects: Project[]; total: number }> {
    let result = Array.from(this.projects.values()).filter(
      (p) => p.user_id === userId
    );

    if (!filters.include_deleted) {
      result = result.filter((p) => !p.deleted_at);
    }

    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      result = result.filter((p) => statuses.includes(p.status));
    }

    if (filters.priority) {
      const priorities = Array.isArray(filters.priority) ? filters.priority : [filters.priority];
      result = result.filter((p) => priorities.includes(p.priority));
    }

    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          (p.description && p.description.toLowerCase().includes(term))
      );
    }

    result.sort((a, b) => {
      if (a.sort_order !== b.sort_order) {
        return a.sort_order - b.sort_order;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const total = result.length;
    const offset = filters.offset || 0;
    const limit = filters.limit || 25;
    const paginated = result.slice(offset, offset + limit);

    return { projects: paginated, total };
  }

  async findById(userId: string, projectId: string): Promise<Project | null> {
    const project = this.projects.get(projectId);
    if (!project || project.user_id !== userId) {
      return null;
    }
    return project;
  }

  async create(userId: string, data: CreateProjectDTO): Promise<Project> {
    const now = new Date().toISOString();
    const id = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `proj-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const newProject: Project = {
      id,
      user_id: userId,
      name: data.name,
      description: data.description || null,
      status: data.status || "active",
      priority: data.priority || "medium",
      start_date: data.start_date || null,
      due_date: data.due_date || null,
      completed_at: data.status === "completed" ? now : null,
      color: data.color || null,
      icon: data.icon || null,
      sort_order: 0,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };

    this.projects.set(id, newProject);
    return newProject;
  }

  async update(
    userId: string,
    projectId: string,
    data: UpdateProjectDTO & { completed_at?: string | null; deleted_at?: string | null; updated_at?: string }
  ): Promise<Project | null> {
    const existing = await this.findById(userId, projectId);
    if (!existing) {
      return null;
    }

    const updated: Project = {
      ...existing,
      ...data,
      updated_at: data.updated_at || new Date().toISOString(),
    };

    this.projects.set(projectId, updated);
    return updated;
  }

  async delete(userId: string, projectId: string, hard = false): Promise<boolean> {
    const existing = await this.findById(userId, projectId);
    if (!existing) {
      return false;
    }

    if (hard) {
      this.projects.delete(projectId);
    } else {
      existing.deleted_at = new Date().toISOString();
      this.projects.set(projectId, existing);
    }

    return true;
  }

  async findMilestones(userId: string, projectId: string): Promise<ProjectMilestone[]> {
    return Array.from(this.milestones.values())
      .filter((m) => m.user_id === userId && m.project_id === projectId)
      .sort((a, b) => a.sort_order - b.sort_order);
  }

  async createMilestone(userId: string, projectId: string, data: CreateMilestoneDTO): Promise<ProjectMilestone> {
    const now = new Date().toISOString();
    const id = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `mile-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const milestone: ProjectMilestone = {
      id,
      user_id: userId,
      project_id: projectId,
      title: data.title,
      description: data.description || null,
      due_date: data.due_date || null,
      status: data.status || "pending",
      completed_at: data.status === "completed" ? now : null,
      sort_order: this.milestones.size,
      created_at: now,
      updated_at: now,
    };

    this.milestones.set(id, milestone);
    return milestone;
  }

  async updateMilestone(
    userId: string,
    milestoneId: string,
    data: Partial<ProjectMilestone>
  ): Promise<ProjectMilestone | null> {
    const existing = this.milestones.get(milestoneId);
    if (!existing || existing.user_id !== userId) {
      return null;
    }

    const updated: ProjectMilestone = {
      ...existing,
      ...data,
      updated_at: new Date().toISOString(),
    };

    this.milestones.set(milestoneId, updated);
    return updated;
  }

  async deleteMilestone(userId: string, milestoneId: string): Promise<boolean> {
    const existing = this.milestones.get(milestoneId);
    if (!existing || existing.user_id !== userId) {
      return false;
    }

    return this.milestones.delete(milestoneId);
  }

  clear() {
    this.projects.clear();
    this.milestones.clear();
  }
}

class SupabaseProjectRepository implements IProjectRepository {
  constructor(private client: SupabaseClient) {}

  async findMany(
    userId: string,
    filters: ProjectFilters = {}
  ): Promise<{ projects: Project[]; total: number }> {
    let query = this.client
      .from("projects")
      .select("*", { count: "exact" })
      .eq("user_id", userId);

    if (!filters.include_deleted) {
      query = query.is("deleted_at", null);
    }

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query = query.in("status", filters.status);
      } else {
        query = query.eq("status", filters.status);
      }
    }

    if (filters.priority) {
      if (Array.isArray(filters.priority)) {
        query = query.in("priority", filters.priority);
      } else {
        query = query.eq("priority", filters.priority);
      }
    }

    if (filters.search) {
      query = query.ilike("name", `%${filters.search}%`);
    }

    const offset = filters.offset || 0;
    const limit = filters.limit || 25;

    query = query
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) {
      throw new Error(`Failed to list projects: ${error.message}`);
    }

    return { projects: (data as Project[]) || [], total: count || 0 };
  }

  async findById(userId: string, projectId: string): Promise<Project | null> {
    const { data, error } = await this.client
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .eq("id", projectId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as Project;
  }

  async create(userId: string, data: CreateProjectDTO): Promise<Project> {
    const now = new Date().toISOString();
    const payload = {
      ...data,
      user_id: userId,
      completed_at: data.status === "completed" ? now : null,
      created_at: now,
      updated_at: now,
    };

    const { data: created, error } = await this.client
      .from("projects")
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }

    return created as Project;
  }

  async update(
    userId: string,
    projectId: string,
    data: UpdateProjectDTO & { completed_at?: string | null; deleted_at?: string | null; updated_at?: string }
  ): Promise<Project | null> {
    const payload = {
      ...data,
      updated_at: data.updated_at || new Date().toISOString(),
    };

    const { data: updated, error } = await this.client
      .from("projects")
      .update(payload)
      .eq("user_id", userId)
      .eq("id", projectId)
      .select()
      .single();

    if (error) {
      return null;
    }

    return updated as Project;
  }

  async delete(userId: string, projectId: string, hard = false): Promise<boolean> {
    if (hard) {
      const { error } = await this.client
        .from("projects")
        .delete()
        .eq("user_id", userId)
        .eq("id", projectId);
      return !error;
    }

    const { error } = await this.client
      .from("projects")
      .update({ deleted_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("id", projectId);

    return !error;
  }

  async findMilestones(userId: string, projectId: string): Promise<ProjectMilestone[]> {
    const { data, error } = await this.client
      .from("project_milestones")
      .select("*")
      .eq("user_id", userId)
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true });

    if (error) {
      return [];
    }

    return (data as ProjectMilestone[]) || [];
  }

  async createMilestone(userId: string, projectId: string, data: CreateMilestoneDTO): Promise<ProjectMilestone> {
    const now = new Date().toISOString();
    const payload = {
      ...data,
      user_id: userId,
      project_id: projectId,
      completed_at: data.status === "completed" ? now : null,
      created_at: now,
      updated_at: now,
    };

    const { data: created, error } = await this.client
      .from("project_milestones")
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create milestone: ${error.message}`);
    }

    return created as ProjectMilestone;
  }

  async updateMilestone(
    userId: string,
    milestoneId: string,
    data: Partial<ProjectMilestone>
  ): Promise<ProjectMilestone | null> {
    const { data: updated, error } = await this.client
      .from("project_milestones")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("id", milestoneId)
      .select()
      .single();

    if (error) {
      return null;
    }

    return updated as ProjectMilestone;
  }

  async deleteMilestone(userId: string, milestoneId: string): Promise<boolean> {
    const { error } = await this.client
      .from("project_milestones")
      .delete()
      .eq("user_id", userId)
      .eq("id", milestoneId);

    return !error;
  }
}

const globalInMemoryProjectRepo = new InMemoryProjectRepository();

export function getProjectRepository(client?: SupabaseClient | null): IProjectRepository {
  if (client) {
    return new SupabaseProjectRepository(client);
  }
  return globalInMemoryProjectRepo;
}

export function getInMemoryProjectRepository(): InMemoryProjectRepository {
  return globalInMemoryProjectRepo;
}
