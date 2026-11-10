import { NextRequest } from 'next/server';
import { getRequestContext } from '@/lib/supabase/context';
import { createLeadService } from '@/modules/leads/lead.service';
import { CreateLeadActivitySchema } from '@/modules/leads/schemas';
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
  const activities = await service.listActivities(ctx.user.id, id);

  return apiSuccess(activities);
}

export async function POST(request: NextRequest, { params }: RouteContext) {
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

  const parsed = CreateLeadActivitySchema.safeParse(body);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => ({
      field: i.path.join('.'),
      message: i.message,
    }));
    return apiError('VALIDATION_ERROR', 'The request payload is invalid', details, 422);
  }

  const service = createLeadService(ctx.supabase);
  const activity = await service.addActivity(
    ctx.user.id,
    id,
    parsed.data.activity_type,
    parsed.data.summary,
    parsed.data.details
  );

  return apiSuccess(activity, undefined, 201);
}
