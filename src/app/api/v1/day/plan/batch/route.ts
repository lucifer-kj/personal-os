import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { createTaskService } from "@/modules/tasks/task.service";
import { createProjectService } from "@/modules/projects/project.service";
import { createDayService } from "@/modules/day/day.service";
import { apiSuccess, apiError } from "@/lib/api/response";
import { getLocalDateIso } from "@/lib/utils";

interface BatchTaskInput {
  title: string;
  projectName?: string;
  priority?: "urgent" | "high" | "medium" | "low";
  estimatedMinutes?: number;
  scheduledTime?: string; // e.g. "10:00"
  tags?: string[];
  notes?: string;
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return apiError("UNAUTHORIZED", "Authentication required to plan day", undefined, 401);
  }

  let body: { tasks: BatchTaskInput[]; date?: string };
  try {
    body = await request.json();
  } catch {
    return apiError("MALFORMED_JSON", "The request body must be valid JSON", undefined, 400);
  }

  if (!body.tasks || !Array.isArray(body.tasks) || body.tasks.length === 0) {
    return apiError("VALIDATION_ERROR", "At least one task must be provided in tasks array", undefined, 400);
  }

  const supabase = await createClient();
  const taskService = createTaskService(supabase);
  const projectService = createProjectService(supabase);
  const dayService = createDayService(supabase);

  const targetDate = body.date || getLocalDateIso();

  try {
    // 1. Fetch user projects to resolve @project matches
    const projectRes = await projectService.listProjects(user.id);
    const projectMap = new Map<string, string>();
    for (const p of projectRes.projects) {
      projectMap.set(p.name.toLowerCase(), p.id);
    }

    const createdTasks = [];

    // 2. Insert each task
    for (const item of body.tasks) {
      const cleanTitle = item.title.trim();
      if (!cleanTitle) continue;

      let projectId: string | undefined = undefined;
      if (item.projectName) {
        projectId = projectMap.get(item.projectName.toLowerCase());
      }

      const created = await taskService.createTask(user.id, {
        title: cleanTitle,
        description: item.notes || null,
        status: "todo",
        priority: item.priority || "medium",
        due_date: targetDate,
        project_id: projectId || null,
        estimated_minutes: item.estimatedMinutes || null,
      });

      createdTasks.push(created);
    }

    // 3. Ensure day plan exists for targetDate
    await dayService.getDayOverview(user.id, targetDate);

    return apiSuccess({
      date: targetDate,
      createdCount: createdTasks.length,
      tasks: createdTasks,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to batch create daily plan tasks";
    return apiError("SERVER_ERROR", msg, undefined, 500);
  }
}
