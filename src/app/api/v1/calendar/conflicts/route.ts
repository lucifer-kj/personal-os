import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getCalendarRepository } from "@/modules/calendar/calendar.repository";
import { CalendarService } from "@/modules/calendar/calendar.service";
import { conflictQuerySchema } from "@/modules/calendar/schemas";
import {
  apiSuccess,
  apiUnauthorized,
  apiBadRequest,
} from "@/lib/api/response";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return apiUnauthorized();

    const { searchParams } = new URL(req.url);
    const query = {
      start_at: searchParams.get("start_at") || undefined,
      end_at: searchParams.get("end_at") || undefined,
      exclude_id: searchParams.get("exclude_id") || undefined,
    };

    const parseResult = conflictQuerySchema.safeParse(query);
    if (!parseResult.success) {
      return apiBadRequest(
        parseResult.error.issues[0]?.message || "Invalid conflict parameters"
      );
    }

    const supabase = await createClient();
    const calendarRepo = getCalendarRepository(supabase);
    const service = new CalendarService(calendarRepo);

    const advisory = await service.detectConflicts(
      user.id,
      parseResult.data.start_at,
      parseResult.data.end_at,
      parseResult.data.exclude_id
    );

    return apiSuccess(advisory);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to check conflicts";
    return apiBadRequest(message);
  }
}
