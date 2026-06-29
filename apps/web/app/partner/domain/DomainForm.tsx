'use client';

import { useState } from 'react';
import { Badge, Button } from '@fxunlock/ui';

interface DomainFormProps {
  /** Current custom domain on the tenant, if any (stubbed). */
  readonly initialDomain: string;
  /** DNS records the partner must add to prove ownership (stubbed). */
  readonly dnsRecords: ReadonlyArray<DnsRecord>;
}

export interface DnsRecord {
  readonly type: 'TXT' | 'CNAME';
  readonly host: string;
  readonly value: string;
  readonly purpose: string;
}

/**
 * Custom-domain configurator (isolated client leaf). The domain input and the
 * verification trigger are interactive; the DNS instructions are static.
 *
 * Verification is STUBBED — the button only moves the UI to a "verification
 * pending" state. NOTHING here actually checks DNS or provisions SSL. Custom
 * domains MUST be ownership-verified BEFORE any traffic is routed to them.
 * TODO: wire DNS verification (poll the TXT record, then provision SSL via ACME,
 *       and only flip routing live once both succeed — all org-scoped).
 */
export function DomainForm({ initialDomain, dnsRecords }: DomainFormProps) {
  const [domain, setDomain] = useState(initialDomain);
  const [status, setStatus] = useState<'unverified' | 'pending'>('unverified');

  function requestVerification(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // STUBBED: would enqueue a DNS-ownership check + ACME SSL provisioning.
    setStatus('pending');
  }

  return (
    <div className="dom-grid">
      <form className="pt-panel dom-form" onSubmit={requestVerification} aria-label="Custom domain">
        <div className="field">
          <label htmlFor="dom-input">Custom app domain</label>
          <input
            id="dom-input"
            className="input"
            placeholder="academy.yourbrand.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value.trim().toLowerCase())}
            inputMode="url"
            autoComplete="off"
          />
          <span className="dom-hint">
            Traffic is routed to this domain only AFTER ownership is verified and SSL is issued.
          </span>
        </div>

        <div className="dom-status">
          <span>Status</span>
          {status === 'pending' ? (
            <Badge tone="warn" dot>
              Verification pending
            </Badge>
          ) : (
            <Badge tone="outline">Not verified</Badge>
          )}
        </div>

        <Button type="submit" variant="forest" size="sm" disabled={!domain}>
          {status === 'pending' ? 'Re-check verification' : 'Start verification'}
        </Button>

        {status === 'pending' ? (
          <p className="dom-pending" role="status">
            Verification pending. Add the DNS records on the right, then we&rsquo;ll confirm
            ownership and provision SSL. Routing stays disabled until both complete.
          </p>
        ) : null}
      </form>

      <section className="pt-panel" aria-labelledby="dns-h">
        <h2 id="dns-h">1 · Add these DNS records</h2>
        <p className="sub">Create the records at your DNS provider to prove you own the domain.</p>
        <div className="pt-table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Type</th>
                <th>Host</th>
                <th>Value</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              {dnsRecords.map((rec) => (
                <tr key={`${rec.type}-${rec.host}`}>
                  <td>
                    <Badge tone="neutral">{rec.type}</Badge>
                  </td>
                  <td><code className="dom-code">{rec.host}</code></td>
                  <td><code className="dom-code">{rec.value}</code></td>
                  <td className="muted">{rec.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ol className="dom-steps">
          <li>
            <strong>Ownership verification</strong> — we poll the TXT record until it resolves.
          </li>
          <li>
            <strong>SSL provisioning</strong> — once ownership is confirmed, a certificate is
            issued automatically (ACME).
          </li>
          <li>
            <strong>Go live</strong> — only after both succeed is traffic routed to your domain.
          </li>
        </ol>
      </section>
    </div>
  );
}
