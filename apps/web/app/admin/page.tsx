import { redirect } from 'next/navigation';

/**
 * Bare `/admin` → `/admin/overview`. The admin layout's `requireAdmin` gate has
 * already run by the time this renders, so this is a simple authenticated
 * redirect to the console home.
 */
export default function AdminIndexPage() {
  redirect('/admin/overview');
}
