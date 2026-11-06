import { IProjectRepository, getProjectRepository } from "./project.repository";
import { ITaskRepository, getTaskRepository } from "@/modules/tasks/task.repository";
import {
  Project,
  ProjectWithStats,
  CreateProjectDTO,
  UpdateProjectDTO,
  CreateMilestoneDTO,
  ProjectFilters,
  ProjectMilestone,
} from "./types";
import { SupabaseClient } from "@supabase/supabase-js";

export class ProjectService {
  constructor(
    private projectRepo: IProjectRepository,
    private taskRepo: ITaskRepository
  ) {}

  async listProjects(
    userId: string,
    filters?: ProjectFilters
  ): Promise<{ projects: ProjectWithStats[]; total: number }> {
    const { projects, total } = await this.projectRepo.findMany(userId, filters);

    // Compute stats for each project
    const withStats: ProjectWithStats[] = await Promise.all(
      projects.map(async (project) => {
        const stats = await this.computeProjectStats(userId, project);
        return {
          ...project,
          stats,
        };
      })
    );

    return { projects: withStats, total };
  }

  async getProject(
    userId: string,
    projectId: string
  ): Promise<ProjectWithStats | null> {
    const project = await this.projectRepo.findById(userId, projectId);
    if (!project) {
      return null;
    }

    const [stats, milestones] = await Promise.all([
      this.computeProjectStats(userId, project),
      this.projectRepo.findMilestones(userId, projectId),
    ]);

    return {
      ...project,
      stats,
      milestones,
    };
  }

  async createProject(userId: string, dto: CreateProjectDTO): Promise<Project> {
    return this.projectRepo.create(userId, dto);
  }

  async updateProject(
    userId: string,
    projectId: string,
    dto: UpdateProjectDTO
  ): Promise<Project | null> {
    const existing = await this.projectRepo.findById(userId, projectId);
    if (!existing) {
      return null;
    }

    let completed_at: string | null | undefined = undefined;

    if (dto.status) {
      if (dto.status === "completed" && existing.status !== "completed") {
        completed_at = new Date().toISOString();
      } else if (dto.status !== "completed" && existing.status === "completed") {
        completed_at = null;
      }
    }

    return this.projectRepo.update(userId, projectId, {
      ...dto,
      ...(completed_at !== undefined ? { completed_at } : {}),
      updated_at: new Date().toISOString(),
    });
  }

  async deleteProject(userId: string, projectId: string): Promise<boolean> {
    const existing = await this.projectRepo.findById(userId, projectId);
    if (!existing) {
      return false;
    }

    return this.projectRepo.delete(userId, projectId, false);
  }

  async createMilestone(
    userId: string,
    projectId: string,
    dto: CreateMilestoneDTO
  ): Promise<ProjectMilestone> {
    const project = await this.projectRepo.findById(userId, projectId);
    if (!project) {
      throw new Error(`Project with id '${projectId}' not found`);
    }

    return this.projectRepo.createMilestone(userId, projectId, dto);
  }

  async toggleMilestone(
    userId: string,
    projectId: string,
    milestoneId: string
  ): Promise<ProjectMilestone | null> {
    const milestones = await this.projectRepo.findMilestones(userId, projectId);
    const existing = milestones.find((m) => m.id === milestoneId);
    if (!existing) {
      return null;
    }

    const isNowCompleted = existing.status !== "completed";

    return this.projectRepo.updateMilestone(userId, milestoneId, {
      status: isNowCompleted ? "completed" : "pending",
      completed_at: isNowCompleted ? new Date().toISOString() : null,
    });
  }

  async deleteMilestone(
    userId: string,
    projectId: string,
    milestoneId: string
  ): Promise<boolean> {
    const milestones = await this.projectRepo.findMilestones(userId, projectId);
    const exists = milestones.some((m) => m.id === milestoneId);
    if (!exists) {
      return false;
    }

    return this.projectRepo.deleteMilestone(userId, milestoneId);
  }

  private async computeProjectStats(userId: string, project: Project) {
    const [{ tasks: projectTasks }, milestones] = await Promise.all([
      this.taskRepo.findMany(userId, { project_id: project.id }),
      this.projectRepo.findMilestones(userId, project.id),
    ]);

    const total_tasks = projectTasks.length;
    const completed_tasks = projectTasks.filter((t) => t.status === "completed").length;

    const total_milestones = milestones.length;
    const completed_milestones = milestones.filter((m) => m.status === "completed").length;

    let progress_percent = 0;
    if (total_tasks > 0) {
      progress_percent = Math.round((completed_tasks / total_tasks) * 100);
    } else if (project.status === "completed") {
      progress_percent = 100;
    }

    return {
      total_tasks,
      completed_tasks,
      progress_percent,
      total_milestones,
      completed_milestones,
    };
  }
}

export function createProjectService(client?: SupabaseClient | null): ProjectService {
  const projectRepo = getProjectRepository(client);
  const taskRepo = getTaskRepository(client);
  return new ProjectService(projectRepo, taskRepo);
}
