'use client';

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Disclaimer } from '@fxunlock/ui';
import { useReducedMotion } from './use-reduced-motion';
import {
  DEMO_SCRIPT,
  MODE_INTRO,
  STUB_RESPONSE,
  SUGGESTED_PROMPTS,
  TUTOR_MODES,
  type ChatTurn,
  type TutorModeId,
} from './tutor-script';

const TYPE_MS = 16; // per-character cadence for the replayed demo AI message
const HOLD_MS = 550; // pause before the next demo turn appears

interface Message extends ChatTurn {
  readonly id: number;
  /** Marks the canned placeholder so it can be styled/announced as a stub. */
  readonly stub?: boolean;
}

let nextId = 0;
function makeMessage(turn: ChatTurn, stub = false): Message {
  nextId += 1;
  return { id: nextId, role: turn.role, text: turn.text, stub };
}

/**
 * AI Tutor chat — the single interactive island for M7 (PROJECT.md §7).
 *
 * STUBBED: there is no model or API call here. The live tutor (RAG over approved
 * course content + pre/post moderation through the API gateway) is not wired
 * yet, so the send handler returns a clearly-labeled placeholder and the chat
 * replays a fixed educational demo on first paint. The one place a real request
 * will go is marked at the send call site below.
 *
 * Guardrails are surfaced in the UI, not just in policy: the AI `Disclaimer`
 * (kind="ai") sits directly under the composer, the rail states the hard limits,
 * and every scripted line is educational only — no buy/sell/entry/exit signals
 * and no profit guarantees (§6.5).
 */
export function TutorChat() {
  const reduced = useReducedMotion();
  const [mode, setMode] = useState<TutorModeId>('explain');
  const [messages, setMessages] = useState<ReadonlyArray<Message>>([]);
  const [draft, setDraft] = useState<string>('');
  const [typed, setTyped] = useState<string>('');
  const [typingText, setTypingText] = useState<string | null>(null);
  const streamRef = useRef<HTMLDivElement | null>(null);

  // ── Replay the scripted demo on mount (typewriter unless reduced-motion). ──
  useEffect(() => {
    if (reduced) {
      setMessages(DEMO_SCRIPT.map((turn) => makeMessage(turn)));
      return;
    }

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const revealFrom = (index: number): void => {
      if (cancelled || index >= DEMO_SCRIPT.length) {
        setTypingText(null);
        return;
      }
      const turn = DEMO_SCRIPT[index];
      if (!turn) return;

      if (turn.role === 'me') {
        setMessages((prev) => [...prev, makeMessage(turn)]);
        timers.push(setTimeout(() => revealFrom(index + 1), HOLD_MS));
        return;
      }

      // AI turn: type it out, then commit it as a settled message.
      setTypingText(turn.text);
      setTyped('');
      let char = 0;
      const tick = (): void => {
        if (cancelled) return;
        char += 1;
        setTyped(turn.text.slice(0, char));
        if (char < turn.text.length) {
          timers.push(setTimeout(tick, TYPE_MS));
        } else {
          setTypingText(null);
          setMessages((prev) => [...prev, makeMessage(turn)]);
          timers.push(setTimeout(() => revealFrom(index + 1), HOLD_MS));
        }
      };
      tick();
    };

    revealFrom(0);
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [reduced]);

  // Keep the newest message in view as the log grows.
  useEffect(() => {
    const el = streamRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typed]);

  /**
   * Send a learner message. STUBBED: appends the question, then a clearly-
   * labeled placeholder. No network, no model — nothing is fabricated.
   */
  const send = useCallback((raw: string) => {
    const text = raw.trim();
    if (!text) return;

    // TODO: POST /ai/conversations via the API gateway (RAG + moderation)
    setMessages((prev) => [
      ...prev,
      makeMessage({ role: 'me', text }),
      makeMessage({ role: 'ai', text: STUB_RESPONSE }, true),
    ]);
    setDraft('');
  }, []);

  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    send(draft);
  };

  const onDraftChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setDraft(event.target.value);
  };

  // `mode` is always a valid id, so a match always exists; the fallback label
  // only satisfies `noUncheckedIndexedAccess` and is never reached at runtime.
  const activeModeLabel = TUTOR_MODES.find((m) => m.id === mode)?.label ?? 'Explain';

  return (
    <div className="tut-wrap">
      {/* Left rail: modes, course context, guardrails. */}
      <aside className="tut-rail" aria-label="Tutor controls">
        <section className="tut-rcard" aria-labelledby="tut-mode-h">
          <h2 id="tut-mode-h" className="tut-rl">
            Tutor mode
          </h2>
          <div className="tut-modes" role="radiogroup" aria-label="Tutor mode">
            {TUTOR_MODES.map((m) => {
              const on = m.id === mode;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  className={`tut-mode${on ? ' on' : ''}`}
                  onClick={() => setMode(m.id)}
                >
                  <span className="tut-mode-glyph" aria-hidden="true">
                    {m.glyph}
                  </span>
                  {m.label}
                </button>
              );
            })}
          </div>
          <p className="tut-mode-hint">{MODE_INTRO[mode]}</p>
        </section>

        <section className="tut-rcard" aria-labelledby="tut-ctx-h">
          <h2 id="tut-ctx-h" className="tut-rl">
            Context
          </h2>
          <p className="tut-ctx-body">
            Tied to <strong>Tier 2 · Liquidity &amp; Market Structure</strong>. The tutor knows where
            you are in the course.
          </p>
        </section>

        <section className="tut-rcard tut-guard" aria-labelledby="tut-guard-h">
          <h2 id="tut-guard-h" className="tut-rl tut-rl-on-dark">
            Guardrails
          </h2>
          <ul className="tut-guard-list">
            <li>Educational only — never financial advice</li>
            <li>No buy/sell, entry, exit or stop levels</li>
            <li>No profit promises or market predictions</li>
          </ul>
        </section>
      </aside>

      {/* Chat column. */}
      <section className="tut-chat" aria-labelledby="tut-chat-h">
        <header className="tut-chat-head">
          <span className="tut-ava" aria-hidden="true">
            ✦
          </span>
          <div>
            <h2 id="tut-chat-h" className="tut-chat-title">
              Academy AI Tutor
            </h2>
            <p className="tut-chat-sub">Course-aware · {activeModeLabel} mode</p>
          </div>
          <span className="tut-status" aria-hidden="true">
            Preview
          </span>
        </header>

        <div className="tut-stream" ref={streamRef} role="log" aria-label="Tutor conversation" aria-live="polite">
          {messages.map((m) => (
            <div key={m.id} className={`tut-row${m.role === 'me' ? ' me' : ''}`}>
              {m.role === 'ai' && (
                <span className="tut-ava" aria-hidden="true">
                  ✦
                </span>
              )}
              <p className={`tut-msg ${m.role}${m.stub ? ' tut-msg-stub' : ''}`}>
                {m.stub && <span className="tut-stub-tag">Coming soon</span>}
                {m.text}
              </p>
            </div>
          ))}

          {typingText !== null && (
            <div className="tut-row" aria-hidden="true">
              <span className="tut-ava">✦</span>
              <p className="tut-msg ai tut-msg-typing">
                {typed}
                <span className="tut-caret" />
              </p>
            </div>
          )}
        </div>

        <div className="tut-prompts" aria-label="Suggested prompts">
          {SUGGESTED_PROMPTS.map((p) => (
            <button key={p} type="button" className="tut-chip" onClick={() => send(p)}>
              {p}
            </button>
          ))}
        </div>

        <form className="tut-composer" onSubmit={onSubmit}>
          <label htmlFor="tut-input" className="sr-only">
            Ask the tutor about your current lesson
          </label>
          <input
            id="tut-input"
            className="input"
            placeholder="Ask about your current lesson…"
            value={draft}
            onChange={onDraftChange}
            autoComplete="off"
          />
          <button type="submit" className="btn btn-forest" disabled={!draft.trim()}>
            Send
          </button>
        </form>

        <Disclaimer kind="ai" variant="callout" className="tut-disclaimer" />
      </section>
    </div>
  );
}
