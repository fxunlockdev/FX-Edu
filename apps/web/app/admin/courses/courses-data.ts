/**
 * Sample course/lesson data for the Admin Courses screen (PROJECT.md §9 module
 * 19 "Courses/Lessons: CRUD, media, captions/transcripts, publish"). STUBBED.
 *
 * // TODO: replace with the admin courses API (CRUD + media + publish), each
 *    mutation audited; publish is a dangerous action (step-up + reason).
 */

export type CourseStatus = 'draft' | 'published';
export type CourseTier = 'Entry' | 'Intermediate' | 'Advanced';

export interface CourseRow {
  id: string;
  title: string;
  tier: CourseTier;
  lessons: number;
  status: CourseStatus;
  updated: string;
}

export const SAMPLE_COURSES: readonly CourseRow[] = [
  { id: 'crs_intro', title: 'What is Forex? Markets & Mechanics', tier: 'Entry', lessons: 5, status: 'published', updated: '2026-05-30' },
  { id: 'crs_risk', title: 'Risk & Position Sizing', tier: 'Entry', lessons: 6, status: 'published', updated: '2026-06-02' },
  { id: 'crs_struct', title: 'Market Structure & Liquidity', tier: 'Advanced', lessons: 6, status: 'published', updated: '2026-06-18' },
  { id: 'crs_psych', title: 'Trading Psychology & Discipline', tier: 'Intermediate', lessons: 4, status: 'draft', updated: '2026-06-24' },
  { id: 'crs_props', title: 'Prop Firm Challenge Playbook', tier: 'Advanced', lessons: 8, status: 'draft', updated: '2026-06-25' },
] as const;

export const COURSE_TIERS: readonly CourseTier[] = ['Entry', 'Intermediate', 'Advanced'] as const;
