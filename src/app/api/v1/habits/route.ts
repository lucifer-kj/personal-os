import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@/lib/supabase/context";
import { HabitService } from "@/modules/habits/habit.service";
import { getHabitRepository } from "@/modules/habits/habit.repository";
import { CreateHabitSchema, HabitFilterSchema } from "@/modules/habits/schemas";

export async function GET(request: NextRequest) {
  try {
    const ctx = await getRequestContext(request);
    if (!ctx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filterParsed = HabitFilterSchema.safeParse({
      is_archived: searchParams.get("is_archived") ?? undefined,
      date: searchParams.get("date") ?? undefined,
    });

    if (!filterParsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: filterParsed.error.issues },
        { status: 400 }
      );
    }

    const service = new HabitService(getHabitRepository(ctx.supabase));
    const habits = await service.listHabits(ctx.user.id, filterParsed.data);
    const stats = await service.getSummaryStats(ctx.user.id, filterParsed.data.date);

    return NextResponse.json({
      data: habits,
      meta: { stats },
    });
  } catch (error) {
    console.error("GET /api/v1/habits error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await getRequestContext(request);
    if (!ctx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = CreateHabitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid habit payload", details: parsed.error.issues },
        { status: 422 }
      );
    }

    const service = new HabitService(getHabitRepository(ctx.supabase));
    const habit = await service.createHabit(ctx.user.id, parsed.data);

    return NextResponse.json({ data: habit }, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/habits error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
