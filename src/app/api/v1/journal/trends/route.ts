import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { JournalService } from "@/modules/journal/journal.service";
import { getJournalRepository } from "@/modules/journal/journal.repository";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "14", 10);

    const supabase = await createClient();
    const service = new JournalService(getJournalRepository(supabase));
    const trends = await service.getMoodTrends(user.id, days);

    return NextResponse.json({ data: trends });
  } catch (error) {
    if ((error as { digest?: string })?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    console.error("GET /api/v1/journal/trends error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
