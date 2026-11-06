import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getFocusRepository } from "@/modules/focus/focus.repository";
import { getTaskRepository } from "@/modules/tasks/task.repository";
import { FocusService } from "@/modules/focus/focus.service";
import { startFocusSessionSchema } from "@/modules/focus/schemas";
import {
  apiSuccess,
  apiUnauthorized,
  apiBadRequest,
} from "@/lib/api/response";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return apiUnauthorized();

    const supabase = await createClient();
    const focusRepo = getFocusRepository(supabase);
    const taskRepo = getTaskRepository(supabase);
    const service = new FocusService(focusRepo, taskRepo);

    const activeSession = await service.getActiveSession(user.id);
    const recent = await service.listRecentSessions(user.id, 5);

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
    const user = await getAuthenticatedUser();
    if (!user) return apiUnauthorized();

    const body = await req.json().catch(() => ({}));
    const parseResult = startFocusSessionSchema.safeParse(body);
    if (!parseResult.success) {
      return apiBadRequest(
        parseResult.error.issues[0]?.message || "Validation error"
      );
    }

    const supabase = await createClient();
    const focusRepo = getFocusRepository(supabase);
    const taskRepo = getTaskRepository(supabase);
    const service = new FocusService(focusRepo, taskRepo);

    const activeSession = await service.startSession({
      user_id: user.id,
      ...parseResult.data,
    });

    return apiSuccess(activeSession, undefined, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to start focus session";
    return apiBadRequest(message);
  }
}
