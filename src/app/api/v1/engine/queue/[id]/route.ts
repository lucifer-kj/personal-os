import { NextRequest } from 'next/server';
import { getAuthOrTokenContext } from '@/lib/supabase/context';
import { createLeadService } from '@/modules/leads/lead.service';
import { UpdateLeadQueryQueueSchema } from '@/modules/leads/schemas';
import { apiSuccess, apiError } from '@/lib/api/response';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getAuthOrTokenContext(request);
  if (!ctx) {
    return apiError('UNAUTHORIZED', 'Authentication required', undefined, 401);
  }

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError('MALFORMED_JSON', 'Invalid JSON body', undefined, 400);
  }

  const parsed = UpdateLeadQueryQueueSchema.safeParse(body);
  if (!parsed.success) {
    return apiError('VALIDATION_ERROR', 'Invalid queue update payload', parsed.error.issues, 422);
  }

  const service = createLeadService(ctx.supabase);
  const updated = await service.updateQueueItem(ctx.user.id, id, parsed.data);
  if (!updated) {
    return apiError('NOT_FOUND', `Queue item ${id} not found`, undefined, 404);
  }

  return apiSuccess(updated);
}
