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

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return apiUnauthorized();

    const supabase = await createClient();
    const noteRepo = getNoteRepository(supabase);
    const service = new NoteService(noteRepo);

    const tags = await service.getAllTags(user.id);
    return apiSuccess(tags);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch tags";
    return apiBadRequest(message);
  }
}
