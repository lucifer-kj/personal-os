import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FocusView } from "./FocusView";
import { ActiveFocusSession } from "@/modules/focus/types";

describe("FocusView component", () => {
  it("renders the start session state when no active session exists", () => {
    render(<FocusView initialActiveSession={null} />);

    expect(screen.getByText("Begin Focus Session")).toBeDefined();
    expect(screen.getByText("Deep Work")).toBeDefined();
    expect(screen.getByText("Pomodoro")).toBeDefined();
    expect(screen.getByText("Short Break (5m)")).toBeDefined();
  });

  it("renders active running session with formatted timer and controls", () => {
    const mockSession: ActiveFocusSession = {
      session: {
        id: "session-1",
        user_id: "user-1",
        time_entry_id: "entry-1",
        session_mode: "deep_work",
        status: "running",
        planned_duration_seconds: 1500,
        paused_duration_seconds: 0,
        paused_at: null,
        interruption_count: 0,
        session_rating: null,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      timeEntry: {
        id: "entry-1",
        user_id: "user-1",
        task_id: null,
        project_id: null,
        description: "Draft architecture plan",
        started_at: new Date().toISOString(),
        ended_at: null,
        duration_seconds: null,
        entry_type: "focus",
        is_billable: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      elapsed_seconds: 0,
      remaining_seconds: 1500, // 25:00
    };

    render(<FocusView initialActiveSession={mockSession} />);

    expect(screen.getByText("25:00")).toBeDefined();
    expect(screen.getByText("Focus in Progress")).toBeDefined();
    expect(screen.getByText("Draft architecture plan")).toBeDefined();
    expect(screen.getByRole("button", { name: /pause timer/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /finish session/i })).toBeDefined();
  });

  it("allows toggling to the completion reflection view", () => {
    const mockSession: ActiveFocusSession = {
      session: {
        id: "session-1",
        user_id: "user-1",
        time_entry_id: "entry-1",
        session_mode: "deep_work",
        status: "running",
        planned_duration_seconds: 1500,
        paused_duration_seconds: 0,
        paused_at: null,
        interruption_count: 0,
        session_rating: null,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      timeEntry: {
        id: "entry-1",
        user_id: "user-1",
        task_id: null,
        project_id: null,
        description: null,
        started_at: new Date().toISOString(),
        ended_at: null,
        duration_seconds: null,
        entry_type: "focus",
        is_billable: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      elapsed_seconds: 1500,
      remaining_seconds: 0,
    };

    render(<FocusView initialActiveSession={mockSession} />);

    const finishBtn = screen.getByRole("button", { name: /finish session/i });
    fireEvent.click(finishBtn);

    expect(screen.getByText("Complete Focus Session")).toBeDefined();
    expect(screen.getByText(/Session Clarity & Focus/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /save & complete/i })).toBeDefined();
  });
});
