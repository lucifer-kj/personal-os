import { NextRequest } from "next/server";
import { getRequestContext } from "@/lib/supabase/context";
import { createProjectService } from "@/modules/projects/project.service";
import { UpdateProjectSchema } from "@/modules/projects/schemas";
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
  const service = createProjectService(ctx.supabase);
  const project = await service.getProject(ctx.user.id, id);

  if (!project) {
    return apiError("NOT_FOUND", `Project with id '${id}' not found`, undefined, 404);
  }

  return apiSuccess(project);
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

  const parsed = UpdateProjectSchema.safeParse(body);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    return apiError("VALIDATION_ERROR", "The request payload is invalid", details, 422);
  }

  const service = createProjectService(ctx.supabase);
  const updated = await service.updateProject(ctx.user.id, id, parsed.data);

  if (!updated) {
    return apiError("NOT_FOUND", `Project with id '${id}' not found`, undefined, 404);
  }

  return apiSuccess(updated);
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  const ctx = await getRequestContext(request);
  if (!ctx) {
    return apiError("UNAUTHORIZED", "Authentication required", undefined, 401);
  }

  const { id } = await context.params;
  const service = createProjectService(ctx.supabase);
  const success = await service.deleteProject(ctx.user.id, id);

  if (!success) {
    return apiError("NOT_FOUND", `Project with id '${id}' not found`, undefined, 404);
  }

  return apiSuccess({ id, deleted: true });
}
