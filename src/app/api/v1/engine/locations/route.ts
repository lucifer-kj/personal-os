import { NextRequest } from 'next/server';
import { getAuthOrTokenContext } from '@/lib/supabase/context';
import { createLeadService } from '@/modules/leads/lead.service';
import { CreateLeadLocationSchema } from '@/modules/leads/schemas';
import { apiSuccess, apiError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const ctx = await getAuthOrTokenContext(request);
  if (!ctx) {
    return apiError('UNAUTHORIZED', 'Authentication required', undefined, 401);
  }

  const service = createLeadService(ctx.supabase);
  const locations = await service.listLocations(ctx.user.id);
  return apiSuccess(locations);
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

  const parsed = CreateLeadLocationSchema.safeParse(body);
  if (!parsed.success) {
    return apiError('VALIDATION_ERROR', 'Invalid location configuration', parsed.error.issues, 422);
  }

  const service = createLeadService(ctx.supabase);
  const location = await service.createLocation(ctx.user.id, parsed.data);
  return apiSuccess(location, undefined, 201);
}
