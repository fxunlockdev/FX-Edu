'use client';

import { useState } from 'react';
import { auditStub } from '../_lib/audit';
import { SAMPLE_FLAGS } from './settings-data';

/**
 * Feature-flag toggles (client leaf). Toggling is OPTIMISTIC-LOCAL ONLY and a
 * NO-OP against any backend — a flag change is a dangerous mutation (step-up +
 * reason, §6.1 / §6.7). Routed through `auditStub`.
 */
export function FeatureFlags() {
  const [flags, setFlags] = useState(() => SAMPLE_FLAGS.map((flag) => ({ ...flag })));
  const [status, setStatus] = useState('');

  function toggle(key: string): void {
    setFlags((current) =>
      current.map((flag) => (flag.key === key ? { ...flag, enabled: !flag.enabled } : flag)),
    );
    auditStub({ actor: 'current-admin', action: 'settings.feature_flag', target: key });
    setStatus(`Stub: toggled "${key}" locally — no API wired. Would be audited and require step-up + reason (§6.1).`);
  }

  return (
    <>
    <dl className="adm-deflist">
      {flags.map((flag) => (
        <div key={flag.key}>
          <dt>{flag.label}</dt>
          <dd>
            <button
              type="button"
              className={`adm-btn${flag.enabled ? ' primary' : ''}`}
              role="switch"
              aria-checked={flag.enabled}
              onClick={() => toggle(flag.key)}
            >
              {flag.enabled ? 'Enabled' : 'Disabled'}
            </button>
          </dd>
        </div>
      ))}
    </dl>
    {status ? (
      <p className="adm-stub-status" role="status" aria-live="polite">
        {status}
      </p>
    ) : null}
    </>
  );
}
