'use client';

import { useState } from 'react';
import { Badge } from '@fxunlock/ui';
import type { Pod } from './community-data';

/**
 * One accountability pod (PROJECT.md §12: 6–10 traders, weekly goals/check-ins,
 * unread counts, admin assignment + self-join). Counts and membership are SAMPLE
 * data; the unread badge is stubbed (no realtime). Self-join is optimistic and
 * local only — the real join writes through the API + RLS later.
 * // TODO: wire pod join + Realtime unread/check-in via community tables.
 */
export function PodCard({ pod }: { pod: Pod }) {
  const [joined, setJoined] = useState(pod.joined);
  const members = joined && !pod.joined ? pod.members + 1 : pod.members;
  const full = members >= pod.capacity;
  const checkInPct = Math.round((pod.checkedIn / Math.max(members, 1)) * 100);

  return (
    <article className="cm-pod" aria-label={`Pod ${pod.name}`}>
      <header className="cm-pod-head">
        <div>
          <h3 className="cm-pod-name">{pod.name}</h3>
          <p className="muted cm-pod-count">
            {members} / {pod.capacity} traders
          </p>
        </div>
        {pod.unread > 0 && (
          <Badge tone="lime-dark" aria-label={`${pod.unread} unread messages`}>
            {pod.unread} new
          </Badge>
        )}
      </header>

      <p className="cm-pod-goal">
        <span className="cm-pod-goal-label">This week</span>
        {pod.weeklyGoal}
      </p>

      <div className="cm-pod-progress">
        <div className="cm-pod-bar" role="presentation">
          <span className="cm-pod-bar-fill" style={{ width: `${checkInPct}%` }} />
        </div>
        <span className="muted cm-pod-progress-label">
          {pod.checkedIn} of {members} checked in this week
        </span>
      </div>

      <div className="cm-pod-foot">
        {joined ? (
          <Badge tone="forest">Your pod</Badge>
        ) : full ? (
          <Badge tone="outline">Pod full</Badge>
        ) : (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setJoined(true)}>
            Join pod
          </button>
        )}
        <button type="button" className="cm-pod-open" disabled={!joined}>
          {joined ? 'Open pod chat' : 'Members only'}
        </button>
      </div>
    </article>
  );
}
