'use client';

import { useId, useRef, useState } from 'react';
import { Button } from '@fxunlock/ui';
import { createClient } from '@/lib/supabase/client';
import { createPost, type CreatePostInput } from './create-post';
import { channelByKey, type ChannelKey, type CommunityPost } from './community-data';

/**
 * Post composer (PROJECT.md §12). Client leaf: the page shell + post list stay
 * server-rendered; this owns the form, the stubbed attachment picker, and the
 * RLS-scoped write.
 *
 * Posting writes to `community_posts` through the RLS-scoped client. On success
 * we OPTIMISTICALLY hand the new post up to the feed so it appears immediately;
 * if the table is not deployed yet, the write degrades gracefully and we still
 * add the post locally so the member is never blocked during bring-up.
 *
 * Upload is STUBBED — only the filename is captured (no bytes, no storage, no
 * malware scan yet). // TODO: wire Supabase Storage upload + ClamAV scan.
 */

interface ComposerProps {
  readonly channel: ChannelKey;
  readonly authorName: string;
  readonly onPosted: (post: CommunityPost) => void;
}

export function Composer({ channel, authorName, onPosted }: ComposerProps) {
  const fileId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [body, setBody] = useState('');
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const channelLabel = channelByKey(channel).label;

  function reset() {
    setBody('');
    setAttachmentName(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const input: CreatePostInput = { channel, body, attachmentName };
    setSubmitting(true);
    try {
      const supabase = createClient();
      const result = await createPost(supabase, input);
      if (!result.ok) {
        // Auto-hold (solicitation) and validation errors are surfaced inline;
        // we do NOT optimistically add a held post.
        setError(result.error);
        return;
      }

      // Optimistic add — the feed shows the post immediately.
      const optimistic: CommunityPost = {
        id: `local-${Date.now()}`,
        authorName,
        authorRole: 'Pro',
        channel,
        timeAgo: 'just now',
        body: body.trim(),
        reactions: 0,
        replies: 0,
      };
      onPosted(optimistic);
      reset();
    } catch {
      setError('Something went wrong posting. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="cm-composer" onSubmit={handleSubmit} aria-busy={submitting}>
      <div className="cm-composer-field">
        <label htmlFor="cm-composer-body" className="sr-only">
          Share a chart, a lesson, or a question in {channelLabel}
        </label>
        <textarea
          id="cm-composer-body"
          className="input cm-composer-input"
          rows={2}
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            setError(null);
          }}
          placeholder={`Share a chart, a lesson, or a question in ${channelLabel}…`}
          maxLength={2000}
        />
      </div>

      <div className="cm-composer-foot">
        <label className="cm-attach" htmlFor={fileId}>
          <ImageIcon />
          {attachmentName ? (
            <span className="cm-attach-name">
              {attachmentName} <span className="muted">· upload coming soon</span>
            </span>
          ) : (
            <span>Add chart / image</span>
          )}
          <input
            ref={fileRef}
            id={fileId}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => setAttachmentName(e.target.files?.[0]?.name ?? null)}
          />
        </label>

        <Button type="submit" variant="forest" size="sm" disabled={submitting || body.trim().length === 0}>
          {submitting ? 'Posting…' : `Post to ${channelLabel}`}
        </Button>
      </div>

      {error && (
        <p className="cm-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

function ImageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}
