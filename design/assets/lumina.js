/* FX Academy, shared helpers: SVG charts (lime gradients), toasts, utils */
(function (w) {
  const NS = 'http://www.w3.org/2000/svg';
  const el = (n, a) => { const e = document.createElementNS(NS, n); for (const k in (a||{})) e.setAttribute(k, a[k]); return e; };

  function uid(p){ return p + Math.random().toString(36).slice(2,8); }

  // ---- Area / line chart ----
  // opts: {data:[..], width, height, color, fill(bool), pad, dark}
  function areaChart(mount, opts){
    const o = Object.assign({width:mount.clientWidth||520, height:160, color:'#a8d642', fill:true, pad:6, smooth:true, dark:false, axis:false}, opts);
    const data = o.data; const W=o.width, H=o.height, P=o.pad;
    const max = Math.max(...data), min = Math.min(...data);
    const rng = (max-min)||1;
    const sx = (W-P*2)/(data.length-1);
    const sy = (H-P*2)/rng;
    const pts = data.map((d,i)=>[P+i*sx, H-P-(d-min)*sy]);
    let path = '';
    if(o.smooth){
      path = `M${pts[0][0]},${pts[0][1]}`;
      for(let i=1;i<pts.length;i++){
        const [x0,y0]=pts[i-1],[x1,y1]=pts[i];
        const cx=(x0+x1)/2; path+=` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
      }
    } else { path = 'M'+pts.map(p=>p.join(',')).join(' L'); }
    const svg = el('svg',{viewBox:`0 0 ${W} ${H}`, width:'100%', height:H, preserveAspectRatio:'none'});
    const gid = uid('g');
    const defs = el('defs'); const lg = el('linearGradient',{id:gid,x1:0,y1:0,x2:0,y2:1});
    lg.append(el('stop',{offset:'0%','stop-color':o.color,'stop-opacity':o.dark?.55:.45}));
    lg.append(el('stop',{offset:'100%','stop-color':o.color,'stop-opacity':0}));
    defs.append(lg); svg.append(defs);
    if(o.fill){ const area = el('path',{d:`${path} L${pts[pts.length-1][0]},${H-P} L${pts[0][0]},${H-P} Z`, fill:`url(#${gid})`}); svg.append(area); }
    svg.append(el('path',{d:path, fill:'none', stroke:o.color, 'stroke-width':2.4, 'stroke-linecap':'round','stroke-linejoin':'round'}));
    // last dot
    const last = pts[pts.length-1];
    svg.append(el('circle',{cx:last[0], cy:last[1], r:3.5, fill:o.color, stroke:o.dark?'#0a1410':'#fff','stroke-width':2}));
    mount.innerHTML=''; mount.append(svg);
  }

  // ---- Sparkline (tiny) ----
  function spark(mount, data, color){
    areaChart(mount,{data, height: mount.clientHeight||44, color:color||'#a8d642', fill:true, pad:3, dark:true});
  }

  // ---- Bar chart ----
  // opts:{data:[{label,value,color?}], height, dark, max}
  function barChart(mount, opts){
    const o = Object.assign({width:mount.clientWidth||520, height:200, dark:false, color:'#a8d642'}, opts);
    const data=o.data; const W=o.width,H=o.height; const P=24; const gap=10;
    const max = o.max || Math.max(...data.map(d=>d.value))*1.1;
    const bw = (W - P*2 - gap*(data.length-1))/data.length;
    const svg = el('svg',{viewBox:`0 0 ${W} ${H}`, width:'100%', height:H});
    data.forEach((d,i)=>{
      const h = (d.value/max)*(H-P-18);
      const x = P + i*(bw+gap); const y = H-18-h;
      svg.append(el('rect',{x, y, width:bw, height:Math.max(h,2), rx:5, fill:d.color||o.color, opacity:d.dim?0.45:1}));
      const t = el('text',{x:x+bw/2, y:H-4, 'text-anchor':'middle', 'font-size':11, fill:o.dark?'#a9bcae':'#727971','font-family':'Manrope'}); t.textContent=d.label; svg.append(t);
    });
    mount.innerHTML=''; mount.append(svg);
  }

  // ---- Donut ----
  // opts:{segments:[{value,color,label}], size, thickness, center}
  function donut(mount, opts){
    const o=Object.assign({size:160, thickness:22, dark:false}, opts);
    const S=o.size, R=S/2, r=R-o.thickness/2; const cx=R, cy=R;
    const total=o.segments.reduce((a,s)=>a+s.value,0)||1;
    const svg=el('svg',{viewBox:`0 0 ${S} ${S}`, width:S, height:S});
    svg.append(el('circle',{cx,cy,r,fill:'none',stroke:o.dark?'rgba(255,255,255,.08)':'#e7e9e4','stroke-width':o.thickness}));
    let off=0; const C=2*Math.PI*r;
    o.segments.forEach(s=>{
      const len=(s.value/total)*C;
      const c=el('circle',{cx,cy,r,fill:'none',stroke:s.color,'stroke-width':o.thickness,
        'stroke-dasharray':`${len} ${C-len}`,'stroke-dashoffset':-off,'stroke-linecap':'butt',
        transform:`rotate(-90 ${cx} ${cy})`});
      svg.append(c); off+=len;
    });
    if(o.center){ const t=el('text',{x:cx,y:cy+1,'text-anchor':'middle','dominant-baseline':'middle','font-size':o.centerSize||26,'font-weight':700,'font-family':'Hanken Grotesk, sans-serif',fill:o.dark?'#eef3ec':'#191c1a'}); t.textContent=o.center; svg.append(t);
      if(o.centerSub){ const s2=el('text',{x:cx,y:cy+18,'text-anchor':'middle','font-size':11,'font-family':'Manrope',fill:o.dark?'#a9bcae':'#727971'}); s2.textContent=o.centerSub; svg.append(s2);} }
    mount.innerHTML=''; mount.append(svg);
  }

  // ---- Toast ----
  function toast(msg, kind){
    let host=document.getElementById('toast-host');
    if(!host){ host=document.createElement('div'); host.id='toast-host';
      host.style.cssText='position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;gap:10px;align-items:center;'; document.body.append(host); }
    const t=document.createElement('div');
    const bg = kind==='neg' ? '#ba1a1a' : kind==='warn' ? '#8a5a06' : '#0f3218';
    t.style.cssText=`background:${bg};color:#fff;padding:12px 18px;border-radius:9999px;font:600 14px Manrope;box-shadow:0 8px 28px rgba(0,0,0,.25);display:flex;align-items:center;gap:9px;opacity:0;transform:translateY(8px);transition:.25s;`;
    t.innerHTML = (kind!=='neg'?'<span style="width:7px;height:7px;border-radius:50%;background:#c3f35c"></span>':'') + msg;
    host.append(t); requestAnimationFrame(()=>{t.style.opacity=1;t.style.transform='none';});
    setTimeout(()=>{t.style.opacity=0;t.style.transform='translateY(8px)';setTimeout(()=>t.remove(),300);}, kind==='neg'?3200:2200);
  }

  function copy(text, ok){ navigator.clipboard?.writeText(text).then(()=>toast(ok||'Copied to clipboard')).catch(()=>toast('Copy failed','neg')); }

  // ---- Scroll reveal (v3 — per-element, flash-free, background-load safe) ----
  function initReveal(){
    var io = null;
    function reveal(el){ var d=+el.dataset.revealDelay||0; if(d) setTimeout(function(){el.classList.add('in');}, d); else el.classList.add('in'); }
    function process(){
      if(document.visibilityState !== 'visible') return;   // only animate a visible page
      var vh = window.innerHeight || 800;
      var els = [].slice.call(document.querySelectorAll('.reveal, .reveal-stagger, .reveal-fade'))
                  .filter(function(e){ return !e.classList.contains('armed') && !e.classList.contains('in'); });
      if(!els.length) return;
      if('IntersectionObserver' in window && !io){
        io = new IntersectionObserver(function(ents){ ents.forEach(function(en){ if(en.isIntersecting){ reveal(en.target); io.unobserve(en.target); } }); }, {rootMargin:'0px 0px -8% 0px', threshold:0.05});
      }
      els.forEach(function(e){
        var top = e.getBoundingClientRect().top;
        if(e.hasAttribute('data-reveal-now')){            // explicit load-in (above the fold)
          e.classList.add('armed'); requestAnimationFrame(function(){ requestAnimationFrame(function(){ reveal(e); }); });
        } else if(top > vh*0.80){                          // below the fold → animate on scroll
          e.classList.add('armed'); if(io) io.observe(e); else reveal(e);
        }                                                  // already visible above the fold → leave static (no flash)
      });
    }
    initReveal._process = process;
    process();
    // If the page first loaded hidden (background tab), arm once it becomes visible.
    document.addEventListener('visibilitychange', function(){ if(document.visibilityState==='visible') process(); });
  }
  function rescanReveal(){ if(initReveal._process) initReveal._process(); else initReveal(); }

  // ---- Animate an areaChart line drawing itself in ----
  function drawChart(mount){
    try{
      var path = mount.querySelector('path[stroke]');
      if(!path) return;
      var len = path.getTotalLength();
      path.style.setProperty('--len', len);
      path.classList.add('draw-line');
    }catch(e){}
  }

  if(document.readyState !== 'loading') setTimeout(initReveal,0);
  else document.addEventListener('DOMContentLoaded', initReveal);

  w.FX = { areaChart, spark, barChart, donut, toast, copy, initReveal, rescanReveal, drawChart };
})(window);
