import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Logo, Badge, Disclaimer } from '@fxunlock/ui';
import { createClient } from '@/lib/supabase/server';
import { getViewerPlan, isPro } from '@/lib/entitlements/plan';
import { SignOutButton } from '../_components/SignOutButton';
import {
  ChannelRail,
  Feed,
  RightRail,
  PodsSection,
  CommunityLock,
  SEED_POSTS,
  resolveChannel,
  channelByKey,
  type ChannelKey,
  type CommunityPost,
} from './_components';
import './community.css';

export const metadata: Metadata = {
  title: 'Community',
  robots: { index: false, follow: false },
};

interface CommunityPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

/** Shape of a `community_posts` row the feed reads (RLS-scoped). */
interface CommunityPostRow {
  id: string;
  channel: string;
  body: string;
  created_at: string;
  author_name: string | null;
  author_role: string | null;
  reaction_count: number | null;
  reply_count: number | null;
}

const POST_SELECT_COLUMNS =
  'id, channel, body, created_at, author_name, author_role, reaction_count, reply_count';

/** Coarse relative time for sample/real rows (no i18n lib for v1). */
function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.round(diffMs / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

function normalizeRole(role: string | null): CommunityPost['authorRole'] {
  if (role === 'Educator' || role === 'Basic') return role;
  return 'Pro';
}

/** Map an RLS-scoped DB row to the feed's view-model. */
function rowToPost(row: CommunityPostRow): CommunityPost {
  return {
    id: row.id,
    authorName: row.author_name ?? 'Member',
    authorRole: normalizeRole(row.author_role),
    channel: resolveChannel(row.channel),
    timeAgo: timeAgo(row.created_at),
    body: row.body,
    reactions: row.reaction_count ?? 0,
    replies: row.reply_count ?? 0,
  };
}

/**
 * Community & Pods (RSC) — PROJECT.md §12 module 12 / §8.11.
 *
 * Auth is already guaranteed by the `(member)` layout. The entitlement (plan)
 * gate is enforced HERE, server-side, before any community read runs — the
 * server-side gate is authoritative; the UI lock is only a hint (§6.1, §12 🔒
 * "Basic can't read via direct URL — RLS + entitlement"). Plan is read from the
 * shared entitlements helper and defaults defensively to Basic.
 *
 * Pro path: the active channel is URL state (`?channel=`). We read that channel's
 * posts through the RLS-scoped server client and DEGRADE GRACEFULLY to the seed
 * sample if `community_posts` is not deployed yet. Realtime presence/unread is
 * stubbed (no Supabase Realtime subscription).
 * // TODO: wire Supabase Realtime for presence/unread.
 */
export default async function CommunityPage({ searchParams }: CommunityPageProps) {
  const params = await searchParams;
  const channel: ChannelKey = resolveChannel(firstParam(params.channel));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Entitlement gate (server-side; authoritative). Defaults to Basic. ──────
  const pro = isPro(await getViewerPlan());
  const email = user?.email ?? null;
  const authorName = email ? (email.split('@')[0] ?? 'You') : 'You';

  if (!pro) {
    return (
      <Shell isPro={false}>
        <div className="cm-head">
          <h1 className="h-md">Community</h1>
          <p className="muted">
            Learn alongside other traders. Be supportive, stay on topic, no signal-selling.
          </p>
        </div>
        <CommunityLock />
        <Disclaimer kind="risk" variant="note" style={{ marginTop: 28 }} />
      </Shell>
    );
  }

  // ── Pro path: RLS-scoped read of the active channel, seed fallback. ─────
  let posts: ReadonlyArray<CommunityPost> = SEED_POSTS.filter((p) => p.channel === channel);

  if (user) {
    const { data, error } = await supabase
      .from('community_posts')
      .select(POST_SELECT_COLUMNS)
      .eq('channel', channel)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      const rows = data as CommunityPostRow[];
      // Use real rows when present; otherwise keep the seed so the screen is alive.
      if (rows.length > 0) posts = rows.map(rowToPost);
    }
  }

  const activeChannel = channelByKey(channel);

  return (
    <Shell isPro>
      <div className="cm-head">
        <h1 className="h-md">Community</h1>
        <p className="muted">
          Learn alongside other traders. Be supportive, stay on topic, no signal-selling.
        </p>
      </div>

      <div className="cm-layout">
        <aside className="cm-col-left">
          <ChannelRail active={channel} />
        </aside>

        <div className="cm-col-main">
          <div className="cm-channel-banner">
            <h2 className="cm-section-title">
              <span className="cm-hash" aria-hidden="true">
                #
              </span>
              {activeChannel.label}
            </h2>
            <p className="muted">{activeChannel.blurb}</p>
          </div>

          <Feed channel={channel} authorName={authorName} initialPosts={posts} />

          <PodsSection />
        </div>

        <aside className="cm-col-right">
          <RightRail />
        </aside>
      </div>

      <Disclaimer kind="risk" variant="note" style={{ marginTop: 28 }} />
    </Shell>
  );
}

function Shell({ isPro, children }: { isPro: boolean; children: ReactNode }) {
  return (
    <div className="cm">
      <header className="cm-top">
        <a href="/" aria-label="FX Academy home">
          <Logo variant="dark" size={26} />
        </a>
        <div className="row gap2" style={{ alignItems: 'center' }}>
          <Badge tone={isPro ? 'lime-dark' : 'outline'}>{isPro ? 'Pro' : 'Basic'}</Badge>
          <SignOutButton />
        </div>
      </header>
      <main className="cm-main" id="main">
        {children}
      </main>
    </div>
  );
}
