import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as listTasksHandler, POST as createTaskHandler } from "./route";
import { GET as getTaskHandler, PATCH as updateTaskHandler, DELETE as deleteTaskHandler } from "./[id]/route";
import { POST as completeTaskHandler } from "./[id]/complete/route";
import { POST as reopenTaskHandler } from "./[id]/reopen/route";
import { getInMemoryTaskRepository } from "@/modules/tasks/task.repository";

describe("Tasks REST API Handlers (/api/v1/tasks)", () => {
  const repo = getInMemoryTaskRepository();

  beforeEach(() => {
    repo.clear();
  });

  it("GET /api/v1/tasks rejects unauthenticated requests with 401", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/tasks", {
      headers: { "x-unauthenticated": "true" },
    });

    const res = await listTasksHandler(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error.code).toBe("UNAUTHORIZED");
    expect(body.error.request_id).toBeDefined();
  });

  it("POST /api/v1/tasks returns 422 with validation errors for invalid payload", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/tasks", {
      method: "POST",
      body: JSON.stringify({ title: "" }),
    });

    const res = await createTaskHandler(req);
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.details).toBeDefined();
    expect(body.error.details.length).toBeGreaterThan(0);
  });

  it("POST /api/v1/tasks creates a task and returns 201 with standard envelope", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/tasks", {
      method: "POST",
      body: JSON.stringify({
        title: "Deploy API slice",
        priority: "high",
        due_date: "2026-11-12",
      }),
    });

    const res = await createTaskHandler(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data).toBeDefined();
    expect(body.data.title).toBe("Deploy API slice");
    expect(body.data.priority).toBe("high");
    expect(body.meta.request_id).toBeDefined();
  });

  it("GET /api/v1/tasks lists user tasks with pagination metadata", async () => {
    // Create 2 tasks
    await repo.create("00000000-0000-0000-0000-000000000001", { title: "Task 1" });
    await repo.create("00000000-0000-0000-0000-000000000001", { title: "Task 2" });

    const req = new NextRequest("http://localhost:3000/api/v1/tasks?limit=10");
    const res = await listTasksHandler(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data.length).toBe(2);
    expect(body.meta.total_count).toBe(2);
    expect(body.meta.limit).toBe(10);
  });

  it("GET /api/v1/tasks/:id returns 404 for non-existent task", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/tasks/non-existent-id");
    const res = await getTaskHandler(req, {
      params: Promise.resolve({ id: "non-existent-id" }),
    });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe("NOT_FOUND");
  });

  it("POST /api/v1/tasks/:id/complete and reopen toggle status accurately", async () => {
    const created = await repo.create("00000000-0000-0000-0000-000000000001", {
      title: "Feature verification",
    });

    // Complete
    const completeReq = new NextRequest(
      `http://localhost:3000/api/v1/tasks/${created.id}/complete`,
      { method: "POST" }
    );
    const completeRes = await completeTaskHandler(completeReq, {
      params: Promise.resolve({ id: created.id }),
    });
    expect(completeRes.status).toBe(200);
    const completeBody = await completeRes.json();
    expect(completeBody.data.status).toBe("completed");
    expect(completeBody.data.completed_at).not.toBeNull();

    // Reopen
    const reopenReq = new NextRequest(
      `http://localhost:3000/api/v1/tasks/${created.id}/reopen`,
      { method: "POST" }
    );
    const reopenRes = await reopenTaskHandler(reopenReq, {
      params: Promise.resolve({ id: created.id }),
    });
    expect(reopenRes.status).toBe(200);
    const reopenBody = await reopenRes.json();
    expect(reopenBody.data.status).toBe("todo");
    expect(reopenBody.data.completed_at).toBeNull();
  });

  it("PATCH /api/v1/tasks/:id updates allowed properties", async () => {
    const created = await repo.create("00000000-0000-0000-0000-000000000001", {
      title: "Original title",
    });

    const req = new NextRequest(`http://localhost:3000/api/v1/tasks/${created.id}`, {
      method: "PATCH",
      body: JSON.stringify({ title: "Updated title", priority: "urgent" }),
    });

    const res = await updateTaskHandler(req, {
      params: Promise.resolve({ id: created.id }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.title).toBe("Updated title");
    expect(body.data.priority).toBe("urgent");
  });

  it("DELETE /api/v1/tasks/:id marks task as deleted", async () => {
    const created = await repo.create("00000000-0000-0000-0000-000000000001", {
      title: "Task to delete",
    });

    const req = new NextRequest(`http://localhost:3000/api/v1/tasks/${created.id}`, {
      method: "DELETE",
    });

    const res = await deleteTaskHandler(req, {
      params: Promise.resolve({ id: created.id }),
    });
    expect(res.status).toBe(200);

    // Verify task is now deleted
    const task = await repo.findById("00000000-0000-0000-0000-000000000001", created.id);
    expect(task?.deleted_at).not.toBeNull();
  });
});
