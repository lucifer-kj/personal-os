import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskItem } from "./TaskItem";
import { Task } from "@/modules/tasks/types";

describe("TaskItem component", () => {
  const mockTask: Task = {
    id: "task-1",
    user_id: "user-1",
    title: "Test Task Title",
    description: "Detailed description of task",
    status: "todo",
    priority: "high",
    due_date: "2026-11-15",
    is_recurring: false,
    sort_order: 0,
    created_at: "2026-11-06T12:00:00Z",
    updated_at: "2026-11-06T12:00:00Z",
  };

  it("renders task content and metadata badges faithfully", () => {
    render(
      <TaskItem
        task={mockTask}
        onToggleComplete={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText("Test Task Title")).toBeInTheDocument();
    expect(screen.getByText("Detailed description of task")).toBeInTheDocument();
    expect(screen.getByText("high")).toBeInTheDocument();
    expect(screen.getByText("2026-11-15")).toBeInTheDocument();
  });

  it("calls onToggleComplete when completion button is clicked", () => {
    const handleToggle = vi.fn();
    render(
      <TaskItem
        task={mockTask}
        onToggleComplete={handleToggle}
        onDelete={vi.fn()}
      />
    );

    const toggleButton = screen.getByRole("checkbox");
    fireEvent.click(toggleButton);

    expect(handleToggle).toHaveBeenCalledTimes(1);
    expect(handleToggle).toHaveBeenCalledWith(mockTask);
  });

  it("calls onDelete when delete button is clicked", () => {
    const handleDelete = vi.fn();
    render(
      <TaskItem
        task={mockTask}
        onToggleComplete={vi.fn()}
        onDelete={handleDelete}
      />
    );

    const deleteButton = screen.getByRole("button", { name: /delete 'test task title'/i });
    fireEvent.click(deleteButton);

    expect(handleDelete).toHaveBeenCalledTimes(1);
    expect(handleDelete).toHaveBeenCalledWith("task-1");
  });
});
