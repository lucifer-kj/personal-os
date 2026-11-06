import { ITaskRepository, getTaskRepository } from "./task.repository";
import { CreateTaskDTO, UpdateTaskDTO, TaskFilters, Task } from "./types";
import { SupabaseClient } from "@supabase/supabase-js";

export class TaskService {
  constructor(private repo: ITaskRepository) {}

  async listTasks(userId: string, filters?: TaskFilters): Promise<{ tasks: Task[]; total: number }> {
    return this.repo.findMany(userId, filters);
  }

  async getTask(userId: string, taskId: string): Promise<Task | null> {
    return this.repo.findById(userId, taskId);
  }

  async createTask(userId: string, dto: CreateTaskDTO): Promise<Task> {
    return this.repo.create(userId, dto);
  }

  async updateTask(userId: string, taskId: string, dto: UpdateTaskDTO): Promise<Task | null> {
    const existing = await this.repo.findById(userId, taskId);
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

    return this.repo.update(userId, taskId, {
      ...dto,
      ...(completed_at !== undefined ? { completed_at } : {}),
      updated_at: new Date().toISOString(),
    });
  }

  async completeTask(userId: string, taskId: string): Promise<Task | null> {
    const existing = await this.repo.findById(userId, taskId);
    if (!existing) {
      return null;
    }

    return this.repo.update(userId, taskId, {
      status: "completed",
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  async reopenTask(userId: string, taskId: string): Promise<Task | null> {
    const existing = await this.repo.findById(userId, taskId);
    if (!existing) {
      return null;
    }

    return this.repo.update(userId, taskId, {
      status: "todo",
      completed_at: null,
      updated_at: new Date().toISOString(),
    });
  }

  async deleteTask(userId: string, taskId: string): Promise<boolean> {
    const existing = await this.repo.findById(userId, taskId);
    if (!existing) {
      return false;
    }

    return this.repo.delete(userId, taskId, false);
  }
}

export function createTaskService(client?: SupabaseClient | null): TaskService {
  const repo = getTaskRepository(client);
  return new TaskService(repo);
}
