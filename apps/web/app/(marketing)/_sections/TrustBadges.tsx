const TRUST_BADGES = [
  'Structured curriculum',
  'Weekly webinars',
  'Built-in journal',
  'AI course support',
  'Risk-first education',
] as const;

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/**
 * Hero trust badges — the five at-a-glance value props rendered as a pill row.
 * Lives inside the Hero grid (as in the design), extracted for composition.
 */
export function TrustBadges() {
  return (
    <ul className="trust-row" style={{ listStyle: 'none', padding: 0, margin: '30px 0 0' }}>
      {TRUST_BADGES.map((label) => (
        <li key={label} className="trust">
          <CheckIcon />
          {label}
        </li>
      ))}
    </ul>
  );
}
