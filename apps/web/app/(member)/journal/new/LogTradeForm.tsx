'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@fxunlock/ui';
import { positionSize, riskReward } from '@fxunlock/trading';
import { createClient } from '@/lib/supabase/client';
import { saveTrade, type TradeInput } from '../save-trade';
import {
  INSTRUMENT_OPTIONS,
  RESULT_OPTIONS,
  SESSION_OPTIONS,
  SETUP_OPTIONS,
  isTradeDirection,
  isTradeResult,
  isTradingSession,
  type TradeDirection,
  type TradeResult,
  type TradingSession,
} from '../trade-fields';

export interface LogTradePrefill {
  readonly instrument: string;
  readonly direction: string;
  readonly entry: string;
  readonly stopLoss: string;
  readonly takeProfit: string;
  readonly balance: string;
  readonly risk: string;
  readonly setup: string;
  readonly session: string;
}

interface FormState {
  instrument: string;
  direction: TradeDirection;
  setup: string;
  session: TradingSession | '';
  entry: string;
  stopLoss: string;
  takeProfit: string;
  result: TradeResult;
  emotion: string;
  thesis: string;
  reflection: string;
  balance: string;
  risk: string;
}

const FIRST_INSTRUMENT = INSTRUMENT_OPTIONS[0]?.value ?? 'EUR/USD';
const FIRST_SETUP = SETUP_OPTIONS[0]?.value ?? '';

function initialState(prefill: LogTradePrefill): FormState {
  return {
    instrument: prefill.instrument || FIRST_INSTRUMENT,
    direction: isTradeDirection(prefill.direction) ? prefill.direction : 'long',
    setup: prefill.setup || FIRST_SETUP,
    session: isTradingSession(prefill.session) ? prefill.session : '',
    entry: prefill.entry,
    stopLoss: prefill.stopLoss,
    takeProfit: prefill.takeProfit,
    result: 'open',
    emotion: '7',
    thesis: '',
    reflection: '',
    balance: prefill.balance || '10000',
    risk: prefill.risk || '1',
  };
}

function parseNum(v: string): number | null {
  if (v.trim() === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * Log Trade form (PROJECT.md §8.8). Pure client leaf: the RSC shell stays
 * server-rendered and auth-gated; this owns the interactive form, the live
 * sizing preview, and the RLS-scoped save.
 *
 * Live preview uses `@fxunlock/trading` (`positionSize` + `riskReward`) — the
 * same math the Risk Calculator (M4) and server R-multiple (M5) use, so the
 * numbers are consistent across the app. On save, R-multiple is computed via
 * `rMultiple` inside `saveTrade`.
 */
export function LogTradeForm({ prefill }: { prefill: LogTradePrefill }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => initialState(prefill));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  const preview = useMemo(() => computePreview(form), [form]);

  async function submit(status: 'draft' | 'logged') {
    setError(null);

    const entry = parseNum(form.entry);
    const stopLoss = parseNum(form.stopLoss);
    const takeProfit = parseNum(form.takeProfit);

    // A completed log needs the prices that define risk; a draft can be partial.
    if (status === 'logged' && (entry === null || stopLoss === null)) {
      setError('Enter an entry and stop loss to log a completed trade (or save it as a draft).');
      return;
    }

    const emotion = parseNum(form.emotion);

    const input: TradeInput = {
      instrument: form.instrument,
      direction: form.direction,
      setup: form.setup,
      session: form.session,
      entry,
      stopLoss,
      takeProfit,
      result: form.result,
      emotion: emotion === null ? null : Math.min(10, Math.max(1, Math.round(emotion))),
      thesis: form.thesis,
      reflection: form.reflection,
      status,
    };

    setSubmitting(true);
    try {
      const supabase = createClient();
      const result = await saveTrade(supabase, input);
      if (!result.ok) {
        setError(result.error ?? 'We could not save your trade. Please try again.');
        return;
      }
      router.push('/journal');
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      className="tn-grid"
      onSubmit={(e) => {
        e.preventDefault();
        void submit('logged');
      }}
      aria-busy={submitting}
    >
      <div>
        <section className="panel" aria-labelledby="td-heading">
          <h2 className="ph" id="td-heading">
            Trade details
          </h2>

          <div className="frow">
            <div className="field">
              <label htmlFor="td-pair">Pair / instrument</label>
              <select
                id="td-pair"
                className="input"
                value={form.instrument}
                onChange={(e) => set('instrument', e.target.value)}
              >
                {INSTRUMENT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <span id="td-dir-label">Direction</span>
              <div className="seg" role="radiogroup" aria-labelledby="td-dir-label">
                {(['long', 'short'] as const).map((d) => {
                  const on = form.direction === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      className={`segbtn${on ? (d === 'long' ? ' on-long' : ' on-short') : ''}`}
                      onClick={() => set('direction', d)}
                    >
                      {d === 'long' ? 'Long' : 'Short'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="frow">
            <div className="field">
              <label htmlFor="td-setup">Setup / strategy</label>
              <select
                id="td-setup"
                className="input"
                value={form.setup}
                onChange={(e) => set('setup', e.target.value)}
              >
                {SETUP_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="td-session">Session</label>
              <select
                id="td-session"
                className="input"
                value={form.session}
                onChange={(e) =>
                  set('session', e.target.value as TradingSession | '')
                }
              >
                <option value="">Select session</option>
                {SESSION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="frow frow-3">
            <div className="field">
              <label htmlFor="td-entry">Entry</label>
              <input
                id="td-entry"
                className="input"
                inputMode="decimal"
                value={form.entry}
                onChange={(e) => set('entry', e.target.value)}
                placeholder="1.0840"
              />
            </div>
            <div className="field">
              <label htmlFor="td-stop">Stop loss</label>
              <input
                id="td-stop"
                className="input"
                inputMode="decimal"
                value={form.stopLoss}
                onChange={(e) => set('stopLoss', e.target.value)}
                placeholder="1.0795"
              />
            </div>
            <div className="field">
              <label htmlFor="td-tp">Take profit</label>
              <input
                id="td-tp"
                className="input"
                inputMode="decimal"
                value={form.takeProfit}
                onChange={(e) => set('takeProfit', e.target.value)}
                placeholder="1.0930"
              />
            </div>
          </div>
        </section>

        <section className="panel" aria-labelledby="rr-heading">
          <h2 className="ph" id="rr-heading">
            Review &amp; reflection
          </h2>

          <div className="frow">
            <div className="field">
              <label htmlFor="td-result">Result</label>
              <select
                id="td-result"
                className="input"
                value={form.result}
                onChange={(e) =>
                  set('result', isTradeResult(e.target.value) ? e.target.value : 'open')
                }
              >
                {RESULT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="td-emotion">Emotional state (1&ndash;10)</label>
              <input
                id="td-emotion"
                className="input"
                type="number"
                min={1}
                max={10}
                value={form.emotion}
                onChange={(e) => set('emotion', e.target.value)}
              />
            </div>
          </div>

          <div className="field field-mb">
            <label htmlFor="td-thesis">What was your thesis?</label>
            <textarea
              id="td-thesis"
              className="input"
              rows={2}
              value={form.thesis}
              onChange={(e) => set('thesis', e.target.value)}
              placeholder="Why did you take this trade?"
            />
          </div>

          <div className="field field-mb">
            <label htmlFor="td-reflect">What would you do differently?</label>
            <textarea
              id="td-reflect"
              className="input"
              rows={2}
              value={form.reflection}
              onChange={(e) => set('reflection', e.target.value)}
              placeholder="Lesson for next time…"
            />
          </div>

          <div className="field">
            <label htmlFor="td-chart">Chart screenshot</label>
            {/* Upload is stubbed for v1 — no storage wiring yet. Selecting a file
                records its name only; attachments + malware scan land later. */}
            <label className="tn-upload" htmlFor="td-chart">
              {attachmentName ? (
                <span>
                  Selected <strong>{attachmentName}</strong> — upload wiring coming soon
                </span>
              ) : (
                <span>
                  <strong>Add a chart screenshot</strong> (upload coming soon)
                </span>
              )}
              <input
                id="td-chart"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => setAttachmentName(e.target.files?.[0]?.name ?? null)}
              />
            </label>
          </div>
        </section>
      </div>

      <aside>
        <div className="calc-card" aria-live="polite">
          <span className="chip chip-lime-d">Live risk preview</span>
          <h3>Position sizing</h3>

          <div className="field field-mb">
            <label htmlFor="td-balance">Account balance</label>
            <input
              id="td-balance"
              className="input input-dark"
              inputMode="decimal"
              value={form.balance}
              onChange={(e) => set('balance', e.target.value)}
            />
          </div>
          <div className="field field-mb">
            <label htmlFor="td-risk">Risk per trade (%)</label>
            <input
              id="td-risk"
              className="input input-dark"
              inputMode="decimal"
              value={form.risk}
              onChange={(e) => set('risk', e.target.value)}
            />
          </div>

          <div className="calc-row">
            <span>Risk amount</span>
            <b>{preview.riskAmount}</b>
          </div>
          <div className="calc-row">
            <span>Stop distance</span>
            <b>{preview.stopPips}</b>
          </div>
          <div className="calc-row">
            <span>Position size</span>
            <b>{preview.lots}</b>
          </div>
          <div className="calc-row accent last">
            <span>Reward : risk</span>
            <b>{preview.rewardRisk}</b>
          </div>

          {preview.warning && <p className="calc-warn">{preview.warning}</p>}

          <div className="tn-actions">
            <Button
              type="button"
              variant="ghost"
              onClick={() => void submit('draft')}
              disabled={submitting}
            >
              Save draft
            </Button>
            <Button type="submit" variant="lime" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save trade'}
            </Button>
          </div>
        </div>

        {error && (
          <p className="auth-field-error tn-status" role="alert">
            {error}
          </p>
        )}
      </aside>
    </form>
  );
}

interface PreviewValues {
  riskAmount: string;
  stopPips: string;
  lots: string;
  rewardRisk: string;
  warning: string | null;
}

/**
 * Derive the live preview from the trading package. Missing/invalid inputs show
 * an em-dash rather than an error — this is a real-time hint, not a gate.
 */
function computePreview(form: FormState): PreviewValues {
  const balance = parseNum(form.balance);
  const risk = parseNum(form.risk);
  const entry = parseNum(form.entry);
  const stopLoss = parseNum(form.stopLoss);
  const takeProfit = parseNum(form.takeProfit);

  const out: PreviewValues = {
    riskAmount: '—',
    stopPips: '—',
    lots: '—',
    rewardRisk: '—',
    warning: null,
  };

  if (balance !== null && risk !== null) {
    out.riskAmount = `$${((balance * risk) / 100).toFixed(0)}`;
  }

  if (balance !== null && risk !== null && entry !== null && stopLoss !== null) {
    const sized = positionSize({
      accountBalance: balance,
      accountCurrency: 'USD',
      riskPercent: risk,
      instrument: form.instrument,
      entry,
      stopLoss,
    });
    if (sized.ok) {
      out.riskAmount = `$${sized.value.riskAmount.toFixed(0)}`;
      out.stopPips = `${sized.value.stopDistancePips.toFixed(0)} pips`;
      out.lots = `${sized.value.lots.toFixed(2)} lots`;
      const first = sized.value.warnings[0];
      if (first) out.warning = first.message;
    }
  }

  if (entry !== null && stopLoss !== null && takeProfit !== null) {
    const rr = riskReward({ entry, stopLoss, takeProfit, direction: form.direction });
    if (rr.ok) out.rewardRisk = `${rr.value.rewardRisk.toFixed(1)}R`;
  }

  return out;
}
