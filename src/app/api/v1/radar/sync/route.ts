import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getRadarService } from "@/modules/radar/radar.service";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return apiError("UNAUTHORIZED", "Authentication required", undefined, 401);
  }

  let feedId: string | undefined = undefined;
  try {
    const body = await request.json();
    if (body?.feed_id) feedId = String(body.feed_id);
  } catch {
    // Body is optional
  }

  const supabase = await createClient();
  const service = getRadarService(supabase);
  const result = await service.syncFeeds(user.id, feedId);

  return apiSuccess(result);
}
