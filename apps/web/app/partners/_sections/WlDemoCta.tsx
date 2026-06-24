import { Container } from '@fxunlock/ui';
import { DemoForm } from './DemoForm';

const HIGHLIGHTS = [
  ['Full branded academy', 'on your domain, colors and logo — live for your members.'],
  ['Curriculum engine', 'use our structured courses or publish your own branded library.'],
  ['Member & licensing dashboard', 'engagement, retention and commercials in one view.'],
  ['Guided onboarding', 'a partnerships team that helps you launch in days, not months.'],
] as const;

/**
 * Closing dark "book a demo" band — pairs an outcome checklist with the stubbed
 * contact form (DemoForm, a client leaf). Carries the page's anchor target.
 */
export function WlDemoCta() {
  return (
    <section
      className="section dark-sec"
      id="book-demo"
      aria-labelledby="wl-demo-heading"
    >
      <div
        className="glow glow-lime"
        style={{ width: 520, height: 320, top: -120, left: '50%', transform: 'translateX(-50%)', opacity: 0.28 }}
      />

      <Container>
        <div className="wl-demo-grid">
          <div>
            <div className="eyebrow" style={{ color: 'var(--lime)' }}>
              Book a demo
            </div>
            <h2
              id="wl-demo-heading"
              className="h-md"
              style={{ margin: '10px 0 14px', maxWidth: 460 }}
            >
              Bring your audience. We&apos;ll bring the platform.
            </h2>
            <p
              className="body-lg"
              style={{ color: 'var(--d-ink-var)', maxWidth: 460, margin: 0 }}
            >
              See the white-label academy end to end and talk through licensing or
              revenue-share. Here&apos;s what your partnership includes:
            </p>

            <ul className="wl-checklist">
              {HIGHLIGHTS.map(([title, rest]) => (
                <li key={title}>
                  <span className="wl-check" aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  <span>
                    <b>{title}</b> — {rest}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <DemoForm />
        </div>
      </Container>
    </section>
  );
}
