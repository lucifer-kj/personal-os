import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { HabitService } from "@/modules/habits/habit.service";
import { getHabitRepository } from "@/modules/habits/habit.repository";

export async function POST(
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
    const existing = await service.getHabitById(user.id, id);

    if (!existing) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    const updated = await service.updateHabit(user.id, id, {
      is_archived: !existing.is_archived,
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("POST /api/v1/habits/[id]/archive error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
