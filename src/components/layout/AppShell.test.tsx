import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppShell } from "./AppShell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("AppShell component", () => {
  it("renders desktop sidebar navigation, mobile nav, and header", () => {
    render(
      <AppShell>
        <div data-testid="page-content">Dashboard Content</div>
      </AppShell>
    );

    // Sidebar brand
    expect(screen.getByText("Personal OS")).toBeInTheDocument();

    // Tasks links exist for both desktop sidebar and mobile bottom nav
    const taskLinks = screen.getAllByRole("link", { name: /tasks/i });
    expect(taskLinks.length).toBeGreaterThanOrEqual(1);

    // Page content rendered
    expect(screen.getByTestId("page-content")).toBeInTheDocument();

    // Capture buttons (header desktop and mobile bottom action)
    const captureButtons = screen.getAllByRole("button", { name: /capture/i });
    expect(captureButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("handles mobile menu toggling cleanly", () => {
    render(
      <AppShell>
        <div>Content</div>
      </AppShell>
    );

    // Open mobile menu trigger
    const mobileMenuTrigger = screen.getByRole("button", { name: /more options/i });
    expect(mobileMenuTrigger).toBeInTheDocument();

    fireEvent.click(mobileMenuTrigger);

    // Drawer should now be visible
    expect(screen.getByText("More Destinations")).toBeInTheDocument();

    // Close button dismisses the drawer
    const closeButton = screen.getByRole("button", { name: /close drawer/i });
    fireEvent.click(closeButton);

    expect(screen.queryByText("More Destinations")).not.toBeInTheDocument();
  });
});
