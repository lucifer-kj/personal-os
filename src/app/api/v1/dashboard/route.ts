import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { createDashboardService } from "@/modules/dashboard/dashboard.service";
import { apiSuccess, apiUnauthorized, apiBadRequest } from "@/lib/api/response";
import { dateQuerySchema } from "@/modules/day/schemas";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return apiUnauthorized();
  }

  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date") || undefined;

  const parsed = dateQuerySchema.safeParse({ date: dateParam });
  if (!parsed.success) {
    return apiBadRequest(parsed.error.issues[0]?.message || "Invalid date query parameter");
  }

  const supabase = await createClient();
  const dashboardService = createDashboardService(supabase);
  const overview = await dashboardService.getDashboardOverview(user.id, parsed.data.date);

  return apiSuccess(overview);
}
