import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { getLocalDateIso } from "@/lib/utils";
import { GET as listHabitsRoute, POST as createHabitRoute } from "./route";
import { DELETE as deleteHabitRoute } from "./[id]/route";
import { POST as logHabitRoute } from "./[id]/log/route";
import { POST as archiveHabitRoute } from "./[id]/archive/route";

describe("Habits API Route Handlers", () => {
  it("creates, logs check-in, retrieves, archives, and deletes habit", async () => {
    // 1. Create habit
    const createReq = new NextRequest("http://localhost:3000/api/v1/habits", {
      method: "POST",
      body: JSON.stringify({
        name: "Morning Sunlight & Walk",
        description: "15 minutes outside after waking",
        frequency: "daily",
        target_count: 1,
        color: "amber",
      }),
    });

    const createRes = await createHabitRoute(createReq);
    expect(createRes.status).toBe(201);
    const created = await createRes.json();
    expect(created.data.name).toBe("Morning Sunlight & Walk");
    const habitId = created.data.id;

    // 2. Log check-in for today
    const today = getLocalDateIso();
    const logReq = new NextRequest(`http://localhost:3000/api/v1/habits/${habitId}/log`, {
      method: "POST",
      body: JSON.stringify({
        date: today,
        completed: true,
      }),
    });
    const logRes = await logHabitRoute(logReq, { params: Promise.resolve({ id: habitId }) });
    expect(logRes.status).toBe(200);
    const logJson = await logRes.json();
    expect(logJson.meta.completed).toBe(true);

    // 3. List habits with stats
    const listReq = new NextRequest("http://localhost:3000/api/v1/habits?is_archived=false");
    const listRes = await listHabitsRoute(listReq);
    expect(listRes.status).toBe(200);
    const listJson = await listRes.json();
    expect(listJson.data).toHaveLength(1);
    expect(listJson.data[0].is_completed_today).toBe(true);
    expect(listJson.meta.stats.completed_today).toBe(1);

    // 4. Archive habit
    const archiveReq = new NextRequest(`http://localhost:3000/api/v1/habits/${habitId}/archive`, {
      method: "POST",
    });
    const archiveRes = await archiveHabitRoute(archiveReq, { params: Promise.resolve({ id: habitId }) });
    expect(archiveRes.status).toBe(200);
    const archiveJson = await archiveRes.json();
    expect(archiveJson.data.is_archived).toBe(true);

    // 5. Delete habit
    const deleteReq = new NextRequest(`http://localhost:3000/api/v1/habits/${habitId}`, {
      method: "DELETE",
    });
    const deleteRes = await deleteHabitRoute(deleteReq, { params: Promise.resolve({ id: habitId }) });
    expect(deleteRes.status).toBe(200);
  });
});
