import type { Metadata } from 'next';
import { ComingSoon } from '../_components';

export const metadata: Metadata = {
  title: 'Community Mod',
  robots: { index: false, follow: false },
};

/**
 * Admin Community Moderation (M19 / §9 module 19). Placeholder so the nav
 * resolves without a 404. Will cover the reports queue, moderation actions,
 * banned phrases, and discipline history.
 */
export default function AdminCommunityPage() {
  return (
    <ComingSoon
      title="Community Moderation"
      summary="Work the reports queue, take moderation actions, manage banned phrases, and review discipline history. Coming soon."
    />
  );
}
