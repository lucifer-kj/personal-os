import { NextRequest } from 'next/server';
import { getAuthOrTokenContext } from '@/lib/supabase/context';
import { createLeadService } from '@/modules/leads/lead.service';
import { apiSuccess, apiError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const ctx = await getAuthOrTokenContext(request);
  if (!ctx) {
    return apiError('UNAUTHORIZED', 'Authentication required', undefined, 401);
  }

  const service = createLeadService(ctx.supabase);
  const stats = await service.getStats(ctx.user.id);
  const logs = await service.listLogs(ctx.user.id, 25);

  return apiSuccess({
    stats,
    recent_logs: logs,
  });
}
