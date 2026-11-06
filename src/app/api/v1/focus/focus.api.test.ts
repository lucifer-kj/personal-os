import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET as getFocusRoute, POST as startFocusRoute } from "./route";
import { POST as pauseRoute } from "./[id]/pause/route";
import { POST as resumeRoute } from "./[id]/resume/route";
import { POST as completeRoute } from "./[id]/complete/route";
import { POST as abandonRoute } from "./[id]/abandon/route";

describe("Focus API Route Handlers", () => {
  it("starts a focus session, pauses, resumes, and completes it", async () => {
    // 1. Start Session
    const startReq = new NextRequest("http://localhost:3000/api/v1/focus", {
      method: "POST",
      body: JSON.stringify({
        session_mode: "pomodoro",
        planned_duration_seconds: 1500,
        description: "Focus API integration test",
      }),
    });

    const startRes = await startFocusRoute(startReq);
    expect(startRes.status).toBe(201);
    const startJson = await startRes.json();
    expect(startJson.data.session.status).toBe("running");
    const sessionId = startJson.data.session.id;

    // 2. GET active session
    const getRes = await getFocusRoute();
    expect(getRes.status).toBe(200);
    const getJson = await getRes.json();
    expect(getJson.data.active.session.id).toBe(sessionId);

    // 3. Pause Session
    const pauseReq = new NextRequest(
      `http://localhost:3000/api/v1/focus/${sessionId}/pause`,
      { method: "POST" }
    );
    const pauseRes = await pauseRoute(pauseReq, {
      params: Promise.resolve({ id: sessionId }),
    });
    expect(pauseRes.status).toBe(200);
    const pauseJson = await pauseRes.json();
    expect(pauseJson.data.session.status).toBe("paused");

    // 4. Resume Session
    const resumeReq = new NextRequest(
      `http://localhost:3000/api/v1/focus/${sessionId}/resume`,
      { method: "POST" }
    );
    const resumeRes = await resumeRoute(resumeReq, {
      params: Promise.resolve({ id: sessionId }),
    });
    expect(resumeRes.status).toBe(200);
    const resumeJson = await resumeRes.json();
    expect(resumeJson.data.session.status).toBe("running");

    // 5. Complete Session
    const completeReq = new NextRequest(
      `http://localhost:3000/api/v1/focus/${sessionId}/complete`,
      {
        method: "POST",
        body: JSON.stringify({
          session_rating: 5,
          notes: "Very productive flow",
        }),
      }
    );
    const completeRes = await completeRoute(completeReq, {
      params: Promise.resolve({ id: sessionId }),
    });
    expect(completeRes.status).toBe(200);
    const completeJson = await completeRes.json();
    expect(completeJson.data.session.status).toBe("completed");

    // 6. Verify no active session remaining
    const finalGetRes = await getFocusRoute();
    const finalGetJson = await finalGetRes.json();
    expect(finalGetJson.data.active).toBeNull();
  });

  it("abandons a focus session properly", async () => {
    const startReq = new NextRequest("http://localhost:3000/api/v1/focus", {
      method: "POST",
      body: JSON.stringify({
        session_mode: "deep_work",
        planned_duration_seconds: 2700,
      }),
    });
    const startRes = await startFocusRoute(startReq);
    const startJson = await startRes.json();
    const sessionId = startJson.data.session.id;

    const abandonReq = new NextRequest(
      `http://localhost:3000/api/v1/focus/${sessionId}/abandon`,
      {
        method: "POST",
        body: JSON.stringify({ reason: "Emergency meeting" }),
      }
    );
    const abandonRes = await abandonRoute(abandonReq, {
      params: Promise.resolve({ id: sessionId }),
    });
    expect(abandonRes.status).toBe(200);
    const abandonJson = await abandonRes.json();
    expect(abandonJson.data.session.status).toBe("abandoned");
    expect(abandonJson.data.session.notes).toContain("Emergency meeting");
  });
});
