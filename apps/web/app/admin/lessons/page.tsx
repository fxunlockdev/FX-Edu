import type { Metadata } from 'next';
import { ComingSoon } from '../_components';

export const metadata: Metadata = {
  title: 'Lessons',
  robots: { index: false, follow: false },
};

/**
 * Admin Lessons (M19 / §9 module 19). Placeholder so the nav resolves without a
 * 404. Full lesson CRUD, media, and captions/transcripts arrive with Courses.
 */
export default function AdminLessonsPage() {
  return (
    <ComingSoon
      title="Lessons"
      summary="Per-lesson CRUD, media upload, and captions/transcripts — managed alongside Courses. Coming soon."
    />
  );
}
