import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getNoteRepository } from "@/modules/notes/note.repository";
import { NoteService } from "@/modules/notes/note.service";
import { createNoteLinkSchema } from "@/modules/notes/schemas";
import {
  apiSuccess,
  apiUnauthorized,
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
      return apiBadRequest(`Note not found`);
    }

    return apiSuccess({
      outward_links: note.outward_links || [],
      inward_links: note.inward_links || [],
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch note links";
    return apiBadRequest(message);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return apiUnauthorized();

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const parseResult = createNoteLinkSchema.safeParse(body);
    if (!parseResult.success) {
      return apiBadRequest(
        parseResult.error.issues[0]?.message || "Validation error"
      );
    }

    const supabase = await createClient();
    const noteRepo = getNoteRepository(supabase);
    const service = new NoteService(noteRepo);

    const link = await service.linkNotes(
      user.id,
      id,
      parseResult.data.target_note_id,
      parseResult.data.link_type
    );

    return apiSuccess(link, undefined, 201);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to link notes";
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
    const targetNoteId = searchParams.get("target_note_id");
    if (!targetNoteId) {
      return apiBadRequest("target_note_id parameter is required");
    }

    const supabase = await createClient();
    const noteRepo = getNoteRepository(supabase);
    const service = new NoteService(noteRepo);

    const deleted = await service.unlinkNotes(user.id, id, targetNoteId);
    return apiSuccess({ deleted });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to delete link";
    return apiBadRequest(message);
  }
}
