'use client';

import { useState } from 'react';
import { Composer } from './Composer';
import { PostCard } from './PostCard';
import { channelByKey, type ChannelKey, type CommunityPost } from './community-data';

/**
 * Channel feed — composer + post list. This is a thin client wrapper so a newly
 * posted message can be added OPTIMISTICALLY above the existing posts without a
 * round-trip (PROJECT.md §267 "optimistic UI on community with rollback").
 *
 * The initial posts come from the RSC page (real RLS rows when the table is
 * deployed, otherwise the seed). Channel is URL state, owned by the page; the
 * feed just renders whatever channel slice it was handed.
 */
interface FeedProps {
  readonly channel: ChannelKey;
  readonly authorName: string;
  readonly initialPosts: ReadonlyArray<CommunityPost>;
}

export function Feed({ channel, authorName, initialPosts }: FeedProps) {
  const [extra, setExtra] = useState<ReadonlyArray<CommunityPost>>([]);

  const channelLabel = channelByKey(channel).label;
  const posts = [...extra, ...initialPosts];

  return (
    <div className="cm-feed">
      <Composer
        channel={channel}
        authorName={authorName}
        onPosted={(post) => setExtra((prev) => [post, ...prev])}
      />

      {posts.length === 0 ? (
        <div className="cm-empty">
          <h2>Be the first to post in {channelLabel}</h2>
          <p className="muted">
            Share a chart breakdown, a lesson from a recent trade, or a question. Keep it
            educational — reasoning over calls.
          </p>
        </div>
      ) : (
        <div className="cm-posts">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
