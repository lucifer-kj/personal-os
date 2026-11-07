import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getNoteRepository } from "@/modules/notes/note.repository";
import { NoteService } from "@/modules/notes/note.service";
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
    const supabase = await createClient();
    const noteRepo = getNoteRepository(supabase);
    const service = new NoteService(noteRepo);

    const note = await service.toggleArchive(user.id, id);
    return apiSuccess(note);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to toggle note archive";
    return apiBadRequest(message);
  }
}
