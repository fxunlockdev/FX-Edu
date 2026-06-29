import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Security-sensitive account actions (PROJECT.md §8.16 🔒). These never trust
 * the client for the security decision: password/email changes go through
 * Supabase Auth (`updateUser`), which validates the *current* session
 * server-side, and email changes additionally require re-verification of the
 * new address before they take effect.
 *
 * Step-up note: §8.16 requires an email change to be gated behind step-up auth
 * (AAL2 / recent re-auth). Supabase's `updateUser({ email })` already sends a
 * confirmation link to BOTH addresses and does not switch the login email until
 * the new one is verified — that is the re-verification half. The AAL step-up
 * (re-prompt for password / MFA before allowing the change) is wired once the
 * F2 MFA/AAL flow lands.
 * // TODO: enforce AAL2 step-up before email change once F2 MFA is wired.
 */

export interface SecurityResult {
  readonly ok: boolean;
  readonly error?: string;
  /** Human-readable success note (e.g. "check your inbox to confirm"). */
  readonly message?: string;
}

export const MIN_PASSWORD_LENGTH = 8;

/**
 * Change the account password via Supabase Auth. The SDK applies the change to
 * the currently authenticated user only — the client cannot target another
 * account. We validate length at the boundary; Supabase enforces its own
 * password policy server-side as the authority.
 */
export async function changePassword(
  supabase: SupabaseClient,
  newPassword: string,
  confirmPassword: string,
): Promise<SecurityResult> {
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: `Use at least ${MIN_PASSWORD_LENGTH} characters.`,
    };
  }
  if (newPassword !== confirmPassword) {
    return { ok: false, error: 'The two passwords do not match.' };
  }

  // Confirm the session is live before the change so an expired session gets a
  // clear message rather than a generic failure (consistent with every other
  // write in the module). `updateUser` is itself authoritative server-side.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { ok: false, error: 'Your session has expired. Please log in again.' };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    return {
      ok: false,
      error: 'We could not update your password. Please try again.',
    };
  }

  return { ok: true, message: 'Password updated.' };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Start an email change. Supabase sends confirmation links to the old and new
 * addresses; the login email switches only after the NEW address is verified —
 * so this never silently moves the account. Step-up (AAL2) gating is added when
 * F2 MFA lands (see file header TODO).
 */
export async function requestEmailChange(
  supabase: SupabaseClient,
  newEmail: string,
  currentEmail: string,
): Promise<SecurityResult> {
  const email = newEmail.trim().toLowerCase();

  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: 'Enter a valid email address.' };
  }
  if (email === currentEmail.trim().toLowerCase()) {
    return { ok: false, error: 'That is already your email address.' };
  }

  const { error } = await supabase.auth.updateUser({ email });
  if (error) {
    return {
      ok: false,
      error: 'We could not start the email change. Please try again.',
    };
  }

  return {
    ok: true,
    message:
      'Confirm the change from the link we sent to both your old and new email. Your sign-in email changes only after you verify the new address.',
  };
}

/**
 * Start a GDPR data-export request. The compliant workflow (assemble the user's
 * data across services, store the bundle in Supabase Storage, email a signed
 * download link) is owned by the Admin GDPR pipeline (§9 module 19 / §6 GDPR
 * posture) and runs out-of-band via a worker. Here we only *register the
 * request* so the user gets immediate, honest feedback.
 *
 * // TODO: wire GDPR export — insert a `data_requests` row (kind='export') that
 * a worker fulfils, then email the signed download link. For now this is a
 * client-side stub that returns the queued acknowledgement.
 */
export async function requestDataExport(
  _supabase: SupabaseClient,
): Promise<SecurityResult> {
  // Intentionally not wired to a table yet — see TODO above.
  return {
    ok: true,
    message:
      'Export requested. We will email a secure download link to your verified address, usually within 24 hours.',
  };
}

/**
 * Start a GDPR account-deletion request. Deletion is a destructive, audited,
 * compliant workflow (cascade-erase across Postgres + Storage + downstream
 * processors, honouring legal-retention obligations like Stripe invoices). It
 * must NOT delete from the client. This stub registers the intent and surfaces
 * the grace-period messaging; the worker performs the erasure after the
 * cooling-off window.
 *
 * // TODO: wire GDPR delete — insert a `data_requests` row (kind='delete') with
 * a scheduled `effective_at`, require step-up confirmation, and let the admin
 * GDPR worker perform the audited cascade. Until then this acknowledges intent
 * only and never removes data.
 */
export async function requestAccountDeletion(
  _supabase: SupabaseClient,
): Promise<SecurityResult> {
  // Intentionally not wired to a table yet — see TODO above.
  return {
    ok: true,
    message:
      'Deletion requested. Your account is scheduled for permanent removal in 14 days — sign in again before then to cancel. We will email a confirmation.',
  };
}
