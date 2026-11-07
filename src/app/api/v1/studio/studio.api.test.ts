import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as listPostsRoute, POST as createPostRoute } from "./posts/route";
import {
  GET as getPostRoute,
  PATCH as updatePostRoute,
  DELETE as deletePostRoute,
} from "./posts/[id]/route";
import { getInMemorySocialPostRepository } from "@/modules/studio/studio.repository";

describe("Studio API Routes", () => {
  const repo = getInMemorySocialPostRepository();

  beforeEach(() => {
    repo.clear();
  });
  it("creates, reads, filters, updates, and deletes social posts", async () => {
    // 1. Create a post
    const createReq = new NextRequest("http://localhost:3000/api/v1/studio/posts", {
      method: "POST",
      body: JSON.stringify({
        title: "Announcing Personal OS v1",
        content: "We just open-sourced Personal OS! A calm, zero-telemetry private workstation. #buildinpublic",
        platform: "x",
        status: "draft",
        tags: ["buildinpublic", "opensource"],
      }),
    });

    const createRes = await createPostRoute(createReq);
    expect(createRes.status).toBe(201);
    const createJson = await createRes.json();
    expect(createJson.data.id).toBeDefined();
    expect(createJson.data.title).toBe("Announcing Personal OS v1");
    expect(createJson.data.platform).toBe("x");
    const postId = createJson.data.id;

    // 2. Fetch single post
    const getReq = new NextRequest(`http://localhost:3000/api/v1/studio/posts/${postId}`);
    const getRes = await getPostRoute(getReq, { params: Promise.resolve({ id: postId }) });
    expect(getRes.status).toBe(200);
    const getJson = await getRes.json();
    expect(getJson.data.id).toBe(postId);
    expect(getJson.data.content).toContain("Personal OS");

    // 3. List posts with filter
    const listReq = new NextRequest("http://localhost:3000/api/v1/studio/posts?platform=x&status=draft");
    const listRes = await listPostsRoute(listReq);
    expect(listRes.status).toBe(200);
    const listJson = await listRes.json();
    expect(listJson.data.length).toBeGreaterThanOrEqual(1);

    // 4. Update post (schedule it)
    const futureDate = new Date(Date.now() + 3600000).toISOString();
    const updateReq = new NextRequest(`http://localhost:3000/api/v1/studio/posts/${postId}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: "scheduled",
        scheduled_at: futureDate,
      }),
    });
    const updateRes = await updatePostRoute(updateReq, { params: Promise.resolve({ id: postId }) });
    expect(updateRes.status).toBe(200);
    const updateJson = await updateRes.json();
    expect(updateJson.data.status).toBe("scheduled");
    expect(updateJson.data.scheduled_at).toBe(futureDate);

    // 5. Delete post
    const deleteReq = new NextRequest(`http://localhost:3000/api/v1/studio/posts/${postId}`, {
      method: "DELETE",
    });
    const deleteRes = await deletePostRoute(deleteReq, { params: Promise.resolve({ id: postId }) });
    expect(deleteRes.status).toBe(200);

    // 6. Confirm deleted
    const verifyReq = new NextRequest(`http://localhost:3000/api/v1/studio/posts/${postId}`);
    const verifyRes = await getPostRoute(verifyReq, { params: Promise.resolve({ id: postId }) });
    expect(verifyRes.status).toBe(404);
  });

  it("rejects post that exceeds platform character limit", async () => {
    const createReq = new NextRequest("http://localhost:3000/api/v1/studio/posts", {
      method: "POST",
      body: JSON.stringify({
        content: "x".repeat(300),
        platform: "x",
      }),
    });

    const res = await createPostRoute(createReq);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.message).toContain("character limit");
  });
});
