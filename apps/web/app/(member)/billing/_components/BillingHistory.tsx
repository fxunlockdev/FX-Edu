import type { InvoiceRow } from './billing-data';

interface BillingHistoryProps {
  invoices: ReadonlyArray<InvoiceRow>;
  /** When false, the rows are clearly-illustrative samples (Stripe not wired). */
  isSample: boolean;
}

/**
 * Billing history + receipts (RSC) — STUBBED. Real invoices come from Stripe once
 * it's wired; until then we render either an empty state (no subscription) or a
 * short sample for an active plan, with the receipt-download affordance present
 * but inert. // TODO: list real Stripe invoices + signed receipt URLs via the API.
 */
export function BillingHistory({ invoices, isSample }: BillingHistoryProps) {
  return (
    <section className="bill-panel" aria-labelledby="bill-history-heading">
      <h3 id="bill-history-heading" className="bill-ph">
        Billing history
      </h3>

      {invoices.length === 0 ? (
        <p className="bill-empty muted">
          No invoices yet. Receipts will appear here after your first payment — billing is managed
          by Stripe, and each charge is reflected only once its webhook confirms.
        </p>
      ) : (
        <>
          {isSample && (
            <p className="bill-sample-note muted" role="note">
              Sample history — real Stripe invoices appear here once billing is live.
            </p>
          )}
          <table className="tbl">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Description</th>
                <th scope="col">Amount</th>
                <th scope="col" className="bill-th-right">
                  Receipt
                </th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td>{inv.date}</td>
                  <td className="muted">{inv.description}</td>
                  <td className="bill-amount">{inv.amount}</td>
                  <td className="bill-td-right">
                    <button
                      type="button"
                      className="bill-receipt-link"
                      disabled
                      aria-disabled="true"
                      title="Receipts available once Stripe billing is live"
                    >
                      PDF ↓
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}
