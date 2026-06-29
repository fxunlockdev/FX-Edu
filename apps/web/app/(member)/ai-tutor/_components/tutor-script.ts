/**
 * Static content for the AI Tutor (M7 / PROJECT.md §7). Pure data — no model
 * call, no side effects. Everything here is educational copy only: it never
 * contains buy/sell/entry/exit signals or profit-guarantee language (§6.5).
 *
 * AI responses are STUBBED for this module: the live tutor (RAG over approved
 * course content + pre/post moderation through the API gateway) is not wired
 * yet, so the chat replays a fixed, clearly-labeled demo and the send handler
 * returns a placeholder. See {@link STUB_RESPONSE} and the send call site in
 * `TutorChat.tsx`.
 */

/** The four tutor modes from §7. `id` keys both the rail and the send context. */
export type TutorModeId = 'explain' | 'quiz' | 'next' | 'review';

export interface TutorMode {
  readonly id: TutorModeId;
  readonly label: string;
  /** Decorative glyph (aria-hidden in the UI). */
  readonly glyph: string;
  /** One-line description of what the mode does. */
  readonly hint: string;
}

export const TUTOR_MODES: ReadonlyArray<TutorMode> = [
  { id: 'explain', label: 'Explain', glyph: '✦', hint: 'Break a concept down, tied to your lesson.' },
  { id: 'quiz', label: 'Quiz me', glyph: '?', hint: 'Practice questions on what you are studying.' },
  { id: 'next', label: "What's next", glyph: '↳', hint: 'Suggest the next thing to study.' },
  { id: 'review', label: 'Review a trade', glyph: '⚑', hint: 'Reflect on a logged trade — process, not calls.' },
];

/** Suggested prompts shown as chips under the chat (§7 "suggested prompts"). */
export const SUGGESTED_PROMPTS: ReadonlyArray<string> = [
  'Explain liquidity',
  'Quiz me on order types',
  'What should I study next?',
  'Explain fair value gap',
  'Review my last trade',
];

/** A single turn in the chat. `role: 'me'` is the learner; `'ai'` is the tutor. */
export interface ChatTurn {
  readonly role: 'me' | 'ai';
  readonly text: string;
}

/**
 * The scripted demo conversation replayed on first paint. Every AI turn is
 * educational, course-grounded, and explicitly avoids signals or guarantees —
 * mirroring how the moderated live tutor will be allowed to answer.
 */
export const DEMO_SCRIPT: ReadonlyArray<ChatTurn> = [
  {
    role: 'ai',
    text: "Hi. You're on Liquidity & Market Structure. I can explain a concept, quiz you, suggest what to study next, or help you reflect on a logged trade. What would you like to do?",
  },
  { role: 'me', text: 'Explain liquidity' },
  {
    role: 'ai',
    text: 'Liquidity is where resting orders cluster — usually just above swing highs or below swing lows, where stop-losses sit. Price often moves toward those pools to fill orders before reversing. This is a concept to understand, not a cue to act. Want me to quiz you on it?',
  },
];

/**
 * Canned placeholder returned by the stubbed send handler. The live tutor
 * (RAG + moderation via the API gateway) is not integrated yet, so we never
 * fabricate an answer — we say so plainly. Educational framing only.
 */
export const STUB_RESPONSE =
  'AI tutor responses are coming soon — model integration is pending. When it goes live, I will answer from your approved course content only, with moderation on every reply. I will explain and quiz, but never tell you what to buy, sell, or where to enter or exit.';

/** Mode-aware opening line shown when the learner switches modes (educational). */
export const MODE_INTRO: Record<TutorModeId, string> = {
  explain: 'Explain mode — ask about any concept in your current lesson.',
  quiz: 'Quiz mode — I will ask practice questions. Answers are for learning, not trade calls.',
  next: "What's next — I will suggest the next topic based on your progress.",
  review: 'Review a trade — we will reflect on your process and reasoning, never on entries or exits.',
};
