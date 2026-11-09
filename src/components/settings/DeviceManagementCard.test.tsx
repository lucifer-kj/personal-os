import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import * as React from "react";
import { DeviceManagementCard } from "./DeviceManagementCard";

describe("DeviceManagementCard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders active sessions and distinguishes current device", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            sessions: [
              {
                id: "s-1",
                sessionId: "dev-curr",
                deviceName: "Windows Workstation",
                browser: "Google Chrome",
                os: "Windows",
                ipAddress: "127.0.0.1",
                isTrusted: true,
                isCurrent: true,
                lastActiveAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
              },
              {
                id: "s-2",
                sessionId: "dev-phone",
                deviceName: "iOS Phone",
                browser: "Apple Safari",
                os: "iOS",
                ipAddress: "192.168.1.5",
                isTrusted: false,
                isCurrent: false,
                lastActiveAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
              },
            ],
          },
        }),
      })
    );

    render(<DeviceManagementCard />);

    expect(screen.getByText("Device & Workstation Sessions")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Windows Workstation")).toBeInTheDocument();
      expect(screen.getByText("Current Device")).toBeInTheDocument();
      expect(screen.getByText("iOS Phone")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /Revoke All Others/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Revoke$/i })).toBeInTheDocument();
  });

  it("calls revoke API when Revoke button is clicked and confirmed", async () => {
    const fetchMock = vi.fn().mockImplementation((url, opts) => {
      if (opts?.method === "POST") {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: { message: "Revoked" } }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          data: {
            sessions: [
              {
                id: "s-1",
                sessionId: "dev-curr",
                deviceName: "Windows Workstation",
                browser: "Google Chrome",
                os: "Windows",
                isTrusted: true,
                isCurrent: true,
                lastActiveAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
              },
              {
                id: "s-2",
                sessionId: "dev-phone",
                deviceName: "iOS Phone",
                browser: "Apple Safari",
                os: "iOS",
                isTrusted: false,
                isCurrent: false,
                lastActiveAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
              },
            ],
          },
        }),
      });
    });

    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("confirm", () => true);

    render(<DeviceManagementCard />);

    await waitFor(() => {
      expect(screen.getByText("iOS Phone")).toBeInTheDocument();
    });

    const revokeBtn = screen.getByRole("button", { name: /^Revoke$/i });
    fireEvent.click(revokeBtn);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/v1/auth/sessions",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ action: "revoke", sessionId: "dev-phone" }),
        })
      );
    });
  });
});
