import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getRadarService } from "@/modules/radar/radar.service";
import { CreateFeedSchema } from "@/modules/radar/schemas";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return apiError("UNAUTHORIZED", "Authentication required", undefined, 401);
  }

  const supabase = await createClient();
  const service = getRadarService(supabase);
  const feeds = await service.listFeeds(user.id);

  return apiSuccess(feeds);
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return apiError("UNAUTHORIZED", "Authentication required", undefined, 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("MALFORMED_JSON", "Invalid JSON payload", undefined, 400);
  }

  const parsed = CreateFeedSchema.safeParse(body);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    return apiError("VALIDATION_ERROR", "Validation failed", details, 422);
  }

  try {
    const supabase = await createClient();
    const service = getRadarService(supabase);
    const feed = await service.subscribeFeed(user.id, parsed.data);
    return apiSuccess(feed, undefined, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to subscribe to feed";
    return apiError("BAD_REQUEST", message, undefined, 400);
  }
}
