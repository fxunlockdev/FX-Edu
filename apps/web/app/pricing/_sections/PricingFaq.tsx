import { Container } from '@fxunlock/ui';
import { FAQ_ITEMS } from './plans';

/**
 * Pricing FAQ. Native `<details>` accordions — keyboard-accessible and
 * zero-JS, so this stays a server component. The "Is this financial advice?"
 * entry keeps the mandatory educational-only framing (PROJECT.md §5).
 */
export function PricingFaq() {
  return (
    <section className="section" style={{ background: 'var(--c-low)' }} aria-labelledby="faq-heading">
      <Container>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div className="eyebrow">Questions</div>
          <h2 id="faq-heading" className="h-lg" style={{ margin: '10px 0 0' }}>
            Pricing FAQ
          </h2>
        </div>

        <div className="pp-faq">
          {FAQ_ITEMS.map(([question, answer]) => (
            <details key={question} className="pp-qa">
              <summary>
                <span>{question}</span>
                <span className="pp-qa-mark" aria-hidden="true">
                  +
                </span>
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
