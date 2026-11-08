import { NextRequest } from "next/server";
import { getRequestContext } from "@/lib/supabase/context";
import { getFocusRepository } from "@/modules/focus/focus.repository";
import { getTaskRepository } from "@/modules/tasks/task.repository";
import { FocusService } from "@/modules/focus/focus.service";
import { startFocusSessionSchema } from "@/modules/focus/schemas";
import {
  apiSuccess,
  apiUnauthorized,
  apiBadRequest,
} from "@/lib/api/response";

export async function GET(req?: NextRequest) {
  try {
    const ctx = await getRequestContext(req);
    if (!ctx) return apiUnauthorized();

    const focusRepo = getFocusRepository(ctx.supabase);
    const taskRepo = getTaskRepository(ctx.supabase);
    const service = new FocusService(focusRepo, taskRepo);

    const activeSession = await service.getActiveSession(ctx.user.id);
    const recent = await service.listRecentSessions(ctx.user.id, 5);

    return apiSuccess({
      active: activeSession,
      recent,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch focus state";
    return apiBadRequest(message);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getRequestContext(req);
    if (!ctx) return apiUnauthorized();

    const body = await req.json().catch(() => ({}));
    const parseResult = startFocusSessionSchema.safeParse(body);
    if (!parseResult.success) {
      return apiBadRequest(
        parseResult.error.issues[0]?.message || "Validation error"
      );
    }

    const focusRepo = getFocusRepository(ctx.supabase);
    const taskRepo = getTaskRepository(ctx.supabase);
    const service = new FocusService(focusRepo, taskRepo);

    const activeSession = await service.startSession({
      user_id: ctx.user.id,
      ...parseResult.data,
    });

    return apiSuccess(activeSession, undefined, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to start focus session";
    return apiBadRequest(message);
  }
}
