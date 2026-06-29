import type { Metadata } from 'next';
import { ComingSoon } from '../_components';

export const metadata: Metadata = {
  title: 'Webinars',
  robots: { index: false, follow: false },
};

/**
 * Admin Webinars (M19 / §9 module 19). Placeholder so the nav resolves without a
 * 404. Will cover scheduling, secure stream keys, registrations, moderation, and
 * replay processing.
 */
export default function AdminWebinarsPage() {
  return (
    <ComingSoon
      title="Webinars"
      summary="Schedule sessions, manage secure stream keys and registrations, moderate live, and process replays. Coming soon."
    />
  );
}
