/**
 * Per-lesson teaching content for the Lesson Player tabs (M3 / PROJECT.md §8.4):
 * transcript, lesson notes and a mini quiz. The real content pipeline
 * (lessons/lesson_assets/quizzes) is owned by the db package + the content team;
 * this module supplies designed, educational placeholder content keyed by lesson
 * id with a sensible default so every lesson renders something real.
 *
 * All copy is purely educational. Nothing here recommends a trade or projects a
 * return (PROJECT.md §6.5 compliance posture).
 */

export interface TranscriptCue {
  /** Timestamp label, e.g. "07:05". */
  readonly time: string;
  /** Spoken line for that cue. */
  readonly text: string;
}

export interface QuizQuestion {
  readonly prompt: string;
  readonly options: readonly string[];
  /** Index of the correct option. */
  readonly correct: number;
  /** Shown after a correct answer. */
  readonly explanation: string;
}

export interface LessonContent {
  readonly transcript: readonly TranscriptCue[];
  readonly notes: readonly string[];
  readonly quiz: QuizQuestion;
}

/** Default content used when a lesson has no bespoke entry yet. */
const DEFAULT_CONTENT: LessonContent = {
  transcript: [
    {
      time: '00:30',
      text: 'In this lesson we build on the previous concept and connect it to a repeatable, rule-based process you can journal and review.',
    },
    {
      time: '02:10',
      text: 'Notice that the goal is consistency of process, not predicting every move. We define the conditions first, then we act only when they are met.',
    },
    {
      time: '04:45',
      text: 'We close by tying this back to risk: no single idea matters more than protecting capital and following your plan.',
    },
  ],
  notes: [
    'Define your conditions before you act — never decide mid-trade.',
    'Process over outcome: a good decision can still lose, and that is fine.',
    'Journal the reasoning so you can review it objectively later.',
    'Risk management sits underneath every concept in this course.',
  ],
  quiz: {
    prompt: 'What is the primary aim of a rule-based process?',
    options: [
      'To predict the exact top and bottom of every move',
      'To make decisions consistent and reviewable, not to be right every time',
      'To trade as often as possible',
      'To remove the need for risk management',
    ],
    correct: 1,
    explanation: 'A rule-based process makes your decisions consistent and reviewable — being right every time is not the goal.',
  },
};

/**
 * Bespoke content for a few signature lessons (the rest fall back to the default).
 * Keyed by the lesson id from `courses-data.ts`.
 */
const CONTENT_BY_LESSON: Readonly<Record<string, LessonContent>> = {
  'advanced-liquidity-l1': {
    transcript: [
      {
        time: '07:05',
        text: 'Liquidity pools form where clusters of orders rest — typically just beyond obvious swing highs and lows, and around round numbers.',
      },
      {
        time: '07:48',
        text: 'Price is often drawn toward these zones because that is where stop losses and pending orders sit. A liquidity grab is when price sweeps the level then reverses.',
      },
      {
        time: '08:30',
        text: 'Notice how price can run a prior-day high before reversing. That sweep is your signal that liquidity was taken — but you still wait for confirmation.',
      },
    ],
    notes: [
      'Liquidity rests beyond swing highs/lows and round numbers.',
      'A liquidity sweep = price runs a level, then reverses.',
      'Mark prior-day high/low and the session range before the next session.',
      'Wait for the sweep plus confirmation — never anticipate.',
    ],
    quiz: {
      prompt: 'Where does resting liquidity most commonly sit?',
      options: [
        'At the exact mid-point of a candle',
        'Just beyond swing highs/lows and round numbers',
        'Only during the Asian session',
        'Wherever a moving average crosses',
      ],
      correct: 1,
      explanation: 'Liquidity clusters beyond obvious levels — swing highs/lows and round numbers — where stops and pending orders rest.',
    },
  },
  'entry-what-is-forex-l1': {
    transcript: [
      {
        time: '00:20',
        text: 'Forex is the market for exchanging one currency for another. Prices are always quoted as a pair — what one currency is worth in terms of another.',
      },
      {
        time: '01:30',
        text: 'It is the largest, most liquid market in the world, open 24 hours across global sessions, but liquidity and volatility shift through the day.',
      },
      {
        time: '03:00',
        text: 'Before placing any order you need to understand the pair, the spread, and the risk — which is exactly what this tier covers.',
      },
    ],
    notes: [
      'A forex price is always a relationship between two currencies.',
      'The market runs 24 hours across overlapping global sessions.',
      'Liquidity and spread vary through the day — they are not constant.',
      'Understanding risk basics comes before placing any order.',
    ],
    quiz: {
      prompt: 'How is a forex price always expressed?',
      options: [
        'As a single number in one currency',
        'As a pair — one currency valued in terms of another',
        'Only in US dollars',
        'As a percentage of your account',
      ],
      correct: 1,
      explanation: 'Forex is always quoted as a pair: the value of one currency expressed in terms of another.',
    },
  },
};

/** Resolve the teaching content for a lesson, falling back to the default. */
export function getLessonContent(lessonId: string): LessonContent {
  return CONTENT_BY_LESSON[lessonId] ?? DEFAULT_CONTENT;
}
