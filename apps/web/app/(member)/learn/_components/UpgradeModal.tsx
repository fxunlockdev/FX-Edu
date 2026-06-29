'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@fxunlock/ui';

/**
 * Upgrade prompt shown when a Basic member opens a Pro course (PROJECT.md §8.4).
 * The lock decision is made server-side (the card only carries a hint); this
 * client leaf just surfaces the upsell. It listens for clicks on any element
 * carrying `data-upgrade-course` (the locked `CourseCard` CTAs) so the cards stay
 * server-rendered with no per-card client JS.
 *
 * Accessible dialog: traps nothing heavy but is labelled, closes on Escape and
 * on backdrop click, and the trigger CTAs are real buttons.
 */
export function UpgradeModal() {
  const [courseTitle, setCourseTitle] = useState<string | null>(null);
  const open = courseTitle !== null;

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(
        '[data-upgrade-course]',
      );
      if (target) {
        event.preventDefault();
        setCourseTitle(target.dataset.upgradeCourse ?? 'This course');
      }
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setCourseTitle(null);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="learn-modal-bg on"
      role="dialog"
      aria-modal="true"
      aria-labelledby="learn-up-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) setCourseTitle(null);
      }}
    >
      <div className="learn-modal">
        <div className="learn-modal-hero">
          <span className="learn-modal-glow" aria-hidden="true" />
          <Badge tone="lime-dark">Pro course</Badge>
          <h2 id="learn-up-title" className="h-sm">
            {courseTitle} is included with Pro
          </h2>
          <p>
            Upgrade to continue beyond the Beginner tiers and unlock the full FX Academy curriculum,
            certificates and the AI Tutor.
          </p>
        </div>
        <div className="learn-modal-body">
          <div className="row gap2" style={{ marginBottom: 16 }}>
            <Badge tone="outline">Your plan: Basic</Badge>
          </div>
          <a href="/pricing" className="btn btn-lime btn-block btn-lg">
            See Pro plans
          </a>
          <a href="/pricing" className="btn btn-ghost btn-block" style={{ marginTop: 8 }}>
            Compare plans
          </a>
          <button
            type="button"
            className="btn btn-ghost btn-block learn-modal-dismiss"
            onClick={() => setCourseTitle(null)}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
