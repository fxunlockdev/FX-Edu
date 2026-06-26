/**
 * Strategy Library dataset (M10 / PRD §10).
 *
 * Six documented, rule-based playbooks. Each teaches a *repeatable process* — a
 * way of reading and reacting to structure — not a promise of profit and not a
 * signal to act. Copy is deliberately educational: it describes how a setup is
 * defined, what confirms it, and crucially what invalidates it.
 *
 * Slugs drive the detail route `/strategies/[slug]`. Access mirrors PRD §5: two
 * foundational playbooks are open to every plan; the smart-money / advanced
 * playbooks are Pro-gated and render locked for Basic (the real gate is
 * server-side — see strategies-types `isLocked`/`resolvePlan`).
 */

import type { Strategy } from './strategies-types';

export const STRATEGIES: readonly Strategy[] = Object.freeze([
  {
    slug: 'breakout-retest',
    name: 'Breakout Retest',
    category: 'Technical',
    difficulty: 'Intermediate',
    lessons: 5,
    summary:
      'Enter on the retest of a broken level with confirmation. A patient, structure-based approach.',
    access: 'basic',
    bannerIndex: 0,
    body: {
      concept:
        'A breakout retest waits for price to break a well-tested level, then return to that level before continuing. The idea is to favor confirmation over prediction: rather than entering the break itself, the process asks the market to come back and demonstrate the old resistance now behaves as support (or vice versa). It is a study of how broken structure changes role.',
      rules: [
        'Identify a level tested at least twice that price has clearly broken and closed beyond on the working timeframe.',
        'Wait for price to return toward the broken level — do not anticipate the retest before the break is confirmed.',
        'Look for a reaction at the retest (rejection wick, lower-timeframe structure shift, momentum slowing) before considering the setup valid.',
        'Define the invalidation point on the far side of the level before doing anything else.',
        'Let the trade play out against pre-defined invalidation and objective; avoid managing on emotion.',
      ],
      setupCriteria: [
        'A clean, multi-touch level (horizontal or trendline) with an unambiguous break.',
        'A close beyond the level, not just an intrabar spike.',
        'Price returning to the level with reduced momentum rather than accelerating through it.',
        'A visible reaction (rejection / structure) at the retest zone.',
      ],
      invalidation: [
        'Price closes back through the broken level, signaling the break failed.',
        'The retest arrives with strong momentum and slices through without reaction.',
        'No reaction forms within a reasonable window — the thesis is simply not present.',
      ],
      riskNotes: [
        'Place invalidation where the idea is genuinely wrong, then size the position to that distance — never the reverse.',
        'A wide retest zone means a wider invalidation; respect that the level dictates risk, not your target.',
        'Skipping a setup because the reaction never confirmed is a correct outcome, not a missed trade.',
      ],
      examples: [
        {
          title: 'Range high break and retest',
          walkthrough:
            'A pair ranges under a level touched three times, then closes above it. Price drifts back to the old high, prints a rejection on the lower timeframe, and the invalidation sits just beneath the level. The process is followed mechanically against that line.',
        },
        {
          title: 'Failed break (the teaching case)',
          walkthrough:
            'The same break occurs but the retest closes back inside the range. Because the rule says a close back through invalidates, the setup is discarded — illustrating that not taking a trade is part of the playbook.',
        },
      ],
      relatedLessons: [
        { label: 'Support & resistance as zones', tier: 'Beginner' },
        { label: 'Reading momentum into a level', tier: 'Intermediate' },
        { label: 'Anatomy of a failed breakout', tier: 'Intermediate' },
      ],
      checklist: [
        {
          prompt: 'Is the broken level tested at least twice?',
          detail: 'A single touch is not a level. Multi-touch structure is the foundation of the setup.',
        },
        {
          prompt: 'Did price close beyond the level, not just wick through?',
          detail: 'A close is the confirmation; an intrabar spike is noise.',
        },
        {
          prompt: 'Is invalidation defined before entry?',
          detail: 'If you cannot state where the idea is wrong, the setup is not ready.',
        },
      ],
    },
  },
  {
    slug: 'liquidity-sweep-reversal',
    name: 'Liquidity Sweep Reversal',
    category: 'Smart Money',
    difficulty: 'Advanced',
    lessons: 7,
    summary:
      'Identify stop pools, wait for the sweep, trade the reclaim. Context-heavy and rules-driven.',
    access: 'pro',
    bannerIndex: 1,
    body: {
      concept:
        'A liquidity sweep reversal studies the tendency of price to reach beyond obvious highs or lows where resting stop orders cluster, then reverse. The process is not about predicting the sweep — it is about recognizing one after it happens and waiting for price to reclaim the swept level as evidence the move was a flush rather than a genuine breakout. It is context-heavy and demands patience.',
      rules: [
        'Map clear pools of liquidity — equal highs/lows and obvious swing points where stops likely rest.',
        'Wait for price to sweep beyond that pool and then fail to hold the extension.',
        'Require a reclaim of the swept level plus a lower-timeframe structure shift before the setup is valid.',
        'Anchor invalidation beyond the sweep extreme, where a true continuation would prove the reversal wrong.',
        'Treat any setup without a reclaim as no setup — the sweep alone is insufficient.',
      ],
      setupCriteria: [
        'A well-defined liquidity pool (equal highs/lows or a prominent swing).',
        'A decisive sweep beyond the pool followed by rejection.',
        'A reclaim of the level and a shift in lower-timeframe structure.',
        'Alignment with higher-timeframe context rather than fighting a strong trend blindly.',
      ],
      invalidation: [
        'Price holds beyond the swept level and continues — the sweep was a real breakout.',
        'No reclaim occurs after the sweep; the structure shift never forms.',
        'Higher-timeframe momentum overwhelms the reversal thesis.',
      ],
      riskNotes: [
        'Invalidation beyond the sweep extreme can be wide — accept that this defines a smaller position, not a tighter stop.',
        'This is a high-context process; trading it without higher-timeframe alignment is a common discipline failure.',
        'Sweeps that never reclaim are the most important "do nothing" lesson in the playbook.',
      ],
      examples: [
        {
          title: 'Equal-highs sweep and reclaim',
          walkthrough:
            'Two equal highs leave obvious resting liquidity. Price pushes just above, rejects, then reclaims back below the highs with a lower-timeframe break of structure. Invalidation sits above the sweep wick.',
        },
        {
          title: 'Sweep with no reclaim (discarded)',
          walkthrough:
            'Price sweeps the highs but holds above and continues. With no reclaim, the rules say there is no setup — the trader stands aside despite the tempting sweep.',
        },
      ],
      relatedLessons: [
        { label: 'What liquidity means in practice', tier: 'Intermediate' },
        { label: 'Reading break-of-structure on lower timeframes', tier: 'Advanced' },
        { label: 'Higher-timeframe context first', tier: 'Advanced' },
      ],
      checklist: [
        {
          prompt: 'Is there a clear liquidity pool being targeted?',
          detail: 'Equal highs/lows or a prominent swing — vague structure produces vague setups.',
        },
        {
          prompt: 'Did price reclaim the swept level?',
          detail: 'The reclaim, not the sweep, is the trigger. No reclaim, no setup.',
        },
        {
          prompt: 'Does the idea align with higher-timeframe context?',
          detail: 'Reversals against strong momentum need extra scrutiny.',
        },
      ],
    },
  },
  {
    slug: 'trend-pullback',
    name: 'Trend Pullback',
    category: 'Trend',
    difficulty: 'Beginner',
    lessons: 4,
    summary:
      'Trade with the higher-timeframe trend on controlled pullbacks to dynamic support.',
    access: 'pro',
    bannerIndex: 2,
    body: {
      concept:
        'A trend pullback is the most foundational trend-following process: in an established higher-timeframe trend, price rarely moves in a straight line. The playbook waits for a controlled retracement to a dynamic support area (a moving average, prior structure, or trendline) and looks to participate in the direction the market is already moving, rather than calling tops and bottoms.',
      rules: [
        'Confirm a clear higher-timeframe trend through a sequence of higher highs/lows (or the inverse).',
        'Wait for a controlled pullback toward a defined dynamic-support area — not a violent reversal.',
        'Require a sign the pullback is ending (reaction at support, momentum returning) before the setup is valid.',
        'Set invalidation beyond the support area, where the trend structure would break.',
        'Trade only in the direction of the established trend; do not invert the playbook to fade it.',
      ],
      setupCriteria: [
        'An unambiguous trend on the higher timeframe.',
        'A measured pullback to dynamic support, not a deep structural breakdown.',
        'A reaction at support suggesting the trend is resuming.',
        'Defined invalidation beyond the support area.',
      ],
      invalidation: [
        'Price breaks the trend structure (e.g., a lower low in an uptrend).',
        'The pullback turns into a sustained reversal rather than a pause.',
        'Support gives way with momentum and no reaction.',
      ],
      riskNotes: [
        'The trend is context, not a guarantee — every pullback can be the one that fails.',
        'Chasing extended moves away from support inflates risk; the playbook prefers the pullback for a reason.',
        'Position size is set by the distance to invalidation, never by conviction in the trend.',
      ],
      examples: [
        {
          title: 'Pullback to a rising average',
          walkthrough:
            'An uptrend pulls back to a rising moving average that has acted as support, prints a reaction, and resumes. Invalidation sits below the recent higher low.',
        },
        {
          title: 'Pullback that becomes a reversal',
          walkthrough:
            'A pullback deepens, prints a lower low, and breaks structure. The rule against trading once structure breaks keeps the trader out of a failing trend.',
        },
      ],
      relatedLessons: [
        { label: 'Identifying a trend objectively', tier: 'Beginner' },
        { label: 'Dynamic vs static support', tier: 'Beginner' },
        { label: 'When a pullback becomes a reversal', tier: 'Intermediate' },
      ],
      checklist: [
        {
          prompt: 'Is the higher-timeframe trend unambiguous?',
          detail: 'A questionable trend produces low-quality pullbacks. Demand clarity.',
        },
        {
          prompt: 'Is the pullback controlled, not violent?',
          detail: 'A measured retracement is the setup; a sharp reversal is a warning.',
        },
        {
          prompt: 'Is invalidation set beyond trend structure?',
          detail: 'The trade is wrong when the trend structure breaks — mark that line first.',
        },
      ],
    },
  },
  {
    slug: 'range-rotation',
    name: 'Range Rotation',
    category: 'Range',
    difficulty: 'Intermediate',
    lessons: 5,
    summary:
      'Fade range extremes with clear invalidation when the market lacks direction.',
    access: 'basic',
    bannerIndex: 3,
    body: {
      concept:
        'Range rotation is the counterpart to trend following: when a market lacks direction and oscillates between a defined ceiling and floor, the process looks to fade the extremes back toward the middle. It depends entirely on correctly identifying that a range exists — the playbook is explicit that the single biggest risk is applying it while a trend is actually forming.',
      rules: [
        'Confirm a range: at least two reactions at a ceiling and two at a floor with no clear directional bias.',
        'Wait for price to reach a range extreme and show rejection rather than acceptance.',
        'Require a reaction at the extreme (rejection wick, stalling momentum) before the setup is valid.',
        'Anchor invalidation just beyond the range boundary, where a breakout would negate the range thesis.',
        'Abandon the playbook the moment a clean range breakout occurs — do not fade a breakout.',
      ],
      setupCriteria: [
        'A clearly defined range with repeated reactions at both boundaries.',
        'Price arriving at an extreme with weakening momentum.',
        'A visible rejection at the boundary.',
        'Invalidation set just beyond the boundary.',
      ],
      invalidation: [
        'Price closes decisively beyond the range boundary — the range is breaking.',
        'The boundary is reached with strong momentum and no rejection.',
        'Successive touches penetrate deeper, signaling the range is failing.',
      ],
      riskNotes: [
        'The fatal error is fading a breakout — once the boundary breaks cleanly, the range is gone.',
        'Tight invalidation just beyond the boundary keeps a false range from becoming a large loss.',
        'Ranges eventually break; treat every rotation as provisional, never permanent.',
      ],
      examples: [
        {
          title: 'Rejection at the range high',
          walkthrough:
            'Price reaches a ceiling touched twice before, stalls, and prints a rejection. Invalidation sits just above the ceiling; the objective is rotation back toward the range middle.',
        },
        {
          title: 'Range break (discarded)',
          walkthrough:
            'Price reaches the ceiling but closes above it on momentum. The rule against fading a breakout removes the setup entirely — a key discipline lesson.',
        },
      ],
      relatedLessons: [
        { label: 'Identifying a range vs a trend', tier: 'Beginner' },
        { label: 'Reading rejection at boundaries', tier: 'Intermediate' },
        { label: 'Why ranges break', tier: 'Intermediate' },
      ],
      checklist: [
        {
          prompt: 'Is the range confirmed by multiple reactions at both edges?',
          detail: 'One touch is not a boundary. Demand repeated reactions before fading anything.',
        },
        {
          prompt: 'Is price rejecting the extreme, not accepting it?',
          detail: 'Acceptance beyond the edge is the first sign the range is breaking.',
        },
        {
          prompt: 'Will you stand aside on a clean breakout?',
          detail: 'Fading a breakout is the playbook’s defining mistake. Pre-commit to skipping it.',
        },
      ],
    },
  },
  {
    slug: 'session-open-drive',
    name: 'Session Open Drive',
    category: 'Technical',
    difficulty: 'Advanced',
    lessons: 6,
    summary:
      'Use London / New York opens and session structure for momentum entries.',
    access: 'pro',
    bannerIndex: 0,
    body: {
      concept:
        'A session open drive studies how liquidity and volatility concentrate around major session opens — particularly London and New York. The process uses the structure built during a session (its range, its initial direction) as a framework for momentum, treating the open as a recurring event with characteristic behavior rather than a moment to react impulsively.',
      rules: [
        'Mark the relevant session open and the range established into it.',
        'Wait for the session to declare a direction through a clean break of that early structure.',
        'Require the drive to align with higher-timeframe context before treating it as valid.',
        'Set invalidation back inside the session range, where the drive thesis would be wrong.',
        'Respect that not every session drives — a directionless open is a no-trade session.',
      ],
      setupCriteria: [
        'A clearly marked session open and pre-open range.',
        'A decisive break of session structure in one direction.',
        'Alignment with the broader higher-timeframe picture.',
        'Invalidation defined inside the session range.',
      ],
      invalidation: [
        'Price re-enters the session range and the drive stalls.',
        'The session chops sideways with no clear direction.',
        'The drive fights strong opposing higher-timeframe momentum.',
      ],
      riskNotes: [
        'Session opens are volatile; wider invalidation is the norm and dictates a smaller position.',
        'Forcing a drive out of a directionless session is a discipline failure, not bad luck.',
        'Time-based context matters: the same chart behaves differently at the open than mid-session.',
      ],
      examples: [
        {
          title: 'London open continuation',
          walkthrough:
            'A pre-London range forms; the open breaks it in the direction of the higher-timeframe trend and drives. Invalidation sits back inside the range.',
        },
        {
          title: 'Directionless open (discarded)',
          walkthrough:
            'The session opens and chops within its range without committing. With no clean break, the rules produce no setup — the trader waits for the next session.',
        },
      ],
      relatedLessons: [
        { label: 'How sessions shape volatility', tier: 'Intermediate' },
        { label: 'Reading the open range', tier: 'Advanced' },
        { label: 'Aligning session drives with the trend', tier: 'Advanced' },
      ],
      checklist: [
        {
          prompt: 'Is the session open and its range clearly marked?',
          detail: 'The framework is the session structure. Without it, there is nothing to break.',
        },
        {
          prompt: 'Has the session declared a clean direction?',
          detail: 'A break of session structure is the trigger; chop is not.',
        },
        {
          prompt: 'Does the drive align with higher-timeframe context?',
          detail: 'Drives against strong momentum deserve extra caution or a pass.',
        },
      ],
    },
  },
  {
    slug: 'fair-value-gap-fill',
    name: 'Fair Value Gap Fill',
    category: 'Smart Money',
    difficulty: 'Advanced',
    lessons: 6,
    summary:
      'Map imbalances and trade their mitigation with strict invalidation.',
    access: 'pro',
    bannerIndex: 1,
    body: {
      concept:
        'A fair value gap (FVG) is an imbalance left when price moves so quickly that it leaves an inefficiency — a zone passed through without two-sided trade. This playbook studies the tendency of price to revisit and "fill" such gaps before continuing. It is a precise, rules-driven process built on correctly identifying the imbalance and demanding strict invalidation.',
      rules: [
        'Identify a genuine three-candle imbalance where the gap is left unfilled.',
        'Mark the gap zone and wait for price to return to mitigate it.',
        'Require a reaction inside or at the gap (rejection, structure shift) before the setup is valid.',
        'Anchor invalidation on the far side of the gap, where the imbalance thesis fails.',
        'Treat a gap that fills and continues straight through with no reaction as no setup.',
      ],
      setupCriteria: [
        'A clean, well-defined imbalance from a fast move.',
        'Price returning to mitigate the gap rather than running away from it.',
        'A reaction at the gap consistent with the expected direction.',
        'Invalidation set on the far side of the gap.',
      ],
      invalidation: [
        'Price passes fully through the gap and continues with no reaction.',
        'The gap fills and structure breaks against the expected direction.',
        'No mitigation occurs within a reasonable window.',
      ],
      riskNotes: [
        'Precision matters: a sloppily marked gap produces a sloppily placed invalidation.',
        'Gaps can fully fill before reacting — the far side of the gap is the honest invalidation line.',
        'A gap that simply gets consumed is information, not a missed trade.',
      ],
      examples: [
        {
          title: 'Mitigated gap with reaction',
          walkthrough:
            'A fast move leaves a clean gap. Price returns, taps the gap, prints a rejection, and resumes. Invalidation sits on the far side of the imbalance.',
        },
        {
          title: 'Gap consumed (discarded)',
          walkthrough:
            'Price returns and passes straight through the gap without reaction, then breaks structure. The rules produce no setup, illustrating that not every gap reacts.',
        },
      ],
      relatedLessons: [
        { label: 'What an imbalance is', tier: 'Intermediate' },
        { label: 'Marking gaps precisely', tier: 'Advanced' },
        { label: 'Mitigation vs continuation', tier: 'Advanced' },
      ],
      checklist: [
        {
          prompt: 'Is the imbalance a genuine, clean gap?',
          detail: 'A vaguely marked gap leads to a vaguely placed invalidation. Be precise.',
        },
        {
          prompt: 'Did price react at the gap rather than pass through?',
          detail: 'The reaction is the trigger. A clean pass-through is no setup.',
        },
        {
          prompt: 'Is invalidation on the far side of the gap?',
          detail: 'The imbalance thesis fails once price clears the gap entirely.',
        },
      ],
    },
  },
]);

/** Lookup a strategy by its slug. Returns `undefined` for unknown slugs. */
export function getStrategyBySlug(slug: string): Strategy | undefined {
  return STRATEGIES.find((s) => s.slug === slug);
}

/** Every slug — used to statically generate the detail routes. */
export function allStrategySlugs(): readonly string[] {
  return STRATEGIES.map((s) => s.slug);
}
