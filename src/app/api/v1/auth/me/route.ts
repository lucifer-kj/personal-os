import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@/lib/supabase/context";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const ctx = await getRequestContext(req);
    const user = ctx?.user ?? null;
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
  try {
    const supabase = await createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
  } catch {
    // Non-blocking sign out
  }

  const response = NextResponse.json({ success: true });
  return response;
}
