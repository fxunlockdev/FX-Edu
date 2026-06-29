import { Badge } from '@fxunlock/ui';
import { EARLY_ACCESS } from './elite-data';

/**
 * Early-access content list (M21). Sample items flagged Elite-only that Elite
 * members see ahead of Pro. Pure RSC; static until the content/flags backend
 * lands. Education-only framing (PROJECT.md §6.7).
 */
export function EarlyAccess() {
  return (
    <section aria-labelledby="el-early-h">
      <h2 id="el-early-h" className="el-section-h">
        Early access
      </h2>
      <p className="el-section-lead muted">
        New content reaches Elite first. Explore it ahead of Pro and help shape it with your
        feedback.
      </p>
      <ul className="el-early">
        {EARLY_ACCESS.map((item) => (
          <li className="el-early-item card" key={item.id}>
            <div className="el-early-top">
              <Badge tone="lime-dark">Elite-only</Badge>
              <span className="el-early-format muted">{item.format}</span>
            </div>
            <h3 className="el-early-title">{item.title}</h3>
            <p className="el-early-summary muted">{item.summary}</p>
            <div className="el-early-foot">
              <span className="el-early-release muted">{item.proRelease}</span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled
                aria-disabled="true"
                title="Early-access content opens here once published"
              >
                Preview
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
