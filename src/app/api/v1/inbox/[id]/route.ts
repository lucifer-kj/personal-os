import { NextRequest } from "next/server";
import { getRequestContext } from "@/lib/supabase/context";
import { getInboxRepository } from "@/modules/inbox/inbox.repository";
import { getTaskRepository } from "@/modules/tasks/task.repository";
import { InboxService } from "@/modules/inbox/inbox.service";
import { updateInboxItemSchema } from "@/modules/inbox/schemas";
import {
  apiSuccess,
  apiUnauthorized,
  apiBadRequest,
  apiNotFound,
} from "@/lib/api/response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getRequestContext(req);
    if (!ctx) return apiUnauthorized();

    const { id } = await params;
    const inboxRepo = getInboxRepository(ctx.supabase);
    const service = new InboxService(inboxRepo);

    const item = await service.getItemById(ctx.user.id, id);
    if (!item) return apiNotFound("Inbox item not found");

    return apiSuccess(item);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch inbox item";
    return apiBadRequest(message);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getRequestContext(req);
    if (!ctx) return apiUnauthorized();

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const parseResult = updateInboxItemSchema.safeParse(body);
    if (!parseResult.success) {
      return apiBadRequest(
        parseResult.error.issues[0]?.message || "Validation error"
      );
    }

    const inboxRepo = getInboxRepository(ctx.supabase);
    const taskRepo = getTaskRepository(ctx.supabase);
    const service = new InboxService(inboxRepo, taskRepo);

    const updated = await service.updateItem(ctx.user.id, id, parseResult.data);
    return apiSuccess(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update inbox item";
    return apiBadRequest(message);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getRequestContext(req);
    if (!ctx) return apiUnauthorized();

    const { id } = await params;
    const inboxRepo = getInboxRepository(ctx.supabase);
    const service = new InboxService(inboxRepo);

    const success = await service.deleteItem(ctx.user.id, id);
    return apiSuccess({ deleted: success });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete inbox item";
    return apiBadRequest(message);
  }
}
