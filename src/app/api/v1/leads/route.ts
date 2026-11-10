import { NextRequest } from 'next/server';
import { getRequestContext } from '@/lib/supabase/context';
import { createLeadService } from '@/modules/leads/lead.service';
import { CreateLeadSchema, LeadFilterSchema } from '@/modules/leads/schemas';
import { apiSuccess, apiError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const ctx = await getRequestContext(request);
  if (!ctx) {
    return apiError('UNAUTHORIZED', 'Authentication required to access this resource', undefined, 401);
  }

  const { searchParams } = new URL(request.url);
  const queryObj: Record<string, unknown> = {};

  if (searchParams.has('status')) queryObj.status = searchParams.get('status');
  if (searchParams.has('source')) queryObj.source = searchParams.get('source');
  if (searchParams.has('search')) queryObj.search = searchParams.get('search');
  if (searchParams.has('min_score')) queryObj.min_score = searchParams.get('min_score');
  if (searchParams.has('limit')) queryObj.limit = searchParams.get('limit');
  if (searchParams.has('offset')) queryObj.offset = searchParams.get('offset');

  const parsed = LeadFilterSchema.safeParse(queryObj);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => ({
      field: i.path.join('.'),
      message: i.message,
    }));
    return apiError('VALIDATION_ERROR', 'Invalid query parameters', details, 400);
  }

  const service = createLeadService(ctx.supabase);
  const { leads, total } = await service.listLeads(ctx.user.id, parsed.data);

  return apiSuccess(leads, {
    total_count: total,
    limit: parsed.data.limit,
    offset: parsed.data.offset,
  });
}

export async function POST(request: NextRequest) {
  const ctx = await getRequestContext(request);
  if (!ctx) {
    return apiError('UNAUTHORIZED', 'Authentication required to access this resource', undefined, 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError('MALFORMED_JSON', 'The request body must be valid JSON', undefined, 400);
  }

  const parsed = CreateLeadSchema.safeParse(body);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => ({
      field: i.path.join('.'),
      message: i.message,
    }));
    return apiError('VALIDATION_ERROR', 'The request payload is invalid', details, 422);
  }

  const service = createLeadService(ctx.supabase);
  const lead = await service.createLead(ctx.user.id, parsed.data);

  return apiSuccess(lead, undefined, 201);
}
