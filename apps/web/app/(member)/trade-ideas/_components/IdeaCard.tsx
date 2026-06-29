import { Badge } from '@fxunlock/ui';
import { BIAS_META, timeSince, type TradeIdea } from './ideas-types';

interface IdeaCardProps {
  idea: TradeIdea;
}

/**
 * A single trade-idea card (M11). Server component — read-only, rendered from
 * seed/server data. Presents the idea as an EDUCATIONAL EXAMPLE: the directional
 * `bias` is framed as a *view* (never "buy"/"sell"), and the levels are an
 * educational entry AREA, an invalidation, and an objective — not an order
 * ticket. Each card carries its own per-idea disclaimer (§11 "educational
 * examples … mandatory") and links to the related lesson/playbook so the member
 * studies the framework.
 *
 * Actions (Save, Discuss, Open related strategy) are non-destructive affordances;
 * Save/Discuss are inert placeholders until their modules wire up — no
 * signal-like push behavior by design (§11).
 */
export function IdeaCard({ idea }: IdeaCardProps) {
  const bias = BIAS_META[idea.bias];
  const ago = timeSince(idea.publishedAt);

  return (
    <article className="ti-card" aria-labelledby={`${idea.id}-h`}>
      <header className="ti-card-head">
        <span className={`ti-avatar ti-avatar-${idea.chartBanner}`} aria-hidden="true">
          {idea.initials}
        </span>
        <div className="ti-card-byline">
          <p className="ti-educator">{idea.educator}</p>
          <p className="ti-card-sub muted">
            {ago ? `${ago} · ` : ''}
            {idea.timeframe}
          </p>
        </div>
        <div className="ti-card-instrument">
          <span className="ti-pair mono-num">{idea.instrument}</span>
          <Badge tone={bias.tone}>{bias.label}</Badge>
        </div>
      </header>

      <h2 id={`${idea.id}-h`} className="ti-card-title">
        {idea.instrument} · {idea.tag}
      </h2>

      <div className={`ti-chart ti-chart-${idea.chartBanner}`} role="img" aria-label="Chart placeholder — annotated example coming from the educator">
        <span className="ti-chart-label">Chart example</span>
      </div>

      <p className="ti-note">{idea.note}</p>

      <dl className="ti-levels">
        <div className="ti-level">
          <dt>Educational entry area</dt>
          <dd>{idea.entryArea}</dd>
        </div>
        <div className="ti-level">
          <dt>Invalidation</dt>
          <dd className="text-neg">{idea.invalidation}</dd>
        </div>
        <div className="ti-level">
          <dt>Objective</dt>
          <dd className="text-pos">{idea.objective}</dd>
        </div>
      </dl>

      <p className="ti-card-disclaimer" role="note">
        These are educational examples, not signals or financial advice.
      </p>

      <footer className="ti-card-foot">
        <Badge tone="lime">{idea.tag}</Badge>
        <div className="ti-actions">
          <button type="button" className="ti-action" aria-label="Save this idea">
            <SaveIcon />
            Save
          </button>
          <button type="button" className="ti-action" aria-label="Discuss this idea in the community">
            <DiscussIcon />
            Discuss
          </button>
          <a href={idea.related.href} className="ti-action ti-action-link">
            <BookIcon />
            {idea.related.label}
          </a>
        </div>
      </footer>
    </article>
  );
}

function SaveIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M14 9V5a3 3 0 0 0-6 0v4M5 9h14l1 11H4L5 9Z" />
    </svg>
  );
}

function DiscussIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4L3 21l1.1-3.3A8.4 8.4 0 1 1 21 11.5Z" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 4h11a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4Z" />
      <path d="M18 4h2v14" />
    </svg>
  );
}
