'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from './use-reduced-motion';

/**
 * A single turn in the scripted, educational tutor conversation.
 * `role: 'me'` is the learner; `role: 'ai'` is the tutor.
 */
interface Turn {
  readonly role: 'me' | 'ai';
  readonly text: string;
}

const SCRIPT: ReadonlyArray<Turn> = [
  { role: 'me', text: 'Explain liquidity simply' },
  {
    role: 'ai',
    text: 'Liquidity is where lots of resting orders sit, usually above swing highs or below swing lows. Price often moves to fill them before reversing. Want a chart example?',
  },
  { role: 'me', text: 'Quiz me on it' },
  {
    role: 'ai',
    text: 'Sure. Where would resting buy-stops most likely sit relative to a recent swing high? Take your time — this is just practice.',
  },
];

const TYPE_MS = 18; // per-character cadence for the active AI message
const HOLD_MS = 600; // pause before the next learner turn appears

/**
 * Client leaf: a course-aware tutor chat that types itself out.
 *
 * Progressive enhancement — the server renders the full conversation, so the
 * card is complete without JS and for `prefers-reduced-motion`. Only when JS
 * runs and motion is allowed do we replay the script as a typewriter. All
 * copy is educational and contains no buy/sell signals or profit language.
 */
export function ChatPreview() {
  const reduced = useReducedMotion();
  // `visible` = fully-revealed turns; `typing` = the AI turn currently typing.
  const [visible, setVisible] = useState<number>(reduced ? SCRIPT.length : 0);
  const [typed, setTyped] = useState<string>('');

  useEffect(() => {
    if (reduced) {
      setVisible(SCRIPT.length);
      return;
    }

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    function revealFrom(index: number): void {
      if (cancelled || index >= SCRIPT.length) return;
      const turn = SCRIPT[index];
      if (!turn) return;

      if (turn.role === 'me') {
        setVisible(index + 1);
        timers.push(setTimeout(() => revealFrom(index + 1), HOLD_MS));
        return;
      }

      // AI turn: type it out character by character, then commit it.
      setTyped('');
      let char = 0;
      const tick = (): void => {
        if (cancelled) return;
        char += 1;
        setTyped(turn.text.slice(0, char));
        if (char < turn.text.length) {
          timers.push(setTimeout(tick, TYPE_MS));
        } else {
          setVisible(index + 1);
          setTyped('');
          timers.push(setTimeout(() => revealFrom(index + 1), HOLD_MS));
        }
      };
      tick();
    }

    revealFrom(0);
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [reduced]);

  const typingTurn = !reduced && visible < SCRIPT.length ? SCRIPT[visible] : null;
  const isTypingAi = typingTurn?.role === 'ai';

  return (
    <div className="ai-chat-log" role="log" aria-label="Example tutor conversation">
      {SCRIPT.slice(0, visible).map((turn, i) => (
        <p key={i} className={`ai-msg ai-msg-${turn.role}`}>
          {turn.text}
        </p>
      ))}

      {isTypingAi && (
        <p className="ai-msg ai-msg-ai ai-msg-typing" aria-hidden="true">
          {typed}
          <span className="ai-caret" />
        </p>
      )}
    </div>
  );
}
