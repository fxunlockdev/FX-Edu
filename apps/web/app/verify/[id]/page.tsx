import type { Metadata } from 'next';
import { PublicNav, Footer, Disclaimer } from '@fxunlock/ui';
import { verifyCertificate, type VerificationResult } from '../_lib/verification';
import '../verify.css';

export const metadata: Metadata = {
  title: 'Verify certificate',
  description: 'Confirm the validity of an FX Academy certificate of completion.',
  // Verification pages are per-certificate and should not be indexed.
  robots: { index: false, follow: false },
};

interface VerifyPageProps {
  // Next.js 15: params is async.
  params: Promise<{ id: string }>;
}

/**
 * PUBLIC certificate verification page (PROJECT.md §9 module 9 / §8.14).
 *
 * This route is intentionally OUTSIDE the `(member)` group, so it carries no
 * auth gate — anyone with the link (an employer, partner, recruiter) can open
 * it. It uses the public chrome (`PublicNav` + `Footer`), never the member
 * layout.
 *
 * MINIMAL DISCLOSURE (acceptance, PROJECT.md §9 🔒): we reveal ONLY validity,
 * the tier / certificate name, the issue date, and a minimal learner identity
 * (first name + last initial). No email, no user ID, no org, no scores — and an
 * unknown / malformed / revoked ID renders an identical "not valid" state so the
 * endpoint never leaks an existence oracle. The lookup is server-side; see
 * `verifyCertificate` (currently stubbed until the public read path is wired).
 */
export default async function VerifyPage({ params }: VerifyPageProps) {
  const { id } = await params;
  const result = await verifyCertificate(id);

  return (
    <>
      <PublicNav />

      <main id="main" className="verify">
        <div className="wrap verify-wrap">
          {result.valid ? (
            <ValidCertificate result={result} id={id} />
          ) : (
            <InvalidCertificate />
          )}

          <Disclaimer kind="risk" variant="callout" className="verify-disclaimer" />
        </div>
      </main>

      <Footer />
    </>
  );
}

function ValidCertificate({ result, id }: { result: VerificationResult; id: string }) {
  return (
    <section className="verify-card verify-card-valid" aria-labelledby="verify-heading">
      <div className="verify-badge verify-badge-valid">
        <CheckIcon />
        Valid certificate
      </div>

      <h1 id="verify-heading" className="verify-title">
        {result.name}
      </h1>

      <dl className="verify-facts">
        {result.tierLabel && (
          <Fact term="Tier" detail={result.tierLabel} />
        )}
        {result.learner && (
          <Fact term="Awarded to" detail={result.learner} />
        )}
        {result.issuedAt && (
          <Fact term="Issued" detail={formatDate(result.issuedAt)} />
        )}
        <Fact term="Verification ID" detail={id} mono />
      </dl>

      <p className="verify-note muted">
        This certificate confirms completion of an FX Academy education tier. It recognizes
        education only — not trading results, profit, or performance. No further personal
        information about the holder is disclosed on this page.
      </p>
    </section>
  );
}

function InvalidCertificate() {
  return (
    <section className="verify-card verify-card-invalid" aria-labelledby="verify-heading">
      <div className="verify-badge verify-badge-invalid">
        <CrossIcon />
        Not a valid certificate
      </div>

      <h1 id="verify-heading" className="verify-title">
        We couldn’t verify this certificate
      </h1>

      <p className="verify-note muted">
        This verification link doesn’t match a valid FX Academy certificate. It may be mistyped,
        expired, or revoked. If you received it from a certificate holder, ask them to share the
        link again from their certificates page.
      </p>

      <a href="/" className="btn btn-forest btn-sm verify-home">
        Go to FX Academy
      </a>
    </section>
  );
}

function Fact({ term, detail, mono = false }: { term: string; detail: string; mono?: boolean }) {
  return (
    <div className="verify-fact">
      <dt>{term}</dt>
      <dd className={mono ? 'verify-mono' : undefined}>{detail}</dd>
    </div>
  );
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
