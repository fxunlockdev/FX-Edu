import type { AdminIconName } from './nav-data';

/**
 * Stroke SVG paths for the admin sidebar, ported from the `ICON` map in
 * `design/assets/shell.js`. Pure data → rendered by `<NavIcon>`; no client JS.
 */
const ICON_PATHS: Record<AdminIconName, string> = {
  overview: 'M3 3h8v8H3z M13 3h8v5h-8z M13 12h8v9h-8z M3 13h8v8H3z',
  members: 'M17 20a5 5 0 0 0-10 0 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M22 20a4 4 0 0 0-5-3.9',
  courses: 'M5 4h14v16l-7-3-7 3z',
  lessons: 'M8 5v14l11-7z',
  webinars: 'M12 8v8 M8 6v12 M16 6v12',
  ideas: 'M9 18h6 M10 21h4 M12 3a6 6 0 0 1 4 10.5c-1 1-1 2-1 2.5H9c0-.5 0-1.5-1-2.5A6 6 0 0 1 12 3Z',
  ai: 'M12 3a4 4 0 0 1 4 4v1a4 4 0 0 1-8 0V7a4 4 0 0 1 4-4Z M5 20a7 7 0 0 1 14 0',
  mod: 'M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z M9 12l2 2 4-4',
  affiliates: 'M9 15l6-6 M10 6l1-1a4 4 0 0 1 6 6l-1 1 M14 18l-1 1a4 4 0 0 1-6-6l1-1',
  revenue: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  whitelabel: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M3 12h18 M12 3c3 3 3 15 0 18 M12 3c-3 3-3 15 0 18',
  crm: 'M4 4h16v4H4z M4 12h16v8H4z',
  settings:
    'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.3 1a7 7 0 0 0-1.7-1l-.4-2.6H9.5L9 4a7 7 0 0 0-1.7 1l-2.3-1-2 3.4L5 9a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 1.7 1l.4 2.6h4.9l.4-2.6a7 7 0 0 0 1.7-1l2.3 1 2-3.4L19 13a7 7 0 0 0 0-1Z',
};

interface NavIconProps {
  name: AdminIconName;
}

export function NavIcon({ name }: NavIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}
