import type { Metadata } from 'next';
import { ComingSoon } from '../_components';

export const metadata: Metadata = {
  title: 'Affiliates',
  robots: { index: false, follow: false },
};

/**
 * Admin Affiliates (M19 / §9 module 19). Placeholder so the nav resolves without
 * a 404. Will cover applications, codes, rates, fraud review, and payout status.
 */
export default function AdminAffiliatesPage() {
  return (
    <ComingSoon
      title="Affiliates"
      summary="Review applications, manage codes and rates, flag fraud, and track payout status. Coming soon."
    />
  );
}
