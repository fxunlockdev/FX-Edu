import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Logo, Badge, Disclaimer } from '@fxunlock/ui';
import { createClient } from '@/lib/supabase/server';
import { SignOutButton } from '../_components/SignOutButton';
import { TRADE_SELECT_COLUMNS, type TradeRow } from '../journal/trade-fields';
import {
  computeReadiness,
  deriveSampleTrade,
  PREP_STAGES,
  EVALUATION_CHECKLIST,
  ConstraintsConfig,
  UpgradeLock,
  type Readiness,
  type ReadinessSignal,
} from './_components';
import './prop-firm.css';

export const metadata: Metadata = {
  title: 'Prop Firm Prep',
  robots: { index: false, follow: false },
};

/**
 * Derive whether the caller is on the Pro plan. No subscription/entitlement
 * data is wired at runtime yet, so we DEFENSIVELY default everyone to Basic and
 * render the designed "Upgrade to Pro" locked state. Returning a real `boolean`
 * (not a literal) keeps the Pro branch type-reachable so it compiles unchanged
 * once the flag is fed by the entitlements API.
 *
 * @param _userId reserved — the entitlements lookup will key on it.
 */
function derivePlanIsPro(_userId: string | undefined): boolean {
  // TODO: read plan from /entitlements once the API is runtime-wired
  return false;
}

/**
 * Prop Firm Prep (RSC) — Pro-gated, PROJECT.md §8.13 / §9 module 13.
 *
 * Auth is already guaranteed by the `(member)` layout. The entitlement (plan)
 * gate is enforced HERE, server-side, before any trade query runs — UI locks
 * are only hints (§6.1). Plan derivation is defensive (Basic until wired).
 *
 * Pro path: read the caller's trades through the RLS-scoped server client (a
 * user only ever sees their own rows), compute a pure readiness read and derive
 * a sample trade for the live constraint check. Degrades gracefully to a
 * neutral empty read if the `trades` table is not deployed yet.
 *
 * This module NEVER claims to guarantee passing an evaluation: the readiness
 * score is a behavioral discipline read, and the constraints are values the
 * user configures to model a firm — not official firm data. Both are stated
 * plainly in the UI and in the risk disclaimer.
 */
export default async function PropFirmPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Entitlement gate (server-side). Defaults to Basic until wired. ──────
  const isPro = derivePlanIsPro(user?.id);

  if (!isPro) {
    return (
      <Shell isPro={false}>
        <div className="pf-head">
          <div>
            <h1 className="h-md">Prop Firm Prep</h1>
            <p className="muted">A disciplined path to a funded-account evaluation.</p>
          </div>
        </div>
        <UpgradeLock />
        <Disclaimer kind="risk" variant="note" style={{ marginTop: 28 }} />
      </Shell>
    );
  }

  // ── Pro path: RLS-scoped trade read (most-recent first). ────────────────
  let rows: TradeRow[] = [];
  let tableMissing = false;

  if (user) {
    const { data, error } = await supabase
      .from('trades')
      .select(TRADE_SELECT_COLUMNS)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      // Undeployed table / RLS bring-up → degrade to a neutral read.
      tableMissing = true;
    } else {
      rows = (data as TradeRow[] | null) ?? [];
    }
  }

  const readiness = computeReadiness(rows);
  const sample = deriveSampleTrade(rows);

  return (
    <Shell isPro>
      <div className="pf-head">
        <div>
          <h1 className="h-md">Prop Firm Prep</h1>
          <p className="muted">
            Most evaluations are lost to risk violations, not bad analysis. This track drills the
            discipline that keeps you inside the limits — it cannot and does not guarantee a pass.
          </p>
        </div>
      </div>

      <ReadinessHero readiness={readiness} tableMissing={tableMissing} />

      <section aria-labelledby="pf-path-h">
        <h2 id="pf-path-h" className="pf-section-h">
          Your prep path
        </h2>
        <ol className="pf-steps">
          {PREP_STAGES.map((stage, i) => (
            <li className="pf-step" key={stage.id}>
              <span className="pf-step-num" aria-hidden="true">
                {i + 1}
              </span>
              <div className="pf-step-body">
                <h3>{stage.title}</h3>
                <p className="muted">{stage.detail}</p>
              </div>
              <a className="btn btn-ghost btn-sm" href={stage.href}>
                {stage.action}
              </a>
            </li>
          ))}
        </ol>
      </section>

      <section className="card card-pad pf-block" aria-labelledby="pf-config-h">
        <div className="pf-block-head">
          <h2 id="pf-config-h" className="pf-section-h">
            Your evaluation constraints
          </h2>
          <p className="muted">
            Enter the rules of the firm you are preparing for. We check a trade against them with the
            same engine as the{' '}
            <a className="pf-link" href="/risk-calculator">
              Risk Calculator (prop-firm mode)
            </a>
            . These figures are unofficial and user-configured.
          </p>
        </div>
        <ConstraintsConfig sample={sample} />
      </section>

      <section className="card card-pad pf-block" aria-labelledby="pf-checklist-h">
        <h2 id="pf-checklist-h" className="pf-section-h">
          Evaluation-day checklist
        </h2>
        <p className="muted pf-checklist-lead">
          Run this before every session during your evaluation. Clearing it keeps you inside the
          limits you configured — it is not a guarantee of passing.
        </p>
        <ul className="pf-checklist">
          {EVALUATION_CHECKLIST.map((item) => (
            <li className="pf-check-item" key={item.id}>
              <span className="pf-check-tick" aria-hidden="true">
                ✓
              </span>
              {item.text}
            </li>
          ))}
        </ul>
        <div className="pf-checklist-links">
          <a className="btn btn-ghost btn-sm" href="/journal">
            Open trade journal
          </a>
          <a className="btn btn-ghost btn-sm" href="/risk-calculator">
            Size a trade
          </a>
        </div>
      </section>

      <Disclaimer kind="risk" variant="note" style={{ marginTop: 28 }} />
    </Shell>
  );
}

function Shell({ isPro, children }: { isPro: boolean; children: ReactNode }) {
  return (
    <div className="pf">
      <header className="pf-top">
        <a href="/" aria-label="FX Academy home">
          <Logo variant="dark" size={26} />
        </a>
        <div className="row gap2" style={{ alignItems: 'center' }}>
          <Badge tone={isPro ? 'lime-dark' : 'outline'}>{isPro ? 'Pro' : 'Basic'}</Badge>
          <SignOutButton />
        </div>
      </header>
      <main className="pf-main" id="main">
        {children}
      </main>
    </div>
  );
}

function ReadinessHero({
  readiness,
  tableMissing,
}: {
  readiness: Readiness;
  tableMissing: boolean;
}) {
  return (
    <section className="pf-hero" aria-labelledby="pf-hero-h">
      <span className="pf-hero-glow" aria-hidden="true" />
      <div className="pf-hero-copy">
        <Badge tone="lime-dark">Funded account track</Badge>
        <h2 id="pf-hero-h">Master the rules, not the target.</h2>
        <p>
          Your readiness read below is derived only from the discipline in your own journal. It is a
          behavioral signal to coach your habits — never a prediction or guarantee of passing an
          evaluation.
        </p>
      </div>

      <div className="pf-score" role="group" aria-label="Readiness score">
        {readiness.empty ? (
          <>
            <div className="pf-score-empty-label">Readiness</div>
            <div className="pf-score-empty">
              {tableMissing ? 'Setting up' : 'Not enough trades yet'}
            </div>
            <p className="pf-score-empty-hint">
              {tableMissing
                ? 'Journaling is being provisioned. Your readiness read appears once trades are saved.'
                : `Log at least 5 decided trades to see a readiness read (${readiness.tradesConsidered} so far).`}
            </p>
          </>
        ) : (
          <>
            <div className="pf-score-label">Your readiness</div>
            <div className="pf-score-value">
              {readiness.score}
              <span className="pf-score-pct">%</span>
              <span className="pf-score-band">{readiness.band}</span>
            </div>
            <div className="pf-bar" aria-hidden="true">
              <i style={{ width: `${readiness.score}%` }} />
            </div>
            <p className="pf-score-summary">{readiness.summary}</p>
          </>
        )}
      </div>

      {!readiness.empty && (
        <ul className="pf-signals">
          {readiness.signals.map((signal) => (
            <SignalRow key={signal.id} signal={signal} />
          ))}
        </ul>
      )}
    </section>
  );
}

function SignalRow({ signal }: { signal: ReadinessSignal }) {
  return (
    <li className="pf-signal">
      <div className="pf-signal-top">
        <span className="pf-signal-label">{signal.label}</span>
        <span className="pf-signal-score">{signal.score}</span>
      </div>
      <div className="pf-signal-bar" aria-hidden="true">
        <i style={{ width: `${signal.score}%` }} />
      </div>
      <p className="pf-signal-detail muted">{signal.detail}</p>
    </li>
  );
}
