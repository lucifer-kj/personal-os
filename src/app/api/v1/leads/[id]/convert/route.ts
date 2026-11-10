import { NextRequest } from 'next/server';
import { getRequestContext } from '@/lib/supabase/context';
import { createLeadService } from '@/modules/leads/lead.service';
import { ConvertLeadSchema } from '@/modules/leads/schemas';
import { apiSuccess, apiError } from '@/lib/api/response';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const ctx = await getRequestContext(request);
  if (!ctx) {
    return apiError('UNAUTHORIZED', 'Authentication required to access this resource', undefined, 401);
  }

  const { id } = await params;

  let body: unknown = {};
  try {
    const text = await request.text();
    if (text) {
      body = JSON.parse(text);
    }
  } catch {
    return apiError('MALFORMED_JSON', 'The request body must be valid JSON', undefined, 400);
  }

  const parsed = ConvertLeadSchema.safeParse(body);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => ({
      field: i.path.join('.'),
      message: i.message,
    }));
    return apiError('VALIDATION_ERROR', 'The request payload is invalid', details, 422);
  }

  const service = createLeadService(ctx.supabase);
  const result = await service.convertLead(ctx.user.id, id, parsed.data);

  return apiSuccess(result);
}
