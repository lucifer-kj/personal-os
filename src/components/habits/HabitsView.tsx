"use client";

import * as React from "react";
import { HabitWithStreak, HabitSummaryStats, HabitFrequency } from "@/modules/habits/types";
import { HabitCard } from "./HabitCard";
import { HabitModal } from "./HabitModal";
import { Button } from "@/components/ui/button";
import { Plus, Flame, CheckCircle2, TrendingUp, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface HabitsViewProps {
  initialHabits?: HabitWithStreak[];
  initialStats?: HabitSummaryStats | null;
}

export function HabitsView({ initialHabits = [], initialStats = null }: HabitsViewProps) {
  const [habits, setHabits] = React.useState<HabitWithStreak[]>(initialHabits);
  const [stats, setStats] = React.useState<HabitSummaryStats | null>(initialStats);
  const [activeTab, setActiveTab] = React.useState<"active" | "archived">("active");
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const fetchHabits = React.useCallback(() => {
    fetch(`/api/v1/habits?is_archived=${activeTab === "archived"}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json) {
          setHabits(json.data || []);
          if (json.meta?.stats) {
            setStats(json.meta.stats);
          }
        }
      })
      .catch((err) => console.error("Failed to load habits:", err));
  }, [activeTab]);

  React.useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const handleCreateHabit = async (data: {
    name: string;
    description?: string;
    frequency?: HabitFrequency;
    target_days?: number[];
    color?: string;
  }) => {
    const res = await fetch("/api/v1/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errJson = await res.json();
      throw new Error(errJson.error || "Failed to create habit");
    }

    await fetchHabits();
  };

  const handleToggleCheckin = async (id: string) => {
    const today = format(new Date(), "yyyy-MM-dd");
    const res = await fetch(`/api/v1/habits/${id}/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: today }),
    });

    if (res.ok) {
      // Optimistically update
      setHabits((prev) =>
        prev.map((h) => {
          if (h.id !== id) return h;
          const nextState = !h.is_completed_today;
          const nextStreak = nextState ? h.current_streak + 1 : Math.max(0, h.current_streak - 1);
          return {
            ...h,
            is_completed_today: nextState,
            current_streak: nextStreak,
            recent_history: h.recent_history.map((item, idx) =>
              idx === h.recent_history.length - 1 ? { ...item, completed: nextState } : item
            ),
          };
        })
      );
      // Re-fetch stats asynchronously
      fetchHabits();
    }
  };

  const handleArchive = async (id: string) => {
    const res = await fetch(`/api/v1/habits/${id}/archive`, {
      method: "POST",
    });
    if (res.ok) {
      await fetchHabits();
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/v1/habits/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setHabits((prev) => prev.filter((h) => h.id !== id));
      await fetchHabits();
    }
  };

  const filteredHabits = habits.filter((h) =>
    activeTab === "active" ? !h.is_archived : h.is_archived
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
        <div>
          <h1 className="text-3xl font-serif font-medium text-[var(--foreground)] tracking-tight">
            Habits & Daily Rhythm
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1 font-serif italic">
            Deliberate small acts, compounded through calm consistency.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Habit</span>
        </Button>
      </div>

      {/* Summary Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-mono text-[var(--muted-foreground)] uppercase tracking-wider">
                Completed Today
              </p>
              <p className="text-2xl font-serif font-medium text-[var(--foreground)] mt-0.5">
                {stats.completed_today} / {stats.total_habits}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-mono text-[var(--muted-foreground)] uppercase tracking-wider">
                Today&apos;s Rate
              </p>
              <p className="text-2xl font-serif font-medium text-[var(--foreground)] mt-0.5">
                {stats.completion_rate_today}%
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Flame className="h-5 w-5 fill-amber-500" />
            </div>
            <div>
              <p className="text-xs font-mono text-[var(--muted-foreground)] uppercase tracking-wider">
                Best Current Streak
              </p>
              <p className="text-2xl font-serif font-medium text-[var(--foreground)] mt-0.5">
                {stats.best_streak} {stats.best_streak === 1 ? "day" : "days"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("active")}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
            activeTab === "active"
              ? "bg-[var(--foreground)] text-[var(--background)] shadow-xs"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/50"
          )}
        >
          Active Habits ({habits.filter((h) => !h.is_archived).length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("archived")}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
            activeTab === "archived"
              ? "bg-[var(--foreground)] text-[var(--background)] shadow-xs"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/50"
          )}
        >
          Archived ({habits.filter((h) => h.is_archived).length})
        </button>
      </div>

      {/* Habit List */}
      <div className="space-y-3">
        {filteredHabits.length > 0 ? (
          filteredHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggleCheckin={handleToggleCheckin}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="p-16 rounded-2xl border border-dashed border-[var(--border)] text-center flex flex-col items-center justify-center">
            <Sparkles className="h-8 w-8 text-[var(--muted-foreground)]/60 mb-2" />
            <h3 className="font-serif font-medium text-base text-[var(--foreground)]">
              {activeTab === "active" ? "No active habits found" : "No archived habits"}
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] max-w-sm mt-1">
              {activeTab === "active"
                ? "Cultivate calm momentum by defining a morning or evening ritual."
                : "Habits that you archive will appear here."}
            </p>
            {activeTab === "active" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="mt-4 gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create First Habit</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      <HabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateHabit}
      />
    </div>
  );
}
