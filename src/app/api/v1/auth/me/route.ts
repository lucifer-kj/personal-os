import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    return NextResponse.json({
      authenticated: !!user,
      user: user
        ? {
            id: user.id,
            email: user.email,
          }
        : null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to get user";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST() {
  // Sign out endpoint
  const response = NextResponse.json({ success: true });
  // Clear Supabase auth cookies
  response.cookies.delete("sb-yvdzdwzfgozeanwusysh-auth-token");
  return response;
}
