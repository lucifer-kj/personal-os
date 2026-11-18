import { NextRequest } from 'next/server';
import { getAuthOrTokenContext } from '@/lib/supabase/context';
import { createLeadService } from '@/modules/leads/lead.service';
import { CreateLeadNicheSchema } from '@/modules/leads/schemas';
import { apiSuccess, apiError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const ctx = await getAuthOrTokenContext(request);
  if (!ctx) {
    return apiError('UNAUTHORIZED', 'Authentication required', undefined, 401);
  }

  const service = createLeadService(ctx.supabase);
  const niches = await service.listNiches(ctx.user.id);
  return apiSuccess(niches);
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

  const parsed = CreateLeadNicheSchema.safeParse(body);
  if (!parsed.success) {
    return apiError('VALIDATION_ERROR', 'Invalid niche configuration', parsed.error.issues, 422);
  }

  const service = createLeadService(ctx.supabase);
  const niche = await service.createNiche(ctx.user.id, parsed.data);
  return apiSuccess(niche, undefined, 201);
}
