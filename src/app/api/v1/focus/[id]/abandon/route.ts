import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getFocusRepository } from "@/modules/focus/focus.repository";
import { getTaskRepository } from "@/modules/tasks/task.repository";
import { FocusService } from "@/modules/focus/focus.service";
import { abandonFocusSessionSchema } from "@/modules/focus/schemas";
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
    const parseResult = abandonFocusSessionSchema.safeParse(body);

    const supabase = await createClient();
    const focusRepo = getFocusRepository(supabase);
    const taskRepo = getTaskRepository(supabase);
    const service = new FocusService(focusRepo, taskRepo);

    const result = await service.abandonSession(
      sessionId,
      user.id,
      parseResult.success ? parseResult.data.reason : null
    );

    return apiSuccess(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to abandon focus session";
    return apiBadRequest(message);
  }
}
