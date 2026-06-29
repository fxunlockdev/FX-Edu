'use client';

import { useState } from 'react';
import { auditStub } from '../_lib/audit';
import { SAMPLE_INVOICES, type InvoiceRow } from './revenue-data';

/**
 * Invoices table (client leaf) with a per-row refund/retry stub. Refund is a
 * DANGEROUS mutation: step-up MFA + reason note (§6.1 / §6.7). All actions are
 * no-ops routed through `auditStub`.
 */
export function InvoicesTable() {
  const [status, setStatus] = useState('');

  function handleAction(invoice: InvoiceRow, action: string): void {
    auditStub({ actor: 'current-admin', action: `revenue.${action}`, target: invoice.id, metadata: { member: invoice.member } });
    const danger = action === 'refund';
    setStatus(
      `Stub: "${action}" on invoice ${invoice.id} — no API wired. Audited (§6.7).` +
        (danger ? ' Would require step-up MFA + reason note (§6.1).' : ''),
    );
  }

  return (
    <div>
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
          <tr>
            <th scope="col">Invoice</th>
            <th scope="col">Member</th>
            <th scope="col">Plan</th>
            <th scope="col">Amount</th>
            <th scope="col">Status</th>
            <th scope="col">Date</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {SAMPLE_INVOICES.map((invoice) => (
            <tr key={invoice.id}>
              <td className="adm-cell-strong">{invoice.id}</td>
              <td className="adm-cell-muted">{invoice.member}</td>
              <td>{invoice.plan}</td>
              <td className="adm-num">{invoice.amount}</td>
              <td>
                <span className={`adm-status ${invoice.status}`}>{invoice.status}</span>
              </td>
              <td className="adm-num">{invoice.date}</td>
              <td>
                <div className="adm-row-actions">
                  {invoice.status === 'failed' ? (
                    <button type="button" className="adm-btn" onClick={() => handleAction(invoice, 'retry')}>
                      Retry charge
                    </button>
                  ) : null}
                  {invoice.status === 'paid' ? (
                    <button type="button" className="adm-btn danger" onClick={() => handleAction(invoice, 'refund')}>
                      Refund
                    </button>
                  ) : null}
                  <button type="button" className="adm-btn" onClick={() => handleAction(invoice, 'view')}>
                    View
                  </button>
                </div>
              </td>
            </tr>
          ))}
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
