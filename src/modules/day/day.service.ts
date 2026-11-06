import { SupabaseClient } from "@supabase/supabase-js";
import { IDayRepository, getDayRepository } from "./day.repository";
import { ITaskRepository, getTaskRepository } from "@/modules/tasks/task.repository";
import { DailyPlan, DayOverviewDTO, DayMetrics } from "./types";
import { Task } from "@/modules/tasks/types";

export class DayService {
  constructor(
    private dayRepo: IDayRepository,
    private taskRepo: ITaskRepository
  ) {}

  async getDayOverview(userId: string, date: string): Promise<DayOverviewDTO> {
    const [plan, { tasks: allTasks }] = await Promise.all([
      this.dayRepo.findByDate(userId, date),
      this.taskRepo.findMany(userId, { limit: 200 }),
    ]);

    const activeTasks = allTasks.filter((t: Task) => !t.deleted_at);

    // Tasks due or scheduled on target date
    const tasksToday = activeTasks.filter((t: Task) => {
      if (t.due_date === date) return true;
      if (t.scheduled_start_at && t.scheduled_start_at.startsWith(date)) return true;
      return false;
    });

    // Overdue tasks: due before target date and not completed/cancelled
    const overdueTasks = activeTasks.filter((t: Task) => {
      if (!t.due_date) return false;
      const isPast = t.due_date < date;
      const isPending = t.status !== "completed" && t.status !== "cancelled";
      return isPast && isPending;
    });

    // Completed today: completed_at matches date or completed status on today's tasks
    const completedToday = activeTasks.filter((t: Task) => {
      if (t.status !== "completed") return false;
      if (t.completed_at && t.completed_at.startsWith(date)) return true;
      if (t.due_date === date) return true;
      return false;
    });

    const completedCount = tasksToday.filter((t: Task) => t.status === "completed").length;
    const pendingCount = tasksToday.length - completedCount;

    const estimatedMinutesTotal = tasksToday.reduce(
      (sum: number, t: Task) => sum + (t.estimated_minutes || 0),
      0
    );
    const actualMinutesTotal = tasksToday.reduce(
      (sum: number, t: Task) => sum + (t.actual_minutes || 0),
      0
    );

    const metrics: DayMetrics = {
      total_scheduled: tasksToday.length,
      completed_count: completedCount,
      pending_count: pendingCount,
      estimated_minutes_total: estimatedMinutesTotal,
      actual_minutes_total: actualMinutesTotal,
    };

    return {
      date,
      plan,
      intention: plan?.intention || null,
      tasks_today: tasksToday,
      overdue_tasks: overdueTasks,
      completed_today: completedToday,
      metrics,
    };
  }

  async setIntention(userId: string, date: string, intention: string): Promise<DailyPlan> {
    return this.dayRepo.upsertIntention(userId, date, intention);
  }

  async setShutdownNotes(userId: string, date: string, notes: string): Promise<DailyPlan> {
    return this.dayRepo.upsertShutdownNotes(userId, date, notes);
  }
}

export function createDayService(client?: SupabaseClient | null): DayService {
  const dayRepo = getDayRepository(client);
  const taskRepo = getTaskRepository(client);
  return new DayService(dayRepo, taskRepo);
}
