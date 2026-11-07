import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { apiSuccess, apiError } from "@/lib/api/response";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_MIME_PREFIXES = ["image/", "video/"];

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return apiError("UNAUTHORIZED", "Authentication required", undefined, 401);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return apiError("BAD_REQUEST", "Expected multipart/form-data payload", undefined, 400);
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return apiError("BAD_REQUEST", "No file uploaded or file field missing", undefined, 400);
  }

  if (file.size > MAX_FILE_SIZE) {
    return apiError("BAD_REQUEST", "File size exceeds the 50MB limit", undefined, 400);
  }

  const isValidMime = ALLOWED_MIME_PREFIXES.some((prefix) => file.type.startsWith(prefix));
  if (!isValidMime) {
    return apiError(
      "BAD_REQUEST",
      `Unsupported file type (${file.type}). Only image and video files are permitted.`,
      undefined,
      400
    );
  }

  const supabase = await createClient();
  if (!supabase) {
    return apiError("STORAGE_ERROR", "Supabase storage client not available", undefined, 500);
  }

  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filePath = `${user.id}/${Date.now()}-${sanitizedName}`;

  const { error: uploadError } = await supabase.storage
    .from("media-assets")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    return apiError("STORAGE_ERROR", uploadError.message, undefined, 500);
  }

  const { data: urlData } = supabase.storage
    .from("media-assets")
    .getPublicUrl(filePath);

  const media_type = file.type.startsWith("video/") ? "video" : "image";

  return apiSuccess(
    {
      url: urlData.publicUrl,
      media_type,
      filename: file.name,
      size: file.size,
    },
    undefined,
    201
  );
}
