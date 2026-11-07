import { NextRequest } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getCalendarRepository } from "@/modules/calendar/calendar.repository";
import { getTaskRepository } from "@/modules/tasks/task.repository";
import { CalendarService } from "@/modules/calendar/calendar.service";
import { eventTypeSchema } from "@/modules/calendar/schemas";
import {
  apiSuccess,
  apiUnauthorized,
  apiBadRequest,
} from "@/lib/api/response";

const scheduleTaskSchema = z.object({
  task_id: z.string().uuid("task_id must be a valid UUID"),
  start_at: z.string().datetime("start_at must be an ISO datetime string"),
  duration_minutes: z.number().int().min(5).max(1440).default(30),
  title: z.string().trim().optional(),
  event_type: eventTypeSchema.default("focus"),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return apiUnauthorized();

    const body = await req.json().catch(() => ({}));
    const parseResult = scheduleTaskSchema.safeParse(body);
    if (!parseResult.success) {
      return apiBadRequest(
        parseResult.error.issues[0]?.message || "Validation error"
      );
    }

    const supabase = await createClient();
    const calendarRepo = getCalendarRepository(supabase);
    const taskRepo = getTaskRepository(supabase);
    const service = new CalendarService(calendarRepo, taskRepo);

    const result = await service.scheduleTaskBlock(
      user.id,
      parseResult.data.task_id,
      parseResult.data.start_at,
      parseResult.data.duration_minutes,
      parseResult.data.title,
      parseResult.data.event_type
    );

    return apiSuccess(result, undefined, 201);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to schedule task block";
    return apiBadRequest(message);
  }
}
