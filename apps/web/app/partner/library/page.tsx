import type { Metadata } from 'next';
import { Badge, Button, Disclaimer } from '@fxunlock/ui';
import { PageHeader, TenantIsolationNote } from '../_shell/PageHeader';
import { SAMPLE_TENANT } from '../_shell/nav';
import { LibraryTable, type CourseRow } from './LibraryTable';
import './library.css';

export const metadata: Metadata = {
  title: 'Course Library',
};

/**
 * Course Library (M20). The FX Academy curriculum is available to every tenant;
 * the partner can add their own content (stubbed) and hide/show tiers per
 * course. The catalog table is an isolated client leaf because the visibility
 * toggles are interactive. All rows are sample data scoped to this tenant.
 * TODO: read the tenant curriculum config (RLS-scoped) + wire content uploads.
 */
const COURSES: ReadonlyArray<CourseRow> = [
  { id: 'fxa-101', title: 'Forex Foundations', source: 'FX Academy', tier: 'Foundation', lessons: 18, visible: true },
  { id: 'fxa-risk', title: 'Risk & Money Management', source: 'FX Academy', tier: 'Foundation', lessons: 12, visible: true },
  { id: 'fxa-ta', title: 'Technical Analysis Deep Dive', source: 'FX Academy', tier: 'Pro', lessons: 22, visible: true },
  { id: 'fxa-psy', title: 'Trading Psychology', source: 'FX Academy', tier: 'Pro', lessons: 9, visible: true },
  { id: 'fxa-prop', title: 'Prop Firm Preparation', source: 'FX Academy', tier: 'Pro', lessons: 14, visible: false },
  { id: 'ptn-onboard', title: 'Meridian House Onboarding', source: 'Partner', tier: 'Partner', lessons: 5, visible: true },
];

export default function LibraryPage() {
  const tenant = SAMPLE_TENANT;

  return (
    <>
      <PageHeader
        title="Course Library"
        lead="Use the FX Academy curriculum, layer in your own content, and control which tiers members see."
        actions={
          <Badge tone="outline">
            {COURSES.length} courses · {COURSES.filter((c) => c.visible).length} visible
          </Badge>
        }
      />

      <TenantIsolationNote tenantName={tenant.name} />

      <LibraryTable courses={COURSES} />

      <div className="lib-add">
        <section className="pt-panel" aria-labelledby="add-h">
          <div>
            <h2 id="add-h">Add partner content</h2>
            <p className="muted">
              Publish your own branded courses alongside the FX Academy curriculum. Upload &amp;
              authoring is stubbed in this preview.
            </p>
          </div>
          <Button variant="lime" size="sm" disabled>
            Add course (coming soon)
          </Button>
        </section>
      </div>

      <Disclaimer kind="risk" variant="note" style={{ marginTop: 28 }} />
    </>
  );
}
