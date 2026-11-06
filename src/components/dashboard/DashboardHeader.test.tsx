import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { DashboardHeader } from "./DashboardHeader";

describe("DashboardHeader component", () => {
  it("renders greeting, formatted date, and intention", () => {
    render(
      <DashboardHeader
        greeting="Good afternoon"
        dateStr="2026-11-06"
        initialIntention="Ship M3"
        onUpdateIntention={vi.fn()}
      />
    );

    expect(screen.getByText(/Good afternoon/i)).toBeDefined();
    expect(screen.getByText(/“Ship M3”/)).toBeDefined();
    expect(screen.getByText(/FRI, NOV 6/i)).toBeDefined();
  });

  it("allows toggling edit mode and saving intention", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    render(
      <DashboardHeader
        greeting="Good morning"
        dateStr="2026-11-06"
        initialIntention={null}
        onUpdateIntention={onUpdate}
      />
    );

    const editBtn = screen.getByRole("button", { name: /set intention/i });
    act(() => {
      fireEvent.click(editBtn);
    });

    const input = screen.getByPlaceholderText(/What is your singular priority/i);
    act(() => {
      fireEvent.change(input, { target: { value: "New Intention" } });
    });

    const saveBtn = screen.getByRole("button", { name: /save intention/i });
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    expect(onUpdate).toHaveBeenCalledWith("New Intention");
  });
});
