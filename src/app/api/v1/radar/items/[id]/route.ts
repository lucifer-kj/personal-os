import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getRadarService } from "@/modules/radar/radar.service";
import { UpdateRadarItemSchema } from "@/modules/radar/schemas";
import { apiSuccess, apiError } from "@/lib/api/response";

interface RouteParams {
  params: Promise<{ id: string }>;
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
    return apiError("MALFORMED_JSON", "Invalid JSON payload", undefined, 400);
  }

  const parsed = UpdateRadarItemSchema.safeParse(body);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    return apiError("VALIDATION_ERROR", "Validation failed", details, 422);
  }

  const supabase = await createClient();
  const service = getRadarService(supabase);

  let updated = null;
  if (parsed.data.is_read !== undefined) {
    updated = await service.markItemRead(user.id, id, parsed.data.is_read);
  }
  if (parsed.data.is_starred !== undefined) {
    updated = await service.toggleItemStarred(user.id, id);
  }

  if (!updated) {
    return apiError("NOT_FOUND", `Radar item with id '${id}' not found`, undefined, 404);
  }

  return apiSuccess(updated);
}
