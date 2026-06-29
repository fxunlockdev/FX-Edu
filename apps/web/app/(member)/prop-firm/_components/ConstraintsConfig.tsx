'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { propFirmCheck } from '@fxunlock/trading';
import { Button } from '@fxunlock/ui';
import {
  DEFAULT_CONSTRAINTS,
  readConstraints,
  writeConstraints,
  type PropFirmConstraints,
} from './constraints';
import type { SampleTrade } from './sample-trade';

/**
 * The single `'use client'` interactive leaf of Prop Firm Prep (M13 /
 * PROJECT.md §8.13). Everything above it on the page is a server component.
 *
 * It owns the user-configurable constraints (max daily/overall drawdown, profit
 * target, per-trade cap, evaluation dates), persists them to `localStorage`, and
 * runs `propFirmCheck` from `@fxunlock/trading` against a sample/most-recent
 * trade to show a live pass/violation read. It does NO risk math itself — every
 * violation comes from the shared trading engine.
 *
 * The constraints are values the USER configures to model a firm; they are not
 * official firm data, and a clear "pass" here is not a guarantee of passing a
 * real evaluation. The page states this plainly around this component.
 */

interface ConstraintsConfigProps {
  /** Sample trade derived server-side from the user's journal (or a placeholder). */
  readonly sample: SampleTrade;
}

interface NumberFieldDef {
  readonly key: 'maxDailyDrawdown' | 'maxOverallDrawdown' | 'profitTarget' | 'perTradeCap';
  readonly label: string;
  readonly hint: string;
}

const NUMBER_FIELDS: ReadonlyArray<NumberFieldDef> = [
  { key: 'maxDailyDrawdown', label: 'Max daily drawdown', hint: 'Hard daily loss limit (% of balance).' },
  { key: 'maxOverallDrawdown', label: 'Max overall drawdown', hint: 'Trailing account loss limit (%).' },
  { key: 'profitTarget', label: 'Profit target', hint: 'Profit needed to pass (%).' },
  { key: 'perTradeCap', label: 'Per-trade cap', hint: 'Most you risk on one trade (%).' },
];

function fmtPercent(value: number): string {
  return `${Number(value.toFixed(2))}%`;
}

export function ConstraintsConfig({ sample }: ConstraintsConfigProps) {
  const baseId = useId();
  const [constraints, setConstraints] = useState<PropFirmConstraints>(DEFAULT_CONSTRAINTS);
  const [hydrated, setHydrated] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Load persisted constraints after mount (avoids a hydration mismatch).
  useEffect(() => {
    setConstraints(readConstraints());
    setHydrated(true);
  }, []);

  const setNumber = (key: NumberFieldDef['key'], raw: string) => {
    const n = raw === '' ? 0 : Number(raw);
    setConstraints((prev) => ({ ...prev, [key]: Number.isFinite(n) && n >= 0 ? n : prev[key] }));
    setSavedAt(null);
  };

  const setDate = (key: 'startDate' | 'endDate', raw: string) => {
    setConstraints((prev) => ({ ...prev, [key]: raw }));
    setSavedAt(null);
  };

  const save = () => {
    writeConstraints(constraints);
    setSavedAt(Date.now());
  };

  const reset = () => {
    setConstraints(DEFAULT_CONSTRAINTS);
    writeConstraints(DEFAULT_CONSTRAINTS);
    setSavedAt(Date.now());
  };

  // Live pass/violation read from the shared trading engine. Recomputed on every
  // constraint or sample change. An empty result means the trade is within all
  // configured limits (the "pass" read).
  const violations = useMemo(
    () =>
      propFirmCheck({
        riskPercent: sample.riskPercent,
        dailyLossUsed: 0,
        maxDailyDrawdown: constraints.maxDailyDrawdown,
        maxOverallDrawdown: constraints.maxOverallDrawdown,
        perTradeCap: constraints.perTradeCap,
        overallLossUsed: 0,
      }),
    [sample.riskPercent, constraints],
  );

  const passes = violations.length === 0;

  return (
    <div className="pf-config-grid">
      <div className="pf-config-form">
        <div className="pf-field-grid">
          {NUMBER_FIELDS.map((f) => {
            const id = `${baseId}-${f.key}`;
            return (
              <div className="pf-field" key={f.key}>
                <label htmlFor={id}>{f.label}</label>
                <div className="pf-input-affix">
                  <input
                    id={id}
                    className="input"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={0.1}
                    value={hydrated ? String(constraints[f.key]) : ''}
                    onChange={(e) => setNumber(f.key, e.target.value)}
                    aria-describedby={`${id}-hint`}
                  />
                  <span aria-hidden="true">%</span>
                </div>
                <p id={`${id}-hint`} className="pf-hint muted">
                  {f.hint}
                </p>
              </div>
            );
          })}

          <div className="pf-field">
            <label htmlFor={`${baseId}-start`}>Evaluation start</label>
            <input
              id={`${baseId}-start`}
              className="input"
              type="date"
              value={constraints.startDate}
              onChange={(e) => setDate('startDate', e.target.value)}
            />
          </div>
          <div className="pf-field">
            <label htmlFor={`${baseId}-end`}>Evaluation end</label>
            <input
              id={`${baseId}-end`}
              className="input"
              type="date"
              value={constraints.endDate}
              onChange={(e) => setDate('endDate', e.target.value)}
            />
          </div>
        </div>

        <div className="pf-config-actions">
          <Button type="button" variant="lime" size="sm" onClick={save}>
            Save constraints
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={reset}>
            Reset to example
          </Button>
          {savedAt !== null && (
            <span className="pf-saved" role="status">
              Saved locally
            </span>
          )}
        </div>

        <p className="pf-unofficial muted">
          These constraints are the values you enter to model your target firm. They are not
          official prop-firm data and do not guarantee passing any evaluation.
        </p>
      </div>

      <aside
        className={`pf-check ${passes ? 'pf-check-pass' : 'pf-check-fail'}`}
        aria-live="polite"
        aria-labelledby={`${baseId}-check-h`}
      >
        <div className="pf-check-head">
          <span className="pf-check-badge" aria-hidden="true">
            {passes ? '✓' : '!'}
          </span>
          <h3 id={`${baseId}-check-h`}>{passes ? 'Within your limits' : 'Limit violation'}</h3>
        </div>
        <p className="pf-check-sample">
          {sample.fromJournal
            ? `Checking your most-recent logged trade (${sample.instrument}, ~${fmtPercent(
                sample.riskPercent,
              )} at risk) against your constraints.`
            : `No usable journal trade yet — checking a sample ${sample.instrument} trade at ${fmtPercent(
                sample.riskPercent,
              )} risk.`}
        </p>
        {passes ? (
          <p className="pf-check-msg">
            This trade stays inside every limit you configured. That is a discipline check, not a
            prediction that you will pass a real evaluation.
          </p>
        ) : (
          <ul className="pf-violations">
            {violations.map((v) => (
              <li key={v.code}>{v.message}</li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
