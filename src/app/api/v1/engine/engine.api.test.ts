import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as ingestHandler } from '../leads/ingest/route';
import { GET as listNichesHandler, POST as createNicheHandler } from './niches/route';
import { POST as triggerHandler } from './trigger/route';
import { GET as statusHandler } from './status/route';
import { getInMemoryLeadRepository } from '@/modules/leads/lead.repository';

describe('Lead Engine Autonomous REST API Handlers (/api/v1/engine & /api/v1/leads/ingest)', () => {
  const repo = getInMemoryLeadRepository();

  beforeEach(() => {
    repo.clear();
  });

  it('POST /api/v1/leads/ingest ingests and updates batch leads with Bearer token', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/leads/ingest', {
      method: 'POST',
      headers: {
        authorization: 'Bearer pos_test_crawler',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        leads: [
          {
            full_name: 'Park Street Dental Hub',
            business_name: 'Park Street Dental Hub',
            dedupe_key: 'osm_101',
            score: 88,
            score_tier: 'hot',
            lighthouse_mobile: 29,
            tailored_pitch: 'Notice 8s load on mobile phones. Rebuild for instant WhatsApp booking.',
          },
        ],
        batch_id: 'batch_alpha_01',
      }),
    });

    const res = await ingestHandler(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.ingested).toBe(1);
    expect(body.data.leads[0].business_name).toBe('Park Street Dental Hub');
  });

  it('GET & POST /api/v1/engine/niches manages targeting verticals', async () => {
    const postReq = new NextRequest('http://localhost:3000/api/v1/engine/niches', {
      method: 'POST',
      headers: { authorization: 'Bearer pos_test_token' },
      body: JSON.stringify({
        name: 'Private Nursing Homes',
        vertical: 'Healthcare',
        osm_tags: ['amenity=hospital', 'healthcare=hospital'],
        avg_deal_value_cents: 8000000,
      }),
    });

    const postRes = await createNicheHandler(postReq);
    expect(postRes.status).toBe(201);

    const getReq = new NextRequest('http://localhost:3000/api/v1/engine/niches', {
      headers: { authorization: 'Bearer pos_test_token' },
    });
    const getRes = await listNichesHandler(getReq);
    expect(getRes.status).toBe(200);
    const body = await getRes.json();
    expect(body.data.some((n: { name: string }) => n.name === 'Private Nursing Homes')).toBe(true);
  });

  it('GET /api/v1/engine/status returns live engine telemetry', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/engine/status', {
      headers: { authorization: 'Bearer pos_test_token' },
    });
    const res = await statusHandler(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.stats).toBeDefined();
    expect(body.data.stats.total_leads).toBeGreaterThanOrEqual(1);
    expect(body.data.recent_logs).toBeDefined();
  });

  it('POST /api/v1/engine/trigger dispatches workflow push trigger', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/engine/trigger', {
      method: 'POST',
      headers: { authorization: 'Bearer pos_test_token' },
      body: JSON.stringify({
        workflow: 'discovery',
        parameters: { niche: 'Dental Clinics', city: 'Kolkata' },
      }),
    });

    const res = await triggerHandler(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.triggered).toBe(true);
    expect(body.data.executionId).toBeDefined();
  });
});
