import { describe, expect, it } from 'vitest';
import {
  collectWarnings,
  highRiskWarning,
  tightStopWarning,
} from './warnings';

describe('tightStopWarning', () => {
  it('warns below 10 pips', () => {
    expect(tightStopWarning(5)?.code).toBe('tight_stop');
  });

  it('does not warn at exactly 10 pips or above', () => {
    expect(tightStopWarning(10)).toBeNull();
    expect(tightStopWarning(30)).toBeNull();
  });

  it('does not warn for a zero/negative stop distance', () => {
    expect(tightStopWarning(0)).toBeNull();
    expect(tightStopWarning(-5)).toBeNull();
  });
});

describe('highRiskWarning', () => {
  it('warns above 2%', () => {
    expect(highRiskWarning(2.5)?.code).toBe('high_risk');
  });

  it('does not warn at exactly 2% or below', () => {
    expect(highRiskWarning(2)).toBeNull();
    expect(highRiskWarning(1)).toBeNull();
  });
});

describe('collectWarnings', () => {
  it('filters out nulls and is immutable', () => {
    const result = collectWarnings([tightStopWarning(5), null, highRiskWarning(3)]);
    expect(result.map((w) => w.code)).toEqual(['tight_stop', 'high_risk']);
    expect(Object.isFrozen(result)).toBe(true);
  });

  it('returns an empty array when no warnings apply', () => {
    expect(collectWarnings([null, null])).toHaveLength(0);
  });
});
