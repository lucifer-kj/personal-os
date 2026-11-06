import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET as listInboxRoute, POST as captureRoute } from "./route";
import { GET as getInboxItemRoute, PATCH as updateRoute, DELETE as deleteRoute } from "./[id]/route";
import { POST as processRoute } from "./[id]/process/route";

describe("Inbox API Route Handlers", () => {
  it("captures, retrieves, updates, and processes an inbox item into a task", async () => {
    // 1. Capture item
    const captureReq = new NextRequest("http://localhost:3000/api/v1/inbox", {
      method: "POST",
      body: JSON.stringify({
        title: "Research LLM fine-tuning techniques",
        content: "Check LoRA, QLoRA benchmarks",
        capture_type: "idea",
        url: "https://arxiv.org",
      }),
    });

    const captureRes = await captureRoute(captureReq);
    expect(captureRes.status).toBe(201);
    const captureJson = await captureRes.json();
    expect(captureJson.data.title).toBe("Research LLM fine-tuning techniques");
    const itemId = captureJson.data.id;

    // 2. List inbox items
    const listReq = new NextRequest("http://localhost:3000/api/v1/inbox?status=unprocessed");
    const listRes = await listInboxRoute(listReq);
    expect(listRes.status).toBe(200);
    const listJson = await listRes.json();
    expect(listJson.data.some((i: { id: string }) => i.id === itemId)).toBe(true);

    // 3. Get single item
    const getRes = await getInboxItemRoute(new NextRequest(`http://localhost:3000/api/v1/inbox/${itemId}`), {
      params: Promise.resolve({ id: itemId }),
    });
    expect(getRes.status).toBe(200);

    // 4. Update item
    const updateReq = new NextRequest(`http://localhost:3000/api/v1/inbox/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({
        capture_type: "task",
      }),
    });
    const updateRes = await updateRoute(updateReq, {
      params: Promise.resolve({ id: itemId }),
    });
    expect(updateRes.status).toBe(200);
    const updateJson = await updateRes.json();
    expect(updateJson.data.capture_type).toBe("task");

    // 5. Process item into task
    const processReq = new NextRequest(`http://localhost:3000/api/v1/inbox/${itemId}/process`, {
      method: "POST",
      body: JSON.stringify({
        target_type: "task",
        priority: "high",
        due_date: "2026-11-20",
      }),
    });
    const processRes = await processRoute(processReq, {
      params: Promise.resolve({ id: itemId }),
    });
    expect(processRes.status).toBe(200);
    const processJson = await processRes.json();
    expect(processJson.data.item.status).toBe("processed");
    expect(processJson.data.target_type).toBe("task");
    expect(processJson.data.created_entity_id).toBeDefined();

    // 6. Delete item
    const deleteRes = await deleteRoute(new NextRequest(`http://localhost:3000/api/v1/inbox/${itemId}`), {
      params: Promise.resolve({ id: itemId }),
    });
    expect(deleteRes.status).toBe(200);
  });
});
