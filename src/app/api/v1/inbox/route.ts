import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getInboxRepository } from "@/modules/inbox/inbox.repository";
import { getTaskRepository } from "@/modules/tasks/task.repository";
import { InboxService } from "@/modules/inbox/inbox.service";
import { createInboxItemSchema } from "@/modules/inbox/schemas";
import {
  apiSuccess,
  apiUnauthorized,
  apiBadRequest,
} from "@/lib/api/response";
import { CaptureType, InboxStatus } from "@/modules/inbox/types";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return apiUnauthorized();

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status") as InboxStatus | "all" | null;
    const typeParam = searchParams.get("type") as CaptureType | null;
    const searchParam = searchParams.get("search") || undefined;

    const supabase = await createClient();
    const inboxRepo = getInboxRepository(supabase);
    const taskRepo = getTaskRepository(supabase);
    const service = new InboxService(inboxRepo, taskRepo);

    const result = await service.listItems(user.id, {
      status: statusParam || undefined,
      capture_type: typeParam || undefined,
      search: searchParam,
    });

    return apiSuccess(result.items, { total_count: result.total });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch inbox items";
    return apiBadRequest(message);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return apiUnauthorized();

    const body = await req.json().catch(() => ({}));
    const parseResult = createInboxItemSchema.safeParse(body);
    if (!parseResult.success) {
      return apiBadRequest(
        parseResult.error.issues[0]?.message || "Validation error"
      );
    }

    const supabase = await createClient();
    const inboxRepo = getInboxRepository(supabase);
    const taskRepo = getTaskRepository(supabase);
    const service = new InboxService(inboxRepo, taskRepo);

    const item = await service.captureItem({
      user_id: user.id,
      ...parseResult.data,
    });

    return apiSuccess(item, undefined, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to capture item";
    return apiBadRequest(message);
  }
}
