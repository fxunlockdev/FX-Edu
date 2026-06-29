import { Badge } from '@fxunlock/ui';
import { Avatar } from './Avatar';
import { ONLINE_COUNT, ONLINE_MEMBERS } from './community-data';

/**
 * Right rail — online-members list (presence is STUBBED sample data) and the
 * community rules panel. Presence will be driven by Supabase Realtime later.
 * // TODO: wire Supabase Realtime for presence/unread (PROJECT.md §12).
 */
export function RightRail() {
  return (
    <div className="cm-rail">
      <OnlineNow />
      <CommunityRules />
    </div>
  );
}

function OnlineNow() {
  return (
    <section className="cm-card" aria-labelledby="cm-online-title">
      <h2 id="cm-online-title" className="cm-card-title">
        Online now
      </h2>
      <p className="muted cm-card-sub">{ONLINE_COUNT} members active</p>
      <ul className="cm-online">
        {ONLINE_MEMBERS.map((member) => (
          <li key={member.name} className="cm-online-row">
            <Avatar name={member.name} size={30} />
            <span className="cm-online-name">
              <span className="cm-online-display">{member.name}</span>
              <span className="muted cm-online-role">{member.role}</span>
            </span>
            <span className="cm-online-dot" aria-hidden="true" />
            <span className="sr-only">online</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CommunityRules() {
  return (
    <section className="cm-card" aria-labelledby="cm-rules-title">
      <div className="cm-rules-head">
        <h2 id="cm-rules-title" className="cm-card-title">
          Community rules
        </h2>
        <Badge tone="outline">Enforced</Badge>
      </div>
      <ul className="cm-rules">
        <li>Educational discussion only. No signal-selling or DM solicitation.</li>
        <li>Share your reasoning, not just the call.</li>
        <li>No buy/sell, entry/exit, or guaranteed-profit framing.</li>
        <li>Be respectful — we grow faster together.</li>
      </ul>
    </section>
  );
}
