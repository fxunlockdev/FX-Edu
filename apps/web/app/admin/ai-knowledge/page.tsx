import type { Metadata } from 'next';
import { ComingSoon } from '../_components';

export const metadata: Metadata = {
  title: 'AI Knowledge',
  robots: { index: false, follow: false },
};

/**
 * Admin AI Knowledge (M19 / §9 module 19). Placeholder so the nav resolves
 * without a 404. Will manage approved knowledge snippets, re-indexing, flagged
 * conversations, and guardrail config (§6.5).
 */
export default function AdminAiKnowledgePage() {
  return (
    <ComingSoon
      title="AI Knowledge"
      summary="Manage approved knowledge snippets, re-index pgvector, review flagged conversations, and tune guardrails. Coming soon."
    />
  );
}
