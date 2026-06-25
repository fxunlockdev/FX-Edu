import type { SupabaseClient } from '@supabase/supabase-js';
import { rMultiple } from '@fxunlock/trading';
import type {
  TradeDirection,
  TradeResult,
  TradingSession,
  TradeStatus,
} from './trade-fields';

/**
 * Persists a trade to the `trades` table via the RLS-scoped client, following
 * the M2 `save-profile.ts` pattern: the user id is read from the session
 * (never trusted from the client), and the RLS policy keys on `auth.uid()` so a
 * user can only ever write their own row (PROJECT.md §6.1, §8.8).
 *
 * R-multiple is computed here with `@fxunlock/trading` `rMultiple` so the journal
 * shows a consistent figure immediately on save.
 *
 * TODO(server): recompute R/win-loss server-side via the API for
 * tamper-resistance (PROJECT.md §8.8) — for now client-compute + RLS write is
 * the v1 path (mirrors onboarding). The DB column `r_multiple` is documented as
 * "server-computed, not client-writable"; until the API exists we write the
 * client estimate so the UI is populated, and the server worker will overwrite.
 *
 * NOTE: the `trades` table is provisioned by the orchestrator (Supabase
 * migration). If it is not deployed yet the call returns a friendly error
 * instead of throwing, so journaling degrades gracefully during bring-up.
 */
export interface TradeInput {
  readonly instrument: string;
  readonly direction: TradeDirection;
  readonly setup: string;
  readonly session: TradingSession | '';
  readonly entry: number | null;
  readonly stopLoss: number | null;
  readonly takeProfit: number | null;
  readonly result: TradeResult;
  readonly emotion: number | null;
  readonly thesis: string;
  readonly reflection: string;
  readonly status: TradeStatus;
}

export interface SaveTradeResult {
  readonly ok: boolean;
  readonly error?: string;
}

/**
 * Derive the realized R-multiple for a closed trade.
 *
 * 1R = |entry − stop|. The realized exit depends on the result, because the v1
 * form captures only the plan (entry/stop/take-profit), not a separate fill:
 *  - win      → exit at the take-profit (≈ +R toward the target)
 *  - loss     → exit at the stop loss  (≈ −1R)
 *  - breakeven→ 0R by definition
 *  - open     → no realized R yet
 *
 * Using the take-profit as the exit for a *loss* would wrongly read positive, so
 * we pick the exit price per result. Any math-domain failure (missing entry/stop,
 * zero-distance stop, missing target on a win) yields null rather than a bad
 * number. The server worker recomputes this authoritatively (§8.8).
 */
export function computeRMultiple(input: TradeInput): number | null {
  const { result, direction, entry, stopLoss, takeProfit } = input;

  if (result === 'open') return null;
  if (result === 'breakeven') return 0;
  if (entry === null || stopLoss === null) return null;

  // Loss exits at the stop; win exits at the planned target.
  const exit = result === 'loss' ? stopLoss : takeProfit;
  if (exit === null) return null;

  const r = rMultiple({ entry, stopLoss, exit, direction });
  if (!r.ok) return null;

  return r.value;
}

export async function saveTrade(
  supabase: SupabaseClient,
  input: TradeInput,
): Promise<SaveTradeResult> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: 'Your session has expired. Please log in again.' };
  }

  const computedR = computeRMultiple(input);
  const nowIso = new Date().toISOString();
  const isClosed = input.result !== 'open';

  const { error } = await supabase.from('trades').insert({
    user_id: user.id,
    instrument: input.instrument,
    direction: input.direction,
    setup: input.setup || null,
    session: input.session || null,
    entry: input.entry,
    stop_loss: input.stopLoss,
    take_profit: input.takeProfit,
    result: input.result,
    // TODO(server): server worker recomputes this authoritatively (§8.8).
    r_multiple: computedR,
    emotion: input.emotion,
    thesis: input.thesis || null,
    reflection: input.reflection || null,
    status: input.status,
    opened_at: nowIso,
    closed_at: isClosed ? nowIso : null,
  });

  if (error) {
    return {
      ok: false,
      error: 'We could not save your trade right now. Please try again.',
    };
  }

  return { ok: true };
}
