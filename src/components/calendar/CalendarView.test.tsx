import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { CalendarView } from "./CalendarView";
import { CalendarEvent } from "@/modules/calendar/types";
import { Task } from "@/modules/tasks/types";

describe("CalendarView component", () => {
  const mockEvents: CalendarEvent[] = [
    {
      id: "event-1",
      user_id: "user-1",
      title: "Sprint Retrospective",
      description: "Review Sprint 5 outcomes",
      event_type: "meeting",
      start_at: "2026-11-06T10:00:00Z",
      end_at: "2026-11-06T11:00:00Z",
      all_day: false,
      timezone: "UTC",
      location: "Room Alpha",
      project_id: null,
      task_id: null,
      meeting_id: null,
      source_provider: null,
      source_event_id: null,
      created_at: "2026-11-06T08:00:00Z",
      updated_at: "2026-11-06T08:00:00Z",
    },
    {
      id: "event-2",
      user_id: "user-1",
      title: "Deep Work Focus Block",
      description: null,
      event_type: "focus",
      start_at: "2026-11-06T10:30:00Z", // Overlaps with event-1!
      end_at: "2026-11-06T12:00:00Z",
      all_day: false,
      timezone: "UTC",
      location: null,
      project_id: null,
      task_id: "task-1",
      meeting_id: null,
      source_provider: null,
      source_event_id: null,
      created_at: "2026-11-06T08:00:00Z",
      updated_at: "2026-11-06T08:00:00Z",
    },
  ];

  const mockTasks: Task[] = [
    {
      id: "task-1",
      user_id: "user-1",
      title: "Write documentation for calendar API",
      status: "todo",
      priority: "high",
      estimated_minutes: 60,
      is_recurring: false,
      sort_order: 1,
      created_at: "2026-11-06T08:00:00Z",
      updated_at: "2026-11-06T08:00:00Z",
    },
  ];

  beforeEach(() => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/calendar/events")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockEvents }),
        });
      }
      if (url.includes("/tasks")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockTasks }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      });
    });
  });

  it("renders calendar controls, active month grid, and shows conflict advisory", async () => {
    await act(async () => {
      render(
        <CalendarView initialEvents={mockEvents} initialTasks={mockTasks} />
      );
    });

    expect(screen.getByRole("button", { name: /new event/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /time block/i })).toBeDefined();
    expect(screen.getByText(/conflict advisory/i)).toBeDefined();
  });

  it("switches to agenda view and displays chronological event list", async () => {
    await act(async () => {
      render(
        <CalendarView initialEvents={mockEvents} initialTasks={mockTasks} />
      );
    });

    const agendaTab = screen.getByRole("button", { name: /agenda/i });
    await act(async () => {
      fireEvent.click(agendaTab);
    });

    expect(screen.getByText("Sprint Retrospective")).toBeDefined();
    expect(screen.getByText("Deep Work Focus Block")).toBeDefined();
  });

  it("opens the Time Block drawer when clicked", async () => {
    await act(async () => {
      render(
        <CalendarView initialEvents={mockEvents} initialTasks={mockTasks} />
      );
    });

    const timeBlockBtn = screen.getByRole("button", { name: /time block/i });
    await act(async () => {
      fireEvent.click(timeBlockBtn);
    });

    expect(screen.getByText("Time Block Tasks")).toBeDefined();
    expect(
      screen.getByText("Write documentation for calendar API")
    ).toBeDefined();
  });

  it("opens the New Event modal when New Event button clicked", async () => {
    await act(async () => {
      render(
        <CalendarView initialEvents={mockEvents} initialTasks={mockTasks} />
      );
    });

    const newEventBtn = screen.getByRole("button", { name: /new event/i });
    await act(async () => {
      fireEvent.click(newEventBtn);
    });

    expect(screen.getByText("Create Calendar Event")).toBeDefined();
    expect(screen.getByPlaceholderText(/system design review/i)).toBeDefined();
  });
});
