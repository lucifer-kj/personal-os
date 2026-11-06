import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./badge";

describe("Badge component", () => {
  it("renders with default style", () => {
    render(<Badge>Active</Badge>);
    const badge = screen.getByText("Active");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-[var(--primary)]");
  });

  it("applies semantic variant styling", () => {
    render(<Badge variant="success">Completed</Badge>);
    expect(screen.getByText("Completed")).toHaveClass("text-[var(--success)]");
  });
});
