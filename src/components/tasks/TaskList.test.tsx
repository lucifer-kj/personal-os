import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskList } from "./TaskList";
import { Task } from "@/modules/tasks/types";

describe("TaskList component", () => {
  const initialTasks: Task[] = [
    {
      id: "task-1",
      user_id: "user-1",
      title: "Active Task 1",
      status: "todo",
      priority: "medium",
      is_recurring: false,
      sort_order: 0,
      created_at: "2026-11-06T12:00:00Z",
      updated_at: "2026-11-06T12:00:00Z",
    },
    {
      id: "task-2",
      user_id: "user-1",
      title: "Completed Task 2",
      status: "completed",
      priority: "high",
      is_recurring: false,
      sort_order: 1,
      completed_at: "2026-11-06T13:00:00Z",
      created_at: "2026-11-06T12:00:00Z",
      updated_at: "2026-11-06T13:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders tasks provided in initialTasks", () => {
    render(<TaskList initialTasks={initialTasks} />);

    expect(screen.getByText("Active Task 1")).toBeInTheDocument();
    expect(screen.getByText("Completed Task 2")).toBeInTheDocument();
  });

  it("filters tasks correctly by status tabs", () => {
    render(<TaskList initialTasks={initialTasks} />);

    // Click Active filter
    fireEvent.click(screen.getByRole("button", { name: "Active" }));
    expect(screen.getByText("Active Task 1")).toBeInTheDocument();
    expect(screen.queryByText("Completed Task 2")).not.toBeInTheDocument();

    // Click Completed filter
    fireEvent.click(screen.getByRole("button", { name: "Completed" }));
    expect(screen.queryByText("Active Task 1")).not.toBeInTheDocument();
    expect(screen.getByText("Completed Task 2")).toBeInTheDocument();
  });

  it("shows empty state when no tasks match", () => {
    render(<TaskList initialTasks={[]} />);

    expect(screen.getByTestId("task-empty-state")).toBeInTheDocument();
    expect(screen.getByText("All tasks clear")).toBeInTheDocument();
  });

  it("opens create task dialog on button click", () => {
    render(<TaskList initialTasks={initialTasks} />);

    const newTaskBtn = screen.getByRole("button", { name: /new task/i });
    fireEvent.click(newTaskBtn);

    expect(screen.getByRole("dialog", { name: /create task/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
  });
});
