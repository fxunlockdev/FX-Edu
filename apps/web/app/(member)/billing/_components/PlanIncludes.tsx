import type { Plan } from './billing-data';

/**
 * "Plan includes" list (RSC). Reads the included features straight off the
 * marketing `PLANS` catalogue so the entitlement copy on Billing always matches
 * Pricing. On the Free state this lists what the current (Basic) tier includes.
 */
export function PlanIncludes({ plan }: { plan: Plan }) {
  const included = plan.features.filter((f) => f.included);

  return (
    <section className="bill-panel" aria-labelledby="bill-includes-heading">
      <h3 id="bill-includes-heading" className="bill-ph">
        Plan includes
      </h3>
      <ul className="bill-feats">
        {included.map((feature) => (
          <li key={feature.label} className="bill-feat">
            <CheckIcon />
            {feature.label}
          </li>
        ))}
      </ul>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--lime-dim)"
      strokeWidth="2.6"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
