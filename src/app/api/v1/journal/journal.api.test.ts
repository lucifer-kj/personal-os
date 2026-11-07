import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { getLocalDateIso } from "@/lib/utils";
import { GET as listJournalRoute, POST as createJournalRoute } from "./route";
import {
  PATCH as updateJournalRoute,
  DELETE as deleteJournalRoute,
} from "./[id]/route";
import { GET as getTrendsRoute } from "./trends/route";

describe("Journal API Route Handlers", () => {
  it("creates, retrieves by date, updates, queries trends, and deletes journal entries", async () => {
    const today = getLocalDateIso();

    // 1. Create / Upsert entry
    const createReq = new NextRequest("http://localhost:3000/api/v1/journal", {
      method: "POST",
      body: JSON.stringify({
        entry_date: today,
        title: "Milestone 8 Engineering",
        content: "Building Habits & Journal with precision and focus.",
        mood: "great",
        energy_level: 5,
        reflection: "Consistent rhythm creates calm workstation clarity.",
        gratitude: ["Pair programming flow", "Reliable test runners"],
        tags: ["milestone", "productivity"],
      }),
    });

    const createRes = await createJournalRoute(createReq);
    expect(createRes.status).toBe(201);
    const created = await createRes.json();
    expect(created.data.title).toBe("Milestone 8 Engineering");
    expect(created.data.mood).toBe("great");
    const entryId = created.data.id;

    // 2. Query entry by date
    const getByDateReq = new NextRequest(`http://localhost:3000/api/v1/journal?date=${today}`);
    const getByDateRes = await listJournalRoute(getByDateReq);
    expect(getByDateRes.status).toBe(200);
    const dateJson = await getByDateRes.json();
    expect(dateJson.data.id).toBe(entryId);
    expect(dateJson.data.energy_level).toBe(5);

    // 3. Update entry
    const updateReq = new NextRequest(`http://localhost:3000/api/v1/journal/${entryId}`, {
      method: "PATCH",
      body: JSON.stringify({
        title: "Milestone 8 Engineering (Updated)",
      }),
    });
    const updateRes = await updateJournalRoute(updateReq, { params: Promise.resolve({ id: entryId }) });
    expect(updateRes.status).toBe(200);
    const updateJson = await updateRes.json();
    expect(updateJson.data.title).toBe("Milestone 8 Engineering (Updated)");

    // 4. Query trends
    const trendsReq = new NextRequest("http://localhost:3000/api/v1/journal/trends?days=7");
    const trendsRes = await getTrendsRoute(trendsReq);
    expect(trendsRes.status).toBe(200);
    const trendsJson = await trendsRes.json();
    expect(trendsJson.data.entries_count).toBeGreaterThanOrEqual(1);
    expect(trendsJson.data.mood_counts.great).toBeGreaterThanOrEqual(1);

    // 5. Delete entry
    const deleteReq = new NextRequest(`http://localhost:3000/api/v1/journal/${entryId}`, {
      method: "DELETE",
    });
    const deleteRes = await deleteJournalRoute(deleteReq, { params: Promise.resolve({ id: entryId }) });
    expect(deleteRes.status).toBe(200);
  });
});
