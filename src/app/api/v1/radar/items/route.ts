import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getRadarService } from "@/modules/radar/radar.service";
import { RadarFilterSchema } from "@/modules/radar/schemas";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return apiError("UNAUTHORIZED", "Authentication required", undefined, 401);
  }

  const { searchParams } = new URL(request.url);
  const queryObj: Record<string, unknown> = {};

  if (searchParams.has("feed_id")) queryObj.feed_id = searchParams.get("feed_id");
  if (searchParams.has("category")) queryObj.category = searchParams.get("category");
  if (searchParams.has("is_read")) queryObj.is_read = searchParams.get("is_read");
  if (searchParams.has("is_starred")) queryObj.is_starred = searchParams.get("is_starred");
  if (searchParams.has("search")) queryObj.search = searchParams.get("search");

  const parsed = RadarFilterSchema.safeParse(queryObj);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    return apiError("VALIDATION_ERROR", "Invalid query parameters", details, 400);
  }

  const supabase = await createClient();
  const service = getRadarService(supabase);
  const items = await service.listItems(user.id, parsed.data);

  return apiSuccess(items);
}
