import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getInboxRepository } from "@/modules/inbox/inbox.repository";
import { getTaskRepository } from "@/modules/tasks/task.repository";
import { InboxService } from "@/modules/inbox/inbox.service";
import { processInboxItemSchema } from "@/modules/inbox/schemas";
import {
  apiSuccess,
  apiUnauthorized,
  apiBadRequest,
} from "@/lib/api/response";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return apiUnauthorized();

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const parseResult = processInboxItemSchema.safeParse(body);
    if (!parseResult.success) {
      return apiBadRequest(
        parseResult.error.issues[0]?.message || "Validation error"
      );
    }

    const supabase = await createClient();
    const inboxRepo = getInboxRepository(supabase);
    const taskRepo = getTaskRepository(supabase);
    const service = new InboxService(inboxRepo, taskRepo);

    const result = await service.processItem(user.id, id, parseResult.data);
    return apiSuccess(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to process inbox item";
    return apiBadRequest(message);
  }
}
