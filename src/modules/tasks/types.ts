export type TaskStatus =
  | "inbox"
  | "todo"
  | "in_progress"
  | "blocked"
  | "completed"
  | "cancelled";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  user_id: string;
  project_id?: string | null;
  task_list_id?: string | null;
  parent_task_id?: string | null;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_at?: string | null; // ISO 8601 UTC
  due_date?: string | null; // YYYY-MM-DD
  scheduled_start_at?: string | null;
  scheduled_end_at?: string | null;
  estimated_minutes?: number | null;
  actual_minutes?: number | null;
  completed_at?: string | null;
  is_recurring: boolean;
  recurrence_rule?: string | null;
  source_type?: "manual" | "inbox" | "meeting" | "automation" | "ai" | null;
  source_id?: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateTaskDTO {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_at?: string | null;
  due_date?: string | null;
  project_id?: string | null;
  task_list_id?: string | null;
  parent_task_id?: string | null;
  estimated_minutes?: number | null;
  actual_minutes?: number | null;
  scheduled_start_at?: string | null;
  scheduled_end_at?: string | null;
  source_type?: "manual" | "inbox" | "meeting" | "automation" | "ai" | null;
  source_id?: string | null;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_at?: string | null;
  due_date?: string | null;
  project_id?: string | null;
  task_list_id?: string | null;
  parent_task_id?: string | null;
  estimated_minutes?: number | null;
  actual_minutes?: number | null;
  scheduled_start_at?: string | null;
  scheduled_end_at?: string | null;
  source_type?: "manual" | "inbox" | "meeting" | "automation" | "ai" | null;
  source_id?: string | null;
  sort_order?: number;
}

export interface TaskFilters {
  status?: TaskStatus | TaskStatus[];
  priority?: TaskPriority | TaskPriority[];
  project_id?: string;
  search?: string;
  due_before?: string;
  due_after?: string;
  limit?: number;
  offset?: number;
  include_deleted?: boolean;
}
