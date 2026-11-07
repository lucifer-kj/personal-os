import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getCalendarRepository } from "@/modules/calendar/calendar.repository";
import { getTaskRepository } from "@/modules/tasks/task.repository";
import { CalendarService } from "@/modules/calendar/calendar.service";
import {
  createCalendarEventSchema,
  calendarQuerySchema,
} from "@/modules/calendar/schemas";
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
    const queryParams = {
      from: searchParams.get("from") || undefined,
      to: searchParams.get("to") || undefined,
      type: searchParams.get("type") || undefined,
      project_id: searchParams.get("project_id") || undefined,
      task_id: searchParams.get("task_id") || undefined,
    };

    const parseResult = calendarQuerySchema.safeParse(queryParams);
    if (!parseResult.success) {
      return apiBadRequest(parseResult.error.issues[0]?.message || "Invalid query parameters");
    }

    const supabase = await createClient();
    const calendarRepo = getCalendarRepository(supabase);
    const taskRepo = getTaskRepository(supabase);
    const service = new CalendarService(calendarRepo, taskRepo);

    const events = await service.listEvents(user.id, {
      from: parseResult.data.from,
      to: parseResult.data.to,
      event_type: parseResult.data.type,
      project_id: parseResult.data.project_id,
      task_id: parseResult.data.task_id,
    });

    return apiSuccess(events, { total_count: events.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch calendar events";
    return apiBadRequest(message);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return apiUnauthorized();

    const body = await req.json().catch(() => ({}));
    const parseResult = createCalendarEventSchema.safeParse(body);
    if (!parseResult.success) {
      return apiBadRequest(
        parseResult.error.issues[0]?.message || "Validation error"
      );
    }

    const supabase = await createClient();
    const calendarRepo = getCalendarRepository(supabase);
    const taskRepo = getTaskRepository(supabase);
    const service = new CalendarService(calendarRepo, taskRepo);

    const { event, conflict_advisory } = await service.createEvent(
      user.id,
      parseResult.data
    );

    return apiSuccess(
      {
        ...event,
        conflict_advisory,
      },
      undefined,
      201
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create calendar event";
    return apiBadRequest(message);
  }
}
