import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProjectList } from "./ProjectList";
import { ProjectWithStats } from "@/modules/projects/types";

describe("ProjectList component", () => {
  const initialProjects: ProjectWithStats[] = [
    {
      id: "p1",
      user_id: "u1",
      name: "Active Architecture Plan",
      status: "active",
      priority: "high",
      sort_order: 0,
      created_at: "2026-11-06T12:00:00Z",
      updated_at: "2026-11-06T12:00:00Z",
      stats: {
        total_tasks: 2,
        completed_tasks: 1,
        progress_percent: 50,
        total_milestones: 0,
        completed_milestones: 0,
      },
    },
    {
      id: "p2",
      user_id: "u1",
      name: "Completed Documentation",
      status: "completed",
      priority: "medium",
      sort_order: 1,
      created_at: "2026-11-06T12:00:00Z",
      updated_at: "2026-11-06T12:00:00Z",
      stats: {
        total_tasks: 1,
        completed_tasks: 1,
        progress_percent: 100,
        total_milestones: 0,
        completed_milestones: 0,
      },
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders projects in initial list", () => {
    render(<ProjectList initialProjects={initialProjects} />);

    expect(screen.getByText("Active Architecture Plan")).toBeInTheDocument();
    expect(screen.getByText("Completed Documentation")).toBeInTheDocument();
  });

  it("filters projects by status tabs", () => {
    render(<ProjectList initialProjects={initialProjects} />);

    // Filter to Active only
    fireEvent.click(screen.getByRole("button", { name: "Active" }));
    expect(screen.getByText("Active Architecture Plan")).toBeInTheDocument();
    expect(screen.queryByText("Completed Documentation")).not.toBeInTheDocument();

    // Filter to Completed only
    fireEvent.click(screen.getByRole("button", { name: "Completed" }));
    expect(screen.queryByText("Active Architecture Plan")).not.toBeInTheDocument();
    expect(screen.getByText("Completed Documentation")).toBeInTheDocument();
  });

  it("shows empty state when no projects match", () => {
    render(<ProjectList initialProjects={[]} />);

    expect(screen.getByTestId("project-empty-state")).toBeInTheDocument();
    expect(screen.getByText("No projects created yet")).toBeInTheDocument();
  });

  it("opens create project dialog on button click", () => {
    render(<ProjectList initialProjects={initialProjects} />);

    const newProjectBtn = screen.getByRole("button", { name: /new project/i });
    fireEvent.click(newProjectBtn);

    expect(screen.getByRole("dialog", { name: /create project/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
  });
});
