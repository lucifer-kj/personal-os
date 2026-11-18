import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return apiError("UNAUTHORIZED", "Authentication required for voice transcription", undefined, 401);
  }

  const contentType = request.headers.get("content-type") || "audio/webm";
  const audioBuffer = await request.arrayBuffer();

  if (!audioBuffer || audioBuffer.byteLength === 0) {
    return apiError("VALIDATION_ERROR", "Audio binary payload is required", undefined, 400);
  }

  const edgeUrl = process.env.EDGE_API_URL;
  const edgeToken = process.env.EDGE_API_TOKEN || process.env.ENCLAVE_SECRET_KEY;

  if (!edgeUrl) {
    return apiError("CONFIGURATION_ERROR", "Edge voice service URL is not configured", undefined, 503);
  }

  try {
    const targetUrl = `${edgeUrl.replace(/\/$/, "")}/api/v1/voice/transcribe`;
    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "X-Personal-OS-User": user.id,
    };

    if (edgeToken) {
      headers["Authorization"] = `Bearer ${edgeToken}`;
    }

    const edgeRes = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: audioBuffer,
    });

    if (!edgeRes.ok) {
      const errText = await edgeRes.text();
      return apiError("EXTERNAL_SERVICE_ERROR", `Edge voice error (${edgeRes.status}): ${errText}`, undefined, 502);
    }

    const data = await edgeRes.json();
    return apiSuccess(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return apiError("INTERNAL_ERROR", `Failed to proxy voice transcription: ${msg}`, undefined, 500);
  }
}
