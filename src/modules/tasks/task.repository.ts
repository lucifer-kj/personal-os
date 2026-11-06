import { Task, CreateTaskDTO, UpdateTaskDTO, TaskFilters } from "./types";
import { SupabaseClient } from "@supabase/supabase-js";

export interface ITaskRepository {
  findMany(userId: string, filters?: TaskFilters): Promise<{ tasks: Task[]; total: number }>;
  findById(userId: string, taskId: string): Promise<Task | null>;
  create(userId: string, data: CreateTaskDTO): Promise<Task>;
  update(
    userId: string,
    taskId: string,
    data: UpdateTaskDTO & { completed_at?: string | null; deleted_at?: string | null; updated_at?: string }
  ): Promise<Task | null>;
  delete(userId: string, taskId: string, hard?: boolean): Promise<boolean>;
}

// In-Memory store for tests and local development when Supabase DB is offline
class InMemoryTaskRepository implements ITaskRepository {
  private tasks: Map<string, Task> = new Map();

  async findMany(
    userId: string,
    filters: TaskFilters = {}
  ): Promise<{ tasks: Task[]; total: number }> {
    let result = Array.from(this.tasks.values()).filter(
      (t) => t.user_id === userId
    );

    if (!filters.include_deleted) {
      result = result.filter((t) => !t.deleted_at);
    }

    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      result = result.filter((t) => statuses.includes(t.status));
    }

    if (filters.priority) {
      const priorities = Array.isArray(filters.priority) ? filters.priority : [filters.priority];
      result = result.filter((t) => priorities.includes(t.priority));
    }

    if (filters.project_id) {
      result = result.filter((t) => t.project_id === filters.project_id);
    }

    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(term) ||
          (t.description && t.description.toLowerCase().includes(term))
      );
    }

    // Sort by sort_order ascending, then created_at descending
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

    return { tasks: paginated, total };
  }

  async findById(userId: string, taskId: string): Promise<Task | null> {
    const task = this.tasks.get(taskId);
    if (!task || task.user_id !== userId) {
      return null;
    }
    return task;
  }

  async create(userId: string, data: CreateTaskDTO): Promise<Task> {
    const now = new Date().toISOString();
    const id = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const newTask: Task = {
      id,
      user_id: userId,
      title: data.title,
      description: data.description || null,
      status: data.status || "todo",
      priority: data.priority || "medium",
      due_at: data.due_at || null,
      due_date: data.due_date || (data.due_at ? data.due_at.split("T")[0] : null),
      project_id: data.project_id || null,
      task_list_id: data.task_list_id || null,
      parent_task_id: data.parent_task_id || null,
      estimated_minutes: data.estimated_minutes || null,
      actual_minutes: null,
      scheduled_start_at: data.scheduled_start_at || null,
      scheduled_end_at: data.scheduled_end_at || null,
      completed_at: data.status === "completed" ? now : null,
      is_recurring: false,
      recurrence_rule: null,
      source_type: "manual",
      source_id: null,
      sort_order: 0,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };

    this.tasks.set(id, newTask);
    return newTask;
  }

  async update(
    userId: string,
    taskId: string,
    data: UpdateTaskDTO & { completed_at?: string | null; deleted_at?: string | null; updated_at?: string }
  ): Promise<Task | null> {
    const existing = await this.findById(userId, taskId);
    if (!existing) {
      return null;
    }

    const updated: Task = {
      ...existing,
      ...data,
      updated_at: data.updated_at || new Date().toISOString(),
    };

    this.tasks.set(taskId, updated);
    return updated;
  }

  async delete(userId: string, taskId: string, hard = false): Promise<boolean> {
    const existing = await this.findById(userId, taskId);
    if (!existing) {
      return false;
    }

    if (hard) {
      this.tasks.delete(taskId);
    } else {
      existing.deleted_at = new Date().toISOString();
      this.tasks.set(taskId, existing);
    }

    return true;
  }

  // Clear helper for clean test runs
  clear() {
    this.tasks.clear();
  }
}

class SupabaseTaskRepository implements ITaskRepository {
  constructor(private client: SupabaseClient) {}

  async findMany(
    userId: string,
    filters: TaskFilters = {}
  ): Promise<{ tasks: Task[]; total: number }> {
    let query = this.client
      .from("tasks")
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

    if (filters.project_id) {
      query = query.eq("project_id", filters.project_id);
    }

    if (filters.search) {
      query = query.ilike("title", `%${filters.search}%`);
    }

    const offset = filters.offset || 0;
    const limit = filters.limit || 25;

    query = query
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) {
      throw new Error(`Failed to list tasks: ${error.message}`);
    }

    return { tasks: (data as Task[]) || [], total: count || 0 };
  }

  async findById(userId: string, taskId: string): Promise<Task | null> {
    const { data, error } = await this.client
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("id", taskId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as Task;
  }

  async create(userId: string, data: CreateTaskDTO): Promise<Task> {
    const now = new Date().toISOString();
    const payload = {
      ...data,
      user_id: userId,
      completed_at: data.status === "completed" ? now : null,
      created_at: now,
      updated_at: now,
    };

    const { data: created, error } = await this.client
      .from("tasks")
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create task: ${error.message}`);
    }

    return created as Task;
  }

  async update(
    userId: string,
    taskId: string,
    data: UpdateTaskDTO & { completed_at?: string | null; deleted_at?: string | null; updated_at?: string }
  ): Promise<Task | null> {
    const payload = {
      ...data,
      updated_at: data.updated_at || new Date().toISOString(),
    };

    const { data: updated, error } = await this.client
      .from("tasks")
      .update(payload)
      .eq("user_id", userId)
      .eq("id", taskId)
      .select()
      .single();

    if (error) {
      return null;
    }

    return updated as Task;
  }

  async delete(userId: string, taskId: string, hard = false): Promise<boolean> {
    if (hard) {
      const { error } = await this.client
        .from("tasks")
        .delete()
        .eq("user_id", userId)
        .eq("id", taskId);
      return !error;
    }

    const { error } = await this.client
      .from("tasks")
      .update({ deleted_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("id", taskId);

    return !error;
  }
}

// Global in-memory singleton for development / testing
const globalInMemoryRepo = new InMemoryTaskRepository();

export function getTaskRepository(client?: SupabaseClient | null): ITaskRepository {
  if (client) {
    return new SupabaseTaskRepository(client);
  }
  return globalInMemoryRepo;
}

export function getInMemoryTaskRepository(): InMemoryTaskRepository {
  return globalInMemoryRepo;
}
