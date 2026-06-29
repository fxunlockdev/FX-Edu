import { Badge } from '@fxunlock/ui';
import type { ChecklistItem } from './dashboard-data';

/**
 * First-run onboarding checklist (M18 / §18 "First-run = guided checklist, not
 * zeros"). Each step's done-state comes from the pure `deriveDashboard` model:
 * the steps we can verify server-side (profile, account size, first trade) read
 * as live, while steps whose target module isn't built yet are marked `pending`
 * (informational — they point at the nearest built surface, never a dead link).
 */
interface OnboardingChecklistProps {
  items: ReadonlyArray<ChecklistItem>;
  done: number;
  percent: number;
}

export function OnboardingChecklist({ items, done, percent }: OnboardingChecklistProps) {
  return (
    <section className="mod col-7" aria-labelledby="dash-checklist-h">
      <div className="mod-head">
        <h3 id="dash-checklist-h">Get started checklist</h3>
        <Badge tone="lime">{percent}% complete</Badge>
      </div>

      <div className="bar dash-checklist-bar" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={`${done} of ${items.length} steps complete`}>
        <i style={{ width: `${percent}%` }} />
      </div>

      <ul className="dash-checklist">
        {items.map((item) => (
          <li className="dash-checklist-item" key={item.id}>
            <span className={`dash-cl-box ${item.done ? 'done' : ''}`} aria-hidden="true">
              {item.done && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--on-lime)" strokeWidth="3">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
            </span>
            <span className={`dash-cl-label ${item.done ? 'is-done' : ''}`}>
              {item.label}
              {item.pending && !item.done && <span className="dash-cl-soon">soon</span>}
            </span>
            {!item.done && (
              <a
                href={item.href}
                className="btn btn-ghost btn-sm"
                aria-label={`${item.pending ? 'Preview' : 'Start'}: ${item.label}`}
              >
                {item.pending ? 'Preview' : 'Start'}
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
