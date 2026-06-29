import type { Metadata } from 'next';
import { ComingSoon } from '../_components';

export const metadata: Metadata = {
  title: 'Trade Ideas',
  robots: { index: false, follow: false },
};

/**
 * Admin Trade Ideas (M19 / §9 module 19). Placeholder so the nav resolves
 * without a 404. Will cover trade-idea CRUD with a publish-time disclosure
 * acknowledgement.
 */
export default function AdminTradeIdeasPage() {
  return (
    <ComingSoon
      title="Trade Ideas"
      summary="Create and curate educational trade ideas with a publish-time disclosure acknowledgement. Coming soon."
    />
  );
}
