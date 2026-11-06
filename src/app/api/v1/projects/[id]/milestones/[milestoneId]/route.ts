import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { createProjectService } from "@/modules/projects/project.service";
import { apiSuccess, apiError } from "@/lib/api/response";

interface RouteParams {
  params: Promise<{ id: string; milestoneId: string }>;
}

export async function PATCH(request: NextRequest, context: RouteParams) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return apiError("UNAUTHORIZED", "Authentication required", undefined, 401);
  }

  const { id, milestoneId } = await context.params;
  const supabase = await createClient();
  const service = createProjectService(supabase);
  const updated = await service.toggleMilestone(user.id, id, milestoneId);

  if (!updated) {
    return apiError("NOT_FOUND", `Milestone with id '${milestoneId}' not found`, undefined, 404);
  }

  return apiSuccess(updated);
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return apiError("UNAUTHORIZED", "Authentication required", undefined, 401);
  }

  const { id, milestoneId } = await context.params;
  const supabase = await createClient();
  const service = createProjectService(supabase);
  const success = await service.deleteMilestone(user.id, id, milestoneId);

  if (!success) {
    return apiError("NOT_FOUND", `Milestone with id '${milestoneId}' not found`, undefined, 404);
  }

  return apiSuccess({ id: milestoneId, deleted: true });
}
