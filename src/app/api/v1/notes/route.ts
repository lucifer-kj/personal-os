import { NextRequest } from "next/server";
import { getRequestContext } from "@/lib/supabase/context";
import { getNoteRepository } from "@/modules/notes/note.repository";
import { getProjectRepository } from "@/modules/projects/project.repository";
import { getTaskRepository } from "@/modules/tasks/task.repository";
import { NoteService } from "@/modules/notes/note.service";
import {
  createNoteSchema,
  noteQuerySchema,
} from "@/modules/notes/schemas";
import {
  apiSuccess,
  apiUnauthorized,
  apiBadRequest,
} from "@/lib/api/response";

export async function GET(req: NextRequest) {
  try {
    const ctx = await getRequestContext(req);
    if (!ctx) return apiUnauthorized();

    const { searchParams } = new URL(req.url);
    const queryParams = {
      search: searchParams.get("search") || undefined,
      tag: searchParams.get("tag") || undefined,
      project_id: searchParams.get("project_id") || undefined,
      task_id: searchParams.get("task_id") || undefined,
      note_type: searchParams.get("note_type") || undefined,
      is_pinned: searchParams.get("is_pinned") || undefined,
      is_archived: searchParams.get("is_archived") || undefined,
    };

    const parseResult = noteQuerySchema.safeParse(queryParams);
    if (!parseResult.success) {
      return apiBadRequest(
        parseResult.error.issues[0]?.message || "Invalid query parameters"
      );
    }

    const noteRepo = getNoteRepository(ctx.supabase);
    const projectRepo = getProjectRepository(ctx.supabase);
    const taskRepo = getTaskRepository(ctx.supabase);
    const service = new NoteService(noteRepo, projectRepo, taskRepo);

    const notes = await service.listNotes(ctx.user.id, parseResult.data);
    return apiSuccess(notes, { total_count: notes.length });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch notes";
    return apiBadRequest(message);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getRequestContext(req);
    if (!ctx) return apiUnauthorized();

    const body = await req.json().catch(() => ({}));
    const parseResult = createNoteSchema.safeParse(body);
    if (!parseResult.success) {
      return apiBadRequest(
        parseResult.error.issues[0]?.message || "Validation error"
      );
    }

    const noteRepo = getNoteRepository(ctx.supabase);
    const projectRepo = getProjectRepository(ctx.supabase);
    const taskRepo = getTaskRepository(ctx.supabase);
    const service = new NoteService(noteRepo, projectRepo, taskRepo);

    const note = await service.createNote(ctx.user.id, parseResult.data);
    return apiSuccess(note, undefined, 201);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to create note";
    return apiBadRequest(message);
  }
}
