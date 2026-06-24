interface ReferralBannerProps {
  /** Already-sanitized referral code, or null when absent/invalid. */
  code: string | null;
}

/**
 * Thin top banner shown when a valid `?ref=` referral is present.
 * `code` is sanitized upstream (lib/referral.ts) so it is safe to render.
 */
export function ReferralBanner({ code }: ReferralBannerProps) {
  if (!code) return null;

  return (
    <div className="ref-banner" role="status">
      You were referred by <strong>{code}</strong>, welcome to FX Academy.
    </div>
  );
}
