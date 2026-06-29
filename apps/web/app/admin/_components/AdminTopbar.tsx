'use client';

import { useState } from 'react';

interface AdminTopbarProps {
  /** Admin email — drives the avatar initials and the title tooltip. */
  email: string;
  /** Role label shown as a pill (e.g. "admin"). */
  role: string;
}

/** Two-letter initials from an email local-part, e.g. `jane.doe@x` → `JD`. */
function initialsFromEmail(email: string): string {
  const local = email.split('@')[0] ?? '';
  const parts = local.split(/[.\-_]+/).filter(Boolean);
  const first = parts[0] ?? '';
  const second = parts[1] ?? '';
  const letters = (first && second ? `${first[0]}${second[0]}` : local.slice(0, 2)) || 'AD';
  return letters.toUpperCase();
}

/**
 * Admin topbar — ported from `appTop` in `design/assets/shell.js`. Holds the
 * search field (client-side controlled input; the no-op submit is a stub) and
 * the operator avatar. Notifications + search wiring are deferred.
 */
export function AdminTopbar({ email, role }: AdminTopbarProps) {
  const [query, setQuery] = useState('');

  return (
    <header className="adm-top">
      <form
        className="adm-search"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          // TODO: wire global admin search (members, courses, invoices…) + audit.
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width="15"
          height="15"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search members, courses, invoices…"
          aria-label="Search the admin console"
          className="adm-search-input"
        />
        <kbd className="adm-search-kbd">⌘K</kbd>
      </form>

      <div className="adm-top-right">
        <button type="button" className="adm-icon-btn" title="Notifications" aria-label="Notifications">
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>
          <span className="adm-ndot" />
        </button>
        <span className="adm-role-pill" title={`Role: ${role}`}>
          {role}
        </span>
        <span className="adm-avatar" title={email} aria-hidden="true">
          {initialsFromEmail(email)}
        </span>
      </div>
    </header>
  );
}
