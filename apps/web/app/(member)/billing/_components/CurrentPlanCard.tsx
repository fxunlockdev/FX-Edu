import { Badge } from '@fxunlock/ui';
import { ManagePlanButton } from './ManagePlanButton';
import { upgradeTargetId, type BillingView } from './billing-data';

interface CurrentPlanCardProps {
  view: BillingView;
}

/**
 * Current-plan hero (RSC). Two designed states:
 *   • ACTIVE — plan name, interval, price, renewal line + manage/switch CTAs.
 *   • FREE   — no active subscription: a calm upsell to a paid plan.
 *
 * "Switch to yearly" and "Upgrade" both route to /pricing carrying the plan, so
 * the actual change happens in the (Stripe-backed) checkout flow and is only
 * reflected after the webhook confirms it. No state is mutated from this card.
 */
export function CurrentPlanCard({ view }: CurrentPlanCardProps) {
  if (!view.hasSubscription) {
    return (
      <section className="bill-plan-now" aria-labelledby="bill-plan-heading">
        <span className="bill-glow" aria-hidden="true" />
        <div className="bill-plan-row">
          <div>
            <Badge tone="outline">Current plan</Badge>
            <h2 id="bill-plan-heading" className="bill-plan-name">
              Free
            </h2>
            <p className="bill-plan-sub">
              You&rsquo;re on the free tier. Upgrade to unlock the full curriculum, live webinars,
              AI tutor and performance analytics.
            </p>
          </div>
          <div className="bill-plan-price">
            <div className="bill-price-figure">
              $0<span className="bill-price-per">/mo</span>
            </div>
            <div className="bill-renews">No active subscription</div>
          </div>
        </div>
        <div className="bill-plan-cta">
          <a href="/pricing" className="btn btn-lime btn-sm">
            View plans &amp; upgrade
          </a>
        </div>
      </section>
    );
  }

  const { plan, interval, price } = view;
  const intervalLabel = interval === 'year' ? 'Yearly' : 'Monthly';
  const per = interval === 'year' ? '/yr' : '/mo';
  const upgradeId = upgradeTargetId(plan);

  return (
    <section className="bill-plan-now" aria-labelledby="bill-plan-heading">
      <span className="bill-glow" aria-hidden="true" />
      <div className="bill-plan-row">
        <div>
          <Badge tone="lime-dark">Current plan</Badge>
          <h2 id="bill-plan-heading" className="bill-plan-name">
            {plan.name} · {intervalLabel}
          </h2>
          <p className="bill-plan-sub">{plan.sub}</p>
        </div>
        <div className="bill-plan-price">
          <div className="bill-price-figure">
            ${price}
            <span className="bill-price-per">{per}</span>
          </div>
          {view.renewalLabel && <div className="bill-renews">{view.renewalLabel}</div>}
        </div>
      </div>

      <div className="bill-plan-cta">
        {interval === 'month' && (
          <a href={`/pricing?plan=${plan.id}&interval=year`} className="btn btn-lime btn-sm">
            Switch to yearly · save ~20%
          </a>
        )}
        {upgradeId && (
          <a href={`/pricing?plan=${upgradeId}`} className="btn btn-glass btn-sm">
            Upgrade plan
          </a>
        )}
        <ManagePlanButton glass />
      </div>
    </section>
  );
}
