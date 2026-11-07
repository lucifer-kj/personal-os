export type HabitFrequency = "daily" | "weekdays" | "weekends" | "custom";

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string;
  frequency: HabitFrequency;
  target_days: number[]; // 1 = Mon, 7 = Sun
  target_count: number;
  color: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  user_id: string;
  habit_id: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  count: number;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface HabitRecentDay {
  date: string; // YYYY-MM-DD
  completed: boolean;
}

export interface HabitWithStreak extends Habit {
  is_completed_today: boolean;
  current_streak: number;
  longest_streak: number;
  total_completions: number;
  recent_history: HabitRecentDay[];
}

export interface HabitSummaryStats {
  total_habits: number;
  completed_today: number;
  completion_rate_today: number; // 0 - 100 percentage
  best_streak: number;
}

export interface CreateHabitDTO {
  name: string;
  description?: string;
  frequency?: HabitFrequency;
  target_days?: number[];
  target_count?: number;
  color?: string;
}

export interface UpdateHabitDTO {
  name?: string;
  description?: string;
  frequency?: HabitFrequency;
  target_days?: number[];
  target_count?: number;
  color?: string;
  is_archived?: boolean;
}

export interface LogHabitDTO {
  date: string; // YYYY-MM-DD
  completed?: boolean;
  count?: number;
  note?: string;
}

export interface HabitFilterParams {
  is_archived?: boolean;
  date?: string; // Reference date for completion check (defaults to today)
}
