import { NextRequest } from 'next/server';
import { getAuthOrTokenContext } from '@/lib/supabase/context';
import { createLeadService } from '@/modules/leads/lead.service';
import { TriggerWorkflowSchema } from '@/modules/leads/schemas';
import { apiSuccess, apiError } from '@/lib/api/response';

/**
 * Push trigger endpoint to initiate autonomous n8n workflows directly from Personal OS.
 */
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

  const parsed = TriggerWorkflowSchema.safeParse(body);
  if (!parsed.success) {
    return apiError('VALIDATION_ERROR', 'Invalid trigger parameters', parsed.error.issues, 422);
  }

  const service = createLeadService(ctx.supabase);
  const result = await service.triggerWorkflow(
    ctx.user.id,
    parsed.data.workflow,
    parsed.data.parameters
  );

  return apiSuccess(result, undefined, 200);
}
