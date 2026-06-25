import type { PropFirmInput, Warning } from './types.js';

/**
 * Prop-firm risk checks (PRD §8.7 Prop Firm Risk mode; §13 Prop Firm Prep).
 *
 * Prop evaluations impose hard constraints — a per-trade risk cap, a max daily
 * drawdown, and a max overall drawdown — and breaching any of them typically
 * fails the account. This function takes the user-configured constraints plus
 * how much loss is already used today/overall, and returns the list of
 * violations the planned trade would cause. An empty list means the trade is
 * within all configured limits.
 *
 * All figures are percents of account balance. Pure and total: it never throws;
 * an empty result is the "all clear" signal.
 */
export function propFirmCheck(input: PropFirmInput): readonly Warning[] {
  const {
    riskPercent,
    dailyLossUsed,
    maxDailyDrawdown,
    maxOverallDrawdown,
    perTradeCap,
    overallLossUsed = 0,
  } = input;

  const violations: Warning[] = [];

  // 1. Per-trade cap: the single trade risks more than allowed per trade.
  if (riskPercent > perTradeCap) {
    violations.push({
      code: 'prop_cap_violation',
      message: `Planned risk ${fmt(riskPercent)}% exceeds the per-trade cap of ${fmt(perTradeCap)}%.`,
    });
  }

  // 2. Daily drawdown: today's used loss + this trade's risk breaches the day limit.
  if (dailyLossUsed + riskPercent > maxDailyDrawdown) {
    violations.push({
      code: 'prop_daily_drawdown',
      message: `This trade would push daily loss to ${fmt(
        dailyLossUsed + riskPercent,
      )}%, over the ${fmt(maxDailyDrawdown)}% daily drawdown limit.`,
    });
  }

  // 3. Overall drawdown: cumulative used loss + this trade's risk breaches the max.
  if (overallLossUsed + riskPercent > maxOverallDrawdown) {
    violations.push({
      code: 'prop_overall_drawdown',
      message: `This trade would push overall loss to ${fmt(
        overallLossUsed + riskPercent,
      )}%, over the ${fmt(maxOverallDrawdown)}% overall drawdown limit.`,
    });
  }

  return Object.freeze(violations);
}

/** Trim trailing zeros from a percent for readable messages (2.50 → "2.5"). */
function fmt(percent: number): string {
  return Number(percent.toFixed(2)).toString();
}
