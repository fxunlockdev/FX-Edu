// Live Webinars & Replays (M8) — internal component/data barrel.

// Page-level components. The client leaves (Countdown, SessionActions,
// ReplayFilters) are implementation details of these and are imported directly
// by their parents, not re-exported here.
export { NextLiveHero } from './NextLiveHero';
export { UpcomingSchedule } from './UpcomingSchedule';
export { ReplayLibrary } from './ReplayLibrary';
export { RemindersNote } from './RemindersNote';

// Data seed + selectors
export { LIVE_SESSIONS, REPLAYS, nextLiveSession } from './sessions-data';

// Pure helpers
export {
  TOPIC_TABS,
  REMINDER_SCHEDULE,
  resolveTopic,
  filterByTopic,
  resolvePlan,
  isEntitled,
  sessionStatus,
  joinDecision,
  accessLabel,
} from './sessions-types';

// Types
export type {
  Plan,
  SessionTopic,
  AccessLevel,
  SessionStatus,
  RegistrationState,
  LiveSession,
  Replay,
  TopicTab,
  JoinBlockReason,
} from './sessions-types';
