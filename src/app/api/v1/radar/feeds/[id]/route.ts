import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getRadarService } from "@/modules/radar/radar.service";
import { apiSuccess, apiError } from "@/lib/api/response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return apiError("UNAUTHORIZED", "Authentication required", undefined, 401);
  }

  const { id } = await context.params;
  const supabase = await createClient();
  const service = getRadarService(supabase);
  const success = await service.deleteFeed(user.id, id);

  if (!success) {
    return apiError("NOT_FOUND", `Feed with id '${id}' not found`, undefined, 404);
  }

  return apiSuccess({ deleted: true });
}
