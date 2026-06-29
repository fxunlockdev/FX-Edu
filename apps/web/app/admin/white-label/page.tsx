import type { Metadata } from 'next';
import { ComingSoon } from '../_components';

export const metadata: Metadata = {
  title: 'White-label',
  robots: { index: false, follow: false },
};

/**
 * Admin White-label (M19 / §9 module 19). Placeholder so the nav resolves
 * without a 404. Will cover partners, custom domains, branding, and licensing.
 * Partner admins can never see global FX Academy data (§6.3).
 */
export default function AdminWhiteLabelPage() {
  return (
    <ComingSoon
      title="White-label"
      summary="Manage partners, custom domains, branding, and licensing. Partner tenants are isolated from global data (§6.3). Coming soon."
    />
  );
}
