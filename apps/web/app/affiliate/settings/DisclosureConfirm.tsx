'use client';

import { useState } from 'react';

interface DisclosureConfirmProps {
  /** Whether the disclosure has already been accepted (server-provided). */
  initiallyAccepted: boolean;
}

/**
 * Affiliate disclosure confirmation (client leaf).
 *
 * Owns only the local checkbox + "saved" UI state. The acknowledgement must be
 * persisted server-side as a timestamped record (it gates payouts), so the
 * submit here is a placeholder until that server action is wired.
 * // TODO: wire a server action that records the disclosure acceptance
 * // (affiliate_id, accepted_at, ip/user-agent) and flips the payout gate.
 */
export function DisclosureConfirm({ initiallyAccepted }: DisclosureConfirmProps) {
  const [checked, setChecked] = useState(initiallyAccepted);
  const [accepted, setAccepted] = useState(initiallyAccepted);

  function confirm() {
    if (!checked) return;
    // TODO: call the server action; optimistic local state only for now.
    setAccepted(true);
  }

  return (
    <div className="aff-form">
      <label className="aff-disclosure" htmlFor="aff-disclosure-ack">
        <input
          id="aff-disclosure-ack"
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        <span className="copy">
          I confirm I will clearly and conspicuously disclose my affiliate
          relationship with FX Academy wherever I promote it (FTC and equivalent
          rules). I will present FX Academy as education and tools only, will not
          imply or guarantee trading profits, will not present it as a signal
          service, and understand that <strong>earnings are not guaranteed</strong>.
          I will not engage in self-referral, cookie stuffing, trademark bidding,
          or other prohibited promotion.
        </span>
      </label>

      <div className="row gap2" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          className="btn btn-lime btn-sm"
          onClick={confirm}
          disabled={!checked || accepted}
          aria-disabled={!checked || accepted}
        >
          {accepted ? 'Disclosure accepted' : 'Confirm disclosure'}
        </button>
        {accepted && (
          <span className="aff-pill paid" role="status">
            Accepted
          </span>
        )}
        {!accepted && (
          <span className="muted" style={{ fontSize: 12.5 }}>
            Required before payouts can be released.
          </span>
        )}
      </div>
    </div>
  );
}
