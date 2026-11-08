import { NextRequest } from "next/server";
import { getRequestContext } from "@/lib/supabase/context";
import { createTaskService } from "@/modules/tasks/task.service";
import { UpdateTaskSchema } from "@/modules/tasks/schemas";
import { apiSuccess, apiError } from "@/lib/api/response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteParams) {
  const ctx = await getRequestContext(request);
  if (!ctx) {
    return apiError("UNAUTHORIZED", "Authentication required", undefined, 401);
  }

  const { id } = await context.params;
  const service = createTaskService(ctx.supabase);
  const task = await service.getTask(ctx.user.id, id);

  if (!task) {
    return apiError("NOT_FOUND", `Task with id '${id}' not found`, undefined, 404);
  }

  return apiSuccess(task);
}

export async function PATCH(request: NextRequest, context: RouteParams) {
  const ctx = await getRequestContext(request);
  if (!ctx) {
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

  const service = createTaskService(ctx.supabase);
  const updated = await service.updateTask(ctx.user.id, id, parsed.data);

  if (!updated) {
    return apiError("NOT_FOUND", `Task with id '${id}' not found`, undefined, 404);
  }

  return apiSuccess(updated);
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  const ctx = await getRequestContext(request);
  if (!ctx) {
    return apiError("UNAUTHORIZED", "Authentication required", undefined, 401);
  }

  const { id } = await context.params;
  const service = createTaskService(ctx.supabase);
  const success = await service.deleteTask(ctx.user.id, id);

  if (!success) {
    return apiError("NOT_FOUND", `Task with id '${id}' not found`, undefined, 404);
  }

  return apiSuccess({ id, deleted: true });
}
