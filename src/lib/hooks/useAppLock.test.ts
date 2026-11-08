import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAppLock } from "./useAppLock";
import * as passkeys from "@/lib/auth/passkeys";

describe("useAppLock Hook", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes in unlocked and unshielded state", () => {
    const { result } = renderHook(() => useAppLock({ autoLockEnabled: false }));
    expect(result.current.isLocked).toBe(false);
    expect(result.current.isShielded).toBe(false);
  });

  it("locks immediately when lock() is called", () => {
    const { result } = renderHook(() => useAppLock({ autoLockEnabled: false }));

    act(() => {
      result.current.lock();
    });

    expect(result.current.isLocked).toBe(true);
    expect(result.current.isShielded).toBe(true);
  });

  it("unlocks successfully via passkey authentication", async () => {
    vi.spyOn(passkeys, "signInWithPasskey").mockResolvedValue({
      user: { id: "u1" } as any,
      session: { access_token: "t1" } as any,
      error: null,
    });

    const { result } = renderHook(() => useAppLock({ autoLockEnabled: false }));

    act(() => {
      result.current.lock();
    });
    expect(result.current.isLocked).toBe(true);

    let success = false;
    await act(async () => {
      success = await result.current.unlock();
    });

    expect(success).toBe(true);
    expect(result.current.isLocked).toBe(false);
    expect(result.current.isShielded).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("handles unlock failure and sets error message", async () => {
    vi.spyOn(passkeys, "signInWithPasskey").mockResolvedValue({
      user: null,
      session: null,
      error: new Error("User canceled Touch ID prompt"),
    });

    const { result } = renderHook(() => useAppLock({ autoLockEnabled: false }));

    act(() => {
      result.current.lock();
    });

    let success = false;
    await act(async () => {
      success = await result.current.unlock();
    });

    expect(success).toBe(false);
    expect(result.current.isLocked).toBe(true);
    expect(result.current.error).toContain("canceled Touch ID");
  });

  it("shields on background and auto-locks after grace period", () => {
    let now = 1000000;
    vi.spyOn(Date, "now").mockImplementation(() => now);

    const { result } = renderHook(() =>
      useAppLock({ gracePeriodMs: 60000, autoLockEnabled: true })
    );

    // 1. Simulate tab backgrounded
    Object.defineProperty(document, "visibilityState", {
      value: "hidden",
      configurable: true,
    });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(result.current.isShielded).toBe(true);
    expect(result.current.isLocked).toBe(false);

    // 2. Advance time past 60s grace period and foreground
    now += 65000;
    Object.defineProperty(document, "visibilityState", {
      value: "visible",
      configurable: true,
    });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    // Should now be locked
    expect(result.current.isLocked).toBe(true);
    expect(result.current.isShielded).toBe(true);
  });

  it("shields on background and auto-resumes when returning within grace period", () => {
    let now = 1000000;
    vi.spyOn(Date, "now").mockImplementation(() => now);

    const { result } = renderHook(() =>
      useAppLock({ gracePeriodMs: 60000, autoLockEnabled: true })
    );

    // Backgrounded
    Object.defineProperty(document, "visibilityState", {
      value: "hidden",
      configurable: true,
    });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(result.current.isShielded).toBe(true);

    // Foregrounded after only 20 seconds (< 60s grace)
    now += 20000;
    Object.defineProperty(document, "visibilityState", {
      value: "visible",
      configurable: true,
    });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    // Should resume without locking
    expect(result.current.isLocked).toBe(false);
    expect(result.current.isShielded).toBe(false);
  });

  it("locks on personal-os:lock-app window event", () => {
    const { result } = renderHook(() => useAppLock({ autoLockEnabled: true }));

    act(() => {
      window.dispatchEvent(new CustomEvent("personal-os:lock-app"));
    });

    expect(result.current.isLocked).toBe(true);
    expect(result.current.isShielded).toBe(true);
  });
});
