import { NextRequest } from "next/server";
import { getRequestContext } from "@/lib/supabase/context";
import { getInboxRepository } from "@/modules/inbox/inbox.repository";
import { getTaskRepository } from "@/modules/tasks/task.repository";
import { InboxService } from "@/modules/inbox/inbox.service";
import { processInboxItemSchema } from "@/modules/inbox/schemas";
import {
  apiSuccess,
  apiUnauthorized,
  apiBadRequest,
  apiNotFound,
} from "@/lib/api/response";
import { NotFoundError, ValidationError } from "@/lib/errors";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getRequestContext(req);
    if (!ctx) return apiUnauthorized();

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const parseResult = processInboxItemSchema.safeParse(body);
    if (!parseResult.success) {
      return apiBadRequest(
        parseResult.error.issues[0]?.message || "Validation error"
      );
    }

    const inboxRepo = getInboxRepository(ctx.supabase);
    const taskRepo = getTaskRepository(ctx.supabase);
    const service = new InboxService(inboxRepo, taskRepo);

    const idempotencyKey =
      req.headers.get("x-idempotency-key") || parseResult.data.idempotency_key;
    const dto = { ...parseResult.data, idempotency_key: idempotencyKey };

    const result = await service.processItem(ctx.user.id, id, dto);
    return apiSuccess(result);
  } catch (err: unknown) {
    if (
      err instanceof NotFoundError ||
      (err instanceof Error && err.message.toLowerCase().includes("not found"))
    ) {
      return apiNotFound(
        err instanceof Error ? err.message : "Inbox item not found"
      );
    }
    if (err instanceof ValidationError) {
      return apiBadRequest(err.message);
    }
    const message = err instanceof Error ? err.message : "Failed to process inbox item";
    return apiBadRequest(message);
  }
}
