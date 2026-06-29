'use client';

import { useState } from 'react';
import { Button } from '@fxunlock/ui';

/**
 * Member invite bar (isolated client leaf). Captures an email + role and shows a
 * stubbed confirmation. Bulk import is a stubbed affordance. No persistence.
 * TODO: wire invite + CSV import via an RLS-scoped server action (a partner can
 *       only ever invite members into their OWN tenant).
 */
export function InviteBar() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [note, setNote] = useState('');

  function invite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) return;
    // STUBBED: would enqueue an org-scoped invite.
    setNote(`Invite queued for ${email} as ${role} (preview — not sent).`);
    setEmail('');
  }

  return (
    <form className="pt-panel mbr-invite" onSubmit={invite} aria-label="Invite members">
      <div className="field mbr-invite-email">
        <label htmlFor="inv-email">Invite by email</label>
        <input
          id="inv-email"
          className="input"
          type="email"
          placeholder="trader@yourbrand.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="off"
        />
      </div>
      <div className="field mbr-invite-role">
        <label htmlFor="inv-role">Role</label>
        <select id="inv-role" className="input" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="member">Member</option>
          <option value="educator">Educator</option>
          <option value="support">Support</option>
        </select>
      </div>
      <div className="mbr-invite-actions">
        <Button type="submit" variant="forest" size="sm" disabled={!email}>
          Send invite
        </Button>
        <Button type="button" variant="ghost" size="sm" disabled>
          Import CSV
        </Button>
      </div>
      {note ? (
        <p className="mbr-invite-note" role="status">
          {note}
        </p>
      ) : null}
    </form>
  );
}
