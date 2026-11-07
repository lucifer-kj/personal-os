import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET as searchRoute } from "./route";

describe("Search API Route Handler", () => {
  it("returns default navigation and quick actions when q is empty", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/search?q=");
    const res = await searchRoute(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data).toEqual([]);
    expect(json.navigation.length).toBeGreaterThanOrEqual(8);
    expect(json.actions.length).toBeGreaterThanOrEqual(5);
  });

  it("handles search queries and returns structured results", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/search?q=task");
    const res = await searchRoute(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(Array.isArray(json.data)).toBe(true);
    expect(Array.isArray(json.navigation)).toBe(true);
    expect(Array.isArray(json.actions)).toBe(true);
    // Navigation for tasks should be included
    expect(json.navigation.some((n: { title: string }) => n.title.toLowerCase().includes("task"))).toBe(true);
  });

  it("returns 400 when query parameter is invalid (e.g. over 100 chars)", async () => {
    const req = new NextRequest(`http://localhost:3000/api/v1/search?q=${"a".repeat(105)}`);
    const res = await searchRoute(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toBe("Invalid search query");
  });
});
