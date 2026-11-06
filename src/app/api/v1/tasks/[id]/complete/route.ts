import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { createTaskService } from "@/modules/tasks/task.service";
import { apiSuccess, apiError } from "@/lib/api/response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteParams) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return apiError("UNAUTHORIZED", "Authentication required", undefined, 401);
  }

  const { id } = await context.params;
  const supabase = await createClient();
  const service = createTaskService(supabase);
  const task = await service.completeTask(user.id, id);

  if (!task) {
    return apiError("NOT_FOUND", `Task with id '${id}' not found`, undefined, 404);
  }

  return apiSuccess(task);
}
