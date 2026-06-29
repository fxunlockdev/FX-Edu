'use client';

import { useMemo, useState } from 'react';
import { auditStub } from '../_lib/audit';
import { SAMPLE_MEMBERS, type MemberRow } from './members-data';

/**
 * Members table (client leaf) — searchable list of sample members with per-row
 * admin actions (PROJECT.md §9 module 19 "Members"). EVERY action here is a
 * NO-OP STUB that funnels through `auditStub` and surfaces the audit/step-up
 * requirement to the operator. No real mutation occurs.
 *
 * Dangerous actions (suspend, ban, impersonate, GDPR export/delete) demand
 * STEP-UP MFA + a reason note server-side (§6.1 / §6.7); impersonation is
 * additionally limited-scope + logged (§9 module 19 🔒). The client confirm here
 * is only a hint — the server re-verifies.
 */
export function MembersTable() {
  const [query, setQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [status, setStatus] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SAMPLE_MEMBERS.filter((m) => {
      const matchesQuery =
        q === '' || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
      const matchesPlan = planFilter === 'all' || m.plan === planFilter;
      return matchesQuery && matchesPlan;
    });
  }, [query, planFilter]);

  /**
   * Stub mutation handler. Records the intended audit entry and tells the
   * operator what would happen, including the step-up requirement for dangerous
   * actions. // TODO: wire API + audit log; require step-up + reason server-side.
   */
  function runStubAction(member: MemberRow, action: string, dangerous: boolean): void {
    auditStub({
      actor: 'current-admin',
      action: `member.${action}`,
      target: member.id,
      metadata: { email: member.email },
    });
    const base = `Stub: "${action}" on ${member.name} — no API wired. This action would be audited (§6.7).`;
    const danger = dangerous ? ' Requires step-up MFA + a reason note before it runs (§6.1).' : '';
    const scope =
      action === 'impersonate'
        ? ' Impersonation is limited-scope and explicitly logged (§9 module 19).'
        : '';
    setStatus(base + danger + scope);
  }

  return (
    <div className="adm-members">
      <div className="adm-filter-bar">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or email…"
          aria-label="Search members"
          className="adm-input grow"
        />
        <select
          value={planFilter}
          onChange={(event) => setPlanFilter(event.target.value)}
          aria-label="Filter by plan"
          className="adm-input"
        >
          <option value="all">All plans</option>
          <option value="Basic">Basic</option>
          <option value="Pro">Pro</option>
          <option value="Elite">Elite</option>
        </select>
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th scope="col">Member</th>
              <th scope="col">Plan</th>
              <th scope="col">Status</th>
              <th scope="col">Joined</th>
              <th scope="col">Last active</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((member) => (
              <tr key={member.id}>
                <td>
                  <div className="adm-cell-strong">{member.name}</div>
                  <div className="adm-cell-muted">{member.email}</div>
                </td>
                <td>{member.plan}</td>
                <td>
                  <span className={`adm-status ${member.status}`}>{member.status}</span>
                </td>
                <td className="adm-num">{member.joined}</td>
                <td className="adm-cell-muted">{member.lastActive}</td>
                <td>
                  <div className="adm-row-actions">
                    <button
                      type="button"
                      className="adm-btn"
                      onClick={() => runStubAction(member, 'view', false)}
                    >
                      View
                    </button>
                    <button
                      type="button"
                      className="adm-btn"
                      onClick={() => runStubAction(member, 'suspend', true)}
                    >
                      Suspend
                    </button>
                    <button
                      type="button"
                      className="adm-btn danger"
                      onClick={() => runStubAction(member, 'ban', true)}
                    >
                      Ban
                    </button>
                    <button
                      type="button"
                      className="adm-btn"
                      onClick={() => runStubAction(member, 'gdpr_export', true)}
                    >
                      GDPR export
                    </button>
                    <button
                      type="button"
                      className="adm-btn danger"
                      onClick={() => runStubAction(member, 'gdpr_delete', true)}
                    >
                      GDPR delete
                    </button>
                    <button
                      type="button"
                      className="adm-btn"
                      onClick={() => runStubAction(member, 'impersonate', true)}
                    >
                      Impersonate
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="adm-cell-muted" style={{ textAlign: 'center' }}>
                  No members match your search.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {status ? (
        <p className="adm-stub-status" role="status" aria-live="polite">
          {status}
        </p>
      ) : null}
    </div>
  );
}
