import { NextRequest } from "next/server";
import { getRequestContext } from "@/lib/supabase/context";
import { createProjectService } from "@/modules/projects/project.service";
import { CreateProjectSchema, ProjectQuerySchema } from "@/modules/projects/schemas";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  const ctx = await getRequestContext(request);
  if (!ctx) {
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
  if (searchParams.has("limit")) queryObj.limit = searchParams.get("limit");
  if (searchParams.has("offset")) queryObj.offset = searchParams.get("offset");

  const parsed = ProjectQuerySchema.safeParse(queryObj);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    return apiError("VALIDATION_ERROR", "Invalid query parameters", details, 400);
  }

  const service = createProjectService(ctx.supabase);
  const { projects, total } = await service.listProjects(ctx.user.id, parsed.data);

  return apiSuccess(projects, {
    total_count: total,
    limit: parsed.data.limit,
    offset: parsed.data.offset,
  });
}

export async function POST(request: NextRequest) {
  const ctx = await getRequestContext(request);
  if (!ctx) {
    return apiError("UNAUTHORIZED", "Authentication required to access this resource", undefined, 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("MALFORMED_JSON", "The request body must be valid JSON", undefined, 400);
  }

  const parsed = CreateProjectSchema.safeParse(body);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    return apiError("VALIDATION_ERROR", "The request payload is invalid", details, 422);
  }

  const service = createProjectService(ctx.supabase);
  const project = await service.createProject(ctx.user.id, parsed.data);

  return apiSuccess(project, undefined, 201);
}
