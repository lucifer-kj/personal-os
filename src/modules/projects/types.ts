export type ProjectStatus =
  | "planned"
  | "active"
  | "on_hold"
  | "completed"
  | "archived";

export type ProjectPriority = "low" | "medium" | "high" | "urgent";

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  start_date?: string | null;
  due_date?: string | null;
  completed_at?: string | null;
  color?: string | null;
  icon?: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface ProjectMilestone {
  id: string;
  user_id: string;
  project_id: string;
  title: string;
  description?: string | null;
  due_date?: string | null;
  status: "pending" | "completed";
  completed_at?: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectStats {
  total_tasks: number;
  completed_tasks: number;
  progress_percent: number;
  total_milestones: number;
  completed_milestones: number;
}

export interface ProjectWithStats extends Project {
  stats: ProjectStats;
  milestones?: ProjectMilestone[];
}

export interface CreateProjectDTO {
  name: string;
  description?: string | null;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  start_date?: string | null;
  due_date?: string | null;
  color?: string | null;
  icon?: string | null;
}

export interface UpdateProjectDTO {
  name?: string;
  description?: string | null;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  start_date?: string | null;
  due_date?: string | null;
  color?: string | null;
  icon?: string | null;
  sort_order?: number;
}

export interface CreateMilestoneDTO {
  title: string;
  description?: string | null;
  due_date?: string | null;
  status?: "pending" | "completed";
}

export interface ProjectFilters {
  status?: ProjectStatus | ProjectStatus[];
  priority?: ProjectPriority | ProjectPriority[];
  search?: string;
  limit?: number;
  offset?: number;
  include_deleted?: boolean;
}
