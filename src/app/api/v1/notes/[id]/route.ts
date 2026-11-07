import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getNoteRepository } from "@/modules/notes/note.repository";
import { getProjectRepository } from "@/modules/projects/project.repository";
import { getTaskRepository } from "@/modules/tasks/task.repository";
import { NoteService } from "@/modules/notes/note.service";
import { updateNoteSchema } from "@/modules/notes/schemas";
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
    const noteRepo = getNoteRepository(supabase);
    const service = new NoteService(noteRepo);

    const note = await service.getNote(user.id, id);
    if (!note) {
      return apiNotFound(`Note with id ${id} not found`);
    }

    return apiSuccess(note);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch note";
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
    const parseResult = updateNoteSchema.safeParse(body);
    if (!parseResult.success) {
      return apiBadRequest(
        parseResult.error.issues[0]?.message || "Validation error"
      );
    }

    const supabase = await createClient();
    const noteRepo = getNoteRepository(supabase);
    const projectRepo = getProjectRepository(supabase);
    const taskRepo = getTaskRepository(supabase);
    const service = new NoteService(noteRepo, projectRepo, taskRepo);

    const note = await service.updateNote(user.id, id, parseResult.data);
    return apiSuccess(note);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update note";
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
    const { searchParams } = new URL(req.url);
    const hard = searchParams.get("hard") === "true";

    const supabase = await createClient();
    const noteRepo = getNoteRepository(supabase);
    const service = new NoteService(noteRepo);

    const deleted = await service.deleteNote(user.id, id, hard);
    if (!deleted) {
      return apiNotFound(`Note with id ${id} not found`);
    }

    return apiSuccess({ deleted: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete note";
    return apiBadRequest(message);
  }
}
