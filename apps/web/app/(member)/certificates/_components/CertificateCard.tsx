import { CertificateActions } from './CertificateActions';
import { formatIssued, verifyPath, type CertificateView } from './certificate-types';

interface CertificateCardProps {
  certificate: CertificateView;
  /** Request origin, threaded down so Share can build an absolute URL. */
  origin: string;
}

/**
 * One certificate card. Renders three designed states (earned / in-progress /
 * locked) from a single resolved {@link CertificateView}. Server component —
 * the only interactive piece (Share + Download) is the client island
 * {@link CertificateActions}, mounted on earned cards.
 */
export function CertificateCard({ certificate, origin }: CertificateCardProps) {
  const earned = certificate.status === 'earned';
  const inProgress = certificate.status === 'progress';

  return (
    <article className="cert">
      <div className={earned ? 'cert-face' : 'cert-face locked'}>
        {earned && <span className="cert-glow" aria-hidden="true" />}

        <div className="cert-face-head">
          <span className="cert-kicker">{certificate.tierLabel} Certificate</span>
          <span className={earned ? 'cert-seal' : 'cert-seal locked'} aria-hidden="true">
            {earned ? <SealIcon /> : <LockIcon />}
          </span>
        </div>

        <div className="cert-face-body">
          <h2 className="cert-name">{certificate.name}</h2>
          <p className="cert-learner">
            {earned && certificate.learnerName
              ? `${certificate.learnerName} · FX Academy`
              : 'FX Academy'}
          </p>
        </div>
      </div>

      <div className="cert-foot">
        {earned ? (
          <EarnedFoot certificate={certificate} origin={origin} />
        ) : inProgress ? (
          <ProgressFoot pct={certificate.progressPct ?? 0} />
        ) : (
          <LockedFoot />
        )}
      </div>
    </article>
  );
}

function EarnedFoot({ certificate, origin }: { certificate: CertificateView; origin: string }) {
  const verifyHref = certificate.verificationId ? verifyPath(certificate.verificationId) : undefined;

  return (
    <div className="cert-foot-earned">
      <dl className="cert-meta">
        <div>
          <dt>Issued</dt>
          <dd>{formatIssued(certificate.issuedAt).replace(/^Issued\s/, '')}</dd>
        </div>
        <div>
          <dt>Verification ID</dt>
          <dd className="cert-vid">{certificate.verificationId}</dd>
        </div>
      </dl>

      {verifyHref && (
        <a className="cert-verify-link" href={verifyHref} target="_blank" rel="noreferrer">
          Public verification page
          <ExternalIcon />
        </a>
      )}

      {certificate.verificationId && (
        <CertificateActions verificationId={certificate.verificationId} origin={origin} />
      )}
    </div>
  );
}

function ProgressFoot({ pct }: { pct: number }) {
  return (
    <div className="cert-foot-progress">
      <div className="cert-prog-head">
        <span className="cert-prog-label">In progress</span>
        <span className="cert-prog-pct">{pct}%</span>
      </div>
      <div className="cert-prog-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <span className="cert-prog-fill" style={{ width: `${pct}%` }} />
      </div>
      <a href="/curriculum" className="btn btn-lime btn-sm btn-block">
        Continue tier
      </a>
    </div>
  );
}

function LockedFoot() {
  return (
    <div className="cert-foot-locked">
      <span className="cert-lock-note">
        <LockIcon />
        Complete the previous tier to unlock
      </span>
    </div>
  );
}

function SealIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="9" r="6" />
      <path d="m9 14-2 7 5-3 5 3-2-7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
    </svg>
  );
}
