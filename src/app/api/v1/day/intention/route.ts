import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { createDayService } from "@/modules/day/day.service";
import { apiSuccess, apiUnauthorized, apiBadRequest } from "@/lib/api/response";
import { updateIntentionSchema } from "@/modules/day/schemas";

export async function PATCH(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return apiUnauthorized();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }

  const parsed = updateIntentionSchema.safeParse(body);
  if (!parsed.success) {
    return apiBadRequest(parsed.error.issues[0]?.message || "Invalid intention payload");
  }

  const supabase = await createClient();
  const dayService = createDayService(supabase);
  const updatedPlan = await dayService.setIntention(user.id, parsed.data.date, parsed.data.intention);

  return apiSuccess(updatedPlan);
}
