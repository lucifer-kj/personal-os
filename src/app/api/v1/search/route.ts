import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { SearchService } from "@/modules/search/search.service";
import { getSearchRepository } from "@/modules/search/search.repository";
import { SearchQuerySchema } from "@/modules/search/schemas";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? "";

    // If query string is completely empty, return static navigation and actions
    if (!q.trim()) {
      const service = new SearchService(getSearchRepository(null));
      return NextResponse.json({
        data: [],
        navigation: service.getNavigationCommands(),
        actions: service.getQuickActions(),
        meta: { total: 0 },
      });
    }

    const parsed = SearchQuerySchema.safeParse({
      q,
      types: searchParams.get("types") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid search query", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const service = new SearchService(getSearchRepository(supabase));
    const response = await service.searchAll(user.id, parsed.data);

    return NextResponse.json({
      data: response.results,
      navigation: response.navigation,
      actions: response.actions,
      meta: {
        total: response.results.length,
        query: parsed.data.q,
      },
    });
  } catch (error) {
    if ((error as { digest?: string })?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    console.error("GET /api/v1/search error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
