export type JournalMood = "great" | "good" | "neutral" | "low" | "rough";

export interface JournalEntry {
  id: string;
  user_id: string;
  entry_date: string; // YYYY-MM-DD
  title: string;
  content: string;
  mood: JournalMood | null;
  energy_level: number | null; // 1 - 5
  reflection: string;
  gratitude: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateJournalDTO {
  entry_date: string; // YYYY-MM-DD
  title?: string;
  content?: string;
  mood?: JournalMood | null;
  energy_level?: number | null;
  reflection?: string;
  gratitude?: string[];
  tags?: string[];
}

export interface UpdateJournalDTO {
  title?: string;
  content?: string;
  mood?: JournalMood | null;
  energy_level?: number | null;
  reflection?: string;
  gratitude?: string[];
  tags?: string[];
}

export interface JournalFilterParams {
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  mood?: JournalMood;
  tag?: string;
  search?: string;
  limit?: number;
  offset?: number;
}
