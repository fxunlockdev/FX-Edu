import type { Metadata } from 'next';
import { Disclaimer } from '@fxunlock/ui';
import { AffiliateShell } from '../_components/AffiliateShell';
import {
  PROMO_BANNERS,
  PROMO_SOCIAL,
  PROMO_WEBINARS,
  PROMO_SWIPE,
  type PromoAsset,
} from '../_components/sample-data';

export const metadata: Metadata = {
  title: 'Promo Assets',
  robots: { index: false, follow: false },
};

/**
 * Promo Assets (M14 / PROJECT.md §8.18). RSC.
 *
 * Banners, social graphics, co-branded webinar links and swipe copy presented as
 * SAMPLE / downloadable stubs. The download/link targets are placeholders.
 * // TODO: wire promo assets — serve signed asset URLs from storage and
 * // generate co-branded webinar registration links per affiliate code.
 */
export default function PromoAssetsPage() {
  return (
    <AffiliateShell active="Promo Assets" title="Promo Assets">
      <h1 className="h-md" style={{ margin: 0 }}>
        Promo assets &amp; swipe copy
      </h1>
      <p className="muted aff-lead">
        Ready-made banners, social graphics, co-branded webinar links and swipe
        copy. Downloads are sample stubs while the asset library is connected.
      </p>

      <section className="aff-section">
        <h2>Display banners</h2>
        <p className="sub muted">Standard ad sizes for blogs and sites.</p>
        <div className="aff-asset-grid">
          {PROMO_BANNERS.map((a) => (
            <AssetCard key={a.id} asset={a} cta="Download" />
          ))}
        </div>
      </section>

      <section className="aff-section">
        <h2>Social graphics</h2>
        <p className="sub muted">Story and feed packs for social channels.</p>
        <div className="aff-asset-grid">
          {PROMO_SOCIAL.map((a) => (
            <AssetCard key={a.id} asset={a} cta="Download" />
          ))}
        </div>
      </section>

      <section className="aff-section">
        <h2>Co-branded webinar links</h2>
        <p className="sub muted">Invite your audience to a free educational webinar under your link.</p>
        <div className="aff-asset-grid">
          {PROMO_WEBINARS.map((a) => (
            <AssetCard key={a.id} asset={a} cta="Get link" />
          ))}
        </div>
      </section>

      <section className="aff-section">
        <h2>Swipe copy</h2>
        <p className="sub muted">Education-first copy you can adapt — keep claims accurate and disclose your relationship.</p>
        <div className="grid" style={{ gap: 14 }}>
          {PROMO_SWIPE.map((s) => (
            <div className="aff-swipe" key={s.id}>
              <p className="t">{s.title}</p>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <Disclaimer kind="custom" variant="callout" style={{ marginTop: 24 }}>
        Promote FX Academy honestly as education and tools only — never as a
        signal service or a way to guarantee profits. Do not alter approved
        claims, and always disclose your affiliate relationship. Earnings are not
        guaranteed.
      </Disclaimer>
    </AffiliateShell>
  );
}

function AssetCard({ asset, cta }: { asset: PromoAsset; cta: string }) {
  return (
    <article className="aff-asset">
      <div className="thumb" aria-hidden="true">
        {asset.spec}
      </div>
      <div>
        <div className="t">{asset.title}</div>
        <div className="spec">{asset.spec}</div>
      </div>
      {/* TODO: replace href with a signed asset URL / per-affiliate webinar link. */}
      <a className="btn btn-ghost btn-sm" href={asset.href} aria-label={`${cta} — ${asset.title}`}>
        {cta}
      </a>
    </article>
  );
}
