import { PodCard } from './PodCard';
import { SEED_PODS } from './community-data';

/**
 * Accountability pods section. Renders the sample pods as cards. Pods are small
 * (6–10 traders) groups with a shared weekly goal, check-ins, and unread counts
 * (all sample/stubbed). Members are admin-assigned or self-join (PROJECT.md §12).
 */
export function PodsSection() {
  return (
    <section className="cm-pods" aria-labelledby="cm-pods-title">
      <div className="cm-pods-head">
        <div>
          <h2 id="cm-pods-title" className="cm-section-title">
            Accountability pods
          </h2>
          <p className="muted">
            Small groups of 6–10 traders who set a weekly goal and check in on each other.
          </p>
        </div>
      </div>
      <div className="cm-pods-grid">
        {SEED_PODS.map((pod) => (
          <PodCard key={pod.id} pod={pod} />
        ))}
      </div>
    </section>
  );
}
