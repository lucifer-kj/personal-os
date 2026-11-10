import { NextRequest } from 'next/server';
import { getRequestContext } from '@/lib/supabase/context';
import { createLeadService } from '@/modules/leads/lead.service';
import { UpdateLeadSchema } from '@/modules/leads/schemas';
import { apiSuccess, apiError } from '@/lib/api/response';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const ctx = await getRequestContext(request);
  if (!ctx) {
    return apiError('UNAUTHORIZED', 'Authentication required to access this resource', undefined, 401);
  }

  const { id } = await params;
  const service = createLeadService(ctx.supabase);
  const lead = await service.getLead(ctx.user.id, id);

  if (!lead) {
    return apiError('NOT_FOUND', 'Lead not found', undefined, 404);
  }

  return apiSuccess(lead);
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const ctx = await getRequestContext(request);
  if (!ctx) {
    return apiError('UNAUTHORIZED', 'Authentication required to access this resource', undefined, 401);
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError('MALFORMED_JSON', 'The request body must be valid JSON', undefined, 400);
  }

  const parsed = UpdateLeadSchema.safeParse(body);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => ({
      field: i.path.join('.'),
      message: i.message,
    }));
    return apiError('VALIDATION_ERROR', 'The request payload is invalid', details, 422);
  }

  const service = createLeadService(ctx.supabase);
  const updated = await service.updateLead(ctx.user.id, id, parsed.data);

  if (!updated) {
    return apiError('NOT_FOUND', 'Lead not found', undefined, 404);
  }

  return apiSuccess(updated);
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const ctx = await getRequestContext(request);
  if (!ctx) {
    return apiError('UNAUTHORIZED', 'Authentication required to access this resource', undefined, 401);
  }

  const { id } = await params;
  const service = createLeadService(ctx.supabase);
  await service.archiveLead(ctx.user.id, id);

  return apiSuccess({ success: true, archived_id: id });
}
