import type { Metadata } from 'next';
import { Logo, Badge, Disclaimer } from '@fxunlock/ui';
import { SignOutButton } from '../../_components/SignOutButton';
import { LogTradeForm, type LogTradePrefill } from './LogTradeForm';
import '../journal.css';

export const metadata: Metadata = {
  title: 'Log a trade',
  robots: { index: false, follow: false },
};

interface NewTradePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? '';
  return v ?? '';
}

/**
 * Log Trade page (RSC shell). The `(member)` layout guarantees a session.
 *
 * Pre-fill: the Risk Calculator (M4) hands off via `/journal/new?...` query
 * params, so we read the handoff here on the server and pass it as the form's
 * initial values. Accepted params: instrument/pair, direction, entry, stop,
 * tp/takeProfit, balance, risk, setup, session.
 */
export default async function NewTradePage({ searchParams }: NewTradePageProps) {
  const params = await searchParams;

  const prefill: LogTradePrefill = {
    instrument: firstParam(params.instrument) || firstParam(params.pair),
    direction: firstParam(params.direction),
    entry: firstParam(params.entry),
    stopLoss: firstParam(params.stop) || firstParam(params.stopLoss) || firstParam(params.sl),
    takeProfit: firstParam(params.tp) || firstParam(params.takeProfit),
    balance: firstParam(params.balance),
    risk: firstParam(params.risk),
    setup: firstParam(params.setup),
    session: firstParam(params.session),
  };

  return (
    <div className="jrnl">
      <header className="jrnl-top">
        <a href="/" aria-label="FX Academy home">
          <Logo variant="dark" size={26} />
        </a>
        <div className="row gap2" style={{ alignItems: 'center' }}>
          <Badge tone="lime-dark">Member</Badge>
          <SignOutButton />
        </div>
      </header>

      <main className="jrnl-main" id="main">
        <p style={{ marginBottom: 16 }}>
          <a href="/journal" className="tn-back">
            &larr; Back to journal
          </a>
        </p>
        <h1 className="h-md" style={{ margin: '0 0 20px' }}>
          Log a trade
        </h1>

        <LogTradeForm prefill={prefill} />

        <Disclaimer kind="risk" variant="note" style={{ marginTop: 28, maxWidth: 1000 }} />
      </main>
    </div>
  );
}
