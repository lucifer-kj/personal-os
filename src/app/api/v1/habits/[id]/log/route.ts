import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { HabitService } from "@/modules/habits/habit.service";
import { getHabitRepository } from "@/modules/habits/habit.repository";
import { LogHabitSchema } from "@/modules/habits/schemas";

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
    const body = await request.json();
    const parsed = LogHabitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid log payload", details: parsed.error.issues },
        { status: 422 }
      );
    }

    const supabase = await createClient();
    const service = new HabitService(getHabitRepository(supabase));
    const result = await service.toggleCheckin(user.id, id, parsed.data.date, parsed.data.note);

    return NextResponse.json({
      data: result.log,
      meta: { completed: result.completed },
    });
  } catch (error) {
    console.error("POST /api/v1/habits/[id]/log error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
