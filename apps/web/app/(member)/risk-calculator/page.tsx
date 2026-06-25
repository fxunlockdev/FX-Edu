import type { Metadata } from 'next';
import { Logo, Badge } from '@fxunlock/ui';
import { SignOutButton } from '../_components/SignOutButton';
import { RiskCalculator } from './_components';
import './risk-calculator.css';

export const metadata: Metadata = {
  title: 'Risk Calculator',
  robots: { index: false, follow: false },
};

/**
 * Member Risk Calculator page (M4 / PRD §8.7). Server component shell.
 *
 * The `(member)` layout has already enforced the server-side auth gate, so this
 * route is reachable only by a signed-in user. The shell renders the member
 * chrome (matching the dashboard) and mounts the single interactive island —
 * {@link RiskCalculator} — which owns all form state and live results. All math
 * runs through `@fxunlock/trading`; nothing is computed here.
 */
export default function RiskCalculatorPage() {
  return (
    <div className="rc">
      <header className="rc-top">
        <a href="/dashboard" aria-label="FX Academy dashboard">
          <Logo variant="dark" size={26} />
        </a>
        <div className="row gap2" style={{ alignItems: 'center' }}>
          <Badge tone="lime-dark">Member</Badge>
          <SignOutButton />
        </div>
      </header>

      <main className="rc-main" id="main">
        <h1 className="rc-title h-md">Risk Calculator</h1>
        <p className="rc-lead muted">
          Fast, accurate position sizing. Every figure is computed from the shared
          trading engine, so it matches your journal and analytics to the cent.
        </p>

        <RiskCalculator />
      </main>
    </div>
  );
}
