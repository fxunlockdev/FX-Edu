import { Logo } from '../logo/Logo';
import { Disclaimer } from '../disclaimer/Disclaimer';
import { FOOTER_COLUMNS, FOOTER_LEGAL_LINKS } from './footer-data';

interface FooterProps {
  /** Year shown in the copyright line. Defaults to the current year. */
  year?: number;
}

/**
 * Site footer — brand + tagline, four link columns, the mandatory risk
 * disclaimer, and the Terms/Privacy/Risk/Affiliate legal links.
 * Ported from design/assets/shell.js `footer()`.
 */
export function Footer({ year = new Date().getFullYear() }: FooterProps) {
  return (
    <footer className="dark-sec site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <Logo variant="light" size={28} />
            <p className="footer-tagline">
              Structured forex education, live guidance, AI support, and built-in trading tools, in
              one disciplined platform.
            </p>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <div className="footer-colhead">{col.heading}</div>
              {col.links.map((link, i) => (
                <a key={`${link.href}-${i}`} href={link.href} className="footer-link">
                  {link.label}
                </a>
              ))}
            </nav>
          ))}
        </div>

        <hr className="footer-rule" />

        <Disclaimer kind="risk" className="footer-risk" />

        <div className="between" style={{ marginTop: 18, flexWrap: 'wrap', gap: 12 }}>
          <span className="footer-legal">© {year} FX Academy. All rights reserved.</span>
          <div className="row gap3 footer-legal">
            {FOOTER_LEGAL_LINKS.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
