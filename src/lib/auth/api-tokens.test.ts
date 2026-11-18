import { describe, it, expect, vi } from 'vitest';
import {
  hashApiToken,
  generateApiTokenPair,
  extractBearerToken,
  validateApiToken,
  API_TOKEN_PREFIX,
} from './api-tokens';

describe('API Tokens Utility', () => {
  it('generates consistent SHA-256 hashes', () => {
    const token = 'pos_live_1234567890abcdef';
    const hash1 = hashApiToken(token);
    const hash2 = hashApiToken(token);
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  it('generates random token pairs with pos_live_ prefix', () => {
    const pair = generateApiTokenPair();
    expect(pair.token.startsWith(API_TOKEN_PREFIX)).toBe(true);
    expect(pair.tokenHash).toHaveLength(64);
    expect(pair.tokenHash).toBe(hashApiToken(pair.token));
  });

  it('extracts Bearer token correctly from HTTP requests', () => {
    const reqWithBearer = new Request('https://api.personal-os.local/test', {
      headers: { Authorization: 'Bearer pos_live_mysecrettoken' },
    });
    expect(extractBearerToken(reqWithBearer)).toBe('pos_live_mysecrettoken');

    const reqWithoutAuth = new Request('https://api.personal-os.local/test');
    expect(extractBearerToken(reqWithoutAuth)).toBeNull();

    const reqWithBasic = new Request('https://api.personal-os.local/test', {
      headers: { Authorization: 'Basic dXNlcjpwYXNz' },
    });
    expect(extractBearerToken(reqWithBasic)).toBeNull();
  });

  it('validates mock test tokens in test environment', async () => {
    const result = await validateApiToken('Bearer pos_test_sample', null);
    expect(result.valid).toBe(true);
    expect(result.userId).toBe('00000000-0000-0000-0000-000000000001');
    expect(result.scopes).toContain('leads:ingest');
  });

  it('rejects missing or empty tokens', async () => {
    const result = await validateApiToken('', null);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Missing or malformed/i);
  });

  it('validates against mock supabase client when provided', async () => {
    const token = 'pos_live_customtoken999';

    const mockClient = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: {
            id: 'tok-uuid-1',
            user_id: 'user-uuid-1',
            name: 'n8n Production Crawler',
            scopes: ['read', 'write', 'leads:ingest'],
            expires_at: null,
            revoked_at: null,
          },
          error: null,
        }),
        update: vi.fn().mockReturnThis(),
      }),
    };

    const result = await validateApiToken(`Bearer ${token}`, mockClient as unknown as Parameters<typeof validateApiToken>[1]);
    expect(result.valid).toBe(true);
    expect(result.userId).toBe('user-uuid-1');
    expect(result.name).toBe('n8n Production Crawler');
    expect(mockClient.from).toHaveBeenCalledWith('api_tokens');
  });
});
