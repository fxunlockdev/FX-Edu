/**
 * Pure preference-resolution logic (PRD §8.16 — preference-aware fan-out).
 *
 * Given a user's stored `notification_preferences` rows and a target
 * (channel, type), decide whether that channel may fire. No I/O — the
 * dispatcher loads prefs once and asks this module per channel. Deterministic
 * and unit-tested (see preferences.test.ts).
 *
 * Default policy: **opt-out, not opt-in.** A channel is enabled unless an
 * explicit row disables it. This matches the DB column default
 * (`enabled boolean default true`) so a user with no rows yet still receives
 * notifications, while an explicit `enabled = false` always suppresses.
 */

/** The two channels this worker fans out to (push is out of scope for M15). */
export type Channel = "in_app" | "email";

/** A single stored preference row (subset of notification_preferences). */
export interface PreferenceRow {
  readonly channel: string;
  readonly type: string;
  readonly enabled: boolean;
}

/** Resolved decision for one (channel, type) target. */
export interface ChannelDecision {
  readonly channel: Channel;
  readonly allowed: boolean;
}

/**
 * Is a given channel allowed for this notification type?
 *
 * An explicit matching row wins; absence of a row means allowed (opt-out model).
 */
export function isChannelEnabled(
  preferences: ReadonlyArray<PreferenceRow>,
  channel: Channel,
  type: string,
): boolean {
  const match = preferences.find(
    (row) => row.channel === channel && row.type === type,
  );
  return match ? match.enabled : true;
}

/**
 * Resolve every channel for a notification type in one pass. Returns a frozen
 * decision per channel so the dispatcher can fan out without re-querying.
 */
export function resolveChannels(
  preferences: ReadonlyArray<PreferenceRow>,
  type: string,
  channels: ReadonlyArray<Channel> = ["in_app", "email"],
): ReadonlyArray<ChannelDecision> {
  return channels.map((channel) =>
    Object.freeze({
      channel,
      allowed: isChannelEnabled(preferences, channel, type),
    }),
  );
}

/** Convenience: may we email this user for this type? */
export function mayEmail(
  preferences: ReadonlyArray<PreferenceRow>,
  type: string,
): boolean {
  return isChannelEnabled(preferences, "email", type);
}

/** Convenience: may we write an in-app notification for this type? */
export function mayNotifyInApp(
  preferences: ReadonlyArray<PreferenceRow>,
  type: string,
): boolean {
  return isChannelEnabled(preferences, "in_app", type);
}
