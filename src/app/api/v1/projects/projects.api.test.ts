import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as listProjectsHandler, POST as createProjectHandler } from "./route";
import {
  GET as getProjectHandler,
  PATCH as updateProjectHandler,
  DELETE as deleteProjectHandler,
} from "./[id]/route";
import {
  GET as listMilestonesHandler,
  POST as createMilestoneHandler,
} from "./[id]/milestones/route";
import {
  PATCH as toggleMilestoneHandler,
  DELETE as deleteMilestoneHandler,
} from "./[id]/milestones/[milestoneId]/route";
import { getInMemoryProjectRepository } from "@/modules/projects/project.repository";
import { getInMemoryTaskRepository } from "@/modules/tasks/task.repository";

describe("Projects REST API Handlers (/api/v1/projects)", () => {
  const projectRepo = getInMemoryProjectRepository();
  const taskRepo = getInMemoryTaskRepository();

  beforeEach(() => {
    projectRepo.clear();
    taskRepo.clear();
  });

  it("GET /api/v1/projects rejects unauthenticated requests with 401", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/projects", {
      headers: { "x-unauthenticated": "true" },
    });

    const res = await listProjectsHandler(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  it("POST /api/v1/projects validates input and returns 201 on success", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/projects", {
      method: "POST",
      body: JSON.stringify({
        name: "Personal OS Project 1",
        description: "Core workspace launch",
        priority: "high",
      }),
    });

    const res = await createProjectHandler(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data).toBeDefined();
    expect(body.data.name).toBe("Personal OS Project 1");
    expect(body.data.priority).toBe("high");
    expect(body.meta.request_id).toBeDefined();
  });

  it("POST /api/v1/projects rejects invalid payload with 422", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/projects", {
      method: "POST",
      body: JSON.stringify({ name: "" }),
    });

    const res = await createProjectHandler(req);
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("GET /api/v1/projects lists projects with computed stats", async () => {
    const p1 = await projectRepo.create("00000000-0000-0000-0000-000000000001", {
      name: "Alpha Project",
    });
    await taskRepo.create("00000000-0000-0000-0000-000000000001", {
      title: "Alpha Task",
      project_id: p1.id,
      status: "completed",
    });

    const req = new NextRequest("http://localhost:3000/api/v1/projects");
    const res = await listProjectsHandler(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data.length).toBe(1);
    expect(body.data[0].stats.progress_percent).toBe(100);
    expect(body.data[0].stats.completed_tasks).toBe(1);
  });

  it("GET /api/v1/projects/:id returns 404 for non-existent project", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/projects/non-existent-id");
    const res = await getProjectHandler(req, {
      params: Promise.resolve({ id: "non-existent-id" }),
    });

    expect(res.status).toBe(404);
  });

  it("PATCH /api/v1/projects/:id updates project details", async () => {
    const created = await projectRepo.create("00000000-0000-0000-0000-000000000001", {
      name: "Original Name",
    });

    const req = new NextRequest(`http://localhost:3000/api/v1/projects/${created.id}`, {
      method: "PATCH",
      body: JSON.stringify({ name: "Updated Name", status: "completed" }),
    });

    const res = await updateProjectHandler(req, {
      params: Promise.resolve({ id: created.id }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.name).toBe("Updated Name");
    expect(body.data.status).toBe("completed");
    expect(body.data.completed_at).not.toBeNull();
  });

  it("POST & PATCH milestone endpoints manage milestone lifecycle", async () => {
    const project = await projectRepo.create("00000000-0000-0000-0000-000000000001", {
      name: "Milestone Testing",
    });

    // Create milestone
    const postReq = new NextRequest(
      `http://localhost:3000/api/v1/projects/${project.id}/milestones`,
      {
        method: "POST",
        body: JSON.stringify({ title: "Milestone 1 Spec" }),
      }
    );
    const postRes = await createMilestoneHandler(postReq, {
      params: Promise.resolve({ id: project.id }),
    });
    expect(postRes.status).toBe(201);
    const postBody = await postRes.json();
    const milestoneId = postBody.data.id;
    expect(postBody.data.status).toBe("pending");

    // Toggle milestone
    const patchReq = new NextRequest(
      `http://localhost:3000/api/v1/projects/${project.id}/milestones/${milestoneId}`,
      { method: "PATCH" }
    );
    const patchRes = await toggleMilestoneHandler(patchReq, {
      params: Promise.resolve({ id: project.id, milestoneId }),
    });
    expect(patchRes.status).toBe(200);
    const patchBody = await patchRes.json();
    expect(patchBody.data.status).toBe("completed");

    // List milestones
    const listReq = new NextRequest(
      `http://localhost:3000/api/v1/projects/${project.id}/milestones`
    );
    const listRes = await listMilestonesHandler(listReq, {
      params: Promise.resolve({ id: project.id }),
    });
    const listBody = await listRes.json();
    expect(listBody.data.length).toBe(1);

    // Delete milestone
    const delReq = new NextRequest(
      `http://localhost:3000/api/v1/projects/${project.id}/milestones/${milestoneId}`,
      { method: "DELETE" }
    );
    const delRes = await deleteMilestoneHandler(delReq, {
      params: Promise.resolve({ id: project.id, milestoneId }),
    });
    expect(delRes.status).toBe(200);

    // Delete project
    const delProjReq = new NextRequest(`http://localhost:3000/api/v1/projects/${project.id}`, {
      method: "DELETE",
    });
    const delProjRes = await deleteProjectHandler(delProjReq, {
      params: Promise.resolve({ id: project.id }),
    });
    expect(delProjRes.status).toBe(200);
  });
});
