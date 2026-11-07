import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardMetrics } from "./DashboardMetrics";

describe("DashboardMetrics component", () => {
  it("renders 4 metric cards with correct values and calculations", () => {
    render(
      <DashboardMetrics
        metrics={{
          tasks_completed_today: 3,
          tasks_pending_today: 2,
          estimated_focus_minutes: 120,
          active_projects_count: 4,
        }}
      />
    );

    // 4 Cards matching design reference
    expect(screen.getByText("Focus Time")).toBeDefined();
    expect(screen.getByText("Daily Tasks")).toBeDefined();
    expect(screen.getByText("Active Projects")).toBeDefined();
    expect(screen.getByText("Targets")).toBeDefined();

    // 3 completed of 5 total -> "3 / 5"
    expect(screen.getByText("3 / 5")).toBeDefined();

    // 120 minutes focus -> "2h 0m"
    expect(screen.getByText("2h 0m")).toBeDefined();

    // 4 active projects
    expect(screen.getByText("4")).toBeDefined();

    // 60% targets
    expect(screen.getByText("60%")).toBeDefined();
  });
});
