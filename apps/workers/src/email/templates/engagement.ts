/**
 * Engagement / learning email templates (PRD §8.16).
 *
 * Each export is a PURE function of typed props → RenderedEmail. No I/O, no
 * globals — trivially unit-testable and identical given identical input
 * (immutability + determinism, ENGINEERING.md).
 *
 * Covers: webinar reminder, new trade idea, community reply,
 * weekly progress digest, product update, certificate earned.
 */
import { button, esc, greeting, layout, type RenderedEmail } from "./layout.js";

export interface WebinarReminderProps {
  readonly name?: string;
  readonly webinarTitle: string;
  readonly startsAt: string;
  readonly joinUrl: string;
  readonly leadTime: string;
}

export function webinarReminderEmail(p: WebinarReminderProps): RenderedEmail {
  return layout({
    subject: `Reminder: "${p.webinarTitle}" starts in ${p.leadTime}`,
    heading: "Your live webinar is coming up",
    bodyHtml: `<p>${greeting(p.name)}</p>
      <p><strong>${esc(p.webinarTitle)}</strong> starts <strong>${esc(p.startsAt)}</strong> (in ${esc(p.leadTime)}).</p>
      <p style="margin:22px 0">${button("Join the webinar", p.joinUrl)}</p>`,
    bodyText: `${p.webinarTitle} starts ${p.startsAt} (in ${p.leadTime}). Join: ${p.joinUrl}`,
  });
}

export interface NewTradeIdeaProps {
  readonly name?: string;
  readonly pair: string;
  readonly bias: string;
  readonly summary: string;
  readonly ideaUrl: string;
}

export function newTradeIdeaEmail(p: NewTradeIdeaProps): RenderedEmail {
  return layout({
    subject: `New trade idea: ${p.pair} (${p.bias})`,
    heading: "A new educational trade idea was published",
    bodyHtml: `<p>${greeting(p.name)}</p>
      <p>An educator just shared an idea on <strong>${esc(p.pair)}</strong> — ${esc(p.bias)} bias.</p>
      <p style="color:#5b6b62">${esc(p.summary)}</p>
      <p style="margin:22px 0">${button("View the idea", p.ideaUrl)}</p>
      <p style="font-size:12px;color:#5b6b62">Educational only — not financial advice or a signal to trade.</p>`,
    bodyText: `New trade idea on ${p.pair} (${p.bias}). ${p.summary} View: ${p.ideaUrl}\nEducational only — not financial advice.`,
  });
}

export interface CommunityReplyProps {
  readonly name?: string;
  readonly replierName: string;
  readonly threadTitle: string;
  readonly excerpt: string;
  readonly threadUrl: string;
}

export function communityReplyEmail(p: CommunityReplyProps): RenderedEmail {
  return layout({
    subject: `${p.replierName} replied to "${p.threadTitle}"`,
    heading: "You have a new reply",
    bodyHtml: `<p>${greeting(p.name)}</p>
      <p><strong>${esc(p.replierName)}</strong> replied in <strong>${esc(p.threadTitle)}</strong>:</p>
      <blockquote style="margin:14px 0;padding:10px 14px;border-left:3px solid #c3f35c;color:#5b6b62">${esc(p.excerpt)}</blockquote>
      <p style="margin:22px 0">${button("View the conversation", p.threadUrl)}</p>`,
    bodyText: `${p.replierName} replied in "${p.threadTitle}": ${p.excerpt}\nView: ${p.threadUrl}`,
  });
}

export interface WeeklyDigestRow {
  readonly label: string;
  readonly value: string;
}

export interface WeeklyDigestProps {
  readonly name?: string;
  readonly weekOf: string;
  readonly stats: ReadonlyArray<WeeklyDigestRow>;
  readonly dashboardUrl: string;
}

export function weeklyDigestEmail(p: WeeklyDigestProps): RenderedEmail {
  const rows = p.stats
    .map(
      (s) =>
        `<tr><td style="padding:6px 0;color:#5b6b62">${esc(s.label)}</td><td style="padding:6px 0;text-align:right;font-weight:700">${esc(s.value)}</td></tr>`,
    )
    .join("");
  const textRows = p.stats.map((s) => `  ${s.label}: ${s.value}`).join("\n");
  return layout({
    subject: `Your FX Academy progress — week of ${p.weekOf}`,
    heading: "Your weekly progress digest",
    bodyHtml: `<p>${greeting(p.name)}</p>
      <p>Here's how your week of <strong>${esc(p.weekOf)}</strong> looked:</p>
      <table style="width:100%;border-collapse:collapse;margin:14px 0">${rows}</table>
      <p style="margin:22px 0">${button("Open your dashboard", p.dashboardUrl)}</p>`,
    bodyText: `Your progress — week of ${p.weekOf}:\n${textRows}\nDashboard: ${p.dashboardUrl}`,
  });
}

export interface ProductUpdateProps {
  readonly name?: string;
  readonly title: string;
  readonly body: string;
  readonly learnMoreUrl: string;
}

export function productUpdateEmail(p: ProductUpdateProps): RenderedEmail {
  return layout({
    subject: `What's new: ${p.title}`,
    heading: p.title,
    bodyHtml: `<p>${greeting(p.name)}</p>
      <p>${esc(p.body)}</p>
      <p style="margin:22px 0">${button("Learn more", p.learnMoreUrl)}</p>`,
    bodyText: `${p.title}\n${p.body}\nLearn more: ${p.learnMoreUrl}`,
  });
}

export interface CertificateEarnedProps {
  readonly name?: string;
  readonly courseTitle: string;
  readonly certificateUrl: string;
}

export function certificateEarnedEmail(p: CertificateEarnedProps): RenderedEmail {
  return layout({
    subject: `Certificate earned: ${p.courseTitle}`,
    heading: "Congratulations — you earned a certificate",
    bodyHtml: `<p>${greeting(p.name)}</p>
      <p>You completed <strong>${esc(p.courseTitle)}</strong>. Your certificate is ready to download and share.</p>
      <p style="margin:22px 0">${button("View your certificate", p.certificateUrl)}</p>`,
    bodyText: `You completed ${p.courseTitle}. View your certificate: ${p.certificateUrl}`,
  });
}
