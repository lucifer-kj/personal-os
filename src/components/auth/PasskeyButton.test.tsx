import * as React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PasskeyButton } from "./PasskeyButton";
import * as passkeyLib from "@/lib/auth/passkeys";

describe("PasskeyButton Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders passkey sign-in button when WebAuthn is supported", () => {
    vi.spyOn(passkeyLib, "isWebAuthnSupported").mockReturnValue(true);

    render(<PasskeyButton mode="signin" />);
    expect(
      screen.getByRole("button", { name: /sign in with passkey \/ biometrics/i })
    ).toBeDefined();
  });

  it("triggers passkey authentication and fires onSuccess", async () => {
    vi.spyOn(passkeyLib, "isWebAuthnSupported").mockReturnValue(true);
    const mockSuccess = vi.fn();
    const mockResult: passkeyLib.PasskeyAuthResult = {
      user: { id: "user-1", email: "321arifali@gmail.com" } as any,
      session: { access_token: "tok" } as any,
      error: null,
    };
    vi.spyOn(passkeyLib, "signInWithPasskey").mockResolvedValue(mockResult);

    render(<PasskeyButton mode="signin" onSuccess={mockSuccess} />);
    const button = screen.getByRole("button", {
      name: /sign in with passkey \/ biometrics/i,
    });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSuccess).toHaveBeenCalledWith(mockResult);
    });
  });

  it("handles passkey errors and fires onError", async () => {
    vi.spyOn(passkeyLib, "isWebAuthnSupported").mockReturnValue(true);
    const mockError = vi.fn();
    vi.spyOn(passkeyLib, "signInWithPasskey").mockResolvedValue({
      user: null,
      session: null,
      error: new Error("User cancelled biometric prompt"),
    });

    render(<PasskeyButton mode="signin" onError={mockError} />);
    const button = screen.getByRole("button", {
      name: /sign in with passkey \/ biometrics/i,
    });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockError).toHaveBeenCalled();
      expect(mockError.mock.calls[0][0].message).toBe("User cancelled biometric prompt");
    });
  });

  it("does not render when WebAuthn is unsupported", () => {
    vi.spyOn(passkeyLib, "isWebAuthnSupported").mockReturnValue(false);

    const { container } = render(<PasskeyButton mode="signin" />);
    expect(container.firstChild).toBeNull();
  });
});
