import type { ReactNode } from 'react';
import { Badge } from '@fxunlock/ui';
import type { JournalSummary } from '../../journal/journal-stats';
import { profileLabel } from '@/lib/onboarding/labels';

/**
 * Dashboard cards (M18 / §18). Server components — each card is read-only and
 * rendered from server-personalized data (or a safe placeholder). Locked Pro
 * cards leak NO protected content (§18 🔒): they describe the feature's value
 * and link to upgrade, nothing more. No profit-guarantee or advice copy anywhere.
 *
 * Real cards (data-backed): Journal snapshot, Risk calculator quick-link,
 * Performance insight (Pro), Profile / account-size.
 * Placeholder cards (module pending): Continue learning, Today's focus,
 * Market news, Upcoming webinar.
 * Locked cards (Pro, Basic sees upgrade): AI tutor, Community pod, Performance.
 *
 * The live-prices card is a client island ({@link LivePrices}); everything here
 * is static server-rendered markup.
 */

interface CardShellProps {
  /** Bento column span class, e.g. "col-4". */
  span: string;
  className?: string;
  labelledBy: string;
  children: ReactNode;
}

/** Light surface card with a consistent header slot. */
function CardShell({ span, className = '', labelledBy, children }: CardShellProps) {
  return (
    <article className={`mod ${span} ${className}`} aria-labelledby={labelledBy}>
      {children}
    </article>
  );
}

// ── Real: Journal snapshot ─────────────────────────────────────────────────

/** Keys of the summary whose value is a displayable string (excludes `empty`). */
type SummaryStatKey = {
  [K in keyof JournalSummary]: JournalSummary[K] extends string ? K : never;
}[keyof JournalSummary];

const JOURNAL_STATS: ReadonlyArray<{ label: string; key: SummaryStatKey; tone?: string }> = [
  { label: 'This week', key: 'tradesThisWeek' },
  { label: 'Win rate', key: 'winRate', tone: 'text-pos' },
  { label: 'Avg R:R', key: 'avgRR' },
];

export function JournalSnapshotCard({ summary }: { summary: JournalSummary }) {
  return (
    <CardShell span="col-4" labelledBy="dash-jrnl-h">
      <div className="mod-head">
        <h3 id="dash-jrnl-h">Journal snapshot</h3>
        <a href="/journal" className="mod-link">
          View →
        </a>
      </div>

      {summary.empty ? (
        <p className="muted dash-card-empty">
          No trades logged yet. Your win rate and R:R appear here once you start journaling.
        </p>
      ) : (
        <div className="dash-mini">
          {JOURNAL_STATS.map((s) => (
            <div className="dash-stat" key={s.key}>
              <div className="dash-stat-l">{s.label}</div>
              <div className={`dash-stat-v ${s.tone ?? ''}`}>{summary[s.key]}</div>
            </div>
          ))}
        </div>
      )}

      <a href="/journal/new" className="btn btn-lime btn-sm btn-block dash-card-cta">
        Log new trade
      </a>
    </CardShell>
  );
}

// ── Real: Risk calculator quick-link ───────────────────────────────────────

/**
 * The risk calculator's starting default risk-per-trade. A safe educational
 * default until a saved per-user preference exists (the calculator lets the user
 * change it live). Kept as a named constant rather than a magic string.
 */
const DEFAULT_RISK_PERCENT = '1.0%';

export function RiskCalculatorCard({ accountSize }: { accountSize: string | null }) {
  const accountLabel = profileLabel.accountSize(accountSize);
  return (
    <CardShell span="col-4" labelledBy="dash-risk-h">
      <div className="mod-head">
        <h3 id="dash-risk-h">Risk calculator</h3>
      </div>
      <dl className="dash-kv">
        <div className="dash-kv-row">
          <dt>Account size</dt>
          <dd className="num">{accountLabel ?? 'Not set'}</dd>
        </div>
        <div className="dash-kv-row">
          <dt>Default risk</dt>
          <dd className="num">{DEFAULT_RISK_PERCENT}</dd>
        </div>
        <div className="dash-kv-row">
          <dt>Engine</dt>
          <dd className="num text-pos">Live</dd>
        </div>
      </dl>
      <a href="/risk-calculator" className="btn btn-ghost btn-sm btn-block dash-card-cta">
        Open calculator
      </a>
    </CardShell>
  );
}

// ── Real (Pro): Performance insight — links to /analytics ──────────────────

export function PerformanceInsightCard({ summary }: { summary: JournalSummary }) {
  return (
    <CardShell span="col-4" className="mod-dark dash-insight" labelledBy="dash-perf-h">
      <span className="dash-glow" aria-hidden="true" />
      <div className="mod-head">
        <h3 id="dash-perf-h" className="mod-title-on-dark">
          Performance insight
        </h3>
        <Badge tone="lime-dark">Pro</Badge>
      </div>
      {summary.empty ? (
        <p className="dash-insight-body">
          Close a few trades and your coaching breakdown — win rate by session, setup and day —
          opens here.
        </p>
      ) : (
        <p className="dash-insight-body">
          Your strongest pair so far is <strong>{summary.bestPair}</strong>. Net{' '}
          <strong>{summary.netR30d}</strong> over the last 30 days of logged trades.
        </p>
      )}
      <a href="/analytics" className="btn btn-glass btn-sm dash-card-cta">
        Review analytics →
      </a>
    </CardShell>
  );
}

// ── Placeholder: Continue learning (module 3 pending) ──────────────────────

export function ContinueLearningCard() {
  return (
    <CardShell span="col-7" labelledBy="dash-learn-h">
      <div className="mod-head">
        <h3 id="dash-learn-h">Continue learning</h3>
        <a href="/curriculum" className="mod-link">
          All courses →
        </a>
      </div>
      <div className="dash-soon">
        <span className="dash-soon-thumb" aria-hidden="true" />
        <div>
          <p className="dash-soon-title">Your learning path</p>
          <p className="muted dash-soon-sub">
            Lessons and progress tracking arrive with the lesson player. Browse the curriculum to
            see what&rsquo;s ahead.
          </p>
          <a href="/curriculum" className="btn btn-ghost btn-sm">
            Explore curriculum
          </a>
        </div>
      </div>
    </CardShell>
  );
}

// ── Placeholder: Today's focus (module 7 pending) ──────────────────────────

export function FocusCard() {
  return (
    <CardShell span="col-5" className="mod-soft" labelledBy="dash-focus-h">
      <div className="mod-head">
        <h3 id="dash-focus-h" className="mod-title-on-dark">
          Today&rsquo;s focus
        </h3>
        <span aria-hidden="true">✦</span>
      </div>
      <p className="dash-focus-body">
        Review yesterday&rsquo;s journal entries before placing any new trades. Confirm each setup
        matches your written plan.
      </p>
      <div className="row gap1 dash-card-cta">
        <a href="/journal" className="btn btn-glass btn-sm">
          Open journal
        </a>
      </div>
      <p className="dash-soon-tag">Personalized focus lands with the AI tutor.</p>
    </CardShell>
  );
}

// ── Placeholder: Market news (module 11 pending) ───────────────────────────

export function MarketNewsCard() {
  return (
    <CardShell span="col-7" labelledBy="dash-news-h">
      <div className="mod-head">
        <h3 id="dash-news-h">Market news</h3>
      </div>
      <div className="dash-unavailable" role="status">
        <span className="dash-unavailable-icon" aria-hidden="true" />
        <div>
          <p className="dash-unavailable-title">News feed unavailable</p>
          <p className="muted dash-unavailable-sub">
            Curated, impact-rated market headlines connect when the news provider goes live.
          </p>
        </div>
      </div>
    </CardShell>
  );
}

// ── Placeholder: Upcoming webinar (module 8 pending) ───────────────────────

export function WebinarCard({ locked }: { locked: boolean }) {
  if (locked) {
    return (
      <LockedCard
        span="col-4"
        labelledBy="dash-web-h"
        title="Weekly live webinars"
        body="Join weekly technical, fundamental and mindset sessions, with replays saved to your library."
      />
    );
  }
  return (
    <CardShell span="col-4" labelledBy="dash-web-h">
      <div className="mod-head">
        <h3 id="dash-web-h">Upcoming webinar</h3>
        <Badge tone="outline">Soon</Badge>
      </div>
      <div className="dash-unavailable" role="status">
        <span className="dash-unavailable-icon" aria-hidden="true" />
        <div>
          <p className="dash-unavailable-title">No webinar scheduled</p>
          <p className="muted dash-unavailable-sub">
            Live sessions and registration appear here once webinars go live.
          </p>
        </div>
      </div>
    </CardShell>
  );
}

// ── Locked Pro cards (Basic sees upgrade; leak no protected content) ───────

interface LockedCardProps {
  span: string;
  labelledBy: string;
  title: string;
  body: string;
}

/** Designed Pro-locked state — value + upgrade CTA only, no protected data. */
export function LockedCard({ span, labelledBy, title, body }: LockedCardProps) {
  return (
    <article className={`mod dash-locked ${span}`} aria-labelledby={labelledBy}>
      <div className="dash-locked-head">
        <span className="dash-lock-icon" aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
        </span>
        <h3 id={labelledBy}>{title}</h3>
        <Badge tone="lime-dark" className="dash-lock-badge">
          Pro
        </Badge>
      </div>
      <p className="muted dash-locked-body">{body}</p>
      <a href="/pricing" className="btn btn-forest btn-sm">
        Upgrade to Pro
      </a>
    </article>
  );
}

export function AiTutorCard({ locked }: { locked: boolean }) {
  if (locked) {
    return (
      <LockedCard
        span="col-7"
        labelledBy="dash-ai-h"
        title="AI Tutor"
        body="Ask course-aware questions, get quizzed, and find your next lesson. Included with Pro."
      />
    );
  }
  return (
    <CardShell span="col-7" labelledBy="dash-ai-h">
      <div className="mod-head">
        <h3 id="dash-ai-h">AI Tutor</h3>
        <Badge tone="lime">Course-aware</Badge>
      </div>
      <p className="muted dash-card-empty">Ask a question about your current lesson:</p>
      <div className="dash-chip-row">
        <a href="/ai-learning" className="dash-ai-chip">
          Explain liquidity
        </a>
        <a href="/ai-learning" className="dash-ai-chip">
          Quiz me on order types
        </a>
        <a href="/ai-learning" className="dash-ai-chip">
          What should I study next?
        </a>
      </div>
    </CardShell>
  );
}

export function CommunityPodCard({ locked }: { locked: boolean }) {
  if (locked) {
    return (
      <LockedCard
        span="col-5"
        labelledBy="dash-pod-h"
        title="Community & pods"
        body="Join an accountability pod of 6–10 traders with weekly goals and check-ins. Included with Pro."
      />
    );
  }
  return (
    <CardShell span="col-5" labelledBy="dash-pod-h">
      <div className="mod-head">
        <h3 id="dash-pod-h">Your pod</h3>
        <Badge tone="outline">Soon</Badge>
      </div>
      <p className="muted dash-card-empty">
        Accountability pods connect when the community module goes live.
      </p>
      <a href="/community" className="btn btn-ghost btn-sm btn-block dash-card-cta">
        Explore community
      </a>
    </CardShell>
  );
}
