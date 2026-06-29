import { describe, expect, it } from 'vitest';
import { resolveChannel, channelByKey, initials } from './community-data';
import { validatePost, type CreatePostInput } from './create-post';
import { validateReport, type ReportInput } from './report-target';

/**
 * Pure helper tests (M12 / PROJECT.md §12). Deterministic, no I/O — the network
 * writes (`createPost`/`submitReport`) wrap these validators, so covering the
 * validators covers the moderation/auto-hold logic and channel routing without a
 * Supabase mock. The auto-hold cases are the security-relevant ones: they keep
 * signal-selling / DM-solicitation framing out of the feed (§12 auto-hold).
 */

function post(overrides: Partial<CreatePostInput> = {}): CreatePostInput {
  return {
    channel: 'general',
    body: 'Sharing my reasoning on EUR/USD structure — not a trade idea.',
    attachmentName: null,
    ...overrides,
  };
}

function report(overrides: Partial<ReportInput> = {}): ReportInput {
  return {
    targetType: 'post',
    targetId: 'post-1',
    reason: 'spam',
    note: '',
    ...overrides,
  };
}

describe('resolveChannel', () => {
  it('keeps a known channel key', () => {
    expect(resolveChannel('psychology')).toBe('psychology');
  });

  it('defaults unknown / missing values to general', () => {
    expect(resolveChannel('nope')).toBe('general');
    expect(resolveChannel(undefined)).toBe('general');
    expect(resolveChannel('')).toBe('general');
  });
});

describe('channelByKey', () => {
  it('returns the matching channel', () => {
    expect(channelByKey('fundamentals').label).toBe('Fundamentals');
  });
});

describe('initials', () => {
  it('takes up to two leading letters', () => {
    expect(initials('Jordan S.')).toBe('JS');
    expect(initials('marcus vale')).toBe('MV');
    expect(initials('Madonna')).toBe('M');
  });
});

describe('validatePost', () => {
  it('accepts an educational post', () => {
    expect(validatePost(post())).toEqual({ ok: true });
  });

  it('rejects an empty body', () => {
    expect(validatePost(post({ body: '   ' })).ok).toBe(false);
  });

  it('rejects an unknown channel', () => {
    expect(validatePost(post({ channel: 'bogus' as CreatePostInput['channel'] })).ok).toBe(false);
  });

  it('rejects an over-long body', () => {
    expect(validatePost(post({ body: 'x'.repeat(2001) })).ok).toBe(false);
  });

  it('auto-holds DM solicitation', () => {
    const result = validatePost(post({ body: 'DM me for my private signals 🔥' }));
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.held).toBe(true);
  });

  it('auto-holds guaranteed-profit framing', () => {
    const result = validatePost(post({ body: 'guaranteed profit, buy now before it moves' }));
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.held).toBe(true);
  });

  it('auto-holds join-my-group solicitation', () => {
    expect(validatePost(post({ body: 'join my telegram for calls' })).ok).toBe(false);
  });
});

describe('validateReport', () => {
  it('accepts a valid reason', () => {
    expect(validateReport(report())).toEqual({ ok: true });
  });

  it('rejects an unknown reason', () => {
    expect(validateReport(report({ reason: 'made-up' })).ok).toBe(false);
  });

  it('rejects an over-long note', () => {
    expect(validateReport(report({ note: 'x'.repeat(1001) })).ok).toBe(false);
  });
});
