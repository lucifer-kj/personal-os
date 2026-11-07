import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { JournalService } from "@/modules/journal/journal.service";
import { getJournalRepository } from "@/modules/journal/journal.repository";
import { CreateJournalSchema, JournalFilterSchema } from "@/modules/journal/schemas";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const supabase = await createClient();
    const service = new JournalService(getJournalRepository(supabase));

    if (date) {
      const entry = await service.getEntryByDate(user.id, date);
      return NextResponse.json({ data: entry });
    }

    const filterParsed = JournalFilterSchema.safeParse({
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
      mood: searchParams.get("mood") ?? undefined,
      tag: searchParams.get("tag") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      offset: searchParams.get("offset") ?? undefined,
    });

    if (!filterParsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: filterParsed.error.issues },
        { status: 400 }
      );
    }

    const result = await service.listEntries(user.id, filterParsed.data);

    return NextResponse.json({
      data: result.entries,
      meta: {
        total: result.total,
        limit: filterParsed.data.limit,
        offset: filterParsed.data.offset,
      },
    });
  } catch (error) {
    console.error("GET /api/v1/journal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = CreateJournalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid journal payload", details: parsed.error.issues },
        { status: 422 }
      );
    }

    const supabase = await createClient();
    const service = new JournalService(getJournalRepository(supabase));
    const entry = await service.saveEntry(user.id, parsed.data);

    return NextResponse.json({ data: entry }, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/journal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
