import { Task } from "@/modules/tasks/types";
import { ProjectWithStats } from "@/modules/projects/types";

export interface DashboardMetrics {
  tasks_completed_today: number;
  tasks_pending_today: number;
  estimated_focus_minutes: number;
  active_projects_count: number;
}

export interface DashboardOverviewDTO {
  date: string;
  greeting: string;
  intention: string | null;
  metrics: DashboardMetrics;
  today_agenda: Task[];
  overdue_tasks: Task[];
  active_projects: ProjectWithStats[];
}
