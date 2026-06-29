import { Badge } from '@fxunlock/ui';
import { timeSince } from './ideas-types';
import { IMPACT_TONE, NEWS_FEED, type NewsItem } from './market-data';

/**
 * Market news panel (M11). Server component — STUBBED. The Trading Economics
 * provider is not wired, so this renders honest sample headlines (impact rating,
 * source attribution, asset tag, time-since) behind a clear "sample" status, and
 * shows a graceful "data unavailable" note when the feed is offline (§11
 * "graceful degradation if provider down"; §18 "degrades gracefully"). No
 * fabricated live data is presented as real.
 */
export function MarketNewsPanel() {
  const feed = NEWS_FEED;

  return (
    <section className="ti-side-card" aria-labelledby="ti-news-h">
      <div className="ti-side-head">
        <h2 id="ti-news-h" className="ti-side-title">
          Market news
        </h2>
        <Badge tone={feed.available ? 'pos' : 'outline'} dot>
          {feed.available ? 'Live' : 'Sample'}
        </Badge>
      </div>

      {feed.items.length === 0 ? (
        <p className="muted ti-unavailable" role="status">
          News data unavailable. Curated, impact-rated headlines connect when the news provider goes
          live.
        </p>
      ) : (
        <ul className="ti-news-list">
          {feed.items.map((item) => (
            <NewsRow item={item} key={item.id} />
          ))}
        </ul>
      )}

      <p className="ti-side-note muted">
        Educational context only — sample headlines shown until the news feed is connected.
      </p>
    </section>
  );
}

function NewsRow({ item }: { item: NewsItem }) {
  const ago = timeSince(item.publishedAt);
  return (
    <li className="ti-news-row">
      <span className={`ti-impact ti-impact-${item.impact}`} aria-hidden="true" />
      <div className="ti-news-body">
        <p className="ti-news-headline">{item.headline}</p>
        <p className="ti-news-meta muted">
          <Badge tone={IMPACT_TONE[item.impact]}>{item.impact} impact</Badge>
          <span className="ti-news-asset">{item.asset}</span>
          {ago && <span>· {ago}</span>}
          <span className="ti-news-source">· {item.source}</span>
        </p>
      </div>
    </li>
  );
}
