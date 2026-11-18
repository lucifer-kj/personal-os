import { NextRequest } from 'next/server';
import { getAuthOrTokenContext } from '@/lib/supabase/context';
import { createLeadService } from '@/modules/leads/lead.service';
import { BatchIngestLeadsSchema } from '@/modules/leads/schemas';
import { apiSuccess, apiError } from '@/lib/api/response';

/**
 * High-speed autonomous ingestion route for n8n scrapers, external workers, and batch imports.
 * Accepts both Cookie session authentication and Authorization: Bearer <pos_live_token>.
 */
export async function POST(request: NextRequest) {
  const ctx = await getAuthOrTokenContext(request);
  if (!ctx) {
    return apiError('UNAUTHORIZED', 'Authentication token or session required', undefined, 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError('MALFORMED_JSON', 'Request payload must be valid JSON', undefined, 400);
  }

  // Handle both { leads: [...] } batch payload and single lead object payload
  let batchPayload = body;
  if (body && typeof body === 'object' && !('leads' in body)) {
    batchPayload = {
      leads: [body],
      component: 'single_ingest',
    };
  }

  const parsed = BatchIngestLeadsSchema.safeParse(batchPayload);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => ({
      field: i.path.join('.'),
      message: i.message,
    }));
    return apiError('VALIDATION_ERROR', 'Invalid lead ingestion payload', details, 422);
  }

  const service = createLeadService(ctx.supabase);
  const result = await service.batchIngest(ctx.user.id, parsed.data);

  return apiSuccess(
    {
      ingested: result.count,
      leads: result.leads,
    },
    { batch_id: parsed.data.batch_id },
    201
  );
}
