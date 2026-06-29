import type { Metadata } from 'next';
import { PageHeader, AuditBanner, AuditNote } from '../_components';
import { CourseEditor } from './CourseEditor';

export const metadata: Metadata = {
  title: 'Courses',
  robots: { index: false, follow: false },
};

/**
 * Admin Courses (M19 / PROJECT.md §9 module 19 "Courses/Lessons"). RSC page
 * wrapping the `CourseEditor` client leaf: a sample course/lesson list plus
 * create/edit/publish stub forms. Media upload, captions/transcripts, and per-
 * lesson CRUD land later.
 *
 * 🔒 Publish and delete are dangerous (step-up MFA + reason note, §6.1); every
 * create/edit/publish/delete is audited (§6.7). All controls are no-op stubs.
 */
export default function AdminCoursesPage() {
  return (
    <>
      <PageHeader
        title="Courses"
        description="Author and publish course content. Sample list; create/edit/publish controls are stubs."
      />

      <AuditBanner />

      <CourseEditor />

      <AuditNote>
        Media upload, captions/transcripts, and per-lesson CRUD arrive in a later pass. Uploaded
        assets stay <code>pending</code> until a malware scan passes (§6.6) before they can be served.
      </AuditNote>
    </>
  );
}
