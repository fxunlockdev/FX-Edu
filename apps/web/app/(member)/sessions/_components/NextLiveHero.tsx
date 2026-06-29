import { Badge } from '@fxunlock/ui';
import { Countdown } from './Countdown';
import { SessionActions } from './SessionActions';
import {
  accessLabel,
  joinDecision,
  sessionStatus,
  type LiveSession,
  type Plan,
} from './sessions-types';

interface NextLiveHeroProps {
  readonly session: LiveSession;
  readonly plan: Plan;
  /** Server clock — the join decision and status are computed against it. */
  readonly now: number;
}

/**
 * "Next live session" hero (M8 / PROJECT.md §8.6 ✨).
 *
 * Server component: the JOIN GATE is decided HERE, server-side, via
 * {@link joinDecision}. Join is enabled only when the session is currently live
 * AND the viewer is entitled (Pro/Elite). Otherwise the button is disabled with
 * a visible reason. This is still a UI HINT — the authoritative gate is
 * `GET /webinars/:id/join-token`, which must re-check the entitlement before
 * minting a signed Mux token (§6.1, §8.6 🔒). A Basic member cannot get a token
 * even if they tamper with the client.
 *
 * The countdown is the only client leaf in the hero; reserve + add-to-calendar
 * live in {@link SessionActions}.
 */
export function NextLiveHero({ session, plan, now }: NextLiveHeroProps) {
  const status = sessionStatus(session, now);
  const { canJoin, reason } = joinDecision(session, plan, now);
  const isLive = status === 'live';

  return (
    <section className="sx-hero" aria-labelledby="sx-hero-h" id="live">
      <span className="sx-hero-glow" aria-hidden="true" />
      <div className="sx-hero-grid">
        <div className="sx-hero-main">
          <Badge tone="lime-dark" dot={isLive ? 'live' : false}>
            {isLive ? 'Live now' : 'Next live session'}
          </Badge>
          <h2 id="sx-hero-h" className="sx-hero-title">
            {session.title}
          </h2>
          <p className="sx-hero-meta">
            {session.host} · {session.topic} · {accessLabel(session.access)} ·{' '}
            {session.registeredCount} registered
          </p>
          <p className="sx-hero-summary">{session.summary}</p>

          {isLive ? (
            <div className="sx-hero-livebar">
              <JoinButton canJoin={canJoin} reason={reason} sessionId={session.id} />
            </div>
          ) : (
            <Countdown targetIso={session.startsAt} liveLabel="This session is live now" />
          )}
        </div>

        <div className="sx-hero-side">
          {isLive ? (
            <p className="sx-hero-side-note">
              The room is open. {canJoin ? "Join in when you're ready." : null}
            </p>
          ) : (
            <SessionActions session={session} reserved={session.registration === 'reserved'} />
          )}
        </div>
      </div>
    </section>
  );
}

function JoinButton({
  canJoin,
  reason,
  sessionId,
}: {
  canJoin: boolean;
  reason: ReturnType<typeof joinDecision>['reason'];
  sessionId: string;
}) {
  if (canJoin) {
    // STUBBED: this would request GET /webinars/:id/join-token and open the
    // signed Mux player. // TODO: wire Mux/IVS live + signed playback tokens.
    return (
      <a className="btn btn-lime btn-lg" href={`/sessions#${sessionId}`}>
        Join live
      </a>
    );
  }

  const message =
    reason === 'plan-locked'
      ? 'Live access is included with Pro'
      : 'Join opens when the session goes live';

  return (
    <div className="sx-join-blocked">
      <button type="button" className="btn btn-glass btn-lg" disabled>
        Join live
      </button>
      <p className="sx-join-reason" role="note">
        {message}
        {reason === 'plan-locked' && (
          <>
            {' · '}
            <a href="/pricing" className="sx-join-upsell">
              Upgrade
            </a>
          </>
        )}
      </p>
    </div>
  );
}
