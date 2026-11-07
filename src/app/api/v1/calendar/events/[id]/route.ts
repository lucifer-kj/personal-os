import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getCalendarRepository } from "@/modules/calendar/calendar.repository";
import { getTaskRepository } from "@/modules/tasks/task.repository";
import { CalendarService } from "@/modules/calendar/calendar.service";
import { updateCalendarEventSchema } from "@/modules/calendar/schemas";
import {
  apiSuccess,
  apiUnauthorized,
  apiNotFound,
  apiBadRequest,
} from "@/lib/api/response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return apiUnauthorized();

    const { id } = await params;
    const supabase = await createClient();
    const calendarRepo = getCalendarRepository(supabase);
    const service = new CalendarService(calendarRepo);

    const event = await service.getEvent(user.id, id);
    if (!event) {
      return apiNotFound(`Calendar event with id ${id} not found`);
    }

    return apiSuccess(event);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch event";
    return apiBadRequest(message);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return apiUnauthorized();

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const parseResult = updateCalendarEventSchema.safeParse(body);
    if (!parseResult.success) {
      return apiBadRequest(
        parseResult.error.issues[0]?.message || "Validation error"
      );
    }

    const supabase = await createClient();
    const calendarRepo = getCalendarRepository(supabase);
    const taskRepo = getTaskRepository(supabase);
    const service = new CalendarService(calendarRepo, taskRepo);

    const { event, conflict_advisory } = await service.updateEvent(
      user.id,
      id,
      parseResult.data
    );

    return apiSuccess({
      ...event,
      conflict_advisory,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update event";
    return apiBadRequest(message);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return apiUnauthorized();

    const { id } = await params;
    const supabase = await createClient();
    const calendarRepo = getCalendarRepository(supabase);
    const taskRepo = getTaskRepository(supabase);
    const service = new CalendarService(calendarRepo, taskRepo);

    const deleted = await service.deleteEvent(user.id, id);
    if (!deleted) {
      return apiNotFound(`Calendar event with id ${id} not found`);
    }

    return apiSuccess({ deleted: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete event";
    return apiBadRequest(message);
  }
}
