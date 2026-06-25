# @fxunlock/trading

Pure, deterministic forex/trading math — the calculation foundation shared by the **Risk Calculator** (M4 / PRD §8.7), the **Journal R‑multiple** (M5 / §8.8), and **Performance Analytics** (M6 / §8.9).

- **Pure** — no I/O, no network, no clock, no mutation. Every input maps to one output.
- **Total** — domain failures (unknown instrument, non‑positive stop, …) return a typed `Result` error instead of throwing or producing `NaN`.
- **Instrument‑aware** — pip size and contract size come from a typed registry, so JPY pairs, metals, and crypto are sized correctly, not just majors.
- **Dependency‑free** — no runtime dependencies; `vitest` only for tests.
- **Numerically consistent** with the existing client `PositionSizeCalculator` (a major's `$10/pip/standard‑lot`, the default example below matches to the cent).

## Result shape

Calculators that can fail at the domain level return a discriminated `Result<T>`:

```ts
import { positionSize } from '@fxunlock/trading';

const r = positionSize({
  accountBalance: 10_000,
  accountCurrency: 'USD',
  riskPercent: 1,
  instrument: 'EUR/USD',
  entry: 1.1,
  stopLoss: 1.097, // 30-pip stop
});

if (!r.ok) {
  // r.code: 'unknown_instrument' | 'invalid_stop' | ...
  console.error(r.message);
} else {
  // r.value.riskAmount === 100, r.value.lots ≈ 0.3333, r.value.units === 33_333
}
```

## Default example (canonical, verified in tests)

`balance 10000, USD, 1% risk, 30‑pip stop on a major (EUR/USD)`:

| Output             | Value                       |
| ------------------ | --------------------------- |
| `riskAmount`       | `$100`                      |
| `lots`             | `0.3333…` (`0.33` displayed)|
| `units`            | `33,333`                    |
| `stopDistancePips` | `30`                        |
| `pipValue`         | `$3.33`                     |
| `warnings`         | `[]`                        |

## Instrument model

| Class      | Example     | Pip size | Contract size | Pip value / std lot |
| ---------- | ----------- | -------- | ------------- | ------------------- |
| `fx_major` | `EUR/USD`   | `0.0001` | `100,000`     | `$10`               |
| `fx_jpy`   | `USD/JPY`   | `0.01`   | `100,000`     | `1,000` (quote ccy) |
| `metal`    | `XAU/USD`   | `0.01`   | `100` oz      | `$1`                |
| `crypto`   | `BTC/USD`   | `1`      | `1`           | `$1`                |

`lookupInstrument(symbol)` is **total** — an unknown symbol returns `{ ok: false, code: 'unknown_instrument' }`, never `undefined` or `NaN`.

> Pip value is denominated in the instrument's **quote currency**. The registered instruments are USD‑quoted, so for a USD account it is the dollar value directly. Cross‑currency conversion (e.g. a USD account trading `USD/JPY`, whose pip value is in JPY) needs a live FX rate and is intentionally **out of scope** for this pure package — callers convert the quote‑currency figure with a rate they supply.

## API

| Function                                                              | Purpose                                              |
| -------------------------------------------------------------------- | ---------------------------------------------------- |
| `positionSize(input)`                                                | Risk‑first lot/unit sizing + warnings.               |
| `pipValue(symbol, lots, accountCurrency)`                            | Pip value for a position (quote currency).           |
| `riskReward({ entry, stopLoss, takeProfit, direction })`            | Reward‑to‑risk ratio + distances.                    |
| `profitLoss({ instrument, direction, entry, exit, lots })`          | Signed P&L (quote currency).                         |
| `rMultiple({ entry, stopLoss, exit, direction })`                   | R‑multiple for the journal (sign‑correct).           |
| `propFirmCheck({ riskPercent, dailyLossUsed, maxDailyDrawdown, maxOverallDrawdown, perTradeCap })` | Prop‑evaluation rule violations. |

### Warnings (non‑blocking advisories — PRD §8.7)

- **Tight stop** — stop distance `< 10` pips.
- **High risk** — risk `> 2%` per trade.
- **Prop‑cap violations** — per‑trade cap, daily drawdown, overall drawdown.

Warnings never invalidate a result; surface them in the UI before save.

## Scripts

```bash
pnpm --filter @fxunlock/trading test          # run the suite
pnpm --filter @fxunlock/trading test:coverage # coverage (thresholds in vitest.config.ts)
pnpm --filter @fxunlock/trading typecheck     # tsc --noEmit
```

> Education only — this math is an estimate and excludes spread, slippage, swap, and commission. See the tool's disclaimer copy (PRD §8.7 acceptance criteria).
