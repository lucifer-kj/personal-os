import { NextRequest } from "next/server";
import { getRequestContext } from "@/lib/supabase/context";
import { createDashboardService } from "@/modules/dashboard/dashboard.service";
import { apiSuccess, apiUnauthorized, apiBadRequest } from "@/lib/api/response";
import { dateQuerySchema } from "@/modules/day/schemas";

export async function GET(request: NextRequest) {
  const ctx = await getRequestContext(request);
  if (!ctx) {
    return apiUnauthorized();
  }

  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date") || undefined;

  const parsed = dateQuerySchema.safeParse({ date: dateParam });
  if (!parsed.success) {
    return apiBadRequest(parsed.error.issues[0]?.message || "Invalid date query parameter");
  }

  const dashboardService = createDashboardService(ctx.supabase);
  const overview = await dashboardService.getDashboardOverview(ctx.user.id, parsed.data.date);

  return apiSuccess(overview);
}
