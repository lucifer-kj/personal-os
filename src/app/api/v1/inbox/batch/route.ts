import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { parseBatchIngest } from "@/lib/parser/batchIngest";
import { getTaskRepository } from "@/modules/tasks/task.repository";
import { getInboxRepository } from "@/modules/inbox/inbox.repository";
import { apiSuccess, apiUnauthorized, apiBadRequest } from "@/lib/api/response";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return apiUnauthorized();

    const body = await req.json().catch(() => ({}));
    const rawText = typeof body.rawText === "string" ? body.rawText : "";
    const target = body.target === "inbox" ? "inbox" : "tasks";

    if (!rawText.trim()) {
      return apiBadRequest("rawText is required and cannot be empty");
    }

    const items = parseBatchIngest(rawText);
    if (items.length === 0) {
      return apiBadRequest("No valid items found in provided text");
    }

    const supabase = await createClient();

    // If target is inbox, save as unorganized inbox items
    if (target === "inbox") {
      const inboxRepo = getInboxRepository(supabase);
      const createdInbox = [];
      for (const it of items) {
        const item = await inboxRepo.create({
          user_id: user.id,
          title: it.title,
          content: it.raw,
          capture_type: "task",
          source: "manual",
        });
        createdInbox.push(item);
      }

      return apiSuccess({
        count: createdInbox.length,
        target: "inbox",
        items: createdInbox,
      });
    }

    // Default target: tasks
    const projectMap = new Map<string, string>();
    try {
      if (supabase) {
        const { data: userProjects } = await supabase
          .from("projects")
          .select("id, title")
          .eq("user_id", user.id);

        if (userProjects) {
          for (const p of userProjects) {
            projectMap.set(p.title.toLowerCase().replace(/\s+/g, "-"), p.id);
            projectMap.set(p.title.toLowerCase(), p.id);
          }
        }
      }
    } catch {
      // Ignore project lookup error in mock mode
    }

    const taskRepo = getTaskRepository(supabase);
    const createdTasks = [];

    for (const it of items) {
      let matchedProjectId: string | null = null;
      if (it.projectName) {
        matchedProjectId =
          projectMap.get(it.projectName.toLowerCase()) ||
          projectMap.get(it.projectName.toLowerCase().replace(/-/g, " ")) ||
          null;
      }

      const task = await taskRepo.create(user.id, {
        title: it.title,
        status: it.isCompleted ? "completed" : "todo",
        priority: it.priority || "medium",
        due_date: it.date || null,
        estimated_minutes: it.estimatedMinutes || null,
        project_id: matchedProjectId,
        source_type: "inbox",
      });
      createdTasks.push(task);
    }

    return apiSuccess({
      count: createdTasks.length,
      target: "tasks",
      items: createdTasks,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to execute batch ingest";
    return apiBadRequest(message);
  }
}
