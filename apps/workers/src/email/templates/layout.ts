/**
 * Minimal, dependency-free email layout helpers.
 *
 * Templates are pure functions of typed props → { subject, html, text }. We
 * keep the HTML deliberately simple (inline styles, table-free) — no heavy
 * email-component lib — so the worker has a tiny surface and no build step for
 * markup. The Lumina brand colours (forest #0f3218, lime #c3f35c) match the
 * design system (PROJECT.md §5 design port).
 */

export interface RenderedEmail {
  readonly subject: string;
  readonly html: string;
  readonly text: string;
}

const BRAND = {
  forest: "#0f3218",
  lime: "#c3f35c",
  ink: "#13201a",
  muted: "#5b6b62",
  surface: "#f6f8f5",
} as const;

/** HTML-escape a dynamic string before interpolating into markup (XSS-safe). */
export function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function greeting(name?: string): string {
  return name ? `Hi ${esc(name)},` : "Hi there,";
}

/** A primary call-to-action button. `href` is trusted (built server-side). */
export function button(label: string, href: string): string {
  return `<a href="${esc(href)}" style="display:inline-block;background:${BRAND.lime};color:${BRAND.forest};font-weight:700;text-decoration:none;padding:12px 22px;border-radius:10px;font-size:15px">${esc(label)}</a>`;
}

export interface LayoutProps {
  readonly subject: string;
  readonly heading: string;
  readonly bodyHtml: string;
  readonly bodyText: string;
}

/**
 * Wrap a template body in the shared shell. Returns both html and text so every
 * email is multipart and accessible in plain-text clients.
 */
export function layout(props: LayoutProps): RenderedEmail {
  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;background:${BRAND.surface};font-family:'Hanken Grotesk',-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${BRAND.ink}">
    <div style="max-width:560px;margin:0 auto;padding:32px 20px">
      <div style="font-weight:800;font-size:18px;color:${BRAND.forest};margin-bottom:24px">FX Academy</div>
      <div style="background:#ffffff;border-radius:16px;padding:28px;border:1px solid #e7ece8">
        <h1 style="margin:0 0 14px;font-size:22px;line-height:1.25;color:${BRAND.forest}">${esc(props.heading)}</h1>
        <div style="font-size:15px;line-height:1.6;color:${BRAND.ink}">${props.bodyHtml}</div>
      </div>
      <p style="font-size:12px;color:${BRAND.muted};margin-top:24px;line-height:1.5">
        You're receiving this because of your FX Academy notification preferences.
        Manage them anytime in Settings &rsaquo; Notifications.
      </p>
    </div>
  </body>
</html>`;

  const text = `FX Academy\n\n${props.heading}\n\n${props.bodyText}\n\n— You're receiving this based on your notification preferences. Manage them in Settings > Notifications.`;

  return { subject: props.subject, html, text };
}
