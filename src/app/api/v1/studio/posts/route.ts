import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getSocialStudioService } from "@/modules/studio/studio.service";
import {
  CreateSocialPostSchema,
  PostFilterSchema,
} from "@/modules/studio/schemas";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return apiError("UNAUTHORIZED", "Authentication required", undefined, 401);
  }

  const { searchParams } = new URL(request.url);
  const queryObj: Record<string, unknown> = {};

  if (searchParams.has("status")) queryObj.status = searchParams.get("status");
  if (searchParams.has("platform")) queryObj.platform = searchParams.get("platform");
  if (searchParams.has("search")) queryObj.search = searchParams.get("search");

  const parsed = PostFilterSchema.safeParse(queryObj);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    return apiError("VALIDATION_ERROR", "Invalid query parameters", details, 400);
  }

  const supabase = await createClient();
  const service = getSocialStudioService(supabase);
  const posts = await service.listPosts(user.id, parsed.data);

  return apiSuccess(posts);
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return apiError("UNAUTHORIZED", "Authentication required", undefined, 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("MALFORMED_JSON", "The request body must be valid JSON", undefined, 400);
  }

  const parsed = CreateSocialPostSchema.safeParse(body);
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
    const post = await service.createPost(user.id, parsed.data);
    return apiSuccess(post, undefined, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create social post";
    return apiError("BAD_REQUEST", message, undefined, 400);
  }
}
