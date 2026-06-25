'use client';

import { useId, useMemo, useState } from 'react';
import { allInstruments, type Direction } from '@fxunlock/trading';
import { Badge, Button, Disclaimer } from '@fxunlock/ui';
import { compute } from './compute';
import { buildJournalHref } from './journal';
import type { CalcMode, RiskForm } from './types';

/**
 * Member Risk Calculator — the single `'use client'` interactive leaf (M4 /
 * PRD §8.7). The page shell is a server component; this island owns form state
 * and renders live results. It does NO math itself: every number comes from
 * `@fxunlock/trading` via {@link compute} (PROJECT.md §8.7 — the trading
 * package is the source of truth).
 */

const MODES: ReadonlyArray<{ id: CalcMode; label: string }> = [
  { id: 'position', label: 'Position Size' },
  { id: 'pip', label: 'Pip Value' },
  { id: 'rr', label: 'R:R Calculator' },
  { id: 'prop', label: 'Prop Firm Risk' },
];

const INSTRUMENTS = allInstruments();

const INITIAL_FORM: RiskForm = {
  accountBalance: '5000',
  accountCurrency: 'USD',
  riskPercent: '1',
  riskAmount: '50',
  riskBasis: 'percent',
  instrument: 'EUR/USD',
  direction: 'long',
  entry: '1.08500',
  stopLoss: '1.08200',
  takeProfit: '1.09100',
  mode: 'position',
  propPerTradeCap: '1',
  propMaxDaily: '5',
  propMaxOverall: '10',
  propDailyUsed: '0',
};

const MODE_LABEL: Record<CalcMode, string> = {
  position: 'Position Size',
  pip: 'Pip Value',
  rr: 'R:R Calculator',
  prop: 'Prop Firm Risk',
};

/** Runtime narrowing for the direction select (no unchecked `as` cast). */
function isDirection(value: string): value is Direction {
  return value === 'long' || value === 'short';
}

/**
 * Keep risk% and risk-amount consistent after an edit. Pure: returns a new form
 * with the dependent figure recomputed (and the basis flag updated when the user
 * directly edits one of the two). The displayed math still comes from the
 * trading package — this only mirrors the input the user did not touch.
 */
function syncRiskFields(form: RiskForm, editedKey: keyof RiskForm): RiskForm {
  const balance = Number.parseFloat(form.accountBalance);
  const hasBalance = Number.isFinite(balance) && balance > 0;

  const derivedAmount = (pctStr: string): string => {
    const pct = Number.parseFloat(pctStr);
    return hasBalance && Number.isFinite(pct) ? ((balance * pct) / 100).toFixed(2) : form.riskAmount;
  };
  const derivedPercent = (amtStr: string): string => {
    const amt = Number.parseFloat(amtStr);
    return hasBalance && Number.isFinite(amt) ? ((amt / balance) * 100).toFixed(2) : form.riskPercent;
  };

  if (editedKey === 'riskPercent') {
    return { ...form, riskBasis: 'percent', riskAmount: derivedAmount(form.riskPercent) };
  }
  if (editedKey === 'riskAmount') {
    return { ...form, riskBasis: 'amount', riskPercent: derivedPercent(form.riskAmount) };
  }
  if (editedKey === 'accountBalance') {
    return form.riskBasis === 'percent'
      ? { ...form, riskAmount: derivedAmount(form.riskPercent) }
      : { ...form, riskPercent: derivedPercent(form.riskAmount) };
  }
  return form;
}

export function RiskCalculator() {
  const [form, setForm] = useState<RiskForm>(INITIAL_FORM);
  const result = useMemo(() => compute(form), [form]);

  const baseId = useId();
  const errId = `${baseId}-err`;

  // Immutable field update. Keeps risk %/amount in sync based on which the user
  // edits, so the two stay consistent without storing redundant derived state.
  function update<K extends keyof RiskForm>(key: K, value: RiskForm[K]): void {
    setForm((prev) => syncRiskFields({ ...prev, [key]: value }, key));
  }

  const journalHref = buildJournalHref({
    instrument: form.instrument,
    direction: form.direction,
    entry: form.entry,
    stopLoss: form.stopLoss,
    takeProfit: form.takeProfit,
    accountBalance: form.accountBalance,
    accountCurrency: form.accountCurrency,
    riskPercent: form.riskPercent,
  });

  const fid = (name: string) => `${baseId}-${name}`;

  return (
    <div className="rc-grid">
      <section className="card card-pad" aria-labelledby={`${baseId}-inputs`}>
        <h2 id={`${baseId}-inputs`} className="sr-only">
          Trade inputs
        </h2>

        {/* Pill toggle. A `group` of `aria-pressed` buttons (not a tablist) —
            there are no separate tab panels, so this is the correct, fully
            keyboard-operable pattern. */}
        <div className="rc-modes" role="group" aria-label="Calculator mode">
          {MODES.map((m) => {
            const active = form.mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                aria-pressed={active}
                className={active ? 'on' : undefined}
                onClick={() => update('mode', m.id)}
              >
                {m.label}
              </button>
            );
          })}
        </div>

        <div className="rc-row">
          <div className="field">
            <label htmlFor={fid('bal')}>Account size</label>
            <input
              id={fid('bal')}
              className="input num"
              inputMode="decimal"
              value={form.accountBalance}
              onChange={(e) => update('accountBalance', e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor={fid('cur')}>Account currency</label>
            <select
              id={fid('cur')}
              className="input"
              value={form.accountCurrency}
              onChange={(e) => update('accountCurrency', e.target.value)}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>

        <div className="rc-row">
          <div className="field">
            <label htmlFor={fid('rpct')}>Risk %</label>
            <input
              id={fid('rpct')}
              className="input num"
              inputMode="decimal"
              value={form.riskPercent}
              onChange={(e) => update('riskPercent', e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor={fid('ramt')}>Risk amount</label>
            <input
              id={fid('ramt')}
              className="input num"
              inputMode="decimal"
              value={form.riskAmount}
              onChange={(e) => update('riskAmount', e.target.value)}
            />
          </div>
        </div>

        <div className="rc-row">
          <div className="field">
            <label htmlFor={fid('pair')}>Instrument</label>
            <select
              id={fid('pair')}
              className="input"
              value={form.instrument}
              onChange={(e) => update('instrument', e.target.value)}
            >
              {INSTRUMENTS.map((inst) => (
                <option key={inst.symbol} value={inst.symbol}>
                  {inst.symbol}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor={fid('dir')}>Direction</label>
            <select
              id={fid('dir')}
              className="input"
              value={form.direction}
              onChange={(e) => {
                if (isDirection(e.target.value)) update('direction', e.target.value);
              }}
            >
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>
          </div>
        </div>

        <hr className="divider rc-divider" />

        <div className="rc-row">
          <div className="field">
            <label htmlFor={fid('entry')}>Entry price</label>
            <input
              id={fid('entry')}
              className="input num"
              inputMode="decimal"
              value={form.entry}
              onChange={(e) => update('entry', e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor={fid('sl')}>Stop loss</label>
            <input
              id={fid('sl')}
              className="input num"
              inputMode="decimal"
              value={form.stopLoss}
              onChange={(e) => update('stopLoss', e.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor={fid('tp')}>Take profit</label>
          <input
            id={fid('tp')}
            className="input num"
            inputMode="decimal"
            value={form.takeProfit}
            onChange={(e) => update('takeProfit', e.target.value)}
          />
        </div>

        {form.mode === 'prop' && (
          <fieldset className="rc-prop">
            <legend>Prop firm limits (% of account)</legend>
            <div className="rc-row">
              <div className="field">
                <label htmlFor={fid('cap')}>Per-trade cap</label>
                <input
                  id={fid('cap')}
                  className="input num"
                  inputMode="decimal"
                  value={form.propPerTradeCap}
                  onChange={(e) => update('propPerTradeCap', e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor={fid('daily')}>Max daily drawdown</label>
                <input
                  id={fid('daily')}
                  className="input num"
                  inputMode="decimal"
                  value={form.propMaxDaily}
                  onChange={(e) => update('propMaxDaily', e.target.value)}
                />
              </div>
            </div>
            <div className="rc-row">
              <div className="field">
                <label htmlFor={fid('overall')}>Max overall drawdown</label>
                <input
                  id={fid('overall')}
                  className="input num"
                  inputMode="decimal"
                  value={form.propMaxOverall}
                  onChange={(e) => update('propMaxOverall', e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor={fid('used')}>Daily loss already used</label>
                <input
                  id={fid('used')}
                  className="input num"
                  inputMode="decimal"
                  value={form.propDailyUsed}
                  onChange={(e) => update('propDailyUsed', e.target.value)}
                />
              </div>
            </div>
          </fieldset>
        )}

        {result.error && (
          <p id={errId} role="alert" className="rc-error">
            {result.error}
          </p>
        )}
      </section>

      <aside className="rc-out dark-sec" aria-live="polite" aria-label="Calculated risk">
        <div className="rc-out-head">
          <span>Suggested position size</span>
          <Badge tone="lime-dark">{MODE_LABEL[form.mode]}</Badge>
        </div>
        <div className="rc-big num">{result.headline}</div>
        <p className="rc-caption">{result.headlineCaption}</p>

        <dl className="rc-out-rows">
          {result.rows.map((row) => (
            <div className="rc-out-row" key={row.label}>
              <dt>{row.label}</dt>
              <dd className={row.accent ? 'num text-lime-d' : 'num'}>{row.value}</dd>
            </div>
          ))}
        </dl>

        {result.warnings.length > 0 && (
          <ul className="rc-warn">
            {result.warnings.map((w) => (
              <li key={w.code}>{w.message}</li>
            ))}
          </ul>
        )}

        <Button href={journalHref} variant="lime" block className="rc-save">
          Save to journal
        </Button>

        <Disclaimer kind="custom" variant="note" className="rc-disclaimer">
          For educational planning only. This does not account for spread,
          slippage, commissions, or execution and does not guarantee a fill
          price or trading outcome.
        </Disclaimer>
      </aside>
    </div>
  );
}
