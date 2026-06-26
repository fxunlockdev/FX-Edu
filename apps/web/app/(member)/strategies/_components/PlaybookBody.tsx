import type { Strategy } from './strategies-types';

/**
 * Renders the full educational body of a playbook (concept → rules → setup →
 * invalidation → risk → examples → quiz/checklist) plus the related-lessons
 * aside. Pure presentational RSC; receives an unlocked {@link Strategy}.
 *
 * All copy is educational and process-oriented — the rendering deliberately
 * emphasizes invalidation and risk discipline with equal weight to entries
 * (PROJECT.md §10: educational language only).
 */
export function PlaybookContent({ strategy }: { strategy: Strategy }) {
  const { body } = strategy;
  return (
    <div className="strat-grid">
      <div>
        <section className="strat-section" aria-labelledby="concept-h">
          <h2 id="concept-h">Concept</h2>
          <p className="muted">{body.concept}</p>
        </section>

        <BulletSection id="rules-h" title="Rules" items={body.rules} />
        <BulletSection id="setup-h" title="Setup criteria" items={body.setupCriteria} />
        <BulletSection id="inval-h" title="Invalidation" items={body.invalidation} warn />
        <BulletSection id="risk-h" title="Risk notes" items={body.riskNotes} />

        <section className="strat-section" aria-labelledby="examples-h">
          <h2 id="examples-h">Examples</h2>
          {body.examples.map((ex) => (
            <div className="strat-example" key={ex.title}>
              <h3>{ex.title}</h3>
              <p className="muted">{ex.walkthrough}</p>
            </div>
          ))}
        </section>

        <section className="strat-section" aria-labelledby="quiz-h">
          <h2 id="quiz-h">Process checklist &amp; self-quiz</h2>
          <div className="strat-check">
            {body.checklist.map((item) => (
              <div className="strat-check-item" key={item.prompt}>
                <span className="strat-check-box" aria-hidden="true" />
                <div>
                  <h3>{item.prompt}</h3>
                  <p className="muted">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <aside className="strat-aside" aria-label="Related lessons">
        <div className="card card-pad">
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Related lessons</h2>
          <ul className="strat-related">
            {body.relatedLessons.map((lesson) => (
              <li key={lesson.label}>
                <span>{lesson.label}</span>
                <span className="chip chip-outline">{lesson.tier}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}

interface BulletSectionProps {
  id: string;
  title: string;
  items: readonly string[];
  warn?: boolean;
}

function BulletSection({ id, title, items, warn = false }: BulletSectionProps) {
  return (
    <section className="strat-section" aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      <ul className={`strat-list${warn ? ' warn' : ''}`}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
