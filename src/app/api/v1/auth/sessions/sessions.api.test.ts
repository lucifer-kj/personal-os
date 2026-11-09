import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "./route";

const mockSessions = [
  {
    id: "session-1",
    session_id: "dev-curr-123",
    device_name: "Windows Workstation",
    browser: "Google Chrome",
    os: "Windows",
    ip_address: "127.0.0.1",
    is_trusted: true,
    last_active_at: "2026-11-09T04:00:00Z",
    created_at: "2026-11-08T04:00:00Z",
    revoked_at: null,
  },
  {
    id: "session-2",
    session_id: "dev-other-456",
    device_name: "iOS Phone",
    browser: "Apple Safari",
    os: "iOS",
    ip_address: "192.168.1.50",
    is_trusted: false,
    last_active_at: "2026-11-09T02:00:00Z",
    created_at: "2026-11-09T01:00:00Z",
    revoked_at: null,
  },
];

const mockUpdate = vi.fn().mockReturnValue({
  eq: vi.fn().mockReturnValue({
    neq: vi.fn().mockReturnValue({
      is: vi.fn().mockResolvedValue({ error: null }),
    }),
    eq: vi.fn().mockResolvedValue({ error: null }),
  }),
});

const mockSelect = vi.fn().mockReturnValue({
  eq: vi.fn().mockReturnValue({
    is: vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: mockSessions, error: null }),
    }),
  }),
});

vi.mock("@/lib/supabase/context", () => ({
  getRequestContext: vi.fn().mockImplementation((req: NextRequest) => {
    if (req.headers.get("x-unauthenticated") === "true") return null;
    return {
      user: { id: "user-123", email: "321arifali@gmail.com" },
      supabase: {
        from: (table: string) => {
          if (table === "auth_sessions") {
            return {
              select: mockSelect,
              update: mockUpdate,
            };
          }
          return {};
        },
      },
    };
  }),
}));

describe("API /api/v1/auth/sessions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    const req = new NextRequest("http://localhost/api/v1/auth/sessions", {
      headers: { "x-unauthenticated": "true" },
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("lists active device sessions and identifies current device", async () => {
    const serializedCookie = encodeURIComponent(
      JSON.stringify({
        deviceId: "dev-curr-123",
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
        isTrusted: true,
      })
    );
    const req = new NextRequest("http://localhost/api/v1/auth/sessions", {
      headers: {
        cookie: `pos_session_meta=${serializedCookie}`,
      },
    });

    const res = await GET(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.sessions).toHaveLength(2);
    expect(json.data.sessions[0].isCurrent).toBe(true);
    expect(json.data.sessions[1].isCurrent).toBe(false);
  });

  it("revokes a single device session", async () => {
    const req = new NextRequest("http://localhost/api/v1/auth/sessions", {
      method: "POST",
      body: JSON.stringify({ action: "revoke", sessionId: "dev-other-456" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.message).toContain("Session dev-other-456 revoked");
  });

  it("revokes all other sessions", async () => {
    const serializedCookie = encodeURIComponent(
      JSON.stringify({
        deviceId: "dev-curr-123",
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
        isTrusted: true,
      })
    );
    const req = new NextRequest("http://localhost/api/v1/auth/sessions", {
      method: "POST",
      headers: {
        cookie: `pos_session_meta=${serializedCookie}`,
      },
      body: JSON.stringify({ action: "revoke_others" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.message).toContain("All other sessions have been revoked");
  });
});
