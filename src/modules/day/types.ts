import { Task } from "@/modules/tasks/types";

export interface DailyPlan {
  id: string;
  user_id: string;
  plan_date: string;
  intention: string | null;
  shutdown_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DayMetrics {
  total_scheduled: number;
  completed_count: number;
  pending_count: number;
  estimated_minutes_total: number;
  actual_minutes_total: number;
}

export interface DayOverviewDTO {
  date: string;
  plan: DailyPlan | null;
  intention: string | null;
  tasks_today: Task[];
  overdue_tasks: Task[];
  completed_today: Task[];
  metrics: DayMetrics;
}

export interface UpdateIntentionDTO {
  date: string;
  intention: string;
}
