import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectCard } from "./ProjectCard";
import { ProjectWithStats } from "@/modules/projects/types";

describe("ProjectCard component", () => {
  const mockProject: ProjectWithStats = {
    id: "proj-1",
    user_id: "user-1",
    name: "Design System Revamp",
    description: "Align design tokens with warm editorial concept",
    status: "active",
    priority: "high",
    due_date: "2026-11-20",
    sort_order: 0,
    created_at: "2026-11-06T12:00:00Z",
    updated_at: "2026-11-06T12:00:00Z",
    stats: {
      total_tasks: 4,
      completed_tasks: 3,
      progress_percent: 75,
      total_milestones: 2,
      completed_milestones: 1,
    },
  };

  it("renders project name, status badge, priority, and computed progress percentage", () => {
    render(<ProjectCard project={mockProject} />);

    expect(screen.getByText("Design System Revamp")).toBeInTheDocument();
    expect(screen.getByText("Align design tokens with warm editorial concept")).toBeInTheDocument();
    expect(screen.getByText("active")).toBeInTheDocument();
    expect(screen.getByText("high")).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.getByText("3/4 tasks")).toBeInTheDocument();
    expect(screen.getByText("2026-11-20")).toBeInTheDocument();
  });
});
