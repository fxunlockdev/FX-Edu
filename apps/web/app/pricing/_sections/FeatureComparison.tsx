import { Container } from '@fxunlock/ui';
import { COMPARISON_ROWS } from './plans';
import { CheckIcon, CrossIcon } from './icons';

const COLUMNS = ['Basic', 'Pro', 'Elite'] as const;

function Cell({ included, plan }: { included: boolean; plan: string }) {
  return (
    <td className="pp-cmp-cell">
      <span className={included ? 'pp-cmp-yes' : 'pp-cmp-no'}>
        {included ? <CheckIcon /> : <CrossIcon />}
        <span className="sr-only">
          {included ? `Included in ${plan}` : `Not in ${plan}`}
        </span>
      </span>
    </td>
  );
}

/**
 * Side-by-side feature comparison. Scrolls horizontally inside its own wrapper
 * on narrow screens (the page itself never overflows) and the first column
 * stays readable.
 */
export function FeatureComparison() {
  return (
    <section className="section" aria-labelledby="compare-heading">
      <Container>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div className="eyebrow">Compare</div>
          <h2 id="compare-heading" className="h-lg" style={{ margin: '10px 0 0' }}>
            Every feature, side by side
          </h2>
        </div>

        <div className="pp-cmp-scroll">
          <table className="pp-cmp">
            <caption className="sr-only">Feature comparison across Basic, Pro and Elite plans</caption>
            <thead>
              <tr>
                <th scope="col">Feature</th>
                {COLUMNS.map((col) => (
                  <th key={col} scope="col" className={col === 'Pro' ? 'pp-cmp-pro' : undefined}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  <Cell included={row.basic} plan="Basic" />
                  <Cell included={row.pro} plan="Pro" />
                  <Cell included={row.elite} plan="Elite" />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </section>
  );
}
