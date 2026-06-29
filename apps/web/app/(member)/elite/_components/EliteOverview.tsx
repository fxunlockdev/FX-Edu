import { ELITE_BENEFITS } from './elite-data';

/**
 * Elite tier overview (M21) — what Elite adds on top of Pro, framed as education
 * and skill-building only (PROJECT.md §6.7: no profit/guarantee copy). Pure RSC.
 */
export function EliteOverview() {
  return (
    <section aria-labelledby="el-value-h">
      <h2 id="el-value-h" className="el-section-h">
        What Elite adds on top of Pro
      </h2>
      <ul className="el-benefits">
        {ELITE_BENEFITS.map((benefit) => (
          <li className="el-benefit" key={benefit.id}>
            <span className="el-benefit-marker" aria-hidden="true">
              {benefit.marker}
            </span>
            <div className="el-benefit-body">
              <h3>{benefit.title}</h3>
              <p className="muted">{benefit.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
