import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST, DELETE } from "./route";
import {
  SESSION_COOKIE_NAME,
  createSessionMeta,
  serializeSessionMeta,
  deserializeSessionMeta,
} from "@/lib/auth/session-policy";

describe("Auth Session Policy API (/api/v1/auth/session)", () => {
  it("rejects unauthenticated GET requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/auth/session", {
      headers: { "x-unauthenticated": "true" },
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns session evaluation for authenticated user", async () => {
    const meta = createSessionMeta(true, "test-macbook");
    const serialized = serializeSessionMeta(meta);

    const req = new NextRequest("http://localhost:3000/api/v1/auth/session", {
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${serialized}`,
      },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.user).toBeDefined();
    expect(json.data.sessionMeta.isTrusted).toBe(true);
    expect(json.data.evaluation.isValid).toBe(true);
  });

  it("establishes trusted desktop session via POST", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/auth/session", {
      method: "POST",
      body: JSON.stringify({ isTrusted: true, deviceId: "workstation-1" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.meta.isTrusted).toBe(true);
    expect(json.data.meta.deviceId).toBe("workstation-1");

    // Verify Set-Cookie header
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toBeDefined();
    expect(setCookie).toContain(SESSION_COOKIE_NAME);
  });

  it("terminates session and deletes cookie on DELETE", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/auth/session", {
      method: "DELETE",
    });

    const res = await DELETE(req);
    expect(res.status).toBe(200);
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toBeDefined();
    // Cookie deletion is signaled by max-age=0 or expires in the past
    expect(setCookie?.toLowerCase()).toMatch(/(max-age=0|expires=)/);
  });
});
