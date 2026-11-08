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

  let retentionDays = 7;
  try {
    const body = await request.json();
    if (typeof body?.retention_days === "number") {
      retentionDays = Math.max(1, body.retention_days);
    }
  } catch {
    // Body optional, fallback to default 7 days
  }

  try {
    const supabase = await createClient();
    const service = getRadarService(supabase);
    const prunedCount = await service.pruneOldItems(user.id, retentionDays);

    return apiSuccess({
      pruned: prunedCount,
      retentionDays,
      message: `Cleaned ${prunedCount} stale signals (retained starred, promoted, and recent articles).`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to prune old radar items";
    return apiError("INTERNAL_ERROR", message, undefined, 500);
  }
}
