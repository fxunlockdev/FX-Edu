/**
 * Sample member rows for the Admin Members table (PROJECT.md §9 module 19
 * "Members"). STUBBED — no data source. Real data is RLS-scoped and read through
 * the API with access auditing.
 *
 * // TODO: replace with a paginated, server-side-filtered admin members API.
 */

export type MemberStatus = 'active' | 'suspended' | 'banned';
export type MemberPlan = 'Basic' | 'Pro' | 'Elite';

export interface MemberRow {
  id: string;
  name: string;
  email: string;
  plan: MemberPlan;
  status: MemberStatus;
  joined: string;
  lastActive: string;
}

export const SAMPLE_MEMBERS: readonly MemberRow[] = [
  {
    id: 'usr_8fa21',
    name: 'Alex Rivera',
    email: 'alex.rivera@example.com',
    plan: 'Pro',
    status: 'active',
    joined: '2025-11-02',
    lastActive: '2h ago',
  },
  {
    id: 'usr_3b7c9',
    name: 'Priya Nair',
    email: 'priya.nair@example.com',
    plan: 'Elite',
    status: 'active',
    joined: '2025-09-18',
    lastActive: '1d ago',
  },
  {
    id: 'usr_91de4',
    name: 'Marcus Vale',
    email: 'marcus.vale@example.com',
    plan: 'Basic',
    status: 'suspended',
    joined: '2026-01-22',
    lastActive: '6d ago',
  },
  {
    id: 'usr_55a02',
    name: 'Hana Kimura',
    email: 'hana.kimura@example.com',
    plan: 'Pro',
    status: 'active',
    joined: '2025-12-09',
    lastActive: '5h ago',
  },
  {
    id: 'usr_2cc18',
    name: 'Tomás Beck',
    email: 'tomas.beck@example.com',
    plan: 'Basic',
    status: 'banned',
    joined: '2025-08-30',
    lastActive: '3w ago',
  },
  {
    id: 'usr_77f63',
    name: 'Lena Osei',
    email: 'lena.osei@example.com',
    plan: 'Elite',
    status: 'active',
    joined: '2026-02-14',
    lastActive: '12m ago',
  },
] as const;
