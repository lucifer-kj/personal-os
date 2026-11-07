import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CurrentFocusCard } from "./CurrentFocusCard";
import { FocusTimerWidget } from "./FocusTimerWidget";

describe("CurrentFocusCard component", () => {
  it("renders focus title, description, and toggles subtask chips", () => {
    const onToggle = vi.fn();
    render(
      <CurrentFocusCard
        title="Design token architecture"
        description="Finalize layouts and design tokens."
        subtasks={[
          { id: "s1", title: "Token grid", completed: true },
          { id: "s2", title: "Layout system", completed: false },
        ]}
        onToggleSubtask={onToggle}
      />
    );

    expect(screen.getByText("Design token architecture")).toBeDefined();
    expect(screen.getByText("Token grid")).toBeDefined();
    expect(screen.getByText("Layout system")).toBeDefined();

    const chip = screen.getByText("Layout system");
    fireEvent.click(chip);
    expect(onToggle).toHaveBeenCalledWith("s2");
  });
});

describe("FocusTimerWidget component", () => {
  it("renders timer formatted time and controls", () => {
    render(<FocusTimerWidget initialSeconds={25 * 60} label="Pomodoro" />);

    expect(screen.getByText("25:00")).toBeDefined();
    expect(screen.getByText("Pomodoro")).toBeDefined();

    const startBtn = screen.getByRole("button", { name: /start timer/i });
    expect(startBtn).toBeDefined();
    fireEvent.click(startBtn);

    // After click, label switches to pause
    expect(screen.getByRole("button", { name: /pause timer/i })).toBeDefined();
  });
});
