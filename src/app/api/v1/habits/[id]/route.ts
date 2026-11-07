import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { HabitService } from "@/modules/habits/habit.service";
import { getHabitRepository } from "@/modules/habits/habit.repository";
import { UpdateHabitSchema } from "@/modules/habits/schemas";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") ?? undefined;

    const supabase = await createClient();
    const service = new HabitService(getHabitRepository(supabase));
    const habit = await service.getHabitById(user.id, id, date);

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    return NextResponse.json({ data: habit });
  } catch (error) {
    console.error("GET /api/v1/habits/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = UpdateHabitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid update payload", details: parsed.error.issues },
        { status: 422 }
      );
    }

    const supabase = await createClient();
    const service = new HabitService(getHabitRepository(supabase));
    const updated = await service.updateHabit(user.id, id, parsed.data);

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("PATCH /api/v1/habits/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = await createClient();
    const service = new HabitService(getHabitRepository(supabase));
    const deleted = await service.deleteHabit(user.id, id);

    if (!deleted) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("DELETE /api/v1/habits/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
