import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getCalendarRepository } from "@/modules/calendar/calendar.repository";
import { getTaskRepository } from "@/modules/tasks/task.repository";
import { CalendarService } from "@/modules/calendar/calendar.service";
import { moveCalendarEventSchema } from "@/modules/calendar/schemas";
import {
  apiSuccess,
  apiUnauthorized,
  apiBadRequest,
} from "@/lib/api/response";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return apiUnauthorized();

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const parseResult = moveCalendarEventSchema.safeParse(body);
    if (!parseResult.success) {
      return apiBadRequest(
        parseResult.error.issues[0]?.message || "Validation error"
      );
    }

    const supabase = await createClient();
    const calendarRepo = getCalendarRepository(supabase);
    const taskRepo = getTaskRepository(supabase);
    const service = new CalendarService(calendarRepo, taskRepo);

    const { event, conflict_advisory } = await service.moveEvent(
      user.id,
      id,
      parseResult.data
    );

    return apiSuccess({
      ...event,
      conflict_advisory,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to move event";
    return apiBadRequest(message);
  }
}
