/* The desktop mockup works like a small computer.
   Minus sends the desktop down into the start button and the start button brings it back. The square
   opens it full screen. The X turns it off like an old monitor. The taskbar opens three apps: Files
   (every project), a browser and a music app with the site's playlist. Apps can be dragged, minimized
   into their taskbar button, maximized and closed.
   Every animation only moves and fades things (transform and opacity), so the graphics card does the
   work and nothing has to be laid out again while it plays. */
(function () {
  var win = document.querySelector('.visual.showcase .win'); if (!win) return;
  var fig = win.parentElement, bar = win.querySelector('.win-bar'), desk = win.querySelector('.desk'), tb = win.querySelector('.taskbar');
  if (!bar || !desk || !tb) return;
  var root = document.documentElement, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var OUT = 'cubic-bezier(.16,1,.3,1)', IN = 'cubic-bezier(.5,0,.75,0)', SOFT = 'cubic-bezier(.4,0,.2,1)';
  var startB = tb.querySelector('.tb-start'), appB = { files: tb.querySelector('[data-app="files"]'), web: tb.querySelector('[data-app="web"]'), music: tb.querySelector('[data-app="music"]') };
  var ctl = { min: bar.querySelector('.win-ctl .min'), max: bar.querySelector('.win-ctl .max'), cls: bar.querySelector('.win-ctl .cls') };

  var css = [
    '.os-layer{position:absolute;left:0;right:0;z-index:3;pointer-events:none}',
    '.os-w{position:absolute;left:0;top:0;display:flex;flex-direction:column;pointer-events:auto;background:#141416;color:#ECECEA;border:1px solid rgba(255,255,255,.1);border-radius:12px;overflow:hidden;transform-origin:0 0;',
    'box-shadow:0 1px 0 rgba(255,255,255,.06) inset,0 30px 60px -20px rgba(0,0,0,.75),0 10px 22px -10px rgba(0,0,0,.6);font-family:var(--body,system-ui,sans-serif);contain:layout paint}',
    '.os-w[hidden]{display:none}','.os-w:focus{outline:none}',
    '.os-w.max{border-radius:0;border-width:0}',
    '.rz{position:absolute;z-index:5;touch-action:none}',
    '.rz-n,.rz-s{left:16px;right:16px;height:8px;cursor:ns-resize}.rz-n{top:0}.rz-s{bottom:0}',
    '.rz-e,.rz-w{top:16px;bottom:16px;width:8px;cursor:ew-resize}.rz-e{right:0}.rz-w{left:0}',
    '.rz-ne,.rz-nw,.rz-se,.rz-sw{width:18px;height:18px}.rz-nw{left:0;top:0;cursor:nwse-resize}.rz-se{right:0;bottom:0;cursor:nwse-resize}.rz-ne{right:0;top:0;cursor:nesw-resize}.rz-sw{left:0;bottom:0;cursor:nesw-resize}',
    '.os-w.max .rz,.os-fit .rz{display:none}',
    '.os-w.sizing{user-select:none;-webkit-user-select:none}',
    '.os-w.sizing .os-b{pointer-events:none}',
    '.os-hd{flex:0 0 auto;display:flex;align-items:center;height:2.1rem;padding-left:.75rem;gap:.5rem;background:rgba(255,255,255,.03);border-bottom:1px solid rgba(255,255,255,.07);cursor:grab;user-select:none;-webkit-user-select:none;touch-action:none}',
    '.os-w.max .os-hd,.os-fit .os-hd{cursor:default}',
    '.os-hd.held{cursor:grabbing}',
    '.os-hd .os-t{flex:1;min-width:0;display:flex;align-items:center;gap:.5rem;font-family:var(--mono,ui-monospace,monospace);font-size:.6rem;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.82);white-space:nowrap;overflow:hidden}',
    '.os-hd .os-t svg{flex:0 0 auto;width:.95rem;height:.95rem}',
    '.os-c{display:flex;height:100%}',
    '.os-c button,.win-ctl button{display:grid;place-items:center;width:2.3rem;height:100%;background:none;border:0;padding:0;color:inherit;cursor:pointer;transition:background .15s}',
    '.os-c{gap:.2rem;padding-right:.3rem;align-items:center}.os-c button{width:1.85rem;height:1.45rem;border-radius:6px;background:rgba(255,255,255,.06);box-shadow:inset 0 0 0 1px rgba(255,255,255,.07)}',
    '.os-c button:disabled{opacity:.35;cursor:default}',
    '.os-c button:hover{background:rgba(255,255,255,.16)}',
    '.os-c button.x:hover{background:#c42b1c}',
    '.os-c svg{width:.64rem;height:.64rem;fill:none;stroke:#fff;stroke-width:1.4;vector-effect:non-scaling-stroke}',
    '.os-c button.x:hover svg,.win-ctl button.cls:hover svg{stroke:#fff}',
    '.visual.showcase .win-ctl button{width:1.95rem!important;height:1.45rem!important;opacity:.92!important;border-radius:6px!important;background:rgba(255,255,255,.07)!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)}',
    '.visual.showcase .win-ctl{align-items:center;gap:.25rem!important}',
    '.visual.showcase .win-ctl button:hover{opacity:1!important;background:rgba(255,255,255,.17)!important}',
    '.visual.showcase .win-ctl button.cls:hover{background:#c42b1c!important}',
    '.visual.showcase .win-ctl svg{width:.62rem!important;height:.62rem!important;stroke:#fff!important;stroke-width:1.4!important}',
    '.os-c button:focus-visible,.win-ctl button:focus-visible,.os-w button:focus-visible,.os-w a:focus-visible,.os-start button:focus-visible{outline:2px solid #fff;outline-offset:-2px}',
    '.os-b{flex:1 1 auto;min-height:0;overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.2) transparent}',
    '.win-ctl button{height:100%}',

    /* music, laid out like Spotify */
    '.sp{background:#121212;min-height:100%}',
    '.sp-hd{position:relative;display:flex;align-items:flex-end;gap:1rem;padding:1.2rem 1.1rem 1rem;background:var(--sp,#2a2a2a);transition:background-color .6s ease}',
    '.sp-hd::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(18,18,18,0) 0%,rgba(18,18,18,.55) 70%,#121212 100%);pointer-events:none}',
    '.sp-hd>*{position:relative;z-index:1}',
    '.sp-art{flex:0 0 auto;width:clamp(4.2rem,22%,8.5rem);aspect-ratio:1;border-radius:6px;object-fit:cover;box-shadow:0 12px 30px -8px rgba(0,0,0,.6);background:#282828}',
    '.sp-hd small{display:block;font-size:.66rem;font-weight:600;color:rgba(255,255,255,.85)}',
    '.sp-hd h4{margin:.15rem 0 .35rem;font-family:var(--body,system-ui,sans-serif);font-weight:800;font-size:2.1rem;line-height:1;letter-spacing:-.03em;color:#fff}',
    '.sp-hd p{margin:0;font-size:.72rem;color:rgba(255,255,255,.72)}',
    '.sp-hd p b{color:#fff;font-weight:600}',
    '.sp-bar{position:sticky;top:0;z-index:2;display:flex;align-items:center;gap:.9rem;padding:.7rem 1.1rem .6rem;background:#121212}',
    '.sp-play{flex:0 0 auto;display:grid;place-items:center;width:2.9rem;height:2.9rem;border-radius:50%;border:0;padding:0;background:#1ed760;color:#000;cursor:pointer;transition:transform .2s ' + OUT + ',background .2s}',
    '.sp-play:hover{transform:scale(1.06);background:#3be477}',
    '.sp-play svg{width:1.1rem;height:1.1rem;fill:currentColor}',
    '.sp-sk{display:grid;place-items:center;width:2rem;height:2rem;border:0;padding:0;background:none;color:rgba(255,255,255,.7);cursor:pointer;border-radius:50%;transition:color .15s}',
    '.sp-sk:hover{color:#fff}',
    '.sp-sk svg{width:1rem;height:1rem;fill:currentColor}',
    '.sp-now{min-width:0;font-size:.72rem;color:rgba(255,255,255,.6);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.sp-now b{color:#1ed760;font-weight:600}',
    '.sp-cols{display:grid;grid-template-columns:1.6rem minmax(0,1fr) auto;gap:.8rem;padding:.35rem 1.1rem;margin:0 .4rem;border-bottom:1px solid rgba(255,255,255,.1);font-size:.62rem;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.5)}',
    '.sp-cols span:first-child{text-align:right}',
    '.sp-list{list-style:none;margin:.4rem .4rem .8rem;padding:0}',
    '.sp-row{display:grid;grid-template-columns:1.6rem 2.3rem minmax(0,1fr) auto;align-items:center;gap:.8rem;width:100%;padding:.35rem .7rem;border:0;border-radius:6px;background:none;color:inherit;font:inherit;text-align:left;cursor:pointer;transition:background .12s}',
    '.sp-row:hover{background:rgba(255,255,255,.08)}',
    '.sp-n{position:relative;text-align:right;font-size:.8rem;color:rgba(255,255,255,.55);font-variant-numeric:tabular-nums}',
    '.sp-row img{width:2.3rem;height:2.3rem;border-radius:4px;object-fit:cover;background:#282828;display:block}',
    '.sp-ti{min-width:0;display:flex;flex-direction:column;line-height:1.3}',
    '.sp-ti b{font-weight:500;font-size:.84rem;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.sp-ti small{font-size:.72rem;color:rgba(255,255,255,.6);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.sp-d{font-size:.75rem;color:rgba(255,255,255,.55);font-variant-numeric:tabular-nums}',
    '.sp-row.cur .sp-ti b,.sp-row.cur .sp-n i{color:#1ed760}',
    '.sp-ic{display:none;position:absolute;right:0;top:50%;width:.8rem;height:.8rem;margin-top:-.4rem;fill:#fff}',
    '.sp-row:hover .sp-n i,.sp-row:focus-visible .sp-n i,.sp-row.on .sp-n i{visibility:hidden}',
    '.sp-row:not(.on):hover .sp-ic.pl,.sp-row:not(.on):focus-visible .sp-ic.pl{display:block}',
    '.sp-row.on:hover .sp-ic.pa,.sp-row.on:focus-visible .sp-ic.pa{display:block}',
    '.sp-row.on:not(:hover):not(:focus-visible) .sp-eq{display:flex}',
    '.sp-eq{display:none;position:absolute;right:0;top:50%;height:.8rem;margin-top:-.4rem;gap:2px;align-items:flex-end}',
    '.sp-eq i{display:block;width:3px;height:100%;background:#1ed760;transform-origin:50% 100%;animation:speq .9s ease-in-out infinite}',
    '.sp-eq i:nth-child(2){animation-delay:-.3s}.sp-eq i:nth-child(3){animation-delay:-.6s}',
    '@keyframes speq{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}',
    '@media (prefers-reduced-motion:reduce){.sp-eq i{animation:none;transform:scaleY(.7)}}',
    '.os-sm .sp-hd h4{font-size:1.4rem}.os-sm .bx-pg h5{font-size:1.7rem}.os-w.max:not(.os-sm) .sp-hd h4{font-size:2.8rem}',
    '.os-sm .sp-cols,.os-sm .sp-d{display:none}.os-sm .sp-row{grid-template-columns:1.3rem 2.1rem minmax(0,1fr)}.os-sm .sp-hd{padding:.9rem .8rem .7rem}',

    /* files, laid out like Explorer */
    '.fx{display:grid;grid-template-columns:9.5rem minmax(0,1fr);grid-template-rows:auto minmax(0,1fr) auto;height:100%;background:#1b1b1d}',
    '.fx-path{grid-column:1/-1;display:flex;align-items:center;gap:.4rem;padding:.45rem .7rem;border-bottom:1px solid rgba(255,255,255,.07);font-size:.72rem;color:rgba(255,255,255,.6)}',
    '.fx-path span{padding:.15rem .45rem;border-radius:5px;background:rgba(255,255,255,.06);color:rgba(255,255,255,.85);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.fx-side{padding:.6rem .4rem;border-right:1px solid rgba(255,255,255,.07);display:flex;flex-direction:column;gap:.1rem;overflow:auto}',
    '.fx-side a,.fx-side b{display:flex;align-items:center;gap:.5rem;padding:.38rem .55rem;border-radius:6px;font-size:.74rem;color:rgba(255,255,255,.8);text-decoration:none;font-weight:400}',
    '.fx-side b{background:rgba(255,255,255,.08);color:#fff}',
    '.fx-side a:hover{background:rgba(255,255,255,.06);color:#fff}',
    '.fx-side svg{width:.95rem;height:.95rem;flex:0 0 auto}',
    '.fx-main{overflow:auto;overscroll-behavior:contain;padding:.8rem}',
    '.fx-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(7.2rem,1fr));gap:.4rem}',
    '.fx-it{display:flex;flex-direction:column;align-items:center;gap:.35rem;padding:.7rem .4rem .6rem;border:1px solid transparent;border-radius:8px;background:none;color:inherit;font:inherit;text-align:center;cursor:pointer;text-decoration:none;transition:background .12s,border-color .12s}',
    '.fx-it:hover{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.08)}',
    '.fx-it svg{width:3rem;height:2.5rem;transition:transform .25s ' + OUT + '}',
    '.fx-it:hover svg{transform:translateY(-2px) scale(1.04)}',
    '.fx-it b{font-weight:500;font-size:.74rem;line-height:1.25;color:#fff}',
    '.fx-it small{font-size:.64rem;line-height:1.3;color:rgba(255,255,255,.5)}',
    '.fx-it i{font-style:normal;font-family:var(--mono,monospace);font-size:.56rem;letter-spacing:.14em;color:var(--signal,#FF5A1F)}',
    '.fx-st{grid-column:1/-1;padding:.3rem .8rem;border-top:1px solid rgba(255,255,255,.07);font-size:.66rem;color:rgba(255,255,255,.5)}',
    '.os-sm .fx{grid-template-columns:minmax(0,1fr)}.os-sm .fx-side{display:none}.os-sm .fx-grid{grid-template-columns:repeat(auto-fill,minmax(6rem,1fr))}',

    /* browser */
    '.bx{display:flex;flex-direction:column;height:100%;background:#202124}',
    '.bx-tabs{display:flex;align-items:flex-end;gap:.2rem;padding:.35rem .5rem 0;background:#151517}',
    '.bx-tab{display:flex;align-items:center;gap:.45rem;padding:.42rem .8rem;border-radius:8px 8px 0 0;background:#202124;font-size:.72rem;color:#fff;max-width:12rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.bx-tab i{width:.6rem;height:.6rem;background:var(--signal,#FF5A1F);flex:0 0 auto}',
    '.bx-url{display:flex;align-items:center;gap:.5rem;margin:.45rem .6rem;padding:.4rem .8rem;border-radius:99px;background:#2e2f32;font-size:.74rem;color:rgba(255,255,255,.85)}',
    '.bx-url svg{width:.75rem;height:.75rem;fill:none;stroke:rgba(255,255,255,.6);stroke-width:2}',
    '.bx-pg{position:relative;isolation:isolate;background:#0c0d0f;flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.2rem;padding:1.4rem 1rem}',
    '.bx-bg{position:absolute;inset:0;width:100%;height:100%;z-index:-1;display:block;image-rendering:pixelated;image-rendering:crisp-edges;pointer-events:none}',
    '.bx-pg h5{text-shadow:0 2px 18px rgba(0,0,0,.8);margin:0;font-family:var(--serif,Georgia,serif);font-weight:400;font-size:2.4rem;line-height:1;color:#fff;letter-spacing:-.01em}',
    '.bx-pg h5 em{font-style:italic}',
    '.bx-pg h5 i{display:inline-block;width:.16em;height:.16em;margin-left:.08em;background:var(--signal,#FF5A1F)}',
    '.bx-tiles{display:grid;grid-template-columns:repeat(4,minmax(0,5.2rem));gap:.6rem}',
    '.bx-tiles a{background:rgba(14,15,17,.62);border:1px solid rgba(255,255,255,.08);display:flex;flex-direction:column;align-items:center;gap:.45rem;padding:.7rem .3rem;border-radius:10px;text-decoration:none;color:rgba(255,255,255,.85);font-size:.7rem;transition:background .15s}',
    '.bx-tiles a:hover{background:rgba(255,255,255,.07)}',
    '.bx-tiles span{display:grid;place-items:center;width:2.6rem;height:2.6rem;border-radius:50%;background:#35363a;color:#fff;font-weight:700;font-size:.8rem}',
    '.bx-tiles svg{width:1.1rem;height:1.1rem;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}',
    '.os-sm .bx-tiles{grid-template-columns:repeat(2,minmax(0,5.2rem))}',

    /* start menu */
    '.os-start{position:absolute;left:50%;bottom:0;z-index:6;width:min(19rem,calc(100% - 1.2rem));margin-left:max(-9.5rem,calc(-50% + .6rem));padding:.9rem;border-radius:12px;background:rgba(22,22,24,.97);border:1px solid rgba(255,255,255,.1);box-shadow:0 24px 50px -16px rgba(0,0,0,.8);color:#ECECEA;transform-origin:50% 100%}',
    '.os-start[hidden]{display:none}',
    '.os-start h6{margin:0 0 .55rem;font-family:var(--mono,monospace);font-weight:500;font-size:.56rem;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.5)}',
    '.os-pins{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.2rem}',
    '.os-pins button{display:flex;flex-direction:column;align-items:center;gap:.35rem;padding:.6rem .2rem;border:0;border-radius:8px;background:none;color:rgba(255,255,255,.85);font:inherit;font-size:.66rem;cursor:pointer;transition:background .12s}',
    '.os-pins button:hover{background:rgba(255,255,255,.08);color:#fff}',
    '.os-pins svg{width:1.3rem;height:1.3rem}',
    '.os-me{display:flex;align-items:center;justify-content:space-between;gap:.6rem;margin-top:.7rem;padding-top:.7rem;border-top:1px solid rgba(255,255,255,.08);font-size:.74rem}',
    '.os-me span{display:flex;align-items:center;gap:.5rem}',
    '.os-me span i{width:1.6rem;height:1.6rem;border-radius:50%;background:var(--signal,#FF5A1F) center/cover;flex:0 0 auto}',
    '.os-me button{display:grid;place-items:center;width:2rem;height:2rem;border:0;border-radius:8px;background:none;color:rgba(255,255,255,.8);cursor:pointer}',
    '.os-me button:hover{background:rgba(255,255,255,.08);color:#fff}',
    '.os-me svg{width:1rem;height:1rem;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round}',

    /* taskbar states */
    '.dock>button.act::after{width:.6rem!important;background:var(--signal,#FF5A1F)!important}',
    '.tb-start.wake{animation:oswake 1.6s ease-in-out infinite}',
    '@keyframes oswake{0%,100%{box-shadow:0 0 0 0 rgba(255,255,255,0)}50%{box-shadow:0 0 0 4px rgba(255,255,255,.14)}}',
    '.win.dmin .desk,.win.dmin .os-layer{visibility:hidden}',

    /* switched off */
    '.os-off{position:absolute;inset:0;z-index:8;display:none;flex-direction:column;align-items:center;justify-content:center;gap:.9rem;background:#050506;color:rgba(255,255,255,.6);font-family:var(--mono,monospace);font-size:.6rem;letter-spacing:.18em;text-transform:uppercase}',
    '.win.off .os-off{display:flex}',
    '.win.off>.win-bar,.win.off>.desk,.win.off>.taskbar,.win.off>.os-layer,.win.off>canvas.wall{visibility:hidden}',
    '.os-pow{display:grid;place-items:center;width:3.4rem;height:3.4rem;border-radius:50%;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.04);color:#fff;cursor:pointer;transition:background .2s,border-color .2s,transform .3s ' + OUT + '}',
    '.os-pow:hover{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.4);transform:scale(1.05)}',
    '.os-pow svg{width:1.2rem;height:1.2rem;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round}',
    '.os-line{position:absolute;left:0;right:0;top:50%;height:2px;margin-top:-1px;z-index:9;background:#fff;box-shadow:0 0 12px 3px rgba(255,255,255,.7);opacity:0;pointer-events:none}',

    /* full screen */
    '.visual.showcase.win-host{position:fixed!important;top:0!important;left:0!important;right:auto!important;bottom:auto!important;width:100vw!important;height:100vh!important;height:100dvh!important;max-width:none!important;z-index:80;margin:0!important;padding:0!important;border:0!important;background:transparent!important;transform:none!important}',
    '.visual.showcase.win-host[hidden]{display:none!important}',
    '.win.full{position:absolute;inset:0;width:100%;height:100%;border-radius:0!important;border:0!important;display:flex;flex-direction:column;--rx:0deg;--ry:0deg}',
    /* full screen: the folders sit down the left like desktop icons and the widgets shrink into a column on the right */
    '.win.full>.desk{--ww:max(15rem,min(26rem,30vw,calc((100vh - 9rem) / 1.12)));flex:1 1 auto;min-height:0;width:100%;margin:0;padding:clamp(.8rem,2vw,1.5rem)!important;display:grid!important;gap:.8rem!important;overflow:hidden;',
    'grid-template-columns:auto minmax(0,1fr) calc(var(--ww) * .4) calc(var(--ww) * .6 - .8rem)!important;grid-template-rows:auto auto auto minmax(0,1fr)!important;align-items:start!important;align-content:stretch;',
    'grid-template-areas:"icons . clock clock" "icons . aura aura" "icons . tall wide" "icons . . ."!important}',
    '@supports (height:100dvh){.win.full>.desk{--ww:max(15rem,min(26rem,30vw,calc((100dvh - 9rem) / 1.12)))}}',
    '.win.full>.desk .icons{grid-area:icons!important;flex-direction:column!important;justify-content:flex-start!important;align-items:center!important;align-self:start!important;gap:.5rem!important;width:6.4rem;padding:0!important}',
    '.win.full>.desk .icons a{flex:none!important;width:100%;padding:.4rem .2rem!important;gap:.3rem!important}',
    '.win.full>.desk .icons svg{width:2.5rem!important;height:2.1rem!important}',
    '.win.full>.desk .icons span{font-size:.66rem!important;line-height:1.2!important}',
    '.win.full>.desk .clock{grid-area:clock!important;align-self:start}',
    '.win.full>.desk .aura-slot{grid-area:aura!important}',
    '.win.full>.desk .tall{grid-area:tall!important;width:auto!important;justify-self:stretch!important;align-self:start!important;aspect-ratio:1/1!important;min-height:0}',
    '.win.full>.desk .wide{grid-area:wide!important;align-self:stretch!important;aspect-ratio:auto!important;height:auto;min-height:0}',
    /* phones: folders in a row along the top, widgets stacked at the bottom where a thumb reaches */
    '@media (max-width:700px){.win.full>.desk{--ww:100%;grid-template-columns:minmax(0,.4fr) minmax(0,.6fr)!important;grid-template-rows:auto minmax(0,1fr) auto auto auto!important;grid-template-areas:"icons icons" ". ." "clock clock" "aura aura" "tall wide"!important;align-items:end!important}',
    '.win.full>.desk .icons{flex-direction:row!important;justify-content:flex-start!important;width:auto;gap:.3rem!important}.win.full>.desk .icons a{width:5.6rem}}',
    '.win.full>.desk .aura-slot .ac{--h:clamp(92px,30cqw,calc(150px * var(--mk,1)))}',
    'html.os-full{overflow:hidden}',
    'html.os-full .mp{visibility:hidden}'
  ].join('\n');
  var st = document.createElement('style'); st.id = 'desk-os'; st.textContent = css; document.head.appendChild(st);

  /* ---------- small helpers ---------- */
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] }) }
  /* one animation per element at a time: a new one first snaps the old one to its end, so fast clicking never leaves things half way */
  function A(e, kf, opt, done) {
    if (e._a) { var o = e._a; e._a = null; o.onfinish = null; try { o._done && o._done() } catch (x) {} o.cancel() }
    if (reduce || !e.animate) { done && done(); return null }
    var a = e.animate(kf, Object.assign({ duration: 420, easing: OUT, fill: 'forwards' }, opt || {}));
    a._done = done; e._a = a;
    a.onfinish = function () { if (e._a === a) e._a = null; done && done(); a.cancel() };
    return a;
  }
  function rel(r, to) { return { x: r.left - to.left, y: r.top - to.top, w: r.width, h: r.height } }
  function center(b, to) { var r = b.getBoundingClientRect(); return { x: r.left + r.width / 2 - to.left, y: r.top + r.height / 2 - to.top } }
  function T(x, y, s, sy) { return 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)' + (s != null ? ' scale(' + s.toFixed(4) + ',' + (sy != null ? sy : s).toFixed(4) + ')' : '') }
  var I = {
    min: '<svg viewBox="0 0 10 10"><path d="M1 5h8"/></svg>',
    max: '<svg viewBox="0 0 10 10"><rect x="1.5" y="1.5" width="7" height="7" rx="1"/></svg>',
    res: '<svg viewBox="0 0 10 10"><rect x="1.5" y="3" width="5.5" height="5.5" rx="1"/><path d="M3.5 3V1.8a.6.6 0 0 1 .6-.6h4.1a.6.6 0 0 1 .6.6v4.1a.6.6 0 0 1-.6.6H7"/></svg>',
    x: '<svg viewBox="0 0 10 10"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7"/></svg>',
    play: '<svg viewBox="0 0 16 16"><path d="M4 2.6v10.8a.6.6 0 0 0 .9.5l8.6-5.4a.6.6 0 0 0 0-1L4.9 2.1a.6.6 0 0 0-.9.5z"/></svg>',
    pause: '<svg viewBox="0 0 16 16"><rect x="3.2" y="2" width="3.4" height="12" rx=".8"/><rect x="9.4" y="2" width="3.4" height="12" rx=".8"/></svg>',
    prev: '<svg viewBox="0 0 16 16"><rect x="2.5" y="2.5" width="1.8" height="11" rx=".6"/><path d="M13.5 3.2v9.6a.6.6 0 0 1-.9.5L5.4 8.5a.6.6 0 0 1 0-1l7.2-4.8a.6.6 0 0 1 .9.5z"/></svg>',
    next: '<svg viewBox="0 0 16 16"><rect x="11.7" y="2.5" width="1.8" height="11" rx=".6"/><path d="M2.5 3.2v9.6a.6.6 0 0 0 .9.5l7.2-4.8a.6.6 0 0 0 0-1L3.4 2.7a.6.6 0 0 0-.9.5z"/></svg>',
    folder: '<svg viewBox="0 0 48 40" aria-hidden="true"><path d="M2 6a3 3 0 0 1 3-3h13l4 5h21a3 3 0 0 1 3 3v24a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3z" fill="#e9b949"/><path d="M2 13h44v22a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3z" fill="#f7cf5c"/></svg>',
    pdf: '<svg viewBox="0 0 48 40" aria-hidden="true"><path d="M12 2h18l9 9v26a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="#f4f5f7"/><path d="M30 2v9h9" fill="#d9dce2"/><rect x="13" y="22" width="20" height="8" rx="1.5" fill="#e5484d"/><text x="23" y="28.6" font-size="6.5" font-weight="700" fill="#fff" text-anchor="middle" font-family="Arial,sans-serif">PDF</text></svg>',
    lock: '<svg viewBox="0 0 16 16"><rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/></svg>',
    power: '<svg viewBox="0 0 24 24"><path d="M12 3v8"/><path d="M6.3 6.6a8 8 0 1 0 11.4 0"/></svg>',
    full: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>'
  };
  function ico(name) { var b = appB[name]; return b ? b.querySelector('svg').outerHTML : '' }

  /* ---------- the layer the apps live in, between the title bar and the taskbar ---------- */
  var layer = el('div', 'os-layer'); win.insertBefore(layer, tb);
  var L = { w: 0, h: 0 };
  function layout() {
    var top = bar.offsetTop + bar.offsetHeight, bottom = win.clientHeight - tb.offsetTop;
    layer.style.top = top + 'px'; layer.style.bottom = bottom + 'px';
    L.w = layer.clientWidth; L.h = layer.clientHeight;
    layer.classList.toggle('os-fit', fit());
    apps.forEach(function (a) { if (!a.w.hidden || a.min) place(a, true) });
  }
  function K() { return window.MN_K ? MN_K() : 1 }
  function fit() { var k = K(); return L.w < 380 * k || L.h < 280 * k || matchMedia('(pointer:coarse)').matches }

  /* ---------- apps ---------- */
  var apps = [], zTop = 1;
  function App(name, title, body, sizeW, sizeH) {
    var w = el('section', 'os-w'); w.hidden = true; w.tabIndex = -1; w.setAttribute('role', 'dialog'); w.setAttribute('aria-label', title);
    w.innerHTML = '<header class="os-hd"><span class="os-t">' + ico(name) + esc(title) + '</span><span class="os-c">' +
      '<button type="button" class="m" aria-label="Minimize ' + esc(title) + '">' + I.min + '</button>' +
      '<button type="button" class="s" aria-label="Maximize ' + esc(title) + '">' + I.max + '</button>' +
      '<button type="button" class="x" aria-label="Close ' + esc(title) + '">' + I.x + '</button></span></header><div class="os-b"></div>';
    w.querySelector('.os-b').appendChild(body);
    layer.appendChild(w);
    var a = { name: name, w: w, b: appB[name], open: false, min: false, max: false, x: 0, y: 0, ww: 0, hh: 0, fx: .5, fy: .5, sw: sizeW, sh: sizeH, i: apps.length };
    apps.push(a);
    w.querySelector('.m').addEventListener('click', function () { minimize(a) });
    w.querySelector('.s').addEventListener('click', function () { toggleMax(a) });
    w.querySelector('.x').addEventListener('click', function () { close(a) });
    w.addEventListener('pointerdown', function () { focus(a) }, true);
    drag(a); resizer(a);
    return a;
  }
  function size(a) {
    var k = K();
    if (a.max || fit()) { a.ww = L.w; a.hh = L.h }
    else if (a.cw) { a.ww = Math.round(Math.min(a.cw, L.w)); a.hh = Math.round(Math.min(a.ch, L.h)) }
    else {
      var sw = a.sw * k, sh = a.sh * k;
      a.ww = Math.round(Math.min(L.w - 24, Math.max(sw * .7, Math.min(sw, L.w * .86))));
      a.hh = Math.round(Math.min(L.h - 20, Math.max(sh * .7, Math.min(sh, L.h * .88))));
    }
    a.w.classList.toggle('os-sm', a.ww < 520 * k);
  }
  function place(a, keep) {
    size(a);
    var full = a.max || fit();
    a.w.classList.toggle('max', full);
    a.w.style.width = a.ww + 'px'; a.w.style.height = a.hh + 'px';
    if (full) { a.x = 0; a.y = 0 } else {
      if (!keep) { var off = (a.i - 1) * 22; a.fx = .5; a.fy = .5; a.x = (L.w - a.ww) / 2 + off; a.y = (L.h - a.hh) / 2 + off }
      else { a.x = a.fx * (L.w - a.ww); a.y = a.fy * (L.h - a.hh) }
      clamp(a);
    }
    a.w.style.transform = T(a.x, a.y);
    a.w.querySelector('.s').innerHTML = full ? I.res : I.max;
    a.w.querySelector('.s').setAttribute('aria-label', (full ? 'Restore ' : 'Maximize ') + a.w.getAttribute('aria-label'));
    a.w.querySelector('.s').disabled = fit();
  }
  function clamp(a) {
    a.x = Math.max(0, Math.min(L.w - a.ww, a.x)); a.y = Math.max(0, Math.min(L.h - a.hh, a.y));
    var sx = L.w - a.ww, sy = L.h - a.hh; a.fx = sx > 0 ? a.x / sx : .5; a.fy = sy > 0 ? a.y / sy : .5;
  }
  /* where an app's taskbar button sits, as a tiny box the window can grow out of or shrink into */
  function iconBox(a) { var lr = layer.getBoundingClientRect(), c = center(a.b, lr), s = .06; return { t: T(c.x - a.ww * s / 2, c.y - a.hh * s / 2, s), c: c } }
  function focus(a) {
    if (a.w.style.zIndex == zTop && a.open) { mark(); return }
    a.w.style.zIndex = ++zTop; mark();
  }
  function top() { var t = null; apps.forEach(function (a) { if (a.open && !a.min && (!t || +a.w.style.zIndex > +t.w.style.zIndex)) t = a }); return t }
  function mark() {
    var t = top();
    apps.forEach(function (a) { if (!a.b) return; a.b.classList.toggle('on', a.open); a.b.classList.toggle('act', a === t); a.b.setAttribute('aria-pressed', a.open && !a.min ? 'true' : 'false') });
  }
  function openApp(a) {
    closeStart();
    if (win.classList.contains('dmin')) restoreDesk();
    if (a.open && a.min) return unminimize(a);
    if (a.open) { if (top() === a) return minimize(a); return focus(a) }
    a.open = true; a.min = false; a.w.hidden = false; place(a); focus(a);
    if (a.onopen) a.onopen();
    if (a.onshow) setTimeout(a.onshow, 30);
    var ib = iconBox(a);
    A(a.w, [{ transform: ib.t, opacity: 0 }, { transform: T(a.x, a.y), opacity: 1 }], { duration: 520 });
    try { a.w.focus({ preventScroll: true }) } catch (x) {}
  }
  function minimize(a) {
    if (!a.open || a.min) return;
    a.min = true; mark();
    var ib = iconBox(a);
    A(a.w, [{ transform: T(a.x, a.y), opacity: 1 }, { transform: ib.t, opacity: 0 }], { duration: 360, easing: IN }, function () { a.w.hidden = true });
  }
  function unminimize(a) {
    a.min = false; a.w.hidden = false; place(a, true); focus(a); if (a.onshow) setTimeout(a.onshow, 30);
    var ib = iconBox(a);
    A(a.w, [{ transform: ib.t, opacity: 0 }, { transform: T(a.x, a.y), opacity: 1 }], { duration: 480 });
  }
  function close(a) {
    if (!a.open) return;
    a.open = false; a.min = false; mark();
    var cx = a.ww * .02, cy = a.hh * .02;
    A(a.w, [{ transform: T(a.x, a.y), opacity: 1 }, { transform: T(a.x + cx, a.y + cy, .96), opacity: 0 }], { duration: 170, easing: SOFT }, function () { a.w.hidden = true; a.max = false });
  }
  function toggleMax(a) {
    if (fit()) return;
    var lr = layer.getBoundingClientRect(), r0 = rel(a.w.getBoundingClientRect(), lr);
    a.max = !a.max; place(a, true);
    var sx = r0.w / a.ww, sy = r0.h / a.hh;
    A(a.w, [{ transform: T(r0.x, r0.y, sx, sy) }, { transform: T(a.x, a.y, 1, 1) }], { duration: 380 });
  }
  /* resize from any edge or corner, like a real window. The size the visitor picks is kept */
  function resizer(a) {
    var ds = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'], st = null, raf = 0, nx, ny, nw, nh;
    ds.forEach(function (d) {
      var h = el('div', 'rz rz-' + d); h.setAttribute('aria-hidden', 'true'); a.w.appendChild(h);
      h.addEventListener('pointerdown', function (e) {
        if (e.button !== 0 || a.max || fit()) return;
        st = { d: d, id: e.pointerId, sx: e.clientX, sy: e.clientY, x: a.x, y: a.y, w: a.ww, h: a.hh };
        try { h.setPointerCapture(e.pointerId) } catch (x) {}
        focus(a); a.w.classList.add('sizing'); e.preventDefault(); e.stopPropagation();
      });
      h.addEventListener('pointermove', function (e) {
        if (!st || e.pointerId !== st.id) return;
        var k = K(), mw = Math.min(L.w, 260 * k), mh = Math.min(L.h, 200 * k), dx = e.clientX - st.sx, dy = e.clientY - st.sy;
        nx = st.x; ny = st.y; nw = st.w; nh = st.h;
        if (st.d.indexOf('e') > -1) nw = Math.max(mw, Math.min(st.w + dx, L.w - st.x));
        if (st.d.indexOf('w') > -1) { nw = Math.max(mw, Math.min(st.w - dx, st.x + st.w)); nx = st.x + st.w - nw }
        if (st.d.indexOf('s') > -1) nh = Math.max(mh, Math.min(st.h + dy, L.h - st.y));
        if (st.d.indexOf('n') > -1) { nh = Math.max(mh, Math.min(st.h - dy, st.y + st.h)); ny = st.y + st.h - nh }
        if (!raf) raf = requestAnimationFrame(function () {
          raf = 0; a.x = nx; a.y = ny; a.ww = Math.round(nw); a.hh = Math.round(nh); a.cw = a.ww; a.ch = a.hh;
          a.w.style.width = a.ww + 'px'; a.w.style.height = a.hh + 'px'; a.w.style.transform = T(a.x, a.y);
          a.w.classList.toggle('os-sm', a.ww < 520 * K());
        });
      });
      function up(e) { if (!st || e.pointerId !== st.id) return; st = null; a.w.classList.remove('sizing'); clamp(a) }
      h.addEventListener('pointerup', up); h.addEventListener('pointercancel', up);
    });
  }
  function drag(a) {
    var hd = a.w.querySelector('.os-hd'), sx, sy, ox, oy, raf = 0, id = null;
    hd.addEventListener('dblclick', function (e) { if (!e.target.closest('button')) toggleMax(a) });
    hd.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 || e.target.closest('button') || a.max || fit()) return;
      id = e.pointerId; sx = e.clientX; sy = e.clientY; ox = a.x; oy = a.y; hd.classList.add('held');
      try { hd.setPointerCapture(id) } catch (x) {}
      e.preventDefault();
    });
    hd.addEventListener('pointermove', function (e) {
      if (e.pointerId !== id) return;
      a.x = ox + e.clientX - sx; a.y = oy + e.clientY - sy;
      if (!raf) raf = requestAnimationFrame(function () { raf = 0; clamp(a); a.w.style.transform = T(a.x, a.y) });
    });
    function up(e) { if (e.pointerId !== id) return; id = null; hd.classList.remove('held'); clamp(a); a.w.style.transform = T(a.x, a.y) }
    hd.addEventListener('pointerup', up); hd.addEventListener('pointercancel', up);
  }

  /* ---------- Files: every project on the site ---------- */
  var fx = el('div', 'fx');
  (function () {
    var items = [].slice.call(document.querySelectorAll('#proj-menu a')).map(function (l) {
      var id = l.getAttribute('href'), sec = document.querySelector(id), gh = sec && sec.querySelector('.links a[href*="github.com/MatinNikoo/"]');
      return { id: id, no: (l.querySelector('i') || {}).textContent || '', name: (l.querySelector('b') || l).textContent, sub: (l.querySelector('span') || {}).textContent || '', gh: gh && gh.href };
    });
    var gh = document.querySelector('a[href="https://github.com/MatinNikoo"]');
    fx.innerHTML = '<div class="fx-path"><span>Matin</span>›<span>Projects</span></div>' +
      '<nav class="fx-side" aria-label="Places"><b>' + I.folder + 'Projects</b><a href="resume.pdf" target="_blank" rel="noopener">' + I.pdf + 'Resume</a>' +
      (gh ? '<a href="' + gh.href + '" target="_blank" rel="noopener">' + I.folder + 'GitHub</a>' : '') + '</nav>' +
      '<div class="fx-main"><div class="fx-grid">' + items.map(function (p) {
        return '<a class="fx-it" href="' + p.id + '" data-go="' + p.id + '">' + I.folder + '<i>' + esc(p.no) + '</i><b>' + esc(p.name) + '</b><small>' + esc(p.sub) + '</small></a>';
      }).join('') + '<a class="fx-it" href="resume.pdf" target="_blank" rel="noopener">' + I.pdf + '<i>PDF</i><b>resume.pdf</b><small>One page</small></a></div></div>' +
      '<div class="fx-st">' + (items.length + 1) + ' items</div>';
    fx.addEventListener('click', function (e) {
      var g = e.target.closest('[data-go]'); if (!g) return;
      e.preventDefault(); e.stopPropagation();
      var to = document.querySelector(g.getAttribute('data-go')); if (!to) return;
      function go() { var y = to.getBoundingClientRect().top + scrollY - (parseFloat(getComputedStyle(root).scrollPaddingTop) || 72); scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' }) }
      if (full) exitFull(go); else go();
    });
  })();
  var files = App('files', 'Projects', fx, 720, 470);

  /* ---------- Browser: a new tab with the real links ---------- */
  var bx = el('div', 'bx');
  (function () {
    function link(q) { var a = document.querySelector(q); return a ? a.href : null }
    var tiles = [
      ['GitHub', link('a[href="https://github.com/MatinNikoo"]'), 'GH'],
      ['LinkedIn', link('a[href*="linkedin.com/in/"]'), 'in'],
      ['Email', link('a[href^="mailto:"]'), '@'],
      ['Resume', 'resume.pdf', 'CV']
    ].filter(function (t) { return t[1] });
    bx.innerHTML = '<div class="bx-tabs"><span class="bx-tab"><i></i>New tab</span></div>' +
      '<div class="bx-url">' + I.lock + '<span>matinnikoo.github.io</span></div>' +
      '<div class="bx-pg"><canvas class="bx-bg" aria-hidden="true"></canvas><h5>Matin <em>Nikoomanzar</em><i></i></h5><div class="bx-tiles">' + tiles.map(function (t) {
        return '<a href="' + esc(t[1]) + '"' + (t[1].indexOf('mailto:') === 0 ? '' : ' target="_blank" rel="noopener"') + '><span>' + esc(t[2]) + '</span>' + esc(t[0]) + '</a>';
      }).join('') + '</div></div>';
  })();
  var web = App('web', 'Browser', bx, 640, 420);

  /* the browser's own live wallpaper: a dotted globe turning slowly, drawn tiny and scaled up in the same
     pixel style as the desktop. A scan band sweeps its latitudes and a satellite rides an orbit ring.
     It only runs while the browser window is open and on screen, at about 30 frames a second */
  (function () {
    var cv = bx.querySelector('.bx-bg'), g = cv.getContext('2d'), P = [], N = 1300, cw = 0, ch = 0, raf = 0, last = 0, seen = true, sig = [255, 90, 31];
    var GA = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < N; i++) { var y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = GA * i; P.push([Math.cos(th) * r, y, Math.sin(th) * r]) }
    function color() { var x = document.createElement('canvas').getContext('2d'); x.fillStyle = '#FF5A1F'; x.fillStyle = getComputedStyle(root).getPropertyValue('--signal').trim() || '#FF5A1F'; var v = x.fillStyle;
      if (v[0] === '#') sig = [parseInt(v.slice(1, 3), 16), parseInt(v.slice(3, 5), 16), parseInt(v.slice(5, 7), 16)] }
    color(); addEventListener('themechange', color);
    function on() { return web.open && !web.min && seen && !document.hidden && !win.classList.contains('off') && !win.classList.contains('dmin') }
    function frame(now) {
      raf = 0; if (!on()) return;
      if (!reduce) raf = requestAnimationFrame(frame);
      if (now - last < 32) return; last = now;
      var W = Math.max(40, Math.round(cv.clientWidth / 2)), H = Math.max(40, Math.round(cv.clientHeight / 2));
      if (W !== cw || H !== ch) { cw = cv.width = W; ch = cv.height = H }
      var t = reduce ? 6 : now / 1000, a = t * .22, ca = Math.cos(a), sa = Math.sin(a), tl = .42, ct = Math.cos(tl), st = Math.sin(tl);
      var R = Math.min(cw * .42, ch * .62), cx = cw * .5, cy = ch * .56;
      g.fillStyle = '#0c0d0f'; g.fillRect(0, 0, cw, ch);
      var gr = g.createRadialGradient(cx, cy, R * .2, cx, cy, R * 1.6); gr.addColorStop(0, 'rgba(' + sig + ',.16)'); gr.addColorStop(1, 'rgba(' + sig + ',0)');
      g.fillStyle = gr; g.fillRect(0, 0, cw, ch);
      var band = Math.sin(t * .5) * .85, s = '#' + sig.map(function (v) { return ('0' + v.toString(16)).slice(-2) }).join('');
      for (var i = 0; i < N; i++) {
        var p = P[i], x = p[0] * ca + p[2] * sa, z = -p[0] * sa + p[2] * ca, y = p[1] * ct - z * st, zz = p[1] * st + z * ct;
        var px = (cx + x * R) | 0, py = (cy + y * R) | 0, front = zz > 0, near = Math.abs(p[1] - band) < .05;
        if (near && front) { g.globalAlpha = .95; g.fillStyle = s; g.fillRect(px, py, 2, 1) }
        else { g.globalAlpha = front ? .34 + zz * .62 : .13; g.fillStyle = front ? '#e9e9e6' : '#8a8c92'; g.fillRect(px, py, 1, 1) }
      }
      /* the orbit ring and its satellite */
      var ra = R * 1.38, rb = R * .34, rot = -.32, cr = Math.cos(rot), sr = Math.sin(rot);
      g.globalAlpha = .35; g.fillStyle = '#e9e9e6';
      for (var u = 0; u < 6.283; u += .045) { var ex = Math.cos(u) * ra, ey = Math.sin(u) * rb, back = Math.sin(u) < 0; if (back) continue; g.fillRect((cx + ex * cr - ey * sr) | 0, (cy + ex * sr + ey * cr) | 0, 1, 1) }
      var su = t * .7, sx = Math.cos(su) * ra, sy = Math.sin(su) * rb, qx = cx + sx * cr - sy * sr, qy = cy + sx * sr + sy * cr;
      g.globalAlpha = 1; g.fillStyle = s; g.fillRect((qx - 1) | 0, (qy - 1) | 0, 3, 3);
      g.globalAlpha = .25; g.fillRect((qx - 3) | 0, qy | 0, 7, 1); g.fillRect(qx | 0, (qy - 3) | 0, 1, 7);
      g.globalAlpha = 1;
    }
    function wake() { if (!raf && on()) raf = requestAnimationFrame(frame) }
    web.onshow = wake;
    document.addEventListener('visibilitychange', wake);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { seen = es[es.length - 1].isIntersecting; wake() }).observe(bx);
    setInterval(wake, 1200);
  })();

  /* ---------- Music: the site's playlist, laid out like Spotify ---------- */
  var sp = el('div', 'sp'), music = null, P = window.mnPlayer;
  function fmt(d) { d = Math.round(d || 0); return Math.floor(d / 60) + ':' + ('0' + d % 60).slice(-2) }
  function buildMusic() {
    P = window.mnPlayer; if (!P || !P.tracks) return false;
    var tr = P.tracks, total = tr.reduce(function (s, t) { return s + (t.d || 0) }, 0), hr = Math.floor(total / 3600), mn = Math.round((total % 3600) / 60);
    sp.innerHTML = '<div class="sp-hd"><img class="sp-art" alt="" decoding="async"><div><small>Playlist</small><h4>Matin’s playlist</h4><p><b>Matin</b> · ' + tr.length + ' songs, ' + (hr ? hr + ' hr ' : '') + mn + ' min</p></div></div>' +
      '<div class="sp-bar"><button type="button" class="sp-play" aria-label="Play">' + I.play + '</button><button type="button" class="sp-sk pv" aria-label="Previous song">' + I.prev + '</button><button type="button" class="sp-sk nx" aria-label="Next song">' + I.next + '</button><span class="sp-now"></span></div>' +
      '<div class="sp-cols" aria-hidden="true"><span>#</span><span>Title</span><span>Time</span></div>' +
      '<ol class="sp-list">' + tr.map(function (t, k) {
        return '<li><button type="button" class="sp-row" data-k="' + k + '"><span class="sp-n"><i>' + (k + 1) + '</i><svg class="sp-ic pl" viewBox="0 0 16 16">' + I.play.replace(/<\/?svg[^>]*>/g, '') + '</svg><svg class="sp-ic pa" viewBox="0 0 16 16">' + I.pause.replace(/<\/?svg[^>]*>/g, '') + '</svg><span class="sp-eq" aria-hidden="true"><i></i><i></i><i></i></span></span>' +
          '<img alt="" loading="lazy" decoding="async" src="' + esc(t.c) + '"><span class="sp-ti"><b>' + esc(t.t) + '</b><small>' + esc(t.a) + '</small></span><span class="sp-d">' + fmt(t.d) + '</span></button></li>';
      }).join('') + '</ol>';
    sp.querySelector('.sp-play').addEventListener('click', function () { P.toggle() });
    sp.querySelector('.pv').addEventListener('click', function () { P.prev() });
    sp.querySelector('.nx').addEventListener('click', function () { P.next() });
    sp.querySelector('.sp-list').addEventListener('click', function (e) {
      var r = e.target.closest('.sp-row'); if (!r) return; var k = +r.getAttribute('data-k');
      if (k === P.current()) P.toggle(); else P.play(k);
    });
    paintMusic(true);
    return true;
  }
  var lastK = -1, lastOn = null;
  function paintMusic(force) {
    if (!P || !P.tracks || !sp.firstChild) return;
    var k = P.current(), on = P.playing();
    if (!force && k === lastK && on === lastOn) return;
    var t = P.tracks[k], rows = sp.querySelectorAll('.sp-row');
    if (k !== lastK || force) {
      if (rows[lastK]) rows[lastK].classList.remove('cur', 'on');
      var art = sp.querySelector('.sp-art'); if (t.c && art.getAttribute('src') !== t.c) art.src = t.c;
      sp.querySelector('.sp-hd').style.setProperty('--sp', (t.p && t.p.bg) || '#2a2a2a');
    }
    if (rows[k]) { rows[k].classList.add('cur'); rows[k].classList.toggle('on', on); rows[k].setAttribute('aria-label', (on ? 'Pause ' : 'Play ') + t.t) }
    var pb = sp.querySelector('.sp-play'); pb.innerHTML = on ? I.pause : I.play; pb.setAttribute('aria-label', on ? 'Pause' : 'Play');
    sp.querySelector('.sp-now').innerHTML = (on ? 'Playing ' : 'Paused · ') + '<b>' + esc(t.t) + '</b> · ' + esc(t.a);
    lastK = k; lastOn = on;
  }
  music = App('music', 'Music', sp, 700, 520);
  music.onopen = function () {
    if (!sp.firstChild) buildMusic();
    paintMusic(true);
    /* start at the top, unless the song that's on is further down the list */
    var r = sp.querySelector('.sp-row.cur'), b = music.w.querySelector('.os-b');
    if (r && b) b.scrollTop = r.offsetTop + r.offsetHeight > b.clientHeight - 20 ? r.offsetTop - b.clientHeight / 2 : 0;
  };
  addEventListener('mnplayer', function () { if (music.open) paintMusic() });

  [files, web, music].forEach(function (a) { if (a.b) { a.b.addEventListener('click', function (e) { e.preventDefault(); openApp(a) }); a.b.setAttribute('aria-pressed', 'false') } });

  /* ---------- start menu ---------- */
  var sm = el('div', 'os-start'); sm.hidden = true; sm.setAttribute('role', 'menu'); sm.setAttribute('aria-label', 'Start');
  sm.innerHTML = '<h6>Pinned</h6><div class="os-pins">' +
    '<button type="button" data-o="files">' + ico('files') + 'Projects</button>' +
    '<button type="button" data-o="web">' + ico('web') + 'Browser</button>' +
    '<button type="button" data-o="music">' + ico('music') + 'Music</button>' +
    '<button type="button" data-o="full">' + I.full + 'Full screen</button></div>' +
    '<div class="os-me"><span><i></i>Matin Nikoomanzar</span><button type="button" data-o="off" aria-label="Shut down">' + I.power + '</button></div>';
  var me = document.querySelector('.hero img'); if (me && (me.currentSrc || me.src)) sm.querySelector('.os-me i').style.backgroundImage = 'url("' + (me.currentSrc || me.src) + '")';
  win.insertBefore(sm, tb.nextSibling);
  sm.addEventListener('click', function (e) {
    var b = e.target.closest('[data-o]'); if (!b) return; var o = b.getAttribute('data-o');
    if (o === 'full') { closeStart(); return full ? exitFull() : enterFull() }
    if (o === 'off') { closeStart(); return shutDown() }
    openApp({ files: files, web: web, music: music }[o]);
  });
  function placeStart() { sm.style.bottom = (win.clientHeight - tb.offsetTop + 6) + 'px' }
  function openStart() {
    placeStart(); sm.hidden = false; startB.setAttribute('aria-expanded', 'true');
    A(sm, [{ transform: 'translateY(14px) scale(.97)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 300 });
  }
  function closeStart() {
    if (sm.hidden) return; startB.setAttribute('aria-expanded', 'false');
    A(sm, [{ transform: 'none', opacity: 1 }, { transform: 'translateY(10px) scale(.98)', opacity: 0 }], { duration: 140, easing: SOFT }, function () { sm.hidden = true });
  }
  document.addEventListener('pointerdown', function (e) { if (!sm.hidden && !sm.contains(e.target) && !startB.contains(e.target)) closeStart() });

  /* ---------- minus: the desktop drops into the start button, the start button brings it back ---------- */
  function deskTo() { var dr = desk.getBoundingClientRect(), c = center(startB, dr), s = .05; return T(c.x - dr.width * s / 2, c.y - dr.height * s / 2, s) }
  function layerTo() { var lr = layer.getBoundingClientRect(), c = center(startB, lr), s = .05; return T(c.x - lr.width * s / 2, c.y - lr.height * s / 2, s) }
  function minDesk() {
    if (win.classList.contains('dmin')) return;
    closeStart();
    desk.style.transformOrigin = layer.style.transformOrigin = '0 0';
    var o = { duration: 420, easing: IN };
    A(layer, [{ transform: 'none', opacity: 1 }, { transform: layerTo(), opacity: 0 }], o);
    A(desk, [{ transform: 'none', opacity: 1 }, { transform: deskTo(), opacity: 0 }], o, function () { win.classList.add('dmin'); startB.classList.add('wake') });
    startB.setAttribute('aria-label', 'Bring the desktop back');
  }
  function restoreDesk() {
    if (!win.classList.contains('dmin')) return;
    win.classList.remove('dmin'); startB.classList.remove('wake'); startB.setAttribute('aria-label', 'Start');
    var o = { duration: 560 };
    A(layer, [{ transform: layerTo(), opacity: 0 }, { transform: 'none', opacity: 1 }], o);
    A(desk, [{ transform: deskTo(), opacity: 0 }, { transform: 'none', opacity: 1 }], o);
  }
  startB.addEventListener('click', function () {
    if (win.classList.contains('dmin')) return restoreDesk();
    sm.hidden ? openStart() : closeStart();
  });
  startB.setAttribute('aria-haspopup', 'menu'); startB.setAttribute('aria-expanded', 'false');

  /* ---------- square: full screen. The window is lifted out to the page so nothing around it can clip it ---------- */
  var full = false, host = el('div', 'visual showcase win-host'), ph = null; host.hidden = true; document.body.appendChild(host);
  function poke() { try { dispatchEvent(new Event('resize')) } catch (x) {} }
  /* Full screen is one move: the window opens out to the edges while every icon and widget glides from
     where it was to its new place, folders down the left side and the widgets in a column on the right.
     Each piece is measured before and after and only its transform animates, so nothing is laid out mid way. */
  var memo = null;
  function pieces() {
    return {
      fit: [].slice.call(desk.querySelectorAll('.icons a')).concat([desk.querySelector('.tall'), desk.querySelector('.clock'), desk.querySelector('.aura-slot'), desk.querySelector('.wide')]).filter(Boolean),
      slide: [bar.querySelector('.win-title'), bar.querySelector('.win-ctl'), tb.querySelector('.dock')].filter(Boolean)
    };
  }
  function settle(list) { list.forEach(function (e) { if (e._a) { var o = e._a; e._a = null; o.onfinish = null; try { o._done && o._done() } catch (x) {} o.cancel() } }) }
  function rects(list) { return list.map(function (e) { return e.getBoundingClientRect() }) }
  function inset(r, round) { return 'inset(' + r.top.toFixed(1) + 'px ' + (innerWidth - r.right).toFixed(1) + 'px ' + (innerHeight - r.bottom).toFixed(1) + 'px ' + r.left.toFixed(1) + 'px round ' + round + 'px)' }
  function fromTo(b, a, scale) { return scale ? T(b.left - a.left, b.top - a.top, b.width / (a.width || 1), b.height / (a.height || 1)) : T(b.left - a.left, b.top - a.top) }
  function openApps() { return apps.filter(function (a) { return a.open && !a.min }) }
  function enterFull() {
    if (full) return; full = true; closeStart();
    var P = pieces(), all = P.fit.concat(P.slide, [win]); settle(all); openApps().forEach(function (a) { settle([a.w]) });
    root.classList.add('os-full');
    var w0 = win.getBoundingClientRect(), f0 = rects(P.fit), s0 = rects(P.slide);
    memo = { vw: innerWidth, vh: innerHeight, w: w0, f: f0, s: s0 };
    ph = el('div', 'win-ph'); ph.style.height = w0.height + 'px'; fig.insertBefore(ph, win);
    memo.ph = ph.getBoundingClientRect();
    win.style.setProperty('--rx', '0deg'); win.style.setProperty('--ry', '0deg');
    host.hidden = false; host.appendChild(win); win.classList.add('full');
    layout();
    ctl.max.setAttribute('aria-label', 'Leave full screen'); ctl.max.innerHTML = I.res;
    if (reduce || !win.animate) { poke(); return }
    var f1 = rects(P.fit), s1 = rects(P.slide), D = 640, run = [];
    P.fit.forEach(function (e, i) { e.style.transformOrigin = '0 0'; run.push(e.animate([{ transform: fromTo(f0[i], f1[i], true) }, { transform: 'none' }], { duration: D, easing: OUT })) });
    P.slide.forEach(function (e, i) { run.push(e.animate([{ transform: fromTo(s0[i], s1[i]) }, { transform: 'none' }], { duration: D, easing: OUT })) });
    openApps().forEach(function (a) { run.push(a.w.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: D * .55, easing: SOFT, fill: 'backwards' })) });
    var wa = win.animate([{ clipPath: inset(w0, 14) }, { clipPath: inset({ top: 0, left: 0, right: innerWidth, bottom: innerHeight }, 0) }], { duration: D, easing: OUT });
    win._a = wa;
    wa.onfinish = function () { if (win._a === wa) win._a = null; run.forEach(function (r) { r.cancel() }); P.fit.forEach(function (e) { e.style.transformOrigin = '' }); poke() };
  }
  function exitFull(then) {
    if (!full) { then && then(); return }
    var P = pieces(), done = false;
    settle(P.fit.concat(P.slide, [win]));
    function swap() {
      if (done) return; done = true; full = false;
      fig.insertBefore(win, ph); ph.remove(); ph = null; host.hidden = true;
      win.classList.remove('full'); root.classList.remove('os-full');
      layout(); poke(); then && then();
    }
    ctl.max.setAttribute('aria-label', 'Full screen'); ctl.max.innerHTML = I.max;
    /* if the screen changed size while it was open, the old spots are stale, so it just settles back in place */
    if (reduce || !win.animate || !memo || memo.vw !== innerWidth || memo.vh !== innerHeight) {
      swap(); if (!reduce && win.animate) win.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: OUT }); return;
    }
    /* the page gets its scrollbar back first, and the remembered spots shift by however much that moved the page */
    root.classList.remove('os-full');
    var pn = ph.getBoundingClientRect(), ox = pn.left - memo.ph.left, oy = pn.top - memo.ph.top;
    function sh(r) { return { left: r.left + ox, top: r.top + oy, width: r.width, height: r.height, right: r.right + ox, bottom: r.bottom + oy } }
    var f1 = rects(P.fit), s1 = rects(P.slide), D = 540, run = [];
    P.fit.forEach(function (e, i) { e.style.transformOrigin = '0 0'; run.push(e.animate([{ transform: 'none' }, { transform: fromTo(sh(memo.f[i]), f1[i], true) }], { duration: D, easing: OUT, fill: 'forwards' })) });
    P.slide.forEach(function (e, i) { run.push(e.animate([{ transform: 'none' }, { transform: fromTo(sh(memo.s[i]), s1[i]) }], { duration: D, easing: OUT, fill: 'forwards' })) });
    openApps().forEach(function (a) { run.push(a.w.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: SOFT, fill: 'forwards' })) });
    var wr = win.getBoundingClientRect(), mw = sh(memo.w);
    var wa = win.animate([{ clipPath: 'inset(0px 0px 0px 0px round 0px)' }, { clipPath: 'inset(' + (mw.top - wr.top).toFixed(1) + 'px ' + (wr.right - mw.right).toFixed(1) + 'px ' + (wr.bottom - mw.bottom).toFixed(1) + 'px ' + (mw.left - wr.left).toFixed(1) + 'px round 14px)' }], { duration: D, easing: OUT, fill: 'forwards' });
    win._a = wa;
    wa.onfinish = function () {
      if (win._a === wa) win._a = null;
      swap();
      run.forEach(function (r) { r.cancel() }); wa.cancel(); P.fit.forEach(function (e) { e.style.transformOrigin = '' });
      openApps().forEach(function (a) { a.w.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: SOFT }) });
    };
  }

  /* ---------- X: switch off like an old monitor, the power button turns it back on ---------- */
  var off = el('div', 'os-off', '<button type="button" class="os-pow" aria-label="Turn the desktop back on">' + I.power + '</button><span>Press to turn on</span>');
  var line = el('div', 'os-line'); win.appendChild(off); win.appendChild(line);
  function squash(e, wr, sx, sy) { var r = e.getBoundingClientRect(), cx = wr.width / 2 - (r.left - wr.left), cy = wr.height / 2 - (r.top - wr.top); return T((1 - sx) * cx, (1 - sy) * cy, sx, sy) }
  function parts() { return [win.querySelector('canvas.wall'), bar, desk, layer, tb].filter(Boolean) }
  function shutDown() {
    if (win.classList.contains('off')) return; closeStart();
    var wr = win.getBoundingClientRect(), ps = parts(), n = ps.length, D = 620;
    ps.forEach(function (e, i) {
      e.style.transformOrigin = '0 0';
      A(e, [{ transform: 'none', opacity: 1 }, { transform: squash(e, wr, 1, .004), opacity: 1, offset: .55 }, { transform: squash(e, wr, 0, .004), opacity: 0 }], { duration: D, easing: 'cubic-bezier(.6,0,.4,1)' },
        i === n - 1 ? function () { win.classList.add('off'); ps.forEach(function (p) { p.style.transformOrigin = '' }); var pw = off.querySelector('.os-pow'); try { pw.focus({ preventScroll: true }) } catch (x) {} } : null);
    });
    A(line, [{ opacity: 0, transform: 'scaleX(1)' }, { opacity: 0, offset: .4 }, { opacity: 1, transform: 'scaleX(1)', offset: .58 }, { opacity: 1, transform: 'scaleX(.002)', offset: .92 }, { opacity: 0, transform: 'scaleX(0)' }], { duration: D + 80, easing: 'linear', fill: 'none' });
  }
  function powerOn() {
    if (!win.classList.contains('off')) return;
    win.classList.remove('off');
    var wr = win.getBoundingClientRect(), ps = parts(), D = 640;
    ps.forEach(function (e) {
      e.style.transformOrigin = '0 0';
      A(e, [{ transform: squash(e, wr, 0, .004), opacity: 0 }, { transform: squash(e, wr, 1, .004), opacity: 1, offset: .4 }, { transform: 'none', opacity: 1 }], { duration: D, easing: 'cubic-bezier(.3,0,.2,1)' }, function () { e.style.transformOrigin = '' });
    });
    A(line, [{ opacity: 0, transform: 'scaleX(0)' }, { opacity: 1, transform: 'scaleX(1)', offset: .38 }, { opacity: 0, transform: 'scaleX(1)', offset: .6 }, { opacity: 0 }], { duration: D, easing: 'linear', fill: 'none' });
  }
  off.querySelector('.os-pow').addEventListener('click', powerOn);

  /* ---------- the title bar buttons ---------- */
  if (ctl.min) ctl.min.addEventListener('click', minDesk);
  if (ctl.max) ctl.max.addEventListener('click', function () { full ? exitFull() : enterFull() });
  if (ctl.cls) ctl.cls.addEventListener('click', shutDown);
  bar.addEventListener('dblclick', function (e) { if (!e.target.closest('button')) full ? exitFull() : enterFull() });

  /* Escape backs out one step at a time: the start menu, then the top app, then full screen */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!sm.hidden) { closeStart(); e.preventDefault(); return }
    var t = top(), inside = win.contains(document.activeElement);
    if (t && (full || inside)) { close(t); e.preventDefault(); return }
    if (full) { exitFull(); e.preventDefault() }
  });

  var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { layout(); if (!sm.hidden) placeStart() }, 120) });
  if ('ResizeObserver' in window) new ResizeObserver(function () { clearTimeout(rt); rt = setTimeout(layout, 60) }).observe(win);
  layout();
})();
