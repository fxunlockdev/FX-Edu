import { Badge } from '@fxunlock/ui';
import { Avatar } from './Avatar';
import { PostActions } from './PostActions';
import { channelByKey, type CommunityPost } from './community-data';

/**
 * A single community post. Server-rendered as a semantic `<article>`; only the
 * interactive footer (react / save / report) is a client leaf. The author role
 * is shown as a chip so educators and Pro members are legible at a glance.
 */
export function PostCard({ post }: { post: CommunityPost }) {
  const channel = channelByKey(post.channel);
  const roleTone = post.authorRole === 'Educator' ? 'lime' : post.authorRole === 'Pro' ? 'forest' : 'outline';

  return (
    <article className="cm-post" aria-label={`Post by ${post.authorName} in ${channel.label}`}>
      <header className="cm-post-head">
        <Avatar name={post.authorName} />
        <div className="cm-post-meta">
          <p className="cm-post-author">
            {post.authorName}
            <Badge tone={roleTone} className="cm-role">
              {post.authorRole}
            </Badge>
            <span className="cm-post-time"> · {post.timeAgo}</span>
          </p>
          <p className="cm-post-channel">in {channel.label}</p>
        </div>
      </header>

      <p className="cm-post-body">{post.body}</p>

      <PostActions
        postId={post.id}
        authorName={post.authorName}
        reactions={post.reactions}
        replies={post.replies}
      />
    </article>
  );
}
