import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import * as React from "react";
import { SecuritySettingsCard } from "./SecuritySettingsCard";
import * as mfaModule from "@/lib/auth/mfa";
import * as passkeysModule from "@/lib/auth/passkeys";

describe("SecuritySettingsCard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Google Authenticator unconfigured state with setup action", async () => {
    vi.spyOn(mfaModule, "getMfaStatus").mockResolvedValue({
      enrolled: false,
      factors: [],
      currentLevel: "aal1",
      nextLevel: "aal1",
    });

    render(<SecuritySettingsCard />);

    expect(screen.getByText("Two-Factor & Biometric Security")).toBeInTheDocument();
    expect(screen.getByText("Google Authenticator")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Not Configured")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /Configure Google Authenticator/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Register Passkey/i })).toBeInTheDocument();
  });

  it("renders active AAL2 status when Google Authenticator is enrolled", async () => {
    vi.spyOn(mfaModule, "getMfaStatus").mockResolvedValue({
      enrolled: true,
      factors: [
        {
          id: "factor-123",
          friendlyName: "Google Authenticator",
          factorType: "totp",
          status: "verified",
          createdAt: "2026-11-09T00:00:00Z",
        },
      ],
      currentLevel: "aal2",
      nextLevel: "aal2",
    });

    render(<SecuritySettingsCard />);

    await waitFor(() => {
      expect(screen.getByText("Active (AAL2)")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /Remove/i })).toBeInTheDocument();
  });

  it("triggers passkey registration when Register Passkey button clicked", async () => {
    vi.spyOn(mfaModule, "getMfaStatus").mockResolvedValue({
      enrolled: false,
      factors: [],
      currentLevel: "aal1",
      nextLevel: "aal1",
    });
    const regSpy = vi.spyOn(passkeysModule, "registerPasskey").mockResolvedValue({
      data: { id: "passkey-1" } as any,
      error: null,
    });

    render(<SecuritySettingsCard />);

    const passkeyBtn = screen.getByRole("button", { name: /Register Passkey/i });
    fireEvent.click(passkeyBtn);

    await waitFor(() => {
      expect(regSpy).toHaveBeenCalledWith({ name: "Workstation Passkey" });
    });
  });
});
