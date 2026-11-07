import { IHabitRepository, getHabitRepository } from "./habit.repository";
import { getLocalDateIso, getPastLocalDateIso } from "@/lib/utils";
import {
  Habit,
  HabitLog,
  HabitWithStreak,
  HabitRecentDay,
  HabitSummaryStats,
  CreateHabitDTO,
  UpdateHabitDTO,
  LogHabitDTO,
  HabitFilterParams,
} from "./types";

export class HabitService {
  constructor(private habitRepo: IHabitRepository = getHabitRepository()) {}

  async createHabit(userId: string, data: CreateHabitDTO): Promise<Habit> {
    return this.habitRepo.createHabit(userId, data);
  }

  async getHabitById(userId: string, id: string, referenceDate?: string): Promise<HabitWithStreak | null> {
    const habit = await this.habitRepo.findById(userId, id);
    if (!habit) return null;

    const todayStr = referenceDate || this.getTodayIso();
    const logs = await this.habitRepo.findLogsByHabit(userId, id);
    return this.enrichHabitWithStreak(habit, logs, todayStr);
  }

  async listHabits(userId: string, params?: HabitFilterParams): Promise<HabitWithStreak[]> {
    const referenceDate = params?.date || this.getTodayIso();
    const habits = await this.habitRepo.findMany(userId, params);

    // Fetch logs for the past 60 days to calculate streaks efficiently
    const past60Days = this.getPastDateIso(referenceDate, 60);
    const futureDate = this.getPastDateIso(referenceDate, -1);
    const logs = await this.habitRepo.findLogsByDateRange(userId, past60Days, futureDate);

    // Group logs by habit_id
    const logsByHabit = new Map<string, typeof logs>();
    for (const log of logs) {
      const existing = logsByHabit.get(log.habit_id) || [];
      existing.push(log);
      logsByHabit.set(log.habit_id, existing);
    }

    return habits.map((habit) => {
      const habitLogs = logsByHabit.get(habit.id) || [];
      return this.enrichHabitWithStreak(habit, habitLogs, referenceDate);
    });
  }

  async updateHabit(userId: string, id: string, data: UpdateHabitDTO): Promise<Habit> {
    return this.habitRepo.update(userId, id, data);
  }

  async deleteHabit(userId: string, id: string): Promise<boolean> {
    return this.habitRepo.delete(userId, id);
  }

  async toggleCheckin(
    userId: string,
    habitId: string,
    date: string,
    note?: string
  ): Promise<{ log: HabitLog; completed: boolean }> {
    const existing = await this.habitRepo.findLog(userId, habitId, date);
    const newStatus = existing ? !existing.completed : true;

    const log = await this.habitRepo.upsertLog(userId, habitId, {
      date,
      completed: newStatus,
      count: newStatus ? 1 : 0,
      note: note || "",
    });

    return { log, completed: newStatus };
  }

  async logCheckin(userId: string, habitId: string, data: LogHabitDTO) {
    return this.habitRepo.upsertLog(userId, habitId, data);
  }

  async getSummaryStats(userId: string, referenceDate?: string): Promise<HabitSummaryStats> {
    const today = referenceDate || this.getTodayIso();
    const habits = await this.listHabits(userId, { is_archived: false, date: today });

    const total = habits.length;
    const completedToday = habits.filter((h) => h.is_completed_today).length;
    const rate = total > 0 ? Math.round((completedToday / total) * 100) : 0;
    const bestStreak = habits.reduce((max, h) => Math.max(max, h.current_streak), 0);

    return {
      total_habits: total,
      completed_today: completedToday,
      completion_rate_today: rate,
      best_streak: bestStreak,
    };
  }

  // --- Streak & Calculation Helpers ---

  private enrichHabitWithStreak(
    habit: Habit,
    logs: { date: string; completed: boolean }[],
    todayStr: string
  ): HabitWithStreak {
    const completedDates = new Set(
      logs.filter((l) => l.completed).map((l) => l.date)
    );

    const isCompletedToday = completedDates.has(todayStr);

    // Calculate current streak
    let currentStreak = 0;
    let checkDate = isCompletedToday ? todayStr : this.getPastDateIso(todayStr, 1);

    while (completedDates.has(checkDate)) {
      currentStreak++;
      checkDate = this.getPastDateIso(checkDate, 1);
    }

    // Calculate longest streak
    const sortedCompleted = Array.from(completedDates).sort();
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: string | null = null;

    for (const dateStr of sortedCompleted) {
      if (!lastDate) {
        tempStreak = 1;
      } else {
        const expectedNext = this.getPastDateIso(lastDate, -1); // +1 day forward
        if (dateStr === expectedNext) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
      lastDate = dateStr;
    }

    // Calculate recent history (last 7 days including today)
    const recentHistory: HabitRecentDay[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = this.getPastDateIso(todayStr, i);
      recentHistory.push({
        date: d,
        completed: completedDates.has(d),
      });
    }

    return {
      ...habit,
      is_completed_today: isCompletedToday,
      current_streak: currentStreak,
      longest_streak: Math.max(longestStreak, currentStreak),
      total_completions: completedDates.size,
      recent_history: recentHistory,
    };
  }

  private getTodayIso(): string {
    return getLocalDateIso();
  }

  private getPastDateIso(baseDateIso: string, daysAgo: number): string {
    return getPastLocalDateIso(baseDateIso, daysAgo);
  }
}
