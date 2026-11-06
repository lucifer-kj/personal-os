import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardMetrics } from "./DashboardMetrics";

describe("DashboardMetrics component", () => {
  it("renders 3 metric cards with correct values and calculations", () => {
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

    // 3 completed of 5 total (60%)
    expect(screen.getByText("3")).toBeDefined();
    expect(screen.getByText(/of 5 tasks/i)).toBeDefined();
    expect(screen.getByText(/60%/)).toBeDefined();

    // 120 minutes focus
    expect(screen.getByText("120")).toBeDefined();
    expect(screen.getByText(/minutes allocated/i)).toBeDefined();

    // 4 active projects
    expect(screen.getByText("4")).toBeDefined();
    expect(screen.getByText(/deliverables active/i)).toBeDefined();
  });
});
