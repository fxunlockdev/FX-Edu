import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Logo, Badge, Disclaimer } from '@fxunlock/ui';
import { createClient } from '@/lib/supabase/server';
import { SignOutButton } from '../_components/SignOutButton';
import {
  CertificateCard,
  buildCertificateViews,
  summarize,
  CERTIFICATE_SELECT_COLUMNS,
  type CertificateRow,
  type CertificateSummary,
} from './_components';
import './certificates.css';

export const metadata: Metadata = {
  title: 'Certificates',
  robots: { index: false, follow: false },
};

/**
 * Derive the human learner name for the certificate face. Prefers the auth
 * user's display name / metadata, falling back to the email local-part. The
 * authoritative name printed on a minted certificate is set server-side at mint
 * time; this is the live display fallback for cards rendered from the catalog.
 */
function learnerNameFrom(
  meta: Record<string, unknown> | undefined,
  email: string | undefined,
): string {
  const full = typeof meta?.full_name === 'string' ? meta.full_name : undefined;
  const name = typeof meta?.name === 'string' ? meta.name : undefined;
  const candidate = (full || name || '').trim();
  if (candidate) return candidate;
  if (email) return email.split('@')[0] ?? email;
  return 'FX Academy Member';
}

/** Best-effort request origin for building absolute share links. */
async function requestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  if (!host) return '';
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

/**
 * Member Certificates (RSC) — PROJECT.md §9 module 9 / §8.14.
 *
 * The `(member)` layout already enforced the server-side auth gate. We read the
 * caller's own certificate rows through the RLS-scoped server client (a user
 * only ever sees their own rows), overlay them on the fixed five-tier catalog,
 * and render Earned / In-progress / Locked cards.
 *
 * MINTING IS SERVER-SIDE ONLY: a worker writes a `certificates` row after
 * server-verified tier completion (PROJECT.md §9 🔒 — "cannot be minted from
 * client completion events alone"). This page never mints; it only reads.
 *
 * Defensive degradation: if the `certificates` table isn't deployed yet, the
 * read errors and we fall back to an all-locked catalog (empty earned state)
 * instead of throwing.
 */
export default async function CertificatesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const learnerName = learnerNameFrom(
    user?.user_metadata as Record<string, unknown> | undefined,
    user?.email ?? undefined,
  );

  let rows: CertificateRow[] = [];
  let tableMissing = false;

  if (user) {
    const { data, error } = await supabase
      .from('certificates')
      .select(CERTIFICATE_SELECT_COLUMNS)
      .eq('user_id', user.id);

    if (error) {
      tableMissing = true;
    } else {
      rows = (data as CertificateRow[] | null) ?? [];
    }
  }

  const views = buildCertificateViews(rows, learnerName);
  const summary = summarize(views);
  const origin = await requestOrigin();

  return (
    <div className="cert-page">
      <header className="cert-top">
        <a href="/dashboard" aria-label="FX Academy dashboard">
          <Logo variant="dark" size={26} />
        </a>
        <div className="row gap2" style={{ alignItems: 'center' }}>
          <Badge tone="lime-dark">Member</Badge>
          <SignOutButton />
        </div>
      </header>

      <main className="cert-main" id="main">
        <h1 className="h-md">Certificates</h1>
        <p className="cert-lead muted">
          Complete a tier to earn a verifiable certificate of completion. These recognize your
          education — not trading results, profit, or performance.
        </p>

        <Summary summary={summary} />

        {summary.earnedCount === 0 && (
          <p className="cert-empty-note muted">
            {tableMissing
              ? 'Certificates are being set up. Once tiers are complete and verified, your earned certificates will appear here.'
              : 'You haven’t earned a certificate yet. Finish a tier to mint your first verifiable certificate of completion.'}
          </p>
        )}

        <ul className="cert-grid">
          {views.map((certificate) => (
            <li key={certificate.tier}>
              <CertificateCard certificate={certificate} origin={origin} />
            </li>
          ))}
        </ul>

        <Disclaimer kind="risk" variant="note" style={{ marginTop: 28 }} />
      </main>
    </div>
  );
}

function Summary({ summary }: { summary: CertificateSummary }) {
  return (
    <div className="cert-summary">
      <SummaryStat value={String(summary.earnedCount)} label="Certificates earned" emphatic />
      <SummaryStat value={`${summary.overallProgressPct}%`} label="Overall course progress" />
      <SummaryStat value={String(summary.tiersRemaining)} label="Tiers remaining" />
    </div>
  );
}

function SummaryStat({
  value,
  label,
  emphatic = false,
}: {
  value: string;
  label: string;
  emphatic?: boolean;
}) {
  return (
    <div className="cert-sm">
      <div className={emphatic ? 'cert-sm-v cert-sm-v-pos' : 'cert-sm-v'}>{value}</div>
      <div className="cert-sm-l">{label}</div>
    </div>
  );
}
