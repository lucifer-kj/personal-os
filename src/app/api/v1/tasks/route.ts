import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { createTaskService } from "@/modules/tasks/task.service";
import { CreateTaskSchema, TaskQuerySchema } from "@/modules/tasks/schemas";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return apiError("UNAUTHORIZED", "Authentication required to access this resource", undefined, 401);
  }

  const { searchParams } = new URL(request.url);
  const queryObj: Record<string, unknown> = {};

  if (searchParams.has("status")) {
    const rawStatus = searchParams.getAll("status");
    queryObj.status = rawStatus.length > 1 ? rawStatus : rawStatus[0];
  }
  if (searchParams.has("priority")) {
    const rawPriority = searchParams.getAll("priority");
    queryObj.priority = rawPriority.length > 1 ? rawPriority : rawPriority[0];
  }
  if (searchParams.has("search")) queryObj.search = searchParams.get("search");
  if (searchParams.has("project_id")) queryObj.project_id = searchParams.get("project_id");
  if (searchParams.has("limit")) queryObj.limit = searchParams.get("limit");
  if (searchParams.has("offset")) queryObj.offset = searchParams.get("offset");

  const parsed = TaskQuerySchema.safeParse(queryObj);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    return apiError("VALIDATION_ERROR", "Invalid query parameters", details, 400);
  }

  const supabase = await createClient();
  const service = createTaskService(supabase);
  const { tasks, total } = await service.listTasks(user.id, parsed.data);

  return apiSuccess(tasks, {
    total_count: total,
    limit: parsed.data.limit,
    offset: parsed.data.offset,
  });
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return apiError("UNAUTHORIZED", "Authentication required to access this resource", undefined, 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("MALFORMED_JSON", "The request body must be valid JSON", undefined, 400);
  }

  const parsed = CreateTaskSchema.safeParse(body);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    return apiError("VALIDATION_ERROR", "The request payload is invalid", details, 422);
  }

  const supabase = await createClient();
  const service = createTaskService(supabase);
  const task = await service.createTask(user.id, parsed.data);

  return apiSuccess(task, undefined, 201);
}
