import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";

vi.mock("@/lib/supabase/context", () => ({
  getRequestContext: vi.fn().mockResolvedValue({
    user: { id: "user-123", email: "321arifali@gmail.com" },
    supabase: {
      from: vi.fn().mockImplementation(() => {
        const chain = {
          select: vi.fn().mockReturnThis(),
          is: vi.fn().mockResolvedValue({ data: [], error: null, count: 1 }),
          eq: vi.fn().mockResolvedValue({ data: [], error: null, count: 12 }),
          then: vi.fn().mockImplementation((fn) => Promise.resolve({ data: [], error: null, count: 5 }).then(fn)),
        };
        return chain;
      }),
    },
  }),
}));

describe("Health & Observability API /api/v1/health", () => {
  it("returns system health status and queue metrics", async () => {
    const req = new NextRequest("http://localhost/api/v1/health");
    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data.status).toBe("healthy");
    expect(json.data.enclave.owner).toBe("321arifali@gmail.com");
    expect(json.data.observability.database_connected).toBe(true);
    expect(json.data.observability.response_time_ms).toBeGreaterThanOrEqual(0);
  });
});
