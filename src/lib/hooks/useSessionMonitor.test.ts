import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSessionMonitor } from "./useSessionMonitor";

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

describe("useSessionMonitor Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("initializes without warning when disabled", () => {
    const { result } = renderHook(() => useSessionMonitor({ enabled: false }));
    expect(result.current.showWarning).toBe(false);
    expect(result.current.timeRemainingMs).toBe(0);
  });

  it("triggers warning when session check reports under 5 minutes remaining", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          timeRemaining: {
            effectiveRemainingMs: 3 * 60 * 1000, // 3 minutes remaining
          },
        },
      }),
    });
    global.fetch = mockFetch;

    const { result } = renderHook(() =>
      useSessionMonitor({ enabled: true, checkIntervalMs: 10000 })
    );

    // Initial check runs
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.showWarning).toBe(true);
    expect(result.current.timeRemainingMs).toBe(3 * 60 * 1000);
  });

  it("extends session successfully when extendSession is invoked", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          timeRemaining: {
            effectiveRemainingMs: 3 * 3600 * 1000, // 3 hours
          },
        },
      }),
    });
    global.fetch = mockFetch;

    const { result } = renderHook(() => useSessionMonitor({ enabled: false }));

    let success = false;
    await act(async () => {
      success = await result.current.extendSession();
    });

    expect(success).toBe(true);
    expect(result.current.showWarning).toBe(false);
    expect(result.current.timeRemainingMs).toBe(3 * 3600 * 1000);
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/v1/auth/session",
      expect.objectContaining({
        method: "POST",
      })
    );
  });

  it("redirects to login on 401 expired response", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: "Unauthorized" }),
    });
    global.fetch = mockFetch;

    renderHook(() =>
      useSessionMonitor({ enabled: true, checkIntervalMs: 10000 })
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockPush).toHaveBeenCalledWith("/login?reason=expired_inactivity");
  });

  it("signs out and redirects when signOut is called", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { message: "Signed out" } }),
    });
    global.fetch = mockFetch;

    const { result } = renderHook(() => useSessionMonitor({ enabled: false }));

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/v1/auth/session",
      expect.objectContaining({ method: "DELETE" })
    );
    expect(mockPush).toHaveBeenCalledWith("/login?reason=user_signed_out");
  });
});
