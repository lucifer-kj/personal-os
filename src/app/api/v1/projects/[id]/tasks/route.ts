import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { createTaskService } from "@/modules/tasks/task.service";
import { createProjectService } from "@/modules/projects/project.service";
import { apiSuccess, apiError } from "@/lib/api/response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteParams) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return apiError("UNAUTHORIZED", "Authentication required", undefined, 401);
  }

  const { id } = await context.params;
  const supabase = await createClient();
  const projectService = createProjectService(supabase);
  const project = await projectService.getProject(user.id, id);

  if (!project) {
    return apiError("NOT_FOUND", `Project with id '${id}' not found`, undefined, 404);
  }

  const taskService = createTaskService(supabase);
  const { tasks, total } = await taskService.listTasks(user.id, { project_id: id });

  return apiSuccess(tasks, { total_count: total });
}
