import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AppLockScreen } from "./AppLockScreen";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("AppLockScreen Component", () => {
  it("renders nothing when neither shielded nor locked", () => {
    const { container } = render(
      <AppLockScreen
        isShielded={false}
        isLocked={false}
        unlocking={false}
        onUnlock={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders privacy shield when shielded but not locked", () => {
    const onUnlock = vi.fn();
    render(
      <AppLockScreen
        isShielded={true}
        isLocked={false}
        unlocking={false}
        onUnlock={onUnlock}
      />
    );

    expect(screen.getByText("Privacy Shield Active")).toBeDefined();
    expect(screen.getByText("Screen Protected")).toBeDefined();

    const resumeBtn = screen.getByRole("button", { name: /resume workstation/i });
    expect(resumeBtn).toBeDefined();
    fireEvent.click(resumeBtn);
    expect(onUnlock).toHaveBeenCalled();
  });

  it("renders biometric lock overlay when isLocked is true", () => {
    const onUnlock = vi.fn();
    render(
      <AppLockScreen
        isShielded={true}
        isLocked={true}
        unlocking={false}
        error="Biometric verification failed"
        onUnlock={onUnlock}
      />
    );

    expect(screen.getByText("Enclave Locked")).toBeDefined();
    expect(screen.getByText("Personal OS Locked")).toBeDefined();
    expect(screen.getByText("Biometric verification failed")).toBeDefined();

    const unlockBtn = screen.getByRole("button", {
      name: /unlock with passkey \/ face id/i,
    });
    expect(unlockBtn).toBeDefined();
    fireEvent.click(unlockBtn);
    expect(onUnlock).toHaveBeenCalled();
  });

  it("invokes onSignOut callback when sign out clicked", async () => {
    const onSignOut = vi.fn();
    render(
      <AppLockScreen
        isShielded={true}
        isLocked={true}
        unlocking={false}
        onUnlock={vi.fn()}
        onSignOut={onSignOut}
      />
    );

    const signOutBtn = screen.getByRole("button", { name: /sign out/i });
    fireEvent.click(signOutBtn);
    await waitFor(() => {
      expect(onSignOut).toHaveBeenCalled();
    });
  });
});
