import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET as listEventsRoute, POST as createEventRoute } from "./events/route";
import {
  GET as getEventRoute,
  PATCH as updateEventRoute,
  DELETE as deleteEventRoute,
} from "./events/[id]/route";
import { POST as moveEventRoute } from "./events/[id]/move/route";
import { GET as checkConflictsRoute } from "./conflicts/route";
import { POST as scheduleTaskRoute } from "./schedule-task/route";
import { getInMemoryTaskRepository } from "@/modules/tasks/task.repository";
import { DEFAULT_DEV_USER_ID } from "@/lib/supabase/auth";

describe("Calendar API Route Handlers", () => {
  it("creates, retrieves, updates, moves, detects conflicts, and deletes an event", async () => {
    // 1. Create initial event
    const createReq = new NextRequest("http://localhost:3000/api/v1/calendar/events", {
      method: "POST",
      body: JSON.stringify({
        title: "Architecture Strategy Meeting",
        event_type: "meeting",
        start_at: "2026-11-06T14:00:00Z",
        end_at: "2026-11-06T15:00:00Z",
        all_day: false,
        location: "Virtual Room A",
      }),
    });

    const createRes = await createEventRoute(createReq);
    expect(createRes.status).toBe(201);
    const createJson = await createRes.json();
    expect(createJson.data.title).toBe("Architecture Strategy Meeting");
    expect(createJson.data.conflict_advisory.has_conflict).toBe(false);
    const eventId = createJson.data.id;

    // 2. Conflict detection endpoint returns advisory when queried with overlapping time
    const conflictReq = new NextRequest(
      "http://localhost:3000/api/v1/calendar/conflicts?start_at=2026-11-06T14:30:00Z&end_at=2026-11-06T15:30:00Z"
    );
    const conflictRes = await checkConflictsRoute(conflictReq);
    expect(conflictRes.status).toBe(200);
    const conflictJson = await conflictRes.json();
    expect(conflictJson.data.has_conflict).toBe(true);
    expect(conflictJson.data.conflicting_events[0].id).toBe(eventId);

    // 3. List events with range filter
    const listReq = new NextRequest(
      "http://localhost:3000/api/v1/calendar/events?from=2026-11-06T00:00:00Z&to=2026-11-06T23:59:59Z"
    );
    const listRes = await listEventsRoute(listReq);
    expect(listRes.status).toBe(200);
    const listJson = await listRes.json();
    expect(listJson.data.some((e: { id: string }) => e.id === eventId)).toBe(true);

    // 4. Retrieve single event
    const getRes = await getEventRoute(
      new NextRequest(`http://localhost:3000/api/v1/calendar/events/${eventId}`),
      { params: Promise.resolve({ id: eventId }) }
    );
    expect(getRes.status).toBe(200);

    // 5. Update event
    const patchReq = new NextRequest(
      `http://localhost:3000/api/v1/calendar/events/${eventId}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          title: "Senior Architecture Strategy",
          location: "Room 101",
        }),
      }
    );
    const patchRes = await updateEventRoute(patchReq, {
      params: Promise.resolve({ id: eventId }),
    });
    expect(patchRes.status).toBe(200);
    const patchJson = await patchRes.json();
    expect(patchJson.data.title).toBe("Senior Architecture Strategy");
    expect(patchJson.data.location).toBe("Room 101");

    // 6. Move event
    const moveReq = new NextRequest(
      `http://localhost:3000/api/v1/calendar/events/${eventId}/move`,
      {
        method: "POST",
        body: JSON.stringify({
          start_at: "2026-11-06T16:00:00Z",
          end_at: "2026-11-06T17:00:00Z",
        }),
      }
    );
    const moveRes = await moveEventRoute(moveReq, {
      params: Promise.resolve({ id: eventId }),
    });
    expect(moveRes.status).toBe(200);
    const moveJson = await moveRes.json();
    expect(moveJson.data.start_at).toBe("2026-11-06T16:00:00Z");

    // 7. Schedule Task Block endpoint
    const taskRepo = getInMemoryTaskRepository();
    const task = await taskRepo.create(DEFAULT_DEV_USER_ID, {
      title: "Write integration tests for calendar",
      priority: "high",
    });

    const scheduleTaskReq = new NextRequest(
      "http://localhost:3000/api/v1/calendar/schedule-task",
      {
        method: "POST",
        body: JSON.stringify({
          task_id: task.id,
          start_at: "2026-11-06T18:00:00Z",
          duration_minutes: 45,
          event_type: "focus",
        }),
      }
    );
    const scheduleTaskRes = await scheduleTaskRoute(scheduleTaskReq);
    expect(scheduleTaskRes.status).toBe(201);
    const scheduleTaskJson = await scheduleTaskRes.json();
    expect(scheduleTaskJson.data.event.task_id).toBe(task.id);

    // 8. Delete event
    const deleteRes = await deleteEventRoute(
      new NextRequest(`http://localhost:3000/api/v1/calendar/events/${eventId}`),
      { params: Promise.resolve({ id: eventId }) }
    );
    expect(deleteRes.status).toBe(200);
  });
});
