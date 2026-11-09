/**
 * MFA and Google Authenticator Management for Personal OS
 *
 * Implements RFC 6238 TOTP enrollment and challenge verification via Supabase MFA,
 * specifically customized for Google Authenticator.
 * Includes single-use SHA-256 hashed recovery backup codes.
 */

import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface TotpEnrollmentData {
  factorId: string;
  secret: string;
  qrCode: string;
  uri: string;
}

export interface MfaStatus {
  enrolled: boolean;
  factors: Array<{
    id: string;
    friendlyName?: string;
    factorType: string;
    status: string;
    createdAt: string;
  }>;
  currentLevel: "aal1" | "aal2";
  nextLevel: "aal1" | "aal2";
}

export interface VerifyTotpResult {
  success: boolean;
  error?: string;
}

/**
 * Enrolls a new Google Authenticator TOTP factor.
 */
export async function enrollGoogleAuthenticator(
  client?: SupabaseClient,
  friendlyName = "Google Authenticator"
): Promise<{ data: TotpEnrollmentData | null; error: string | null }> {
  try {
    const supabase = client || createClient();
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      issuer: "Personal OS",
      friendlyName,
    });

    if (error || !data) {
      return { data: null, error: error?.message || "Failed to initialize Google Authenticator enrollment" };
    }

    return {
      data: {
        factorId: data.id,
        secret: data.totp.secret,
        qrCode: data.totp.qr_code,
        uri: data.totp.uri,
      },
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unexpected error during enrollment",
    };
  }
}

/**
 * Creates a challenge and verifies the 6-digit TOTP code from Google Authenticator.
 * This transitions the factor from 'unverified' to 'verified'.
 */
export async function verifyMfaChallenge(
  factorId: string,
  code: string,
  client?: SupabaseClient
): Promise<VerifyTotpResult> {
  try {
    const supabase = client || createClient();

    // 1. Create Challenge
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId,
    });

    if (challengeError || !challengeData) {
      return {
        success: false,
        error: challengeError?.message || "Failed to create MFA challenge",
      };
    }

    // 2. Verify Code
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code: code.trim(),
    });

    if (verifyError) {
      return {
        success: false,
        error: verifyError.message || "Invalid 6-digit code. Please check Google Authenticator.",
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Verification failed",
    };
  }
}

/**
 * Unenrolls an MFA factor.
 */
export async function unenrollGoogleAuthenticator(
  factorId: string,
  client?: SupabaseClient
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = client || createClient();
    const { error } = await supabase.auth.mfa.unenroll({ factorId });

    if (error) {
      return { success: false, error: error.message };
    }

    // Also clear recovery codes
    await supabase.auth.updateUser({
      data: { mfa_recovery_codes: [] },
    });

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to unenroll factor",
    };
  }
}

/**
 * Retrieves the current MFA status and assurance level.
 */
export async function getMfaStatus(client?: SupabaseClient): Promise<MfaStatus> {
  try {
    const supabase = client || createClient();

    const [factorsRes, aalRes] = await Promise.all([
      supabase.auth.mfa.listFactors(),
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    ]);

    const factors = factorsRes.data?.totp || [];
    const verifiedFactors = factors.filter((f) => f.status === "verified");

    return {
      enrolled: verifiedFactors.length > 0,
      factors: factors.map((f) => ({
        id: f.id,
        friendlyName: f.friendly_name,
        factorType: f.factor_type,
        status: f.status,
        createdAt: f.created_at,
      })),
      currentLevel: (aalRes.data?.currentLevel as "aal1" | "aal2") || "aal1",
      nextLevel: (aalRes.data?.nextLevel as "aal1" | "aal2") || "aal1",
    };
  } catch {
    return {
      enrolled: false,
      factors: [],
      currentLevel: "aal1",
      nextLevel: "aal1",
    };
  }
}

/**
 * Generates N cryptographically random recovery backup codes.
 * Format: XXXX-XXXX (8 uppercase alphanumeric characters)
 */
export function generateRecoveryCodes(count = 8): string[] {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Base32 unambiguous charset
  const codes: string[] = [];

  for (let i = 0; i < count; i++) {
    const randomBytes = new Uint8Array(8);
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      crypto.getRandomValues(randomBytes);
    } else {
      for (let j = 0; j < 8; j++) randomBytes[j] = Math.floor(Math.random() * 256);
    }

    let code = "";
    for (let j = 0; j < 8; j++) {
      code += charset[randomBytes[j] % charset.length];
      if (j === 3) code += "-";
    }
    codes.push(code);
  }

  return codes;
}

/**
 * Cryptographically hashes a recovery code using SHA-256 for secure storage.
 */
export async function hashRecoveryCode(code: string): Promise<string> {
  const normalized = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);

  if (typeof crypto !== "undefined" && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // Fallback simple hex hasher for environments without crypto.subtle
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

/**
 * Hashes and persists recovery codes to the authenticated user's metadata.
 */
export async function saveRecoveryCodes(
  codes: string[],
  client?: SupabaseClient
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = client || createClient();
    const hashes = await Promise.all(codes.map(hashRecoveryCode));

    const { error } = await supabase.auth.updateUser({
      data: { mfa_recovery_codes: hashes },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save recovery codes",
    };
  }
}

/**
 * Verifies and burns a single-use recovery code.
 */
export async function verifyAndBurnRecoveryCode(
  code: string,
  client?: SupabaseClient
): Promise<{ valid: boolean; remainingCount: number; error?: string }> {
  try {
    const supabase = client || createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      return { valid: false, remainingCount: 0, error: "Not authenticated" };
    }

    const currentHashes: string[] = userData.user.user_metadata?.mfa_recovery_codes || [];
    if (currentHashes.length === 0) {
      return { valid: false, remainingCount: 0, error: "No recovery codes found" };
    }

    const providedHash = await hashRecoveryCode(code);
    const matchingIndex = currentHashes.indexOf(providedHash);

    if (matchingIndex === -1) {
      return { valid: false, remainingCount: currentHashes.length, error: "Invalid recovery code" };
    }

    // Burn code by removing it from the list
    const updatedHashes = currentHashes.filter((_, idx) => idx !== matchingIndex);
    const { error: updateError } = await supabase.auth.updateUser({
      data: { mfa_recovery_codes: updatedHashes },
    });

    if (updateError) {
      return { valid: false, remainingCount: currentHashes.length, error: updateError.message };
    }

    return { valid: true, remainingCount: updatedHashes.length };
  } catch (err) {
    return {
      valid: false,
      remainingCount: 0,
      error: err instanceof Error ? err.message : "Verification failed",
    };
  }
}
