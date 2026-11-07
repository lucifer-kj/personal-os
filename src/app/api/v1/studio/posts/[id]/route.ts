import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getSocialStudioService } from "@/modules/studio/studio.service";
import { UpdateSocialPostSchema } from "@/modules/studio/schemas";
import { apiSuccess, apiError } from "@/lib/api/response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteParams) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return apiError("UNAUTHORIZED", "Authentication required", undefined, 401);
  }

  const { id } = await context.params;
  const supabase = await createClient();
  const service = getSocialStudioService(supabase);
  const post = await service.getPost(user.id, id);

  if (!post) {
    return apiError("NOT_FOUND", `Social post with id '${id}' not found`, undefined, 404);
  }

  return apiSuccess(post);
}

export async function PATCH(request: NextRequest, context: RouteParams) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return apiError("UNAUTHORIZED", "Authentication required", undefined, 401);
  }

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("MALFORMED_JSON", "The request body must be valid JSON", undefined, 400);
  }

  const parsed = UpdateSocialPostSchema.safeParse(body);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    return apiError("VALIDATION_ERROR", "Validation failed", details, 422);
  }

  try {
    const supabase = await createClient();
    const service = getSocialStudioService(supabase);
    const updated = await service.updatePost(user.id, id, parsed.data);

    if (!updated) {
      return apiError("NOT_FOUND", `Social post with id '${id}' not found`, undefined, 404);
    }

    return apiSuccess(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update social post";
    return apiError("BAD_REQUEST", message, undefined, 400);
  }
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return apiError("UNAUTHORIZED", "Authentication required", undefined, 401);
  }

  const { id } = await context.params;
  const supabase = await createClient();
  const service = getSocialStudioService(supabase);
  const success = await service.deletePost(user.id, id);

  if (!success) {
    return apiError("NOT_FOUND", `Social post with id '${id}' not found`, undefined, 404);
  }

  return apiSuccess({ deleted: true });
}
