'use client';

import { useState, type ReactNode } from 'react';
import { ProfileSection, type ProfileValues } from './ProfileSection';
import { NotificationsSection } from './NotificationsSection';
import { PreferencesSection, type LearningValues } from './PreferencesSection';
import { SecuritySection } from './SecuritySection';
import type { NotificationPrefs } from '../settings-fields';

type SectionId = 'profile' | 'notifications' | 'preferences' | 'security';

const SECTIONS: ReadonlyArray<{ id: SectionId; label: string }> = [
  { id: 'profile', label: 'Profile' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'security', label: 'Security' },
];

interface SettingsViewProps {
  readonly initialProfile: ProfileValues;
  readonly initialPrefs: NotificationPrefs;
  readonly initialLearning: LearningValues;
}

/**
 * Settings shell (client leaf). Owns only the active-section state and renders
 * the matching section component — each section owns its own form state and
 * RLS-scoped save, so the sections stay small and independent.
 *
 * The section nav is a `role="tablist"` of buttons for keyboard accessibility;
 * the active section is local UI state (not URL state) because it carries no
 * shareable meaning — unlike the notification inbox tabs, which ARE URL state.
 */
export function SettingsView({
  initialProfile,
  initialPrefs,
  initialLearning,
}: SettingsViewProps) {
  const [active, setActive] = useState<SectionId>('profile');

  return (
    <div className="set-layout">
      <nav className="set-nav" role="tablist" aria-label="Settings sections">
        {SECTIONS.map((s) => {
          const on = active === s.id;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              id={`set-tab-${s.id}`}
              aria-selected={on}
              aria-controls={`set-panel-${s.id}`}
              className={`set-nav-item${on ? ' on' : ''}`}
              onClick={() => setActive(s.id)}
            >
              {s.label}
            </button>
          );
        })}
      </nav>

      <div className="set-sections">
        <Panel id="profile" active={active}>
          <ProfileSection initial={initialProfile} />
        </Panel>
        <Panel id="notifications" active={active}>
          <NotificationsSection initial={initialPrefs} />
        </Panel>
        <Panel id="preferences" active={active}>
          <PreferencesSection initial={initialLearning} />
        </Panel>
        <Panel id="security" active={active}>
          <SecuritySection currentEmail={initialProfile.email} />
        </Panel>
      </div>
    </div>
  );
}

function Panel({
  id,
  active,
  children,
}: {
  id: SectionId;
  active: SectionId;
  children: ReactNode;
}) {
  const on = active === id;
  return (
    <section
      role="tabpanel"
      id={`set-panel-${id}`}
      aria-labelledby={`set-tab-${id}`}
      hidden={!on}
    >
      {children}
    </section>
  );
}
