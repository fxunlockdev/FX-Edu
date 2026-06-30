import { describe, expect, it } from 'vitest';
import { isSubscriptionActive } from './decide';
import type { SubscriptionStatus } from './types';

describe('isSubscriptionActive', () => {
  it('treats active and trialing as active', () => {
    expect(isSubscriptionActive('active')).toBe(true);
    expect(isSubscriptionActive('trialing')).toBe(true);
  });

  it.each<SubscriptionStatus>([
    'past_due',
    'canceled',
    'incomplete',
    'unpaid',
    'paused',
  ])('treats %s as inactive', (status) => {
    expect(isSubscriptionActive(status)).toBe(false);
  });

  it('is a total function over every status', () => {
    const all: SubscriptionStatus[] = [
      'active',
      'trialing',
      'past_due',
      'canceled',
      'incomplete',
      'unpaid',
      'paused',
    ];
    for (const status of all) {
      expect(typeof isSubscriptionActive(status)).toBe('boolean');
    }
  });
});
