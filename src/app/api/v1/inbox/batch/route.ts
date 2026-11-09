import { NextRequest } from "next/server";
import { getRequestContext } from "@/lib/supabase/context";
import { parseBatchIngest } from "@/lib/parser/batchIngest";
import { createTaskService } from "@/modules/tasks/task.service";
import { getInboxRepository } from "@/modules/inbox/inbox.repository";
import { apiSuccess, apiUnauthorized, apiBadRequest, handleApiError } from "@/lib/api/response";

export async function POST(req: NextRequest) {
  try {
    const ctx = await getRequestContext(req);
    if (!ctx) return apiUnauthorized();

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

    // If target is inbox, save as unorganized inbox items
    if (target === "inbox") {
      const inboxRepo = getInboxRepository(ctx.supabase);
      const createdInbox = [];
      for (const it of items) {
        const item = await inboxRepo.create({
          user_id: ctx.user.id,
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
      if (ctx.supabase) {
        const { data: userProjects } = await ctx.supabase
          .from("projects")
          .select("id, title")
          .eq("user_id", ctx.user.id);

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

    const taskService = createTaskService(ctx.supabase);
    const createdTasks = [];

    try {
      for (const it of items) {
        let matchedProjectId: string | null = null;
        if (it.projectName) {
          matchedProjectId =
            projectMap.get(it.projectName.toLowerCase()) ||
            projectMap.get(it.projectName.toLowerCase().replace(/-/g, " ")) ||
            null;
        }

        const task = await taskService.createTask(ctx.user.id, {
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
    } catch (batchErr) {
      // Compensate: cleanup any partially created tasks in this failed batch
      for (const t of createdTasks) {
        try {
          await taskService.deleteTask(ctx.user.id, t.id);
        } catch {
          // Best effort rollback
        }
      }
      throw batchErr;
    }
  } catch (err: unknown) {
    return handleApiError(err, "Failed to execute batch ingest");
  }
}
