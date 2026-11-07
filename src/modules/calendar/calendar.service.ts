import {
  ICalendarRepository,
  CalendarEvent,
  CreateCalendarEventDTO,
  UpdateCalendarEventDTO,
  MoveCalendarEventDTO,
  CalendarEventFilters,
  ConflictAdvisory,
  EventType,
} from "./types";
import { ITaskRepository } from "../tasks/task.repository";

export class CalendarService {
  constructor(
    private calendarRepo: ICalendarRepository,
    private taskRepo?: ITaskRepository
  ) {}

  async listEvents(
    userId: string,
    filters: CalendarEventFilters = {}
  ): Promise<CalendarEvent[]> {
    return this.calendarRepo.findMany(userId, filters);
  }

  async getEvent(userId: string, id: string): Promise<CalendarEvent | null> {
    return this.calendarRepo.findById(userId, id);
  }

  async detectConflicts(
    userId: string,
    startAt: string,
    endAt: string,
    excludeEventId?: string
  ): Promise<ConflictAdvisory> {
    const conflicting = await this.calendarRepo.detectConflicts(
      userId,
      startAt,
      endAt,
      excludeEventId
    );

    return {
      has_conflict: conflicting.length > 0,
      conflicting_events: conflicting,
    };
  }

  async createEvent(
    userId: string,
    data: Omit<CreateCalendarEventDTO, "user_id">
  ): Promise<{ event: CalendarEvent; conflict_advisory: ConflictAdvisory }> {
    // 1. Detect conflicts for advisory notification (never hard-blocks)
    const advisory = await this.detectConflicts(
      userId,
      data.start_at,
      data.end_at
    );

    // 2. Persist the event
    const event = await this.calendarRepo.create({
      ...data,
      user_id: userId,
    });

    // 3. If tied to a task, synchronize scheduled times onto task
    if (data.task_id && this.taskRepo) {
      try {
        await this.taskRepo.update(userId, data.task_id, {
          scheduled_start_at: data.start_at,
          scheduled_end_at: data.end_at,
        });
      } catch {
        // Log or ignore non-critical task synchronization failure
      }
    }

    return { event, conflict_advisory: advisory };
  }

  async updateEvent(
    userId: string,
    id: string,
    data: UpdateCalendarEventDTO
  ): Promise<{ event: CalendarEvent; conflict_advisory: ConflictAdvisory }> {
    const existing = await this.calendarRepo.findById(userId, id);
    if (!existing) {
      throw new Error(`Calendar event not found`);
    }

    const startAt = data.start_at || existing.start_at;
    const endAt = data.end_at || existing.end_at;

    const advisory = await this.detectConflicts(userId, startAt, endAt, id);

    const event = await this.calendarRepo.update(userId, id, data);

    if (event.task_id && this.taskRepo && (data.start_at || data.end_at)) {
      try {
        await this.taskRepo.update(userId, event.task_id, {
          scheduled_start_at: event.start_at,
          scheduled_end_at: event.end_at,
        });
      } catch {
        // Non-critical
      }
    }

    return { event, conflict_advisory: advisory };
  }

  async moveEvent(
    userId: string,
    id: string,
    data: MoveCalendarEventDTO
  ): Promise<{ event: CalendarEvent; conflict_advisory: ConflictAdvisory }> {
    const existing = await this.calendarRepo.findById(userId, id);
    if (!existing) {
      throw new Error(`Calendar event not found`);
    }

    const advisory = await this.detectConflicts(
      userId,
      data.start_at,
      data.end_at,
      id
    );

    const event = await this.calendarRepo.move(userId, id, data);

    if (event.task_id && this.taskRepo) {
      try {
        await this.taskRepo.update(userId, event.task_id, {
          scheduled_start_at: event.start_at,
          scheduled_end_at: event.end_at,
        });
      } catch {
        // Non-critical
      }
    }

    return { event, conflict_advisory: advisory };
  }

  async deleteEvent(userId: string, id: string): Promise<boolean> {
    const existing = await this.calendarRepo.findById(userId, id);
    if (!existing) return false;

    // If event was linked to a task, clear scheduled times from task
    if (existing.task_id && this.taskRepo) {
      try {
        await this.taskRepo.update(userId, existing.task_id, {
          scheduled_start_at: null,
          scheduled_end_at: null,
        });
      } catch {
        // Non-critical
      }
    }

    return this.calendarRepo.delete(userId, id);
  }

  async scheduleTaskBlock(
    userId: string,
    taskId: string,
    startAt: string,
    durationMinutes: number,
    customTitle?: string,
    eventType: EventType = "focus"
  ): Promise<{ event: CalendarEvent; conflict_advisory: ConflictAdvisory }> {
    let title = customTitle || "Scheduled Task Block";
    let projectId: string | null = null;

    if (this.taskRepo) {
      const task = await this.taskRepo.findById(userId, taskId);
      if (task) {
        title = customTitle || task.title;
        projectId = task.project_id || null;
      }
    }

    const startDate = new Date(startAt);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
    const endAt = endDate.toISOString();

    return this.createEvent(userId, {
      title,
      event_type: eventType,
      start_at: startDate.toISOString(),
      end_at: endAt,
      all_day: false,
      timezone: "UTC",
      task_id: taskId,
      project_id: projectId,
    });
  }
}
