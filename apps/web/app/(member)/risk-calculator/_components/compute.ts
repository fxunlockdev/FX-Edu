import {
  pipValue,
  positionSize,
  propFirmCheck,
  riskReward,
  type PositionSizeInput,
  type Warning,
} from '@fxunlock/trading';
import type { RiskForm, RiskResult, ResultRow } from './types';

/**
 * Pure derivation: raw form → fully-formatted {@link RiskResult}.
 *
 * ALL arithmetic is delegated to `@fxunlock/trading` — this module only parses
 * strings, wires inputs into the package's typed calls, and formats the typed
 * results for display. It never hand-rolls pip/lot/R:R math (PROJECT.md §8.7:
 * the trading package is the single source of truth). Total: every domain
 * failure the package can return is surfaced as `result.error`, never thrown.
 */

const PLACEHOLDER = '—';

/** Parse a user string to a finite number, or `null` if blank/invalid. */
function parseNum(raw: string): number | null {
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : null;
}

/** Currency formatter for the account currency (falls back to plain number). */
function makeMoney(currency: string): (n: number) => string {
  try {
    return (n: number) =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
      }).format(n);
  } catch {
    // Unknown/blank currency code — degrade to a prefixed decimal.
    return (n: number) => `${currency || ''}${n.toFixed(2)}`.trim();
  }
}

const num1 = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const lots2 = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** An empty result skeleton used while inputs are incomplete or invalid. */
function emptyResult(form: RiskForm, error: string | null): RiskResult {
  return {
    headline: `${PLACEHOLDER} lots`,
    headlineCaption: `${form.instrument} · ${form.direction === 'long' ? 'Long' : 'Short'}`,
    rows: [
      { label: 'Risk amount', value: PLACEHOLDER },
      { label: 'Stop distance', value: PLACEHOLDER },
      { label: 'Potential reward', value: PLACEHOLDER, accent: true },
      { label: 'Reward : Risk', value: PLACEHOLDER },
      { label: 'Pip value', value: PLACEHOLDER },
    ],
    warnings: [],
    error,
  };
}

/**
 * Build the position-size input from the form, honoring which risk basis the
 * user is driving (percent vs absolute amount). Exactly one is forwarded so the
 * package derives the other consistently.
 */
function toSizeInput(
  form: RiskForm,
  balance: number,
  entry: number,
  stopLoss: number,
): PositionSizeInput {
  const base = {
    accountBalance: balance,
    accountCurrency: form.accountCurrency,
    instrument: form.instrument,
    entry,
    stopLoss,
  } satisfies Omit<PositionSizeInput, 'riskPercent' | 'riskAmount'>;

  const parsedAmount = parseNum(form.riskAmount);
  const parsedPercent = parseNum(form.riskPercent);

  // Forward exactly one risk field, honoring which basis the user is driving.
  // When neither parses, omit both fields entirely — the package then returns
  // its canonical "Provide either riskPercent or riskAmount" error instead of
  // us smuggling a NaN sentinel through an optional field.
  if (form.riskBasis === 'amount' && parsedAmount !== null) {
    return { ...base, riskAmount: parsedAmount };
  }
  if (parsedPercent !== null) {
    return { ...base, riskPercent: parsedPercent };
  }
  return base;
}

/** Run the prop-firm constraint check (only in prop mode). */
function propWarnings(form: RiskForm, riskPercent: number): readonly Warning[] {
  if (form.mode !== 'prop') return [];
  const perTradeCap = parseNum(form.propPerTradeCap);
  const maxDailyDrawdown = parseNum(form.propMaxDaily);
  const maxOverallDrawdown = parseNum(form.propMaxOverall);
  const dailyLossUsed = parseNum(form.propDailyUsed) ?? 0;
  if (perTradeCap === null || maxDailyDrawdown === null || maxOverallDrawdown === null) {
    return [];
  }
  return propFirmCheck({
    riskPercent,
    dailyLossUsed,
    maxDailyDrawdown,
    maxOverallDrawdown,
    perTradeCap,
  });
}

/**
 * Compute the full result. Returns formatted rows + warnings, or an `error`
 * (with placeholder rows) when the trading package rejects the inputs.
 */
export function compute(form: RiskForm): RiskResult {
  const balance = parseNum(form.accountBalance);
  const entry = parseNum(form.entry);
  const stopLoss = parseNum(form.stopLoss);

  if (balance === null || entry === null || stopLoss === null) {
    return emptyResult(form, null);
  }

  const sizing = positionSize(toSizeInput(form, balance, entry, stopLoss));
  if (!sizing.ok) {
    return emptyResult(form, sizing.message);
  }

  const money = makeMoney(form.accountCurrency);
  const { lots, riskAmount, stopDistancePips, pipValue: pipVal, warnings } = sizing.value;

  // Reward + R:R require a take-profit; compute via riskReward when present.
  const takeProfit = parseNum(form.takeProfit);
  let rewardValue = PLACEHOLDER;
  let rrValue = 'Set a take profit';
  if (takeProfit !== null) {
    const rr = riskReward({ entry, stopLoss, takeProfit, direction: form.direction });
    if (rr.ok) {
      // Reward in account currency = R:R × risk amount (risk is 1R by definition).
      rewardValue = money(rr.value.rewardRisk * riskAmount);
      rrValue = `${num1.format(rr.value.rewardRisk)} : 1`;
    } else {
      rrValue = rr.message;
    }
  }

  // Independent pip-value sanity figure via the dedicated package function.
  const pip = pipValue(form.instrument, lots, form.accountCurrency);
  const pipValueText = pip.ok ? money(pip.value) : money(pipVal);

  const riskPercent = (riskAmount / balance) * 100;
  const allWarnings: readonly Warning[] = [...warnings, ...propWarnings(form, riskPercent)];

  const rows: ResultRow[] = [
    { label: 'Risk amount', value: money(riskAmount) },
    { label: 'Stop distance', value: `${num1.format(stopDistancePips)} pips` },
    { label: 'Potential reward', value: rewardValue, accent: true },
    { label: 'Reward : Risk', value: rrValue },
    { label: 'Pip value', value: pipValueText },
  ];

  return {
    headline: `${lots2.format(lots)} lots`,
    headlineCaption: `${form.instrument} · ${form.direction === 'long' ? 'Long' : 'Short'}`,
    rows,
    warnings: allWarnings,
    error: null,
  };
}
