/* FX Academy, shell builder: logo, public nav/footer, app sidebars/topbars.
   Keeps every page DRY. Call FXShell.* after DOM ready. */
(function (w) {

  // ---------- Faster, flash-free webfont loading ----------
  // Preconnect + parallel stylesheet so Hanken/Manrope are ready ASAP.
  (function preloadFonts(){
    try {
      const head = document.head || document.documentElement;
      const pc1 = document.createElement('link'); pc1.rel='preconnect'; pc1.href='https://fonts.googleapis.com';
      const pc2 = document.createElement('link'); pc2.rel='preconnect'; pc2.href='https://fonts.gstatic.com'; pc2.crossOrigin='anonymous';
      const css = document.createElement('link'); css.rel='stylesheet';
      css.href='https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap';
      head.append(pc1, pc2, css);
    } catch(e){}
  })();

  // ---------- Logo ----------
  // variant: 'dark' (for light bg) | 'light' (for dark bg) ; size in px height
  function logo(variant, h) {
    h = h || 30;
    const ink = variant === 'light' ? '#eef3ec' : '#0f3218';
    return `
    <span class="fx-logo" style="display:inline-flex;align-items:center;gap:10px;">
      <span style="display:inline-grid;place-items:center;width:${h+6}px;height:${h+6}px;border-radius:9px;background:linear-gradient(150deg,#0f3218,#001c07);box-shadow:inset 0 1px 0 rgba(255,255,255,.08);">
        <svg width="${h-6}" height="${h-6}" viewBox="0 0 24 24" fill="none">
          <path d="M3 19 L8 11 L13 14 L21 4" stroke="#c3f35c" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="21" cy="4" r="2.1" fill="#c3f35c"/>
          <path d="M3 21 H21" stroke="#c3f35c" stroke-width="1.4" stroke-linecap="round" opacity=".4"/>
        </svg>
      </span>
      <span style="font-family:var(--font-display);font-weight:700;font-size:${h*0.62}px;letter-spacing:-.02em;color:${ink};">FX&nbsp;Academy</span>
    </span>`;
  }

  // ---------- Public top nav ----------
  const PUB = [
    ['Home','home.html'],['Curriculum','curriculum.html'],['Pricing','pricing.html'],
    ['Webinars','webinars-landing.html'],['Tools','trading-tools.html'],['AI Learning','ai-learning-landing.html'],
    ['Affiliates','affiliate-landing.html'],['Partners','whitelabel-landing.html']
  ];
  function publicNav(active, opts) {
    opts = opts || {};
    const links = PUB.map(([t,h]) => `<a href="${h}" class="pubnav-link ${t===active?'active':''}">${t}</a>`).join('');
    const cta = opts.loggedIn
      ? `<a href="../member/dashboard.html" class="btn btn-forest btn-sm">Go to Dashboard</a>`
      : `<a href="login.html" class="pubnav-link">Login</a><a href="pricing.html" class="btn btn-lime btn-sm">Join Pro</a>`;
    return `
    <header class="pubnav sticky-top">
      <div class="wrap pubnav-inner">
        <a href="home.html">${logo('dark',28)}</a>
        <nav class="pubnav-links">${links}</nav>
        <div class="row gap2">${cta}</div>
        <button class="pubnav-burger" aria-label="Menu" onclick="document.querySelector('.pubnav-links').classList.toggle('open')">☰</button>
      </div>
    </header>
    <style>
      .pubnav{background:rgba(251,252,248,.78);backdrop-filter:blur(18px);border-bottom:1px solid rgba(110,117,109,.12);}
      .pubnav-inner{display:flex;align-items:center;justify-content:space-between;height:78px;gap:18px;position:relative;}
      .pubnav-links{display:flex;align-items:center;gap:6px;flex:1;justify-content:center;}
      .pubnav-link{font-size:13px;font-weight:700;color:var(--on-surface-var);padding:10px 14px;border-radius:9999px;transition:.15s;}
      .pubnav-link:hover{background:rgba(15,50,24,.05);color:var(--on-surface);}
      .pubnav-link.active{color:var(--primary);background:#fff;box-shadow:0 8px 22px rgba(15,50,24,.08);}
      .pubnav-links .pubnav-link.active{border:1px solid rgba(110,117,109,.12);}
      .pubnav-burger{display:none;background:none;border:0;font-size:22px;color:var(--on-surface);padding:6px;}
      @media(max-width:1080px){
        .pubnav-inner{height:72px;}
        .pubnav-links{display:none;position:absolute;top:76px;left:20px;right:20px;flex-direction:column;align-items:stretch;justify-content:flex-start;background:rgba(255,255,255,.95);padding:12px;border:1px solid var(--outline-var);border-radius:20px;box-shadow:var(--shadow-lg);}
        .pubnav-links.open{display:flex;}
        .pubnav-link{padding:12px 14px;}
        .pubnav-burger{display:block;}
      }
      @media(max-width:720px){
        .pubnav .row.gap2 .pubnav-link,
        .pubnav .row.gap2 .btn{display:none;}
      }
    </style>`;
  }

  function footer() {
    const cols = [
      ['Platform',[['Curriculum','curriculum.html'],['Pricing','pricing.html'],['Live Webinars','webinars-landing.html'],['Trading Tools','trading-tools.html'],['AI Learning','ai-learning-landing.html']]],
      ['Programs',[['Prop Firm Prep','../member/prop-firm.html'],['Strategy Library','../member/strategies.html'],['Certificates','../member/certificates.html'],['Free Education','curriculum.html']]],
      ['Business',[['Affiliates','affiliate-landing.html'],['Partners','whitelabel-landing.html'],['For Teams','whitelabel-landing.html'],['Contact','#']]],
      ['Company',[['About','#'],['Blog','#'],['Careers','#'],['Contact','#']]]
    ];
    return `
    <footer class="dark-sec" style="padding:64px 0 40px;">
      <div class="wrap">
        <div style="display:grid;grid-template-columns:1.4fr repeat(4,1fr);gap:32px;">
          <div>
            ${logo('light',28)}
            <p class="muted" style="color:var(--d-ink-var);margin:18px 0 0;max-width:240px;font-size:14px;">Structured forex education, live guidance, AI support, and built-in trading tools, in one disciplined platform.</p>
          </div>
          ${cols.map(([h,ls])=>`<div><div style="font-weight:700;font-size:13px;letter-spacing:.04em;text-transform:uppercase;color:var(--d-ink-var);margin-bottom:14px;">${h}</div>
            ${ls.map(([t,u])=>`<a href="${u}" style="display:block;color:var(--d-ink);font-size:14px;padding:6px 0;opacity:.85;">${t}</a>`).join('')}</div>`).join('')}
        </div>
        <hr style="border:0;border-top:1px solid var(--d-outline);margin:36px 0 22px;">
        <p style="font-size:12.5px;color:var(--d-ink-var);line-height:1.7;max-width:880px;">FX Academy provides educational content and tools only. Nothing on this platform is financial advice. Forex trading involves substantial risk and may not be suitable for all traders. Past performance does not guarantee future results.</p>
        <div class="between" style="margin-top:18px;flex-wrap:wrap;gap:12px;">
          <span style="font-size:13px;color:var(--d-ink-var);">© 2026 FX Academy. All rights reserved.</span>
          <div class="row gap3" style="font-size:13px;color:var(--d-ink-var);">
            <a href="#">Terms</a><a href="#">Privacy</a><a href="#">Risk Disclosure</a><a href="#">Affiliate Disclosure</a>
          </div>
        </div>
      </div>
    </footer>`;
  }

  // ---------- App shell (member / affiliate / admin / partner) ----------
  const ICON = {
    dashboard:'M3 13h8V3H3v10Zm10 8h8V3h-8v18ZM3 21h8v-6H3v6Z',
    learn:'M4 5h16v12H4z M4 17l8 4 8-4',book:'M5 4h14v16l-7-3-7 3z',
    live:'M12 8v8 M8 6v12 M16 6v12',play:'M8 5v14l11-7z',ai:'M12 3a4 4 0 0 1 4 4v1a4 4 0 0 1-8 0V7a4 4 0 0 1 4-4Z M5 20a7 7 0 0 1 14 0',
    journal:'M5 4h14v16H5z M9 8h6 M9 12h6 M9 16h3',calc:'M6 3h12v18H6z M9 7h6 M8 11h.01 M12 11h.01 M16 11h.01 M8 15h.01 M12 15h.01',
    chart:'M4 20V10 M10 20V4 M16 20v-8 M22 20H2',idea:'M9 18h6 M10 21h4 M12 3a6 6 0 0 1 4 10.5c-1 1-1 2-1 2.5H9c0-.5 0-1.5-1-2.5A6 6 0 0 1 12 3Z',
    community:'M17 20a5 5 0 0 0-10 0 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
    strategy:'M3 3v18h18 M7 14l4-4 3 3 5-6',prop:'M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z',
    cert:'M12 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z M9 13l-2 7 5-3 5 3-2-7',
    billing:'M3 6h18v12H3z M3 10h18',settings:'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.3 1a7 7 0 0 0-1.7-1l-.4-2.6H9.5L9 4a7 7 0 0 0-1.7 1l-2.3-1-2 3.4L5 9a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 1.7 1l.4 2.6h4.9l.4-2.6a7 7 0 0 0 1.7-1l2.3 1 2-3.4L19 13a7 7 0 0 0 0-1Z',
    members:'M17 20a5 5 0 0 0-10 0 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M22 20a4 4 0 0 0-5-3.9',
    revenue:'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
    link:'M9 15l6-6 M10 6l1-1a4 4 0 0 1 6 6l-1 1 M14 18l-1 1a4 4 0 0 1-6-6l1-1',
    payout:'M3 7h18v10H3z M3 11h18 M7 15h3',asset:'M4 5h16v14H4z M4 15l4-4 3 3 5-5 4 4',
    branding:'M12 3l2.5 6H21l-5 4 2 7-6-4-6 4 2-7-5-4h6.5z',domain:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M3 12h18 M12 3c3 3 3 15 0 18 M12 3c-3 3-3 15 0 18',
    crm:'M4 4h16v4H4z M4 12h16v8H4z',team:'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M3 20a6 6 0 0 1 12 0 M17 11a3 3 0 1 0 0-6 M15 20a6 6 0 0 1 6 0',
    overview:'M3 3h8v8H3z M13 3h8v5h-8z M13 12h8v9h-8z M3 13h8v8H3z',bell:'M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9 M13.7 21a2 2 0 0 1-3.4 0',
    search:'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z M21 21l-4.3-4.3',mod:'M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z M9 12l2 2 4-4'
  };
  function ic(name){ return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="19" height="19"><path d="${ICON[name]||ICON.dashboard}"/></svg>`; }

  // config: {brand:'FX Academy', items:[ [section, [[label,href,icon,locked?],...]] ], active, base, topRight }
  function appSidebar(cfg) {
    const groups = cfg.items.map(([section, links]) => `
      ${section?`<div class="nav-sec">${section}</div>`:''}
      ${links.map(([label,href,icon,locked])=>`
        <a href="${href}" class="nav-item ${label===cfg.active?'active':''} ${locked?'locked':''}">
          <span class="nav-ic">${ic(icon)}</span><span>${label}</span>
          ${locked?'<svg class="nav-lock" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>':''}
        </a>`).join('')}`).join('');
    return `
    <aside class="app-side">
      <div class="app-side-top">${cfg.logoVariant==='light'?logo('light',26):logo('dark',26)}</div>
      <nav class="app-nav">${groups}</nav>
      ${cfg.footer||''}
    </aside>`;
  }

  function appStyles() {
    return `<style>
      body{background:var(--surface);}
      .app{display:grid;grid-template-columns:248px 1fr;min-height:100vh;}
      .app-side{background:var(--d-bg);color:var(--d-ink);display:flex;flex-direction:column;position:sticky;top:0;height:100vh;overflow-y:auto;border-right:1px solid var(--d-outline);}
      .app-side-top{padding:20px 18px;border-bottom:1px solid var(--d-outline);}
      .app-nav{padding:12px 12px 24px;flex:1;}
      .nav-sec{font-size:10.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--d-ink-var);opacity:.7;padding:16px 12px 7px;}
      .nav-item{display:flex;align-items:center;gap:11px;padding:9px 12px;border-radius:9px;color:var(--d-ink);font-size:14px;font-weight:600;opacity:.82;transition:.15s;margin-bottom:1px;}
      .nav-item .nav-ic{display:inline-flex;opacity:.8;}
      .nav-item:hover{background:var(--glass-dark);opacity:1;}
      .nav-item.active{background:linear-gradient(90deg,rgba(168,214,66,.18),rgba(168,214,66,.04));color:#fff;opacity:1;box-shadow:inset 2px 0 0 var(--lime);}
      .nav-item.active .nav-ic{color:var(--lime);opacity:1;}
      .nav-item.locked{opacity:.5;} .nav-item.locked .nav-lock{margin-left:auto;}
      .app-main{display:flex;flex-direction:column;min-width:0;}
      .app-top{height:64px;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:0 28px;background:rgba(248,250,245,.85);backdrop-filter:blur(12px);border-bottom:1px solid var(--outline-var);position:sticky;top:0;z-index:30;}
      .app-body{padding:28px;flex:1;}
      .topsearch{display:flex;align-items:center;gap:9px;background:var(--c-low);border:1px solid var(--outline-var);border-radius:9999px;padding:8px 14px;color:var(--on-surface-var);font-size:13.5px;min-width:240px;cursor:pointer;}
      .icon-btn{width:38px;height:38px;display:grid;place-items:center;border-radius:9999px;border:1px solid var(--outline-var);background:var(--c-lowest);color:var(--on-surface-var);position:relative;}
      .icon-btn:hover{background:var(--c-low);}
      .avatar{width:38px;height:38px;border-radius:9999px;background:linear-gradient(150deg,#0f3218,#436648);color:#fff;display:grid;place-items:center;font-weight:700;font-size:14px;}
      .ndot{position:absolute;top:7px;right:9px;width:8px;height:8px;border-radius:50%;background:var(--lime-dim);border:2px solid var(--c-lowest);}
      @media(max-width:980px){.app{grid-template-columns:1fr;}.app-side{display:none;}}
    </style>`;
  }

  // top bar
  function appTop(cfg){
    cfg = cfg||{};
    return `
    <div class="app-top">
      <div class="row gap2">
        ${cfg.title?`<span style="font-family:var(--font-display);font-weight:700;font-size:18px;letter-spacing:-.02em;">${cfg.title}</span>`:''}
        <div class="topsearch" onclick="FXShell.palette&&FXShell.palette()">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <span>Search…</span><kbd style="margin-left:auto;font:600 11px Manrope;background:var(--c-high);padding:2px 6px;border-radius:5px;">⌘K</kbd>
        </div>
      </div>
      <div class="row gap2">
        ${cfg.right||''}
        <button class="icon-btn" title="Notifications" onclick="location.href='notifications.html'"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg><span class="ndot"></span></button>
        <div class="avatar" title="${cfg.user||'Alex Rivera'}">${(cfg.user||'AR').split(' ').map(s=>s[0]).slice(0,2).join('')}</div>
      </div>
    </div>`;
  }

  w.FXShell = { logo, publicNav, footer, appSidebar, appStyles, appTop, ic };

  // ---------- Nav presets per surface ----------
  // member items: [label, href, icon, proOnly?]
  const MEMBER = [
    ['',[['Dashboard','dashboard.html','dashboard'],['Learn','learn.html','book'],['Live Webinars','webinars.html','live',1],['AI Tutor','ai-tutor.html','ai',1]]],
    ['Trading',[['Trade Journal','journal.html','journal'],['Risk Calculator','risk-calculator.html','calc'],['Performance Analytics','analytics.html','chart',1],['Trade Ideas','trade-ideas.html','idea',1]]],
    ['Grow',[['Community','community.html','community',1],['Strategy Library','strategies.html','strategy'],['Prop Firm Prep','prop-firm.html','prop',1],['Certificates','certificates.html','cert']]],
    ['Account',[['Billing','billing.html','billing'],['Settings','settings.html','settings']]]
  ];
  const AFFILIATE = [
    ['',[['Overview','overview.html','overview'],['Referral Link','referral.html','link'],['Commissions','commissions.html','revenue'],['Payouts','payouts.html','payout'],['Promo Assets','assets.html','asset'],['Settings','settings.html','settings']]]
  ];
  const ADMIN = [
    ['',[['Overview','overview.html','overview'],['Members','members.html','members'],['Courses','courses.html','book'],['Lessons','courses.html','play'],['Webinars','webinars.html','live'],['Trade Ideas','trade-ideas.html','idea']]],
    ['Platform',[['AI Knowledge','ai-kb.html','ai'],['Community Mod','members.html','mod'],['Affiliates','affiliates.html','link'],['Revenue','revenue.html','revenue'],['White-label','partners.html','domain'],['CRM / Integrations','revenue.html','crm'],['Settings','members.html','settings']]]
  ];
  const PARTNER = [
    ['',[['Partner Overview','dashboard.html','overview'],['Branding','branding.html','branding'],['Domain','domain.html','domain'],['Course Library','dashboard.html','book'],['Members','members.html','members'],['Revenue / Licensing','billing.html','revenue'],['Team Access','dashboard.html','team'],['Settings','branding.html','settings']]]
  ];

  // build sidebar for a surface; plan='pro'|'basic' controls member locks
  function surfaceSidebar(surface, active, opts){
    opts = opts||{};
    const map = {member:MEMBER, affiliate:AFFILIATE, admin:ADMIN, partner:PARTNER}[surface];
    const plan = opts.plan||'pro';
    const items = map.map(([section, links])=> [section, links.map(l=>{
      const locked = surface==='member' && plan==='basic' && l[3];
      return [l[0], l[1], l[2], locked];
    })]);
    return appSidebar({items, active, logoVariant:'light', footer: opts.footer});
  }

  w.FXShell.surfaceSidebar = surfaceSidebar;
  w.FXShell.MEMBER = MEMBER;
})(window);
