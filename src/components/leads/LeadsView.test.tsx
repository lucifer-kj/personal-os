import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LeadsView } from "./LeadsView";

describe("LeadsView 3-Tab Architecture Component", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("/api/v1/leads")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                data: [
                  {
                    id: "lead-test-1",
                    full_name: "Kolkata Diagnostic Lab",
                    business_name: "Kolkata Diagnostic Lab",
                    score: 80,
                    status: "lead",
                    lighthouse_mobile: 35,
                  },
                ],
              }),
          });
        }
        if (url.includes("/api/v1/engine/niches")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                data: [
                  {
                    id: "niche-1",
                    name: "Dental Clinics",
                    vertical: "Healthcare",
                    is_active: true,
                  },
                ],
              }),
          });
        }
        if (url.includes("/api/v1/engine/locations")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                data: [
                  {
                    id: "loc-1",
                    name: "Salt Lake Sector V",
                    city: "Kolkata",
                    radius_km: 3.5,
                  },
                ],
              }),
          });
        }
        if (url.includes("/api/v1/engine/status")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                data: {
                  stats: {
                    total_leads: 15,
                    pitch_ready: 5,
                    contacted: 2,
                    converted: 1,
                  },
                  recent_logs: [],
                },
              }),
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ data: [] }) });
      })
    );
  });

  it("renders the 3 main sub-tabs and switches cleanly between views", async () => {
    render(<LeadsView />);

    expect(screen.getByRole("button", { name: /Pipeline & Client Cards/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Targeting & Niches/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Engine Monitor & Triggers/i })).toBeInTheDocument();

    // Default view: Pipeline
    await waitFor(() => {
      expect(screen.getByText("Kolkata Diagnostic Lab")).toBeInTheDocument();
    });

    // Switch to Targeting Tab
    fireEvent.click(screen.getByRole("button", { name: /Targeting & Niches/i }));
    await waitFor(() => {
      expect(screen.getByText("Autonomous Targeting Control")).toBeInTheDocument();
      expect(screen.getByText("Dental Clinics")).toBeInTheDocument();
      expect(screen.getByText("Salt Lake Sector V")).toBeInTheDocument();
    });

    // Switch to Engine Monitor Tab
    fireEvent.click(screen.getByRole("button", { name: /Engine Monitor & Triggers/i }));
    await waitFor(() => {
      expect(screen.getByText("Manual & Webhook Push Triggers")).toBeInTheDocument();
      expect(screen.getByText("Run Full Sweep")).toBeInTheDocument();
    });
  });
});
