'use client';

import { useState, type FormEvent } from 'react';
import { auditStub } from '../_lib/audit';
import { SAMPLE_COURSES, COURSE_TIERS, type CourseRow, type CourseTier } from './courses-data';

/**
 * Courses manager (client leaf): a course/lesson list plus a create/edit form
 * with a publish control (PROJECT.md §9 module 19 "Courses/Lessons"). All
 * submissions and the publish/delete actions are NO-OP STUBS routed through
 * `auditStub`; publish + delete are dangerous (step-up + reason, §6.1 / §6.7).
 */
export function CourseEditor() {
  const [title, setTitle] = useState('');
  const [tier, setTier] = useState<CourseTier>(COURSE_TIERS[0] ?? 'Entry');
  const [summary, setSummary] = useState('');
  const [status, setStatus] = useState('');

  function handleCreate(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    auditStub({ actor: 'current-admin', action: 'course.create', target: 'new', metadata: { title, tier } });
    setStatus(`Stub: create course "${title || 'untitled'}" — no API wired. This action would be audited (§6.7).`);
  }

  function handleRowAction(course: CourseRow, action: string): void {
    auditStub({ actor: 'current-admin', action: `course.${action}`, target: course.id });
    const danger = action === 'publish' || action === 'delete';
    setStatus(
      `Stub: "${action}" on "${course.title}" — no API wired. Audited (§6.7).` +
        (danger ? ' Would require step-up MFA + reason note (§6.1).' : ''),
    );
  }

  return (
    <div className="adm-grid-2">
      <section className="adm-panel" aria-labelledby="course-list-h">
        <div className="adm-panel-head">
          <h2 id="course-list-h">Courses &amp; lessons</h2>
          <p className="adm-panel-sub">{SAMPLE_COURSES.length} courses (sample)</p>
        </div>
        <div className="adm-table-wrap">
          <table className="adm-table" style={{ minWidth: 0 }}>
            <thead>
              <tr>
                <th scope="col">Title</th>
                <th scope="col">Tier</th>
                <th scope="col">Lessons</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_COURSES.map((course) => (
                <tr key={course.id}>
                  <td>
                    <div className="adm-cell-strong">{course.title}</div>
                    <div className="adm-cell-muted">Updated {course.updated}</div>
                  </td>
                  <td>{course.tier}</td>
                  <td className="adm-num">{course.lessons}</td>
                  <td>
                    <span className={`adm-status ${course.status}`}>{course.status}</span>
                  </td>
                  <td>
                    <div className="adm-row-actions">
                      <button type="button" className="adm-btn" onClick={() => handleRowAction(course, 'edit')}>
                        Edit
                      </button>
                      <button type="button" className="adm-btn" onClick={() => handleRowAction(course, 'publish')}>
                        {course.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button type="button" className="adm-btn danger" onClick={() => handleRowAction(course, 'delete')}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="adm-panel" aria-labelledby="course-form-h">
        <div className="adm-panel-head">
          <h2 id="course-form-h">Create / edit course</h2>
        </div>
        <form className="adm-form" onSubmit={handleCreate}>
          <div className="adm-field">
            <label htmlFor="course-title">Title</label>
            <input
              id="course-title"
              className="adm-input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Advanced Order Flow"
            />
          </div>
          <div className="adm-form-row">
            <div className="adm-field">
              <label htmlFor="course-tier">Tier</label>
              <select
                id="course-tier"
                className="adm-input"
                value={tier}
                onChange={(event) => setTier(event.target.value as CourseTier)}
              >
                {COURSE_TIERS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="adm-field">
              <label htmlFor="course-lessons">Lessons</label>
              <input id="course-lessons" className="adm-input" type="number" min={0} placeholder="0" />
            </div>
          </div>
          <div className="adm-field">
            <label htmlFor="course-summary">Summary</label>
            <textarea
              id="course-summary"
              className="adm-input"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              placeholder="Short description shown in the catalogue."
            />
          </div>
          <div className="adm-form-foot">
            <button type="submit" className="adm-btn primary">
              Save draft
            </button>
            <button
              type="button"
              className="adm-btn"
              onClick={() =>
                handleRowAction(
                  { id: 'new', title: title || 'untitled', tier: 'Entry', lessons: 0, status: 'draft', updated: '' },
                  'publish',
                )
              }
            >
              Publish
            </button>
          </div>
        </form>
        {status ? (
          <p className="adm-stub-status" role="status" aria-live="polite">
            {status}
          </p>
        ) : null}
      </section>
    </div>
  );
}
