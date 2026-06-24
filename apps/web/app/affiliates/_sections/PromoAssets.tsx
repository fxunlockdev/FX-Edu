import { Container } from '@fxunlock/ui';

const ASSETS = [
  {
    label: 'Banners & display',
    desc: 'Static and animated banners in every standard size, ready for blogs, newsletters, and ad slots.',
    icon: <path d="M3 5h18v14H3z M3 9h18 M7 13h6" />,
  },
  {
    label: 'Swipe copy',
    desc: 'Pre-written emails, captions, and posts you can drop in and personalise, compliance-checked.',
    icon: <path d="M5 4h14v16H5z M9 8h6 M9 12h6 M9 16h3" />,
  },
  {
    label: 'Social graphics',
    desc: 'On-brand square and vertical graphics for Instagram, X, TikTok, and YouTube thumbnails.',
    icon: <path d="M4 4h16v16H4z M8 12l3 3 5-6" />,
  },
  {
    label: 'Webinar links',
    desc: 'Deep links to live and on-demand webinars so your audience lands on high-intent pages.',
    icon: <path d="M3 5h13v10H3z M16 8l5-3v8l-5-3 M7 18h6" />,
  },
] as const;

/** Promo assets — the marketing toolkit available in the affiliate dashboard. */
export function PromoAssets() {
  return (
    <section className="section" aria-labelledby="assets-heading">
      <Container>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div className="eyebrow">Promo assets</div>
        </div>
        <h2 id="assets-heading" className="h-md" style={{ textAlign: 'center', margin: '8px 0 0' }}>
          A complete marketing toolkit, built for you
        </h2>
        <p className="body-lg" style={{ textAlign: 'center', maxWidth: 560, margin: '14px auto 0' }}>
          Everything you need to promote with confidence, refreshed regularly and ready to use the
          day you're approved.
        </p>

        <div className="af-assets-grid">
          {ASSETS.map((asset) => (
            <article key={asset.label} className="card card-pad card-hover">
              <span className="af-asset-ic">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {asset.icon}
                </svg>
              </span>
              <h3 className="h-sm" style={{ fontSize: 16, margin: '0 0 6px' }}>
                {asset.label}
              </h3>
              <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                {asset.desc}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
