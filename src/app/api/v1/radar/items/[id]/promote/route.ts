import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getRadarService } from "@/modules/radar/radar.service";
import { getNoteRepository } from "@/modules/notes/note.repository";
import { getProjectRepository } from "@/modules/projects/project.repository";
import { getTaskRepository } from "@/modules/tasks/task.repository";
import { NoteService } from "@/modules/notes/note.service";
import { getSocialStudioService } from "@/modules/studio/studio.service";
import { PromoteRadarItemSchema } from "@/modules/radar/schemas";
import { apiSuccess, apiError } from "@/lib/api/response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteParams) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return apiError("UNAUTHORIZED", "Authentication required", undefined, 401);
  }

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("MALFORMED_JSON", "Invalid JSON payload", undefined, 400);
  }

  const parsed = PromoteRadarItemSchema.safeParse(body);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    return apiError("VALIDATION_ERROR", "Validation failed", details, 422);
  }

  const supabase = await createClient();
  const radarService = getRadarService(supabase);

  try {
    if (parsed.data.target === "note") {
      const noteRepo = getNoteRepository(supabase);
      const projectRepo = getProjectRepository(supabase);
      const taskRepo = getTaskRepository(supabase);
      const noteService = new NoteService(noteRepo, projectRepo, taskRepo);

      const note = await radarService.promoteToNote(
        user.id,
        id,
        noteService,
        parsed.data.notes
      );
      return apiSuccess({ promoted_type: "note", data: note }, undefined, 201);
    } else {
      const studioService = getSocialStudioService(supabase);
      const post = await radarService.promoteToSocialPost(
        user.id,
        id,
        studioService,
        "x"
      );
      return apiSuccess({ promoted_type: "post", data: post }, undefined, 201);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Promotion failed";
    return apiError("BAD_REQUEST", message, undefined, 400);
  }
}
