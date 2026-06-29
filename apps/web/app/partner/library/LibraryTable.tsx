'use client';

import { useState } from 'react';
import { Badge } from '@fxunlock/ui';

export interface CourseRow {
  readonly id: string;
  readonly title: string;
  readonly source: 'FX Academy' | 'Partner';
  readonly tier: 'Foundation' | 'Pro' | 'Partner';
  readonly lessons: number;
  readonly visible: boolean;
}

interface LibraryTableProps {
  readonly courses: ReadonlyArray<CourseRow>;
}

/**
 * Course library table with per-course hide/show toggles (isolated client leaf).
 * Toggling is LOCAL/STUBBED — no persistence. When wired, visibility is written
 * to the tenant's curriculum config via an RLS-scoped server action so a partner
 * only ever changes their OWN catalog.
 * TODO: persist tier/course visibility (org-scoped write).
 */
export function LibraryTable({ courses }: LibraryTableProps) {
  const [rows, setRows] = useState<ReadonlyArray<CourseRow>>(courses);

  function toggle(id: string) {
    // Immutable update — map to a new array with the one row replaced.
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, visible: !row.visible } : row)),
    );
  }

  return (
    <div className="pt-table-wrap">
      <table className="tbl lib-table">
        <thead>
          <tr>
            <th>Course</th>
            <th>Source</th>
            <th>Tier</th>
            <th>Lessons</th>
            <th>Shown to members</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="lib-title">{row.title}</td>
              <td>
                <Badge tone={row.source === 'Partner' ? 'lime' : 'neutral'}>{row.source}</Badge>
              </td>
              <td>
                <Badge tone={tierTone(row.tier)}>{row.tier}</Badge>
              </td>
              <td className="num">{row.lessons}</td>
              <td>
                <label className="lib-toggle">
                  <input
                    type="checkbox"
                    checked={row.visible}
                    onChange={() => toggle(row.id)}
                    aria-label={`Show ${row.title} to members`}
                  />
                  <span className="lib-switch" aria-hidden="true" />
                  <span className="lib-toggle-label">{row.visible ? 'Visible' : 'Hidden'}</span>
                </label>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function tierTone(tier: CourseRow['tier']): 'forest' | 'lime-dark' | 'outline' {
  if (tier === 'Foundation') return 'outline';
  if (tier === 'Partner') return 'lime-dark';
  return 'forest';
}
