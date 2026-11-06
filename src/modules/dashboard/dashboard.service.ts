import { SupabaseClient } from "@supabase/supabase-js";
import { DayService, createDayService } from "@/modules/day/day.service";
import { ProjectService, createProjectService } from "@/modules/projects/project.service";
import { DashboardOverviewDTO, DashboardMetrics } from "./types";
import { Task } from "@/modules/tasks/types";

export class DashboardService {
  constructor(
    private dayService: DayService,
    private projectService: ProjectService
  ) {}

  private getGreeting(date: Date = new Date()): string {
    const hours = date.getHours();
    if (hours < 12) return "Good morning";
    if (hours < 18) return "Good afternoon";
    return "Good evening";
  }

  async getDashboardOverview(userId: string, targetDate?: string): Promise<DashboardOverviewDTO> {
    const todayStr = targetDate || new Date().toISOString().split("T")[0];
    const greeting = this.getGreeting();

    const [dayOverview, { projects: activeProjects }] = await Promise.all([
      this.dayService.getDayOverview(userId, todayStr),
      this.projectService.listProjects(userId, { status: "active", limit: 6 }),
    ]);

    // Sort today's agenda: pending items first (urgent -> high -> medium -> low), then completed
    const priorityWeight: Record<string, number> = {
      urgent: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    const sortedAgenda = [...dayOverview.tasks_today].sort((a: Task, b: Task) => {
      const aDone = a.status === "completed" ? 1 : 0;
      const bDone = b.status === "completed" ? 1 : 0;
      if (aDone !== bDone) return aDone - bDone;

      const aWeight = priorityWeight[a.priority] || 0;
      const bWeight = priorityWeight[b.priority] || 0;
      if (aWeight !== bWeight) return bWeight - aWeight;

      return (a.sort_order || 0) - (b.sort_order || 0);
    });

    const metrics: DashboardMetrics = {
      tasks_completed_today: dayOverview.metrics.completed_count,
      tasks_pending_today: dayOverview.metrics.pending_count,
      estimated_focus_minutes: dayOverview.metrics.estimated_minutes_total,
      active_projects_count: activeProjects.length,
    };

    return {
      date: todayStr,
      greeting,
      intention: dayOverview.intention,
      metrics,
      today_agenda: sortedAgenda,
      overdue_tasks: dayOverview.overdue_tasks,
      active_projects: activeProjects,
    };
  }
}

export function createDashboardService(client?: SupabaseClient | null): DashboardService {
  const dayService = createDayService(client);
  const projectService = createProjectService(client);
  return new DashboardService(dayService, projectService);
}
