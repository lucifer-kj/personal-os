import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { JournalView } from "./JournalView";
import { JournalEntry } from "@/modules/journal/types";

const todayStr = new Date().toISOString().split("T")[0];

const mockEntry: JournalEntry = {
  id: "j-1",
  user_id: "u-1",
  entry_date: todayStr,
  title: "Friday Deep Reflection",
  content: "Peaceful atmosphere and clean code.",
  mood: "great",
  energy_level: 5,
  reflection: "Focus and calm execution wins the day.",
  gratitude: ["Good health", "Quiet workspace"],
  tags: ["mindset"],
  created_at: "2026-11-06T00:00:00Z",
  updated_at: "2026-11-06T00:00:00Z",
};

describe("JournalView Component", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) => {
        if (url.includes(`/api/v1/journal?date=${todayStr}`)) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: mockEntry }),
          });
        }
        if (url.includes("/api/v1/journal")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: [mockEntry], meta: { total: 1 } }),
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      })
    );
  });

  it("renders journal writing surface, mood selector, and gratitude prompts", () => {
    render(<JournalView initialEntries={[mockEntry]} initialTodayEntry={mockEntry} />);

    expect(screen.getByText("Reflective Journal & Mind")).toBeDefined();
    expect(screen.getByDisplayValue("Friday Deep Reflection")).toBeDefined();
    expect(screen.getByDisplayValue("Peaceful atmosphere and clean code.")).toBeDefined();
    expect(screen.getByText("Three Grateful Observations")).toBeDefined();
  });

  it("allows selecting a mood pill and marking unsaved changes", async () => {
    render(<JournalView initialEntries={[mockEntry]} initialTodayEntry={mockEntry} />);

    const moodBtn = screen.getByRole("button", { name: /neutral/i });
    fireEvent.click(moodBtn);

    await waitFor(() => {
      expect(screen.getByText("Unsaved changes")).toBeDefined();
    });
  });

  it("triggers save entry on button click", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { ...mockEntry, title: "Saved Reflections" } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<JournalView initialEntries={[mockEntry]} initialTodayEntry={mockEntry} />);

    const saveBtn = screen.getByRole("button", { name: /save entry/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });
  });
});
