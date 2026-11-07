import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { POST as batchRoute } from "./batch/route";

describe("Batch Ingest API", () => {
  it("rejects request without rawText", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/inbox/batch", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await batchRoute(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.message).toContain("rawText is required");
  });

  it("parses multi-line text and creates tasks in batch", async () => {
    const rawText = `
- [ ] Implement Natural Syntax Tokenizer #dev p:high !today @30m
- [ ] Review PR comments @15m
- [x] Run vitest test suite
`;
    const req = new NextRequest("http://localhost:3000/api/v1/inbox/batch", {
      method: "POST",
      body: JSON.stringify({ rawText, target: "tasks" }),
    });

    const res = await batchRoute(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.count).toBe(3);
    expect(json.data.target).toBe("tasks");
    expect(json.data.items[0].title).toBe("Implement Natural Syntax Tokenizer");
    expect(json.data.items[0].priority).toBe("high");
    expect(json.data.items[2].status).toBe("completed");
  });
});
