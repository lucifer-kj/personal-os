import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { createProjectService } from "@/modules/projects/project.service";
import { CreateMilestoneSchema } from "@/modules/projects/schemas";
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
  const service = createProjectService(supabase);
  const project = await service.getProject(user.id, id);

  if (!project) {
    return apiError("NOT_FOUND", `Project with id '${id}' not found`, undefined, 404);
  }

  return apiSuccess(project.milestones || []);
}

export async function POST(request: NextRequest, context: RouteParams) {
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

  const parsed = CreateMilestoneSchema.safeParse(body);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    return apiError("VALIDATION_ERROR", "Invalid milestone data", details, 422);
  }

  const supabase = await createClient();
  const service = createProjectService(supabase);

  try {
    const milestone = await service.createMilestone(user.id, id, parsed.data);
    return apiSuccess(milestone, undefined, 201);
  } catch (err) {
    return apiError("NOT_FOUND", err instanceof Error ? err.message : "Project not found", undefined, 404);
  }
}
