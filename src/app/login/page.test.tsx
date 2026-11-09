import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import * as React from "react";
import LoginPage from "./page";
import * as mfaModule from "@/lib/auth/mfa";

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

const mockSignInWithPassword = vi.fn();
const mockGetAuthenticatorAssuranceLevel = vi.fn();
const mockListFactors = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      mfa: {
        getAuthenticatorAssuranceLevel: mockGetAuthenticatorAssuranceLevel,
        listFactors: mockListFactors,
      },
    },
  }),
}));

describe("LoginPage with Google Authenticator MFA", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders standard credential login and passkey button initially", () => {
    render(<LoginPage />);
    expect(screen.getByText("Personal OS")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@domain.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••••••")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign In/i })).toBeInTheDocument();
  });

  it("switches to Google Authenticator prompt when MFA AAL2 is required", async () => {
    mockSignInWithPassword.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    mockGetAuthenticatorAssuranceLevel.mockResolvedValue({
      data: { currentLevel: "aal1", nextLevel: "aal2" },
      error: null,
    });
    mockListFactors.mockResolvedValue({
      data: {
        totp: [
          { id: "factor-totp-1", status: "verified", friendly_name: "Google Authenticator" },
        ],
      },
      error: null,
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("you@domain.com"), {
      target: { value: "321arifali@gmail.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••••••"), {
      target: { value: "secret123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

    await waitFor(() => {
      expect(screen.getByText("Google Authenticator Code")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("000000")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Verify Identity/i })).toBeInTheDocument();
    });
  });

  it("allows switching to emergency recovery code view and verifying", async () => {
    mockSignInWithPassword.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    mockGetAuthenticatorAssuranceLevel.mockResolvedValue({
      data: { currentLevel: "aal1", nextLevel: "aal2" },
      error: null,
    });
    mockListFactors.mockResolvedValue({
      data: {
        totp: [{ id: "factor-totp-1", status: "verified" }],
      },
      error: null,
    });

    vi.spyOn(mfaModule, "verifyAndBurnRecoveryCode").mockResolvedValue({
      valid: true,
      remainingCount: 7,
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("you@domain.com"), {
      target: { value: "321arifali@gmail.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••••••"), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

    await waitFor(() => {
      expect(screen.getByText("Use Recovery Code")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Use Recovery Code"));

    expect(screen.getByText("Emergency Recovery Code")).toBeInTheDocument();
    const recoveryInput = screen.getByPlaceholderText("XXXX-XXXX");
    fireEvent.change(recoveryInput, { target: { value: "ABCD-1234" } });

    fireEvent.click(screen.getByRole("button", { name: /Verify Recovery Code/i }));

    await waitFor(() => {
      expect(mfaModule.verifyAndBurnRecoveryCode).toHaveBeenCalledWith("ABCD-1234");
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });
});
