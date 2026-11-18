import { createHash, randomBytes } from 'crypto';
import { SupabaseClient } from '@supabase/supabase-js';

export interface ValidatedToken {
  valid: boolean;
  userId?: string;
  tokenId?: string;
  name?: string;
  scopes?: string[];
  error?: string;
}

export const API_TOKEN_PREFIX = 'pos_live_';

/**
 * Computes deterministic SHA-256 hash of an API token.
 */
export function hashApiToken(token: string): string {
  return createHash('sha256').update(token.trim()).digest('hex');
}

/**
 * Generates a new cryptographically secure API token and its storage hash.
 */
export function generateApiTokenPair(prefix: string = API_TOKEN_PREFIX) {
  const randomPart = randomBytes(24).toString('base64url');
  const token = `${prefix}${randomPart}`;
  const tokenHash = hashApiToken(token);
  return {
    token,
    prefix,
    tokenHash,
  };
}

/**
 * Extracts Bearer token from HTTP Authorization header.
 */
export function extractBearerToken(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+([A-Za-z0-9_.-]+)$/i);
  return match ? match[1].trim() : null;
}

/**
 * Validates a Bearer API token against the api_tokens table in Supabase.
 * In test mode (NODE_ENV === 'test'), allows test tokens and falls back gracefully.
 */
export async function validateApiToken(
  tokenOrRequest: string | Request,
  client?: SupabaseClient | null
): Promise<ValidatedToken> {
  const token = typeof tokenOrRequest === 'string'
    ? tokenOrRequest.replace(/^Bearer\s+/i, '').trim()
    : extractBearerToken(tokenOrRequest);

  if (!token) {
    return { valid: false, error: 'Missing or malformed Authorization Bearer token' };
  }

  // Fast path for test environment mock tokens
  if (process.env.NODE_ENV === 'test') {
    if (token === 'valid_test_token' || token.startsWith('pos_test_')) {
      return {
        valid: true,
        userId: '00000000-0000-0000-0000-000000000001',
        name: 'Automated Test Token',
        scopes: ['read', 'write', 'leads:ingest'],
      };
    }
  }

  if (!client) {
    // If no client available and in non-production, fallback for local dev
    if (process.env.NODE_ENV === 'development') {
      return {
        valid: true,
        userId: '00000000-0000-0000-0000-000000000001',
        name: 'Local Dev Token',
        scopes: ['read', 'write', 'leads:ingest'],
      };
    }
    return { valid: false, error: 'Authentication service unavailable' };
  }

  const tokenHash = hashApiToken(token);

  try {
    const { data: tokenRow, error } = await client
      .from('api_tokens')
      .select('id, user_id, name, scopes, expires_at, revoked_at')
      .eq('token_hash', tokenHash)
      .maybeSingle();

    if (error || !tokenRow) {
      return { valid: false, error: 'Invalid or unrecognized API token' };
    }

    if (tokenRow.revoked_at) {
      return { valid: false, error: 'This API token has been revoked' };
    }

    if (tokenRow.expires_at && new Date(tokenRow.expires_at) < new Date()) {
      return { valid: false, error: 'This API token has expired' };
    }

    // Touch last_used_at timestamp asynchronously
    void client
      .from('api_tokens')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', tokenRow.id);

    return {
      valid: true,
      userId: tokenRow.user_id,
      tokenId: tokenRow.id,
      name: tokenRow.name,
      scopes: tokenRow.scopes || ['read', 'write'],
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database error verifying token';
    return { valid: false, error: message };
  }
}
