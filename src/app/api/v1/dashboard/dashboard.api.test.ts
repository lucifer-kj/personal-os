import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as getDashboardHandler } from "./route";
import { GET as getDayHandler } from "../day/route";
import { PATCH as updateIntentionHandler } from "../day/intention/route";
import { getInMemoryTaskRepository } from "@/modules/tasks/task.repository";
import { getInMemoryProjectRepository } from "@/modules/projects/project.repository";
import { getInMemoryDayRepository } from "@/modules/day/day.repository";

describe("Dashboard & Day API Endpoints", () => {
  const inMemoryTaskRepo = getInMemoryTaskRepository();
  const inMemoryProjectRepo = getInMemoryProjectRepository();
  const inMemoryDayRepo = getInMemoryDayRepository();

  const USER_ID = "00000000-0000-0000-0000-000000000001";
  const TODAY = "2026-11-06";

  beforeEach(() => {
    inMemoryTaskRepo.clear();
    inMemoryProjectRepo.clear();
    inMemoryDayRepo.clear();
  });

  it("GET /api/v1/dashboard returns standard envelope with overview", async () => {
    await inMemoryTaskRepo.create(USER_ID, {
      title: "Today's Task",
      due_date: TODAY,
      priority: "high",
      status: "todo",
    });

    const req = new NextRequest(`http://localhost:3000/api/v1/dashboard?date=${TODAY}`);
    const res = await getDashboardHandler(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toBeDefined();
    expect(body.data.date).toBe(TODAY);
    expect(body.data.metrics.tasks_pending_today).toBe(1);
    expect(body.data.today_agenda.length).toBe(1);
  });

  it("GET /api/v1/day returns specific date overview", async () => {
    await inMemoryTaskRepo.create(USER_ID, {
      title: "Target Date Task",
      due_date: TODAY,
      status: "todo",
    });

    const req = new NextRequest(`http://localhost:3000/api/v1/day?date=${TODAY}`);
    const res = await getDayHandler(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.date).toBe(TODAY);
    expect(body.data.tasks_today.length).toBe(1);
    expect(body.data.tasks_today[0].title).toBe("Target Date Task");
  });

  it("PATCH /api/v1/day/intention updates and persists daily intention", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/day/intention", {
      method: "PATCH",
      body: JSON.stringify({
        date: TODAY,
        intention: "Complete Day Planner end-to-end.",
      }),
    });

    const res = await updateIntentionHandler(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.intention).toBe("Complete Day Planner end-to-end.");

    // Verify it reflects in day overview
    const getReq = new NextRequest(`http://localhost:3000/api/v1/day?date=${TODAY}`);
    const getRes = await getDayHandler(getReq);
    const getBody = await getRes.json();
    expect(getBody.data.intention).toBe("Complete Day Planner end-to-end.");
  });

  it("PATCH /api/v1/day/intention rejects invalid date format", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/day/intention", {
      method: "PATCH",
      body: JSON.stringify({
        date: "invalid-date",
        intention: "Test",
      }),
    });

    const res = await updateIntentionHandler(req);
    expect(res.status).toBe(400);
  });
});
