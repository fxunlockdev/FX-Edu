import type { Metadata } from 'next';
import { ComingSoon } from '../_components';

export const metadata: Metadata = {
  title: 'CRM / Integrations',
  robots: { index: false, follow: false },
};

/**
 * Admin CRM / Integrations (M19 / §9 module 19). Placeholder so the nav resolves
 * without a 404. Will cover webhooks, marketing lists, and data exports.
 */
export default function AdminCrmPage() {
  return (
    <ComingSoon
      title="CRM / Integrations"
      summary="Configure outbound webhooks, sync marketing lists, and run data exports. Coming soon."
    />
  );
}
