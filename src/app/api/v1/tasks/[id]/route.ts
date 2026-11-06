import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { createTaskService } from "@/modules/tasks/task.service";
import { UpdateTaskSchema } from "@/modules/tasks/schemas";
import { apiSuccess, apiError } from "@/lib/api/response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteParams) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return apiError("UNAUTHORIZED", "Authentication required", undefined, 401);
  }

  const { id } = await context.params;
  const supabase = await createClient();
  const service = createTaskService(supabase);
  const task = await service.getTask(user.id, id);

  if (!task) {
    return apiError("NOT_FOUND", `Task with id '${id}' not found`, undefined, 404);
  }

  return apiSuccess(task);
}

export async function PATCH(request: NextRequest, context: RouteParams) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return apiError("UNAUTHORIZED", "Authentication required", undefined, 401);
  }

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("MALFORMED_JSON", "The request body must be valid JSON", undefined, 400);
  }

  const parsed = UpdateTaskSchema.safeParse(body);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    return apiError("VALIDATION_ERROR", "The request payload is invalid", details, 422);
  }

  const supabase = await createClient();
  const service = createTaskService(supabase);
  const updated = await service.updateTask(user.id, id, parsed.data);

  if (!updated) {
    return apiError("NOT_FOUND", `Task with id '${id}' not found`, undefined, 404);
  }

  return apiSuccess(updated);
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return apiError("UNAUTHORIZED", "Authentication required", undefined, 401);
  }

  const { id } = await context.params;
  const supabase = await createClient();
  const service = createTaskService(supabase);
  const success = await service.deleteTask(user.id, id);

  if (!success) {
    return apiError("NOT_FOUND", `Task with id '${id}' not found`, undefined, 404);
  }

  return apiSuccess({ id, deleted: true });
}
