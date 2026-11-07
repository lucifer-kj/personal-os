import { IJournalRepository, getJournalRepository } from "./journal.repository";
import {
  JournalEntry,
  CreateJournalDTO,
  UpdateJournalDTO,
  JournalFilterParams,
  JournalMood,
} from "./types";

export class JournalService {
  constructor(private journalRepo: IJournalRepository = getJournalRepository()) {}

  async saveEntry(userId: string, data: CreateJournalDTO): Promise<JournalEntry> {
    return this.journalRepo.upsertEntry(userId, data);
  }

  async getEntryById(userId: string, id: string): Promise<JournalEntry | null> {
    return this.journalRepo.findById(userId, id);
  }

  async getEntryByDate(userId: string, date: string): Promise<JournalEntry | null> {
    return this.journalRepo.findByDate(userId, date);
  }

  async listEntries(
    userId: string,
    filter?: JournalFilterParams
  ): Promise<{ entries: JournalEntry[]; total: number }> {
    return this.journalRepo.findMany(userId, filter);
  }

  async updateEntry(userId: string, id: string, data: UpdateJournalDTO): Promise<JournalEntry> {
    return this.journalRepo.update(userId, id, data);
  }

  async deleteEntry(userId: string, id: string): Promise<boolean> {
    return this.journalRepo.delete(userId, id);
  }

  async getMoodTrends(userId: string, days: number = 14) {
    const today = new Date();
    const fromDate = new Date();
    fromDate.setDate(today.getDate() - days);

    const from = fromDate.toISOString().split("T")[0];
    const to = today.toISOString().split("T")[0];

    const { entries } = await this.journalRepo.findMany(userId, { from, to, limit: 100 });

    const moodCounts: Record<JournalMood, number> = {
      great: 0,
      good: 0,
      neutral: 0,
      low: 0,
      rough: 0,
    };

    let totalEnergy = 0;
    let energyCount = 0;

    for (const entry of entries) {
      if (entry.mood && moodCounts[entry.mood] !== undefined) {
        moodCounts[entry.mood]++;
      }
      if (entry.energy_level !== null) {
        totalEnergy += entry.energy_level;
        energyCount++;
      }
    }

    const averageEnergy = energyCount > 0 ? Number((totalEnergy / energyCount).toFixed(1)) : null;

    return {
      period_days: days,
      entries_count: entries.length,
      mood_counts: moodCounts,
      average_energy: averageEnergy,
    };
  }
}
