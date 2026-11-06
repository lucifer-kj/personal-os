import {
  FocusSession,
  TimeEntry,
  ActiveFocusSession,
  StartFocusSessionDTO,
  CompleteFocusSessionDTO,
  IFocusRepository,
} from "./types";
import { ITaskRepository } from "../tasks/task.repository";

export class FocusService {
  constructor(
    private focusRepo: IFocusRepository,
    private taskRepo?: ITaskRepository
  ) {}

  /**
   * Helper to calculate elapsed active seconds accounting for paused time.
   */
  private calculateElapsedSeconds(
    startedAt: string,
    pausedDurationSeconds: number,
    pausedAt: string | null,
    now: Date = new Date()
  ): number {
    const startTime = new Date(startedAt).getTime();
    let currentOrPausedTime = now.getTime();

    if (pausedAt) {
      currentOrPausedTime = new Date(pausedAt).getTime();
    }

    const rawTotalSeconds = Math.max(
      0,
      Math.floor((currentOrPausedTime - startTime) / 1000)
    );

    return Math.max(0, rawTotalSeconds - pausedDurationSeconds);
  }

  /**
   * Starts a new focus session. Fails if user already has an active session.
   */
  async startSession(dto: StartFocusSessionDTO): Promise<ActiveFocusSession> {
    const active = await this.focusRepo.getActiveSession(dto.user_id);
    if (active) {
      throw new Error("An active focus session is already in progress");
    }

    const now = new Date().toISOString();
    const plannedDuration = dto.planned_duration_seconds ?? 25 * 60; // 25 min default

    const { timeEntry, session } = await this.focusRepo.createSession(
      {
        user_id: dto.user_id,
        task_id: dto.task_id ?? null,
        project_id: dto.project_id ?? null,
        description: dto.description ?? null,
        started_at: now,
        ended_at: null,
        duration_seconds: null,
        entry_type: "focus",
        is_billable: false,
      },
      {
        user_id: dto.user_id,
        session_mode: dto.session_mode ?? "deep_work",
        status: "running",
        planned_duration_seconds: plannedDuration,
        paused_duration_seconds: 0,
        paused_at: null,
        interruption_count: 0,
        session_rating: null,
        notes: null,
      }
    );

    return {
      session,
      timeEntry,
      elapsed_seconds: 0,
      remaining_seconds: plannedDuration,
    };
  }

  /**
   * Retrieves active running or paused focus session with calculated elapsed & remaining time.
   */
  async getActiveSession(userId: string): Promise<ActiveFocusSession | null> {
    const active = await this.focusRepo.getActiveSession(userId);
    if (!active) return null;

    const { session, timeEntry } = active;
    const elapsed = this.calculateElapsedSeconds(
      timeEntry.started_at,
      session.paused_duration_seconds,
      session.paused_at
    );

    const remaining = session.planned_duration_seconds
      ? Math.max(0, session.planned_duration_seconds - elapsed)
      : null;

    return {
      session,
      timeEntry,
      elapsed_seconds: elapsed,
      remaining_seconds: remaining,
    };
  }

  /**
   * Pauses an active running focus session.
   */
  async pauseSession(
    sessionId: string,
    userId: string
  ): Promise<ActiveFocusSession> {
    const record = await this.focusRepo.getSessionById(sessionId, userId);
    if (!record) {
      throw new Error("Focus session not found");
    }

    const { session, timeEntry } = record;
    if (session.status !== "running") {
      throw new Error(`Cannot pause a session that is ${session.status}`);
    }

    const now = new Date().toISOString();
    const updatedSession = await this.focusRepo.updateSession(
      sessionId,
      userId,
      {
        status: "paused",
        paused_at: now,
      }
    );

    const elapsed = this.calculateElapsedSeconds(
      timeEntry.started_at,
      session.paused_duration_seconds,
      now
    );

    const remaining = updatedSession.planned_duration_seconds
      ? Math.max(0, updatedSession.planned_duration_seconds - elapsed)
      : null;

    return {
      session: updatedSession,
      timeEntry,
      elapsed_seconds: elapsed,
      remaining_seconds: remaining,
    };
  }

  /**
   * Resumes a paused focus session.
   */
  async resumeSession(
    sessionId: string,
    userId: string
  ): Promise<ActiveFocusSession> {
    const record = await this.focusRepo.getSessionById(sessionId, userId);
    if (!record) {
      throw new Error("Focus session not found");
    }

    const { session, timeEntry } = record;
    if (session.status !== "paused") {
      throw new Error(`Cannot resume a session that is ${session.status}`);
    }

    const now = new Date().getTime();
    const pausedTime = session.paused_at ? new Date(session.paused_at).getTime() : now;
    const additionalPauseSeconds = Math.max(0, Math.floor((now - pausedTime) / 1000));
    const newPausedDuration = session.paused_duration_seconds + additionalPauseSeconds;

    const updatedSession = await this.focusRepo.updateSession(
      sessionId,
      userId,
      {
        status: "running",
        paused_at: null,
        paused_duration_seconds: newPausedDuration,
      }
    );

    const elapsed = this.calculateElapsedSeconds(
      timeEntry.started_at,
      newPausedDuration,
      null
    );

    const remaining = updatedSession.planned_duration_seconds
      ? Math.max(0, updatedSession.planned_duration_seconds - elapsed)
      : null;

    return {
      session: updatedSession,
      timeEntry,
      elapsed_seconds: elapsed,
      remaining_seconds: remaining,
    };
  }

  /**
   * Completes a focus session, commits elapsed duration to timeEntry, and rolls up minutes into Task if linked.
   */
  async completeSession(
    sessionId: string,
    userId: string,
    dto: CompleteFocusSessionDTO = {}
  ): Promise<{ session: FocusSession; timeEntry: TimeEntry; duration_seconds: number }> {
    const record = await this.focusRepo.getSessionById(sessionId, userId);
    if (!record) {
      throw new Error("Focus session not found");
    }

    const { session, timeEntry } = record;
    if (session.status === "completed" || session.status === "abandoned") {
      throw new Error(`Session already finalized (${session.status})`);
    }

    const now = new Date();
    const nowIso = now.toISOString();

    let pausedDuration = session.paused_duration_seconds;
    if (session.status === "paused" && session.paused_at) {
      const additionalPause = Math.max(
        0,
        Math.floor((now.getTime() - new Date(session.paused_at).getTime()) / 1000)
      );
      pausedDuration += additionalPause;
    }

    const durationSeconds = this.calculateElapsedSeconds(
      timeEntry.started_at,
      pausedDuration,
      null,
      now
    );

    const updatedSession = await this.focusRepo.updateSession(
      sessionId,
      userId,
      {
        status: "completed",
        paused_at: null,
        paused_duration_seconds: pausedDuration,
        session_rating: dto.session_rating ?? null,
        notes: dto.notes ?? null,
      }
    );

    const updatedTimeEntry = await this.focusRepo.updateTimeEntry(
      timeEntry.id,
      userId,
      {
        ended_at: nowIso,
        duration_seconds: durationSeconds,
      }
    );

    // Roll up duration to linked task
    if (timeEntry.task_id && this.taskRepo) {
      try {
        const task = await this.taskRepo.findById(userId, timeEntry.task_id);
        if (task) {
          const minutesToAdd = Math.round(durationSeconds / 60);
          const currentActual = task.actual_minutes || 0;
          await this.taskRepo.update(userId, task.id, {
            actual_minutes: currentActual + minutesToAdd,
            ...(dto.mark_task_completed ? { status: "completed" } : {}),
          });
        }
      } catch (err) {
        console.error("Failed to rollup task minutes:", err);
      }
    }

    return {
      session: updatedSession,
      timeEntry: updatedTimeEntry,
      duration_seconds: durationSeconds,
    };
  }

  /**
   * Abandons a focus session (discarding or marking incomplete without contributing to task actuals).
   */
  async abandonSession(
    sessionId: string,
    userId: string,
    reason?: string | null
  ): Promise<{ session: FocusSession; timeEntry: TimeEntry }> {
    const record = await this.focusRepo.getSessionById(sessionId, userId);
    if (!record) {
      throw new Error("Focus session not found");
    }

    const { session, timeEntry } = record;
    if (session.status === "completed" || session.status === "abandoned") {
      throw new Error(`Session already finalized (${session.status})`);
    }

    const nowIso = new Date().toISOString();

    const updatedSession = await this.focusRepo.updateSession(
      sessionId,
      userId,
      {
        status: "abandoned",
        notes: reason ? `Abandoned: ${reason}` : session.notes,
        paused_at: null,
      }
    );

    const updatedTimeEntry = await this.focusRepo.updateTimeEntry(
      timeEntry.id,
      userId,
      {
        ended_at: nowIso,
        duration_seconds: 0,
      }
    );

    return {
      session: updatedSession,
      timeEntry: updatedTimeEntry,
    };
  }

  /**
   * Log an external interruption during focus.
   */
  async recordInterruption(
    sessionId: string,
    userId: string
  ): Promise<FocusSession> {
    const record = await this.focusRepo.getSessionById(sessionId, userId);
    if (!record) {
      throw new Error("Focus session not found");
    }

    const currentCount = record.session.interruption_count;
    return this.focusRepo.updateSession(sessionId, userId, {
      interruption_count: currentCount + 1,
    });
  }

  async listRecentSessions(userId: string, limit = 10) {
    return this.focusRepo.listRecentSessions(userId, limit);
  }
}
