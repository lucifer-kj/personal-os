import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import * as React from "react";
import { QuickIngestBar } from "./QuickIngestBar";

describe("QuickIngestBar Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders single-line input with syntax legend by default", () => {
    render(<QuickIngestBar />);
    expect(
      screen.getByPlaceholderText(/Type task, e.g. 'Draft launch plan/i)
    ).toBeDefined();
    expect(screen.getByText("Multi-Line Dump")).toBeDefined();
    expect(screen.getByText("Add Task")).toBeDefined();
  });

  it("displays parsed syntax tokens dynamically as user types", () => {
    render(<QuickIngestBar />);
    const input = screen.getByPlaceholderText(/Type task, e.g. 'Draft launch plan/i);
    fireEvent.change(input, {
      target: { value: "Deploy app #infra p:high !today @45m" },
    });

    expect(screen.getByText("#infra")).toBeDefined();
    expect(screen.getAllByText("p:high").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("@45m")).toBeDefined();
  });

  it("toggles between single mode and multi-line batch mode", () => {
    render(<QuickIngestBar />);
    const modeBtn = screen.getByText("Multi-Line Dump");
    fireEvent.click(modeBtn);

    expect(screen.getByText("Switch to Single Ingest")).toBeDefined();
    expect(
      screen.getByPlaceholderText(/Paste your bullet points or thoughts/i)
    ).toBeDefined();
  });

  it("executes batch submission when Ingest All is clicked", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { count: 2 } }),
    });
    global.fetch = fetchMock;

    const onCreated = vi.fn();
    render(<QuickIngestBar onItemCreated={onCreated} />);

    // Switch to batch
    fireEvent.click(screen.getByText("Multi-Line Dump"));

    const textarea = screen.getByPlaceholderText(
      /Paste your bullet points or thoughts/i
    );
    fireEvent.change(textarea, {
      target: { value: "- [ ] Task 1\n- [ ] Task 2" },
    });

    const submitBtn = screen.getByText(/Ingest All \(2\)/i);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/v1/inbox/batch",
        expect.objectContaining({
          method: "POST",
        })
      );
      expect(onCreated).toHaveBeenCalled();
    });
  });
});
