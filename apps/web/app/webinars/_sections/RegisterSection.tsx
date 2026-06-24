import { Container, Disclaimer, SurfaceCard } from '@fxunlock/ui';
import { RegistrationForm } from './RegistrationForm';

/**
 * Free public registration block. Server wrapper around the client form leaf.
 * Anchor target for the hero / session CTAs (`#register`).
 */
export function RegisterSection() {
  return (
    <section className="section" id="register" aria-labelledby="register-heading">
      <Container className="wbn-reg">
        <SurfaceCard padded style={{ textAlign: 'center' }}>
          <h2 id="register-heading" className="h-sm">
            Register for the free weekly webinar
          </h2>
          <p className="muted" style={{ margin: '8px 0 20px', fontSize: 14 }}>
            No subscription required. We&rsquo;ll send a calendar invite and a reminder.
          </p>

          <RegistrationForm />

          <Disclaimer
            kind="custom"
            style={{ marginTop: 16, fontSize: '11.5px' }}
          >
            Educational session only. Forex trading involves risk and is not financial advice.
          </Disclaimer>
        </SurfaceCard>
      </Container>
    </section>
  );
}
