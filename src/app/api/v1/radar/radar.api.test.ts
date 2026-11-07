import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET as listFeedsRoute, POST as createFeedRoute } from "./feeds/route";
import { DELETE as deleteFeedRoute } from "./feeds/[id]/route";
import { GET as listItemsRoute } from "./items/route";
import { PATCH as updateItemRoute } from "./items/[id]/route";
import { POST as promoteItemRoute } from "./items/[id]/promote/route";
import { getInMemoryRadarRepository } from "@/modules/radar/radar.repository";
import * as rssService from "@/modules/radar/rss.service";

describe("Radar API Routes", () => {
  const repo = getInMemoryRadarRepository();

  beforeEach(() => {
    repo.clear();
    vi.clearAllMocks();
  });

  it("subscribes to a feed, lists items, updates read status, and promotes to note", async () => {
    vi.spyOn(rssService, "fetchAndParseFeed").mockResolvedValueOnce({
      title: "MIT Technology Review",
      siteUrl: "https://technologyreview.com",
      items: [
        {
          title: "The Next Era of Generative Systems",
          url: "https://technologyreview.com/genai",
          author: "Will Douglas Heaven",
          summary: "Exploring models that reason across modalities.",
          publishedAt: new Date().toISOString(),
        },
      ],
    });

    // 1. Subscribe to feed
    const subReq = new NextRequest("http://localhost:3000/api/v1/radar/feeds", {
      method: "POST",
      body: JSON.stringify({
        url: "https://technologyreview.com/feed",
        category: "AI",
      }),
    });

    const subRes = await createFeedRoute(subReq);
    expect(subRes.status).toBe(201);
    const subJson = await subRes.json();
    expect(subJson.data.title).toBe("MIT Technology Review");
    const feedId = subJson.data.id;

    // 2. List items
    const listReq = new NextRequest("http://localhost:3000/api/v1/radar/items?category=AI");
    const listRes = await listItemsRoute(listReq);
    expect(listRes.status).toBe(200);
    const listJson = await listRes.json();
    expect(listJson.data.length).toBe(1);
    const itemId = listJson.data[0].id;

    // 3. Mark read
    const patchReq = new NextRequest(`http://localhost:3000/api/v1/radar/items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({ is_read: true }),
    });
    const patchRes = await updateItemRoute(patchReq, { params: Promise.resolve({ id: itemId }) });
    expect(patchRes.status).toBe(200);
    const patchJson = await patchRes.json();
    expect(patchJson.data.is_read).toBe(true);

    // 4. Promote to Note
    const promoteReq = new NextRequest(`http://localhost:3000/api/v1/radar/items/${itemId}/promote`, {
      method: "POST",
      body: JSON.stringify({
        target: "note",
        notes: "Crucial perspective on multimodal agents.",
      }),
    });
    const promoteRes = await promoteItemRoute(promoteReq, { params: Promise.resolve({ id: itemId }) });
    expect(promoteRes.status).toBe(201);
    const promoteJson = await promoteRes.json();
    expect(promoteJson.data.promoted_type).toBe("note");
    expect(promoteJson.data.data.title).toBe("The Next Era of Generative Systems");

    // 5. Delete feed
    const delReq = new NextRequest(`http://localhost:3000/api/v1/radar/feeds/${feedId}`, {
      method: "DELETE",
    });
    const delRes = await deleteFeedRoute(delReq, { params: Promise.resolve({ id: feedId }) });
    expect(delRes.status).toBe(200);
  });
});
