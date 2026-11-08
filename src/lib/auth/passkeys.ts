import type { SupabaseClient, User, Session, AuthError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export interface PasskeyAuthResult {
  user: User | null;
  session: Session | null;
  error: AuthError | Error | null;
}

export interface PasskeyRegistrationResult {
  data: unknown | null;
  error: AuthError | Error | null;
}

export interface PasskeyInfo {
  id: string;
  name?: string;
  created_at?: string;
  last_used_at?: string;
}

/**
 * Returns true if the client environment supports WebAuthn / Passkeys.
 */
export function isWebAuthnSupported(): boolean {
  if (typeof window === "undefined") return false;
  return (
    typeof window.PublicKeyCredential !== "undefined" &&
    typeof window.PublicKeyCredential === "function"
  );
}

/**
 * Returns true if a user-verifying platform authenticator (Touch ID, Face ID, Windows Hello)
 * is available on this device.
 */
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isWebAuthnSupported()) return false;
  try {
    if (
      typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable ===
      "function"
    ) {
      return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Authenticates the user using a registered WebAuthn passkey via Supabase Auth.
 */
export async function signInWithPasskey(options?: {
  client?: SupabaseClient;
}): Promise<PasskeyAuthResult> {
  if (!isWebAuthnSupported()) {
    return {
      user: null,
      session: null,
      error: new Error("Passkey authentication is not supported on this browser or device."),
    };
  }

  try {
    const supabase = options?.client ?? createClient();
    const result = await supabase.auth.signInWithPasskey();

    if (result.error) {
      return {
        user: null,
        session: null,
        error: result.error,
      };
    }

    return {
      user: result.data?.user ?? null,
      session: result.data?.session ?? null,
      error: null,
    };
  } catch (err: unknown) {
    return {
      user: null,
      session: null,
      error: err instanceof Error ? err : new Error("Passkey authentication failed."),
    };
  }
}

/**
 * Registers a new passkey credential linked to the currently authenticated account.
 */
export async function registerPasskey(options?: {
  name?: string;
  client?: SupabaseClient;
}): Promise<PasskeyRegistrationResult> {
  if (!isWebAuthnSupported()) {
    return {
      data: null,
      error: new Error("Passkey registration is not supported on this browser or device."),
    };
  }

  try {
    const supabase = options?.client ?? createClient();
    const result = await supabase.auth.registerPasskey();

    if (result.error) {
      return {
        data: null,
        error: result.error,
      };
    }

    return {
      data: result.data ?? null,
      error: null,
    };
  } catch (err: unknown) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Passkey registration failed."),
    };
  }
}

/**
 * Lists all registered passkeys for the current user.
 */
export async function listPasskeys(client?: SupabaseClient): Promise<{
  passkeys: PasskeyInfo[];
  error: AuthError | Error | null;
}> {
  try {
    const supabase = client ?? createClient();
    if (!supabase.auth.passkey?.list) {
      return { passkeys: [], error: null };
    }

    const { data, error } = await supabase.auth.passkey.list();
    if (error) {
      return { passkeys: [], error };
    }

    return {
      passkeys: (data as PasskeyInfo[]) ?? [],
      error: null,
    };
  } catch (err: unknown) {
    return {
      passkeys: [],
      error: err instanceof Error ? err : new Error("Failed to list passkeys."),
    };
  }
}

/**
 * Deletes a registered passkey by ID.
 */
export async function deletePasskey(
  id: string,
  client?: SupabaseClient
): Promise<{ error: AuthError | Error | null }> {
  try {
    const supabase = client ?? createClient();
    if (!supabase.auth.passkey?.delete) {
      return { error: new Error("Passkey management not supported by client.") };
    }

    const { error } = await supabase.auth.passkey.delete({ passkeyId: id });
    return { error: error ?? null };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err : new Error("Failed to delete passkey."),
    };
  }
}
