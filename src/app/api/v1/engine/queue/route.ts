import { NextRequest } from 'next/server';
import { getAuthOrTokenContext } from '@/lib/supabase/context';
import { createLeadService } from '@/modules/leads/lead.service';
import { CreateLeadQueryQueueSchema } from '@/modules/leads/schemas';
import { apiSuccess, apiError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const ctx = await getAuthOrTokenContext(request);
  if (!ctx) {
    return apiError('UNAUTHORIZED', 'Authentication required', undefined, 401);
  }

  const { searchParams } = new URL(request.url);
  const service = createLeadService(ctx.supabase);

  // If claim=true, atomic worker dequeue operation
  if (searchParams.get('claim') === 'true') {
    const claimed = await service.claimNextQueueItem(ctx.user.id);
    return apiSuccess({ item: claimed });
  }

  const status = searchParams.get('status') || undefined;
  const queue = await service.listQueue(ctx.user.id, status);
  return apiSuccess(queue);
}

export async function POST(request: NextRequest) {
  const ctx = await getAuthOrTokenContext(request);
  if (!ctx) {
    return apiError('UNAUTHORIZED', 'Authentication required', undefined, 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError('MALFORMED_JSON', 'Invalid JSON body', undefined, 400);
  }

  const parsed = CreateLeadQueryQueueSchema.safeParse(body);
  if (!parsed.success) {
    return apiError('VALIDATION_ERROR', 'Invalid queue item', parsed.error.issues, 422);
  }

  const service = createLeadService(ctx.supabase);
  const item = await service.createQueueItem(ctx.user.id, parsed.data);
  return apiSuccess(item, undefined, 201);
}
