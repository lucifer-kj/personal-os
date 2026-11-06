import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getFocusRepository } from "@/modules/focus/focus.repository";
import { getTaskRepository } from "@/modules/tasks/task.repository";
import { FocusService } from "@/modules/focus/focus.service";
import { completeFocusSessionSchema } from "@/modules/focus/schemas";
import {
  apiSuccess,
  apiUnauthorized,
  apiBadRequest,
} from "@/lib/api/response";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return apiUnauthorized();

    const { id: sessionId } = await params;
    if (!sessionId) return apiBadRequest("Session ID is required");

    const body = await req.json().catch(() => ({}));
    const parseResult = completeFocusSessionSchema.safeParse(body);
    if (!parseResult.success) {
      return apiBadRequest(
        parseResult.error.issues[0]?.message || "Validation error"
      );
    }

    const supabase = await createClient();
    const focusRepo = getFocusRepository(supabase);
    const taskRepo = getTaskRepository(supabase);
    const service = new FocusService(focusRepo, taskRepo);

    const result = await service.completeSession(
      sessionId,
      user.id,
      parseResult.data
    );

    return apiSuccess(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to complete focus session";
    return apiBadRequest(message);
  }
}
