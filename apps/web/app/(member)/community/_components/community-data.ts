/**
 * Community & Pods (M12 / PROJECT.md §12) — view-model types + seed data.
 *
 * This module owns the shared TypeScript shapes for the Community surface and the
 * SAMPLE seed used while the backend is still being provisioned. The canonical
 * tables (`community_channels`/`community_posts`/`community_comments`/`reactions`/
 * `reports`/`pods`/`pod_members`) are owned by the db package + F-series Supabase
 * migrations (PROJECT.md §12, §550). The web screens read real posts through the
 * RLS-scoped server client when the table is deployed, and fall back to this seed
 * so the page degrades gracefully during bring-up (mirrors dashboard/journal).
 *
 * No realtime here: presence + unread counts are stubbed sample values.
 * // TODO: wire Supabase Realtime for presence/unread (PROJECT.md §12 "Realtime").
 */

/** Stable channel keys — used as the `?channel=` URL state and the DB slug. */
export type ChannelKey =
  | 'general'
  | 'technical-analysis'
  | 'fundamentals'
  | 'psychology'
  | 'journaling'
  | 'wins-and-lessons'
  | 'prop-firm-prep';

export interface Channel {
  readonly key: ChannelKey;
  readonly label: string;
  /** Short blurb shown under the channel header. */
  readonly blurb: string;
}

/**
 * The seven channels from the design + PROJECT.md §12. Order is intentional:
 * General first (the default), then topic rooms, then the prop-firm track.
 */
export const CHANNELS: ReadonlyArray<Channel> = [
  { key: 'general', label: 'General', blurb: 'Introductions, questions, and day-to-day discussion.' },
  {
    key: 'technical-analysis',
    label: 'Technical analysis',
    blurb: 'Chart structure, levels, and setups — share the reasoning, not just the call.',
  },
  {
    key: 'fundamentals',
    label: 'Fundamentals',
    blurb: 'Macro, rates, and the news that moves pairs.',
  },
  {
    key: 'psychology',
    label: 'Psychology',
    blurb: 'Discipline, tilt, and the inner game of trading.',
  },
  {
    key: 'journaling',
    label: 'Journaling',
    blurb: 'Process, review habits, and learning from your own trades.',
  },
  {
    key: 'wins-and-lessons',
    label: 'Wins & lessons',
    blurb: 'Celebrate the process and unpack what a trade taught you.',
  },
  {
    key: 'prop-firm-prep',
    label: 'Prop firm prep',
    blurb: 'Evaluations, drawdown rules, and passing your challenge the right way.',
  },
];

const CHANNEL_KEYS: ReadonlySet<string> = new Set(CHANNELS.map((c) => c.key));

/** Narrow an arbitrary `?channel=` value to a real channel, defaulting to General. */
export function resolveChannel(raw: string | undefined): ChannelKey {
  if (raw && CHANNEL_KEYS.has(raw)) return raw as ChannelKey;
  return 'general';
}

/** Look up a channel by key (always defined — falls back to General). */
export function channelByKey(key: ChannelKey): Channel {
  return CHANNELS.find((c) => c.key === key) ?? CHANNELS[0]!;
}

/** Two-letter initials for an avatar from a display name. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export interface CommunityPost {
  readonly id: string;
  readonly authorName: string;
  /** Educator / Pro / Basic — drives the role chip next to the name. */
  readonly authorRole: 'Educator' | 'Pro' | 'Basic';
  readonly channel: ChannelKey;
  /** Human relative time (sample). Real rows derive this from `created_at`. */
  readonly timeAgo: string;
  readonly body: string;
  readonly reactions: number;
  readonly replies: number;
}

/**
 * Seed posts (sample). Each is framed as education/observation — never a buy/sell
 * call, never a solicitation — matching the community rules and §12 auto-hold
 * policy for recommendation-framed content.
 */
export const SEED_POSTS: ReadonlyArray<CommunityPost> = [
  {
    id: 'seed-1',
    authorName: 'Jordan S.',
    authorRole: 'Pro',
    channel: 'technical-analysis',
    timeAgo: '12m',
    body:
      'Finally clicked how liquidity sits above equal highs after re-watching the masterclass. Marked up EUR/USD and the sweep + reclaim was textbook. Not a trade, just an observation on structure.',
    reactions: 24,
    replies: 6,
  },
  {
    id: 'seed-2',
    authorName: 'Priya R.',
    authorRole: 'Pro',
    channel: 'psychology',
    timeAgo: '38m',
    body:
      'Took a small loss today and instead of revenge trading I journaled it and walked away. Small win for discipline — the process matters more than any single outcome.',
    reactions: 41,
    replies: 12,
  },
  {
    id: 'seed-3',
    authorName: 'Mike K.',
    authorRole: 'Pro',
    channel: 'prop-firm-prep',
    timeAgo: '1h',
    body:
      'Passed phase 1 of my evaluation using strict 1% risk. The risk calculator here genuinely changed how I size positions. Onto phase 2 — staying patient.',
    reactions: 58,
    replies: 15,
  },
  {
    id: 'seed-4',
    authorName: 'Marcus Vale',
    authorRole: 'Educator',
    channel: 'general',
    timeAgo: '2h',
    body:
      'Welcome to the new members who joined this week. Read the rules, share your reasoning, and ask questions freely — that is how everyone here levels up.',
    reactions: 33,
    replies: 9,
  },
  {
    id: 'seed-5',
    authorName: 'Dana Cole',
    authorRole: 'Educator',
    channel: 'journaling',
    timeAgo: '3h',
    body:
      'Reminder for the weekend review: tag each trade with the setup and your emotional state. The patterns you find in your own journal beat any generic tip.',
    reactions: 27,
    replies: 4,
  },
  {
    id: 'seed-6',
    authorName: 'Lena T.',
    authorRole: 'Basic',
    channel: 'wins-and-lessons',
    timeAgo: '5h',
    body:
      'Lesson of the week: I kept moving my stop and turned a planned small loss into a big one. Writing it here so I actually remember it next time.',
    reactions: 19,
    replies: 7,
  },
];

export interface OnlineMember {
  readonly name: string;
  readonly role: 'Educator' | 'Pro' | 'Basic';
}

/** Sample presence list. // TODO: wire Supabase Realtime presence. */
export const ONLINE_MEMBERS: ReadonlyArray<OnlineMember> = [
  { name: 'Marcus Vale', role: 'Educator' },
  { name: 'Dana Cole', role: 'Educator' },
  { name: 'Jordan S.', role: 'Pro' },
  { name: 'Priya R.', role: 'Pro' },
  { name: 'Mike K.', role: 'Pro' },
  { name: 'Lena T.', role: 'Basic' },
];

/** Stubbed "active now" count shown above the presence list. */
export const ONLINE_COUNT = 248;

export interface Pod {
  readonly id: string;
  readonly name: string;
  /** Current vs target headcount (accountability pods are 6–10 traders). */
  readonly members: number;
  readonly capacity: number;
  /** This week's shared goal (sample). */
  readonly weeklyGoal: string;
  /** How many members have checked in this week (sample). */
  readonly checkedIn: number;
  /** Stubbed unread message count. // TODO: wire Supabase Realtime unread. */
  readonly unread: number;
  /** Whether the current member belongs to this pod (sample). */
  readonly joined: boolean;
}

/**
 * Sample accountability pods (PROJECT.md §12: 6–10 traders, weekly goals/check-ins,
 * unread counts, admin assignment + self-join). All counts are stubbed sample data.
 */
export const SEED_PODS: ReadonlyArray<Pod> = [
  {
    id: 'pod-1',
    name: 'Sunrise Session',
    members: 8,
    capacity: 10,
    weeklyGoal: 'Journal every trade with a tagged setup + emotion score.',
    checkedIn: 6,
    unread: 3,
    joined: true,
  },
  {
    id: 'pod-2',
    name: 'Risk First',
    members: 7,
    capacity: 10,
    weeklyGoal: 'No trade over 1% risk; post your sizing before entry.',
    checkedIn: 5,
    unread: 0,
    joined: false,
  },
  {
    id: 'pod-3',
    name: 'Evaluation Squad',
    members: 9,
    capacity: 10,
    weeklyGoal: 'Daily drawdown check-in during the prop challenge.',
    checkedIn: 8,
    unread: 12,
    joined: false,
  },
];
