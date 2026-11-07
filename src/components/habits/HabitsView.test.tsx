import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { HabitsView } from "./HabitsView";
import { HabitWithStreak, HabitSummaryStats } from "@/modules/habits/types";

const mockHabits: HabitWithStreak[] = [
  {
    id: "habit-1",
    user_id: "u-1",
    name: "Morning Walk & Sunlight",
    description: "15 minutes fresh air",
    frequency: "daily",
    target_days: [1, 2, 3, 4, 5, 6, 7],
    target_count: 1,
    color: "amber",
    is_archived: false,
    is_completed_today: false,
    current_streak: 3,
    longest_streak: 5,
    total_completions: 12,
    recent_history: [
      { date: "2026-10-31", completed: true },
      { date: "2026-11-01", completed: true },
      { date: "2026-11-02", completed: true },
      { date: "2026-11-03", completed: false },
      { date: "2026-11-04", completed: true },
      { date: "2026-11-05", completed: true },
      { date: "2026-11-06", completed: false },
    ],
    created_at: "2026-10-20T00:00:00Z",
    updated_at: "2026-10-20T00:00:00Z",
  },
];

const mockStats: HabitSummaryStats = {
  total_habits: 1,
  completed_today: 0,
  completion_rate_today: 0,
  best_streak: 3,
};

describe("HabitsView Component", () => {
  let isCompleted = false;

  beforeEach(() => {
    isCompleted = false;
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string, init?: RequestInit) => {
        if (url.includes("/log") && init?.method === "POST") {
          isCompleted = !isCompleted;
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: { completed: isCompleted }, meta: { completed: isCompleted } }),
          });
        }
        if (url.includes("/api/v1/habits")) {
          const habits = mockHabits.map((h) => ({
            ...h,
            is_completed_today: isCompleted,
            current_streak: isCompleted ? 4 : 3,
          }));
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                data: habits,
                meta: {
                  stats: {
                    ...mockStats,
                    completed_today: isCompleted ? 1 : 0,
                    completion_rate_today: isCompleted ? 100 : 0,
                  },
                },
              }),
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      })
    );
  });

  it("renders habit list, streak badge, and summary stats", () => {
    render(<HabitsView initialHabits={mockHabits} initialStats={mockStats} />);

    expect(screen.getByText("Habits & Daily Rhythm")).toBeDefined();
    expect(screen.getByText("Morning Walk & Sunlight")).toBeDefined();
    expect(screen.getByText("3d")).toBeDefined();
    expect(screen.getByText("0 / 1")).toBeDefined();
    expect(screen.getByText("0%")).toBeDefined();
  });

  it("opens create habit modal when New Habit clicked", () => {
    render(<HabitsView initialHabits={mockHabits} initialStats={mockStats} />);

    const newBtn = screen.getByRole("button", { name: /new habit/i });
    fireEvent.click(newBtn);

    expect(screen.getByRole("heading", { name: "New Habit" })).toBeDefined();
    expect(screen.getByPlaceholderText(/e\.g\. 20-Minute Evening Reading/i)).toBeDefined();
  });

  it("handles checkin click with optimistic update", async () => {
    render(<HabitsView initialHabits={mockHabits} initialStats={mockStats} />);

    const toggleBtn = screen.getByRole("button", { name: "Mark habit complete" });
    fireEvent.click(toggleBtn);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Mark habit incomplete" })).toBeDefined();
    });
  });
});
