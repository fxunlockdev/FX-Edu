'use client';

import { useId, useMemo, useState } from 'react';
import { Badge, Button } from '@fxunlock/ui';

/**
 * Free, deterministic Position Size calculator. Client-only leaf — the only
 * interactive island on an otherwise server-rendered page (PROJECT.md §9).
 *
 * Math is intentionally simple and transparent (no network, no market data):
 *   riskAmount = balance × risk%
 *   lots       = riskAmount / (stopPips × pipValuePerLot)
 * where pipValuePerLot is the standard $10/pip for a USD-quoted standard lot.
 * This is an estimate for education only — see the disclaimer beneath the tool.
 */

/** $/pip for one standard lot of a USD-quoted pair (e.g. EUR/USD). */
const PIP_VALUE_PER_STD_LOT = 10;
const UNITS_PER_STD_LOT = 100_000;

interface Sizing {
  riskAmount: number;
  lots: number;
  units: number;
  /** Risk % exceeds the prudent 2% ceiling. */
  riskTooHigh: boolean;
  /** Stop is tight enough that small mis-fills meaningfully distort sizing. */
  stopTooTight: boolean;
}

function toNumber(raw: string): number {
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function computeSizing(balance: number, riskPct: number, stopPips: number): Sizing {
  const riskAmount = (balance * riskPct) / 100;
  const lots = stopPips > 0 ? riskAmount / (stopPips * PIP_VALUE_PER_STD_LOT) : 0;
  return {
    riskAmount,
    lots,
    units: Math.round(lots * UNITS_PER_STD_LOT),
    riskTooHigh: riskPct > 2,
    stopTooTight: stopPips > 0 && stopPips < 10,
  };
}

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});
const units = new Intl.NumberFormat('en-US');

export function PositionSizeCalculator() {
  const [balance, setBalance] = useState('10000');
  const [risk, setRisk] = useState('1');
  const [pips, setPips] = useState('30');

  const sizing = useMemo(
    () => computeSizing(toNumber(balance), toNumber(risk), toNumber(pips)),
    [balance, risk, pips],
  );

  const baseId = useId();
  const balId = `${baseId}-bal`;
  const riskId = `${baseId}-risk`;
  const pipsId = `${baseId}-pips`;
  const warnId = `${baseId}-warn`;
  const warning = sizing.riskTooHigh
    ? 'Risking more than 2% per trade is aggressive — a short losing streak can erode your account fast.'
    : sizing.stopTooTight
      ? 'A very tight stop magnifies size: slippage or spread can blow past it before your plan plays out.'
      : null;

  return (
    <div className="calc floaty">
      <Badge tone="lime-dark">Position size calculator</Badge>
      <h2
        style={{ color: '#fff', fontSize: 17, fontWeight: 700, margin: '14px 0 16px' }}
      >
        Risk-first sizing
      </h2>

      <div className="field" style={{ marginBottom: 12 }}>
        <label htmlFor={balId} style={{ color: 'var(--d-ink-var)' }}>
          Account balance ($)
        </label>
        <input
          id={balId}
          className="input input-dark"
          inputMode="decimal"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
        />
      </div>

      <div className="row gap2" style={{ marginBottom: 18, alignItems: 'flex-end' }}>
        <div className="field" style={{ flex: 1 }}>
          <label htmlFor={riskId} style={{ color: 'var(--d-ink-var)' }}>
            Risk %
          </label>
          <input
            id={riskId}
            className="input input-dark"
            inputMode="decimal"
            value={risk}
            onChange={(e) => setRisk(e.target.value)}
            aria-describedby={sizing.riskTooHigh ? warnId : undefined}
          />
        </div>
        <div className="field" style={{ flex: 1 }}>
          <label htmlFor={pipsId} style={{ color: 'var(--d-ink-var)' }}>
            Stop (pips)
          </label>
          <input
            id={pipsId}
            className="input input-dark"
            inputMode="decimal"
            value={pips}
            onChange={(e) => setPips(e.target.value)}
            aria-describedby={sizing.stopTooTight ? warnId : undefined}
          />
        </div>
      </div>

      <div className="calc-row">
        <span style={{ color: 'var(--d-ink-var)' }}>Risk amount</span>
        <b style={{ color: '#fff' }}>{usd.format(sizing.riskAmount)}</b>
      </div>
      <div className="calc-row">
        <span style={{ color: 'var(--d-ink-var)' }}>Position size</span>
        <b style={{ color: 'var(--lime)' }}>{sizing.lots.toFixed(2)} lots</b>
      </div>
      <div className="calc-row">
        <span style={{ color: 'var(--d-ink-var)' }}>Units</span>
        <b style={{ color: '#fff' }}>{units.format(sizing.units)}</b>
      </div>

      {warning && (
        <p id={warnId} role="alert" className="calc-warn">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            <path d="M12 9v4M12 17h.01" />
          </svg>
          <span>{warning}</span>
        </p>
      )}

      <Button
        href="/checkout?plan=pro"
        variant="lime"
        block
        style={{ marginTop: 18 }}
      >
        Unlock the full toolkit
      </Button>
    </div>
  );
}
