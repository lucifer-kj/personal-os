import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TodayAgenda } from "./TodayAgenda";
import { Task } from "@/modules/tasks/types";

describe("TodayAgenda component", () => {
  const mockTasks: Task[] = [
    {
      id: "task-1",
      user_id: "user-1",
      title: "Write Architecture Spec",
      status: "todo",
      priority: "urgent",
      estimated_minutes: 60,
      is_recurring: false,
      sort_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "task-2",
      user_id: "user-1",
      title: "Review PRs",
      status: "completed",
      priority: "medium",
      estimated_minutes: 30,
      is_recurring: false,
      sort_order: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  it("renders agenda items and allows toggling completion", () => {
    const onToggle = vi.fn();
    const onOpenCreate = vi.fn();

    render(
      <TodayAgenda
        todayTasks={mockTasks}
        overdueTasks={[]}
        onToggleTask={onToggle}
        onOpenCreateTask={onOpenCreate}
      />
    );

    expect(screen.getByText("Write Architecture Spec")).toBeDefined();
    expect(screen.getByText("Review PRs")).toBeDefined();
    expect(screen.getByText("urgent")).toBeDefined();

    const checkBtn = screen.getByLabelText(/Mark "Write Architecture Spec" as completed/i);
    fireEvent.click(checkBtn);
    expect(onToggle).toHaveBeenCalledWith(mockTasks[0]);
  });

  it("renders overdue alert when overdue tasks are present", () => {
    const overdueTask: Task = {
      id: "overdue-1",
      user_id: "user-1",
      title: "Past Due Milestone",
      due_date: "2026-11-04",
      status: "todo",
      priority: "high",
      is_recurring: false,
      sort_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    render(
      <TodayAgenda
        todayTasks={[]}
        overdueTasks={[overdueTask]}
        onToggleTask={vi.fn()}
        onOpenCreateTask={vi.fn()}
      />
    );

    expect(screen.getByText(/1 overdue task/i)).toBeDefined();
    expect(screen.getByText("Past Due Milestone")).toBeDefined();
  });
});
