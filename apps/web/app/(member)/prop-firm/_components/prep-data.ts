/**
 * Static content for the Prop Firm Prep path and evaluation-day checklist
 * (M13 / PROJECT.md §8.13). Pure data — kept out of the page so the RSC stays a
 * thin shell and the copy has a single source of truth.
 *
 * The copy is deliberately educational and process-focused. Nothing here claims
 * or implies that following the path guarantees passing an evaluation.
 */

/** The four-stage prep path: rulebook → routine → simulate → funded. */
export interface PrepStage {
  readonly id: string;
  readonly title: string;
  readonly detail: string;
  /** Where the stage's primary action sends the member. */
  readonly href: string;
  /** Label for that action. */
  readonly action: string;
}

export const PREP_STAGES: ReadonlyArray<PrepStage> = [
  {
    id: 'rulebook',
    title: 'Understand the rulebook',
    detail:
      'Daily loss, trailing drawdown, profit target and consistency rules — and how a single breach ends an evaluation.',
    href: '/academy',
    action: 'Study the rules',
  },
  {
    id: 'routine',
    title: 'Build a compliant routine',
    detail:
      'A pre-trade checklist and a position-sizing plan that respect your configured limits before you ever click buy.',
    href: '/risk-calculator',
    action: 'Open Risk Calculator',
  },
  {
    id: 'simulate',
    title: 'Simulate the evaluation',
    detail:
      'Run a mock evaluation in your journal at a strict 1% risk, then review what your own data says about your discipline.',
    href: '/journal/new',
    action: 'Log a practice trade',
  },
  {
    id: 'funded',
    title: 'Manage the funded phase',
    detail:
      'Scaling, payout cycles and protecting the account — the habits that keep a funded account alive, not just won.',
    href: '/academy',
    action: 'Review funded playbook',
  },
];

/** A single evaluation-day discipline item. */
export interface ChecklistItem {
  readonly id: string;
  readonly text: string;
}

/**
 * Evaluation-day checklist (PROJECT.md §8.13). Run before every session during
 * an evaluation. These are discipline rules, not a guarantee — clearing them
 * keeps you inside the limits you configured, nothing more.
 */
export const EVALUATION_CHECKLIST: ReadonlyArray<ChecklistItem> = [
  { id: 'risk', text: 'Risk per trade fixed at 1% or less of the account.' },
  { id: 'daily-stop', text: 'Daily loss limit set as a hard stop — trading ends if it is hit.' },
  { id: 'news', text: 'No trading through high-impact news releases.' },
  { id: 'plan', text: 'Trade plan written before the market opens.' },
  { id: 'journal', text: 'Journal updated after every single trade.' },
];
