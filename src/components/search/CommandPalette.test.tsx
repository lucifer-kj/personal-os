import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import * as React from "react";
import { CommandPalette } from "./CommandPalette";

// Mock next/navigation
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("CommandPalette Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render dialog content when closed", () => {
    render(<CommandPalette isOpen={false} />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders search input, quick actions, and navigation groups when open", () => {
    render(<CommandPalette isOpen={true} />);
    expect(screen.getByRole("dialog", { name: "Command Palette" })).toBeDefined();
    expect(
      screen.getByPlaceholderText(/Search tasks, notes, projects, or type a command/i)
    ).toBeDefined();
    expect(screen.getByText("Quick Actions")).toBeDefined();
    expect(screen.getByText("Navigation")).toBeDefined();
    expect(screen.getByText("Today Overview")).toBeDefined();
    expect(screen.getByText("Create Task")).toBeDefined();
  });

  it("closes when backdrop or ESC key is pressed", () => {
    const onOpenChange = vi.fn();
    render(<CommandPalette isOpen={true} onOpenChange={onOpenChange} />);

    // Press Escape
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("navigates to route when navigation item is clicked", () => {
    const onOpenChange = vi.fn();
    render(<CommandPalette isOpen={true} onOpenChange={onOpenChange} />);

    const tasksNav = screen.getByText("Tasks");
    fireEvent.click(tasksNav);

    expect(pushMock).toHaveBeenCalledWith("/tasks");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("dispatches quick-capture event when Quick Capture action is selected", () => {
    const onOpenChange = vi.fn();
    const eventSpy = vi.fn();
    window.addEventListener("personal-os:quick-capture", eventSpy);

    render(<CommandPalette isOpen={true} onOpenChange={onOpenChange} />);

    const captureAction = screen.getByText("Quick Capture");
    fireEvent.click(captureAction);

    expect(eventSpy).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);

    window.removeEventListener("personal-os:quick-capture", eventSpy);
  });

  it("opens when personal-os:command-palette event is dispatched", async () => {
    render(<CommandPalette />);
    expect(screen.queryByRole("dialog")).toBeNull();

    fireEvent(window, new CustomEvent("personal-os:command-palette"));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeDefined();
    });
  });
});
