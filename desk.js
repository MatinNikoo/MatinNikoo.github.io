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
    '.full{box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}',
    '.tb-exit{display:none!important}.full .tb-exit{display:grid!important;place-items:center}',
    '@media (hover:hover) and (pointer:fine){.full .tb-exit{display:none!important}}',
    '.os-layer{position:absolute;left:0;right:0;z-index:3;pointer-events:none}',
    '.os-w{position:absolute;left:0;top:0;display:flex;flex-direction:column;pointer-events:auto;background:#141416;color:#ECECEA;border:1px solid rgba(255,255,255,.1);border-radius:12px;overflow:hidden;transform-origin:0 0;',
    'box-shadow:0 1px 0 rgba(255,255,255,.06) inset,0 30px 60px -20px rgba(0,0,0,.75),0 10px 22px -10px rgba(0,0,0,.6);font-family:var(--body,system-ui,sans-serif);contain:layout paint}',
    '.os-w[hidden]{display:none}',
    /* no live blur inside the desktop: a blur behind the dock is recomputed when the full screen clip comes off, and that shows as a flash */
    '.win .dock,.win .gctl,.win .gchip,.win [class*="gif"] *{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}',
    '.win .dock{background:rgba(16,16,18,.86)!important}',
    '.os-w,.win .dock,.win .win-title,.win .win-ctl,.desk .icons a,.desk .tall,.desk .clock,.desk .aura-slot,.desk .wide{will-change:transform}','.os-w:focus{outline:none}',
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
    '.bx-home{display:flex;flex-direction:column;align-items:center;gap:1.1rem;width:100%}',
    '.bx-qw{position:relative;width:min(23rem,92%);z-index:2}',
    '.bx-q{display:flex;align-items:center;gap:.55rem;height:2.4rem;padding:0 .95rem;border-radius:99px;background:rgba(32,33,36,.92);border:1px solid rgba(255,255,255,.1);cursor:text;transition:border-color .2s,background .2s,box-shadow .2s}',
    '.bx-q:hover{border-color:rgba(255,255,255,.2)}',
    '.bx-q:focus-within{border-color:rgba(255,90,31,.7);box-shadow:0 0 0 3px rgba(255,90,31,.14);background:#202124}',
    '.bx-q svg{width:.85rem;height:.85rem;flex:0 0 auto;fill:none;stroke:rgba(255,255,255,.6);stroke-width:1.8;stroke-linecap:round}',
    '.bx-q input{flex:1;min-width:0;background:none;border:0;outline:none;color:#fff;font:inherit;font-size:.8rem}',
    '.bx-q input::placeholder{color:rgba(255,255,255,.45)}',
    '.bx-sug{position:absolute;left:0;right:0;top:calc(100% + .4rem);max-height:15.5rem;overflow:auto;overscroll-behavior:contain;padding:.35rem;border-radius:14px;background:#17181b;border:1px solid rgba(255,255,255,.1);box-shadow:0 24px 50px -18px rgba(0,0,0,.85)}',
    '.bx-sh{margin:.25rem .55rem .35rem;font:500 .58rem var(--mono,monospace);letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.4)}',
    '.bx-none{margin:.6rem .7rem;font-size:.75rem;color:rgba(255,255,255,.5)}',
    '.bx-si{display:grid;grid-template-columns:1.6rem minmax(0,1fr);column-gap:.4rem;width:100%;padding:.48rem .55rem;border:0;border-radius:9px;background:none;color:#fff;text-align:left;cursor:pointer;font:inherit;transition:background .15s}',
    '.bx-si.hi{background:rgba(255,255,255,.07)}',
    '.bx-si i{grid-row:span 2;font:normal .6rem var(--mono,monospace);color:var(--signal,#FF5A1F);padding-top:.15rem}',
    '.bx-si b{font-size:.78rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.bx-si small{font-size:.68rem;color:rgba(255,255,255,.5);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.bx-tt{overflow:hidden;text-overflow:ellipsis}',
    '.bx-home[hidden],.bx-site[hidden]{display:none}',
    '.bx-pg{justify-content:safe center}',
    '.bx-tab{border:0;cursor:pointer;color:rgba(255,255,255,.6);background:transparent;font:inherit;font-size:.72rem;transition:background .2s,color .2s}',
    '.bx-tab.on{background:#202124;color:#fff}',
    '.bx-tab:not(.on):hover{background:rgba(255,255,255,.05)}',
    '.bx-tab .bx-tx{font-style:normal;margin-left:.15rem;width:1rem;height:1rem;display:grid;place-items:center;border-radius:50%;font-size:.8rem;line-height:1;color:rgba(255,255,255,.55)}',
    '.bx-tab .bx-tx:hover{background:rgba(255,255,255,.12);color:#fff}',
    '.bx-plus{align-self:center;width:1.5rem;height:1.5rem;margin-left:.15rem;border:0;border-radius:50%;background:none;color:rgba(255,255,255,.7);font-size:1rem;line-height:1;cursor:pointer;transition:background .15s}',
    '.bx-plus:hover{background:rgba(255,255,255,.1)}',
    '.bx-nav{display:flex;align-items:center;gap:.15rem;padding:.4rem .5rem;background:#202124}',
    '.bx-nb{flex:0 0 auto;display:grid;place-items:center;width:1.65rem;height:1.65rem;border:0;border-radius:50%;background:none;color:#e8eaed;cursor:pointer;transition:background .15s,opacity .2s}',
    '.bx-nb:hover:not(:disabled){background:rgba(255,255,255,.1)}',
    '.bx-nb:disabled{opacity:.3;cursor:default}',
    '.bx-nb svg{width:.8rem;height:.8rem;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}',
    '.bx-nav .bx-url{flex:1;min-width:0;margin:0 0 0 .3rem}',
    '.bx-addr{flex:1;min-width:0;background:none;border:0;outline:none;color:rgba(255,255,255,.88);font:inherit;font-size:.74rem}',
    '.bx-addr::placeholder{color:rgba(255,255,255,.4)}',
    '.bx-url:focus-within{box-shadow:0 0 0 2px rgba(138,180,248,.55)}',
    '.bx-site{align-self:stretch;flex:1 0 auto;width:100%;background:#fff;color:#202124}',
    '.bx.away .bx-pg{justify-content:flex-start;padding:0;gap:0}',
    '.bx-site:has(.bx-w){background:#F4F3EF}',
    '.bx-sr{padding:1rem 1.2rem 1.4rem;font-size:.78rem}',
    '.bx-srh{display:flex;align-items:center;gap:.9rem;padding-bottom:.8rem;border-bottom:1px solid #ebebeb}',
    '.bx-srh b{font-family:var(--serif,Georgia,serif);font-weight:400;font-size:1.2rem;color:#202124}',
    '.bx-srh b i{display:inline-block;width:.18em;height:.18em;margin-left:.06em;background:var(--signal,#FF5A1F)}',
    '.bx-srq{flex:1;min-width:0;padding:.45rem .9rem;border-radius:99px;border:1px solid #dfe1e5;box-shadow:0 1px 4px rgba(32,33,36,.12);font-size:.76rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.bx-srn{margin:.7rem 0 .4rem;font-size:.68rem;color:#70757a}',
    '.bx-r{display:block;padding:.55rem 0 .7rem;text-decoration:none;color:inherit}',
    '.bx-rs{display:flex;align-items:center;gap:.4rem;font-size:.66rem;color:#4d5156}',
    '.bx-rs i{width:.9rem;height:.9rem;border-radius:50%;background:#f1f3f4;box-shadow:inset 0 0 0 3px #f1f3f4,inset 0 0 0 10px var(--signal,#FF5A1F)}',
    '.bx-r b{display:block;margin:.2rem 0 .15rem;font-size:.95rem;font-weight:400;color:#1a0dab}',
    '.bx-r:hover b{text-decoration:underline}',
    '.bx-r small{display:block;font-size:.72rem;line-height:1.5;color:#4d5156;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}',
    '.bx-w{max-width:30rem;margin:0 auto;padding:1rem 1.3rem 1.2rem;font-size:.8rem;line-height:1.6;color:#3c3c40;background:#F4F3EF;min-height:100%}',
    '.bx-wh{display:flex;justify-content:space-between;align-items:center;padding-bottom:.6rem;margin-bottom:1rem;border-bottom:1px solid #1b1b1d;font:500 .6rem var(--mono,monospace);letter-spacing:.14em;text-transform:uppercase;color:#1b1b1d}',
    '.bx-wh span{color:#8a8a8f}',
    '.bx-k{display:flex;align-items:center;gap:.5rem;margin:0 0 .45rem;font:500 .6rem var(--mono,monospace);letter-spacing:.16em;text-transform:uppercase;color:#8a8a8f}',
    '.bx-k i{width:.45rem;height:.45rem;background:var(--signal,#FF5A1F)}',
    '.bx-w h6{margin:0;font-family:var(--serif,Georgia,serif);font-weight:400;font-size:1.75rem;line-height:1.05;color:#141416}',
    '.bx-sub{margin:.3rem 0 .9rem;color:#8a8a8f;font-size:.74rem}',
    '.bx-stat{display:flex;align-items:baseline;gap:.75rem;padding:.65rem 0;margin-bottom:.75rem;border-top:1px solid #dcdad3;border-bottom:1px solid #dcdad3}',
    '.bx-stat b{flex:0 0 auto;font-family:var(--serif,Georgia,serif);font-weight:400;font-size:1.7rem;line-height:1;color:var(--signal,#E8480F)}',
    '.bx-stat span{font-size:.72rem;color:#6e6e74;line-height:1.4}',
    '.bx-w p{margin:0 0 .6rem}',
    '.bx-acts{display:flex;flex-wrap:wrap;gap:.45rem;margin-top:.9rem}',
    '.bx-acts a,.bx-acts button{display:inline-flex;align-items:center;height:1.9rem;padding:0 .85rem;border-radius:99px;border:1px solid #1b1b1d;background:none;color:#1b1b1d;font:inherit;font-size:.72rem;text-decoration:none;cursor:pointer;transition:background .15s,color .15s}',
    '.bx-acts a:hover,.bx-acts button:hover{background:#1b1b1d;color:#F4F3EF}',
    '.bx-acts .bx-go{background:#1b1b1d;color:#F4F3EF}',
    '.bx-acts .bx-go:hover{background:#000}',
    '.bx-wf{margin-top:1.4rem;padding-top:.6rem;border-top:1px solid #dcdad3;font:500 .56rem var(--mono,monospace);letter-spacing:.14em;text-transform:uppercase;color:#a3a3a8}',
    /* the project pages follow the site: dark when the site is dark */
    ':root[data-theme="dark"] .bx-site{background:#202124;color:#e8eaed}:root[data-theme="dark"] .bx-site:has(.bx-w){background:#0F1012}:root[data-theme="dark"] .bx-srh{border-color:#3c4043}:root[data-theme="dark"] .bx-srh b{color:#e8eaed}:root[data-theme="dark"] .bx-srq{background:#303134;border-color:#5f6368;box-shadow:none;color:#e8eaed}:root[data-theme="dark"] .bx-srn{color:#9aa0a6}:root[data-theme="dark"] .bx-rs{color:#bdc1c6}:root[data-theme="dark"] .bx-rs i{background:#303134;box-shadow:inset 0 0 0 3px #303134,inset 0 0 0 10px var(--signal,#FF5A1F)}:root[data-theme="dark"] .bx-r b{color:#8ab4f8}:root[data-theme="dark"] .bx-r small{color:#bdc1c6}:root[data-theme="dark"] .bx-w{background:#0F1012;color:#C9C9C6}:root[data-theme="dark"] .bx-wh{border-color:#ECECEA;color:#ECECEA}:root[data-theme="dark"] .bx-wh span{color:#8C8C92}:root[data-theme="dark"] .bx-k{color:#8C8C92}:root[data-theme="dark"] .bx-w h6{color:#ECECEA}:root[data-theme="dark"] .bx-sub{color:#8C8C92}:root[data-theme="dark"] .bx-stat{border-color:#26262B}:root[data-theme="dark"] .bx-stat b{color:#FF5A1F}:root[data-theme="dark"] .bx-stat span{color:#8C8C92}:root[data-theme="dark"] .bx-acts a,:root[data-theme="dark"] .bx-acts button{border-color:#ECECEA;color:#ECECEA}:root[data-theme="dark"] .bx-acts a:hover,:root[data-theme="dark"] .bx-acts button:hover{background:#ECECEA;color:#0F1012}:root[data-theme="dark"] .bx-acts .bx-go{background:#ECECEA;color:#0F1012}:root[data-theme="dark"] .bx-acts .bx-go:hover{background:#fff}:root[data-theme="dark"] .bx-wf{border-color:#26262B;color:#5A5A60}',
    '@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .bx-site{background:#202124;color:#e8eaed}:root:not([data-theme="light"]) .bx-site:has(.bx-w){background:#0F1012}:root:not([data-theme="light"]) .bx-srh{border-color:#3c4043}:root:not([data-theme="light"]) .bx-srh b{color:#e8eaed}:root:not([data-theme="light"]) .bx-srq{background:#303134;border-color:#5f6368;box-shadow:none;color:#e8eaed}:root:not([data-theme="light"]) .bx-srn{color:#9aa0a6}:root:not([data-theme="light"]) .bx-rs{color:#bdc1c6}:root:not([data-theme="light"]) .bx-rs i{background:#303134;box-shadow:inset 0 0 0 3px #303134,inset 0 0 0 10px var(--signal,#FF5A1F)}:root:not([data-theme="light"]) .bx-r b{color:#8ab4f8}:root:not([data-theme="light"]) .bx-r small{color:#bdc1c6}:root:not([data-theme="light"]) .bx-w{background:#0F1012;color:#C9C9C6}:root:not([data-theme="light"]) .bx-wh{border-color:#ECECEA;color:#ECECEA}:root:not([data-theme="light"]) .bx-wh span{color:#8C8C92}:root:not([data-theme="light"]) .bx-k{color:#8C8C92}:root:not([data-theme="light"]) .bx-w h6{color:#ECECEA}:root:not([data-theme="light"]) .bx-sub{color:#8C8C92}:root:not([data-theme="light"]) .bx-stat{border-color:#26262B}:root:not([data-theme="light"]) .bx-stat b{color:#FF5A1F}:root:not([data-theme="light"]) .bx-stat span{color:#8C8C92}:root:not([data-theme="light"]) .bx-acts a,:root:not([data-theme="light"]) .bx-acts button{border-color:#ECECEA;color:#ECECEA}:root:not([data-theme="light"]) .bx-acts a:hover,:root:not([data-theme="light"]) .bx-acts button:hover{background:#ECECEA;color:#0F1012}:root:not([data-theme="light"]) .bx-acts .bx-go{background:#ECECEA;color:#0F1012}:root:not([data-theme="light"]) .bx-acts .bx-go:hover{background:#fff}:root:not([data-theme="light"]) .bx-wf{border-color:#26262B;color:#5A5A60}}',
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
    '.win.full>.desk .icons{flex-direction:row!important;justify-content:flex-start!important;width:auto;gap:.3rem!important}.win.full>.desk .icons a{width:5.6rem}',
    /* on a phone the widgets sit in a narrower column with room around them, like a home screen, instead of filling the glass edge to edge */
    '.win.full>.desk{grid-template-columns:repeat(2,minmax(0,min(9.4rem,calc(50vw - 1.6rem))))!important;justify-content:center!important;column-gap:.65rem!important;row-gap:.65rem!important;padding-bottom:.4rem!important}',
    '.win.full>.desk .icons{justify-self:start}',
    '.win.full>.desk .aura-slot .ac{--h:clamp(80px,26cqw,112px)}',
    '.win.full>.desk .tall,.win.full>.desk .wide{max-height:9.4rem}}',
    '.win.full>.desk .aura-slot .ac{--h:clamp(92px,30cqw,calc(150px * var(--mk,1)))}',
    'html.os-full{overflow:hidden}',
    '.win.flat{transition:none!important;--rx:0deg!important;--ry:0deg!important}',
    '.os-frame{position:absolute;inset:0;background:#0B0B0D;z-index:0}',
    '.os-frame canvas{display:block;width:100%;height:100%;image-rendering:pixelated;image-rendering:crisp-edges}',
    '.win.exiting{background:transparent!important;overflow:visible!important;box-shadow:none!important;border-color:transparent!important}',
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
      var id = l.getAttribute('data-p') ? '#' + l.getAttribute('data-p') : l.getAttribute('href'), sec = document.querySelector(id), gh = sec && sec.querySelector('.links a[href*="github.com/MatinNikoo/"]');
      return { id: id, no: (l.querySelector('i') || {}).textContent || '', name: (l.querySelector('b') ? l.querySelector('b').firstChild.textContent : l.textContent).trim(), sub: (l.querySelector('span') || {}).textContent || '', gh: gh && gh.href };
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

  /* ---------- the browser searches the projects and opens a short page on each one ---------- */
  (function () {
    var SUM = {
      '#p-skeptic': ['p 0.236', 'what a "significant" win looks like once all nine metrics count', ['Skeptic is an AI analyst I\'m building. You give it a claim, the data or a whole report, and it picks the right checks, runs them, and tells you what holds up.', 'It covers A/B tests, causal studies and backtests, writes its own Python when it needs to, and every number the AI writes gets checked against the math first.'], [['Join the waitlist', 'https://getskeptic.pages.dev'], ['Python package', 'https://github.com/MatinNikoo/skeptic-checks']]],
      '#p-apps': ['31% vs 1.7%', 'free apps with ads and in-app purchases vs paid apps, reaching 100K installs', ['I followed 815K apps from launch to see which ones ever reach 100K installs. Only about 6 in 100 do.', 'How an app makes money mattered more than almost anything else, and it held in all 48 categories. I turned the model into a simulator you can play with.'], [['Simulator', 'simulator.html'], ['Code', 'https://github.com/MatinNikoo/play-store-analysis']]],
      '#p-backtest': ['3 of 89', 'moving average pairs that beat just holding SPY', ['I wrote the 50/200 day crossover on SPY from scratch, with next day trades and real costs. Tuned on 2000 to 2017, tested on 2018 to 2026.', 'It lost to buy and hold. Then I checked whether picking the windows was luck, and the overfitting odds came out around a coin flip.'], [['Full report', 'https://matinnikoo.github.io/momentum-backtest/'], ['Code', 'https://github.com/MatinNikoo/momentum-backtest']]],
      '#p-unchart': ['130 charts', 'in the benchmark it gets scored on', ['People retype numbers off charts all the time. Unchart reads the axes, follows every line and bar, and gives you back a table you can paste.', 'It also flags charts drawn to mislead and redraws them honestly.'], [['Try it', 'unchart/'], ['Code', 'https://github.com/MatinNikoo/unchart']]],
      '#p-abkit': ['90,189', 'players in the Cookie Cats test it was run on', ['Real A/B tests break in boring, predictable ways. People peek every day, splits come out uneven, dashboards track twenty metrics at once.', 'abkit handles each of those, and I checked every method on thousands of simulated tests. On Cookie Cats it found a 4.3% drop in day 7 retention and an uneven split.'], [['Code', 'https://github.com/MatinNikoo/abkit'], ['Paper', 'https://github.com/MatinNikoo/abkit/blob/main/paper/abkit.pdf']]],
      '#p-shutdowns': ['69% below', 'its twin, Iran\'s GitHub activity during the 2026 blackouts', ['You can\'t A/B test a government turning off the internet, so I built each country a twin out of 106 that stayed online, using GitHub activity.', 'Every day offline cost about 1.3 days of work, so people never caught up. I planted 1,500 fake shutdowns first to make sure the method finds them.'], [['Interactive', 'shutdowns.html'], ['Code', 'https://github.com/MatinNikoo/internet-shutdowns']]],
      '#p-household': ['3rd of 23', 'teams in the class Kaggle competition', ['We predicted how many people live in a household from their Amazon orders. Classifying the count and taking the average beat plain regression.', 'TF-IDF on product titles beat our hand picked keywords, and a stack of seven models got us third.'], []],
      '#p-aura': ['Near 0%', 'idle CPU, even with the album art recoloring live', ['Windows widgets I built for my own desktop. The main one shows the song that\'s playing and recolors itself from the album art.', 'It goes to sleep when a game is fullscreen, so it barely uses the CPU.'], [['Code', 'https://github.com/MatinNikoo/aura-widgets']]]
    };
    var items = [].slice.call(document.querySelectorAll('#proj-menu a')).map(function (l) {
      var b = l.querySelector('b'), id = l.getAttribute('data-p') ? '#' + l.getAttribute('data-p') : l.getAttribute('href');
      return { id: id, slug: id.replace('#p-', ''), no: (l.querySelector('i') || {}).textContent || '', name: b ? (b.firstChild.textContent || '').trim() : l.textContent, sub: (l.querySelector('span') || {}).textContent || '', s: SUM[id] };
    }).filter(function (p) { return p.s });
    if (!items.length) return;
    var HOST = 'matinnikoo.github.io';
    var pg = bx.querySelector('.bx-pg'), urlBox = bx.querySelector('.bx-url'), tabs = bx.querySelector('.bx-tabs');
    /* the new tab page keeps the globe, the name and the shortcuts, with a search box under the name */
    var home = el('div', 'bx-home'); [].slice.call(pg.children).forEach(function (c) { if (!c.classList.contains('bx-bg')) home.appendChild(c) }); pg.appendChild(home);
    var qw = el('div', 'bx-qw', '<label class="bx-q"><svg viewBox="0 0 16 16"><circle cx="7" cy="7" r="4.6"/><path d="M10.4 10.4 14 14"/></svg><input type="text" placeholder="Search my projects" aria-label="Search my projects" autocomplete="off" spellcheck="false" enterkeyhint="search"></label><div class="bx-sug" role="listbox" hidden></div>');
    home.querySelector('h5').insertAdjacentElement('afterend', qw);
    var inp = qw.querySelector('input'), sug = qw.querySelector('.bx-sug');
    /* any other page is a website of its own, drawn on top of the globe */
    var site = el('div', 'bx-site'); site.hidden = true; pg.appendChild(site);
    /* toolbar: back, forward, reload, then an address bar you can type in */
    var nav = el('div', 'bx-nav', '<button type="button" class="bx-nb" data-n="b" aria-label="Back"><svg viewBox="0 0 16 16"><path d="M10 3 5 8l5 5"/></svg></button><button type="button" class="bx-nb" data-n="f" aria-label="Forward"><svg viewBox="0 0 16 16"><path d="M6 3l5 5-5 5"/></svg></button><button type="button" class="bx-nb" data-n="r" aria-label="Reload"><svg viewBox="0 0 16 16"><path d="M13 8a5 5 0 1 1-1.5-3.6"/><path d="M13 3v3h-3"/></svg></button>');
    urlBox.parentNode.insertBefore(nav, urlBox); nav.appendChild(urlBox);
    var oldSpan = urlBox.querySelector('span'), addr = document.createElement('input'); addr.type = 'text'; addr.className = 'bx-addr'; addr.spellcheck = false; addr.autocomplete = 'off'; addr.setAttribute('aria-label', 'Address'); addr.setAttribute('enterkeyhint', 'go');
    oldSpan.replaceWith(addr);
    var B = nav.querySelector('[data-n="b"]'), Fw = nav.querySelector('[data-n="f"]');

    /* tabs, each with its own history */
    var T = [], cur = 0;
    function newTab(pageObj) { T.push({ h: [pageObj || { k: 'home' }], i: 0 }); cur = T.length - 1; drawTabs(); render(0, true) }
    function pageTitle(p) { return p.k === 'home' ? 'New tab' : p.k === 'q' ? p.q + ' · Search' : byId(p.id).name }
    function pageUrl(p) { return p.k === 'home' ? '' : p.k === 'q' ? HOST + '/search?q=' + encodeURIComponent(p.q).replace(/%20/g, '+') : HOST + '/projects/' + byId(p.id).slug }
    function byId(id) { for (var i = 0; i < items.length; i++) if (items[i].id === id) return items[i]; return items[0] }
    function drawTabs() {
      tabs.innerHTML = T.map(function (t, i) { var p = t.h[t.i]; return '<button type="button" class="bx-tab' + (i === cur ? ' on' : '') + '" data-t="' + i + '"><i></i><span class="bx-tt">' + esc(pageTitle(p)) + '</span>' + (T.length > 1 ? '<em class="bx-tx" data-x="' + i + '" aria-label="Close tab">×</em>' : '') + '</button>' }).join('') +
        '<button type="button" class="bx-plus" aria-label="New tab">+</button>';
    }
    function go(pageObj) { var t = T[cur]; t.h = t.h.slice(0, t.i + 1); t.h.push(pageObj); t.i++; drawTabs(); render(1) }
    function render(dir, instant) {
      var t = T[cur], p = t.h[t.i];
      B.disabled = t.i === 0; Fw.disabled = t.i >= t.h.length - 1;
      if (document.activeElement !== addr) addr.value = pageUrl(p);
      addr.placeholder = 'Search my projects or type a page';
      var toHome = p.k === 'home', from = home.hidden ? site : home, to = toHome ? home : site;
      if (!toHome) site.innerHTML = p.k === 'q' ? results(p.q) : page(byId(p.id));
      bx.classList.toggle('away', !toHome); closeSug();
      if (instant || reduce || from === to && toHome) { home.hidden = !toHome; site.hidden = toHome; pg.scrollTop = 0; return }
      var outEl = from === to ? null : from;
      if (outEl) A(outEl, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(' + (-12 * dir) + 'px)' }], { duration: 150, easing: SOFT }, swapIn); else swapIn();
      function swapIn() { home.hidden = !toHome; site.hidden = toHome; pg.scrollTop = 0; A(to, [{ opacity: 0, transform: 'translateX(' + (16 * (dir || 1)) + 'px)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: OUT }) }
    }
    /* a results page that looks like a search engine */
    function match(q) { q = (q || '').trim().toLowerCase(); return items.filter(function (p) { return !q || (p.name + ' ' + p.sub + ' ' + p.slug + ' ' + p.s[2].join(' ')).toLowerCase().indexOf(q) > -1 }) }
    function results(q) {
      var m = match(q);
      return '<div class="bx-sr"><div class="bx-srh"><b>Matin<i></i></b><span class="bx-srq">' + esc(q) + '</span></div><p class="bx-srn">' + (m.length ? 'About ' + m.length + ' result' + (m.length > 1 ? 's' : '') : 'No results for that one') + '</p>' +
        (m.length ? m : items.slice(0, 3)).map(function (p) {
          return '<a class="bx-r" href="' + p.id + '" data-p="' + p.id + '"><span class="bx-rs"><i></i>' + HOST + ' › projects › ' + esc(p.slug) + '</span><b>' + esc(p.name) + '</b><small>' + esc(p.s[2][0]) + '</small></a>';
        }).join('') + (m.length ? '' : '<p class="bx-srn">Other projects</p>') + '</div>';
    }
    /* each project gets a small website of its own */
    function page(p) {
      var s = p.s;
      return '<article class="bx-w"><header class="bx-wh"><b>Matin Nikoomanzar</b><span>Projects</span></header>' +
        '<p class="bx-k"><i></i>Project ' + esc(p.no) + '</p><h6>' + esc(p.name) + '</h6><p class="bx-sub">' + esc(p.sub) + '</p>' +
        '<div class="bx-stat"><b>' + esc(s[0]) + '</b><span>' + esc(s[1]) + '</span></div>' + s[2].map(function (t) { return '<p>' + esc(t) + '</p>' }).join('') +
        '<div class="bx-acts"><button type="button" class="bx-go" data-j="' + p.id + '">See it on the page</button>' + s[3].map(function (l) {
          var ext = /^https?:/.test(l[1]); return '<a href="' + esc(l[1]) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + esc(l[0]) + '</a>' }).join('') + '</div>' +
        '<footer class="bx-wf">' + HOST + '</footer></article>';
    }
    function jump(id) {
      var to = document.querySelector(id); if (!to) return;
      function g2() { var y = to.getBoundingClientRect().top + scrollY - (parseFloat(getComputedStyle(root).scrollPaddingTop) || 72); scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' }) }
      if (full) exitFull(g2); else g2();
    }
    function submit(text) {
      var q = (text || '').trim(); if (!q) return;
      var low = q.toLowerCase().replace(/^https?:\/\//, '').replace(HOST, '').replace(/^\/+|\/+$/g, '').replace(/^projects\//, '');
      var exact = items.filter(function (p) { return p.slug === low || p.name.toLowerCase() === low })[0];
      go(exact ? { k: 'p', id: exact.id } : { k: 'q', q: q });
    }
    /* suggestions under the new tab search box */
    var shown = [], hi = -1;
    function list(q) {
      shown = match(q); hi = shown.length ? 0 : -1;
      sug.innerHTML = (q.trim() ? '' : '<p class="bx-sh">Projects</p>') + (shown.length ? shown.map(function (p, i) {
        return '<button type="button" role="option" class="bx-si' + (i === hi ? ' hi' : '') + '" data-i="' + i + '"><i>' + esc(p.no) + '</i><b>' + esc(p.name) + '</b><small>' + esc(p.sub) + '</small></button>';
      }).join('') : '<p class="bx-none">Nothing by that name yet. Press enter to search anyway</p>');
    }
    function openSug() {
      if (!sug.hidden) return; list(inp.value); sug.hidden = false; fitSug();
      if (!reduce) { A(sug, [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: OUT });
        [].forEach.call(sug.querySelectorAll('.bx-si'), function (b, i) { b.animate([{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 260, delay: 30 + i * 26, easing: OUT, fill: 'backwards' }) }) }
    }
    /* the list never runs past the bottom of the window: it gets exactly the room that\'s left and scrolls inside */
    function fitSug() {
      var k = K(), pr = pg.getBoundingClientRect(), sr = sug.getBoundingClientRect(), room = (pr.bottom - sr.top) / k - 10;
      if (room < 190 && pg.scrollHeight > pg.clientHeight) { pg.scrollTop += (sr.top - pr.top) / k - 60; pr = pg.getBoundingClientRect(); sr = sug.getBoundingClientRect(); room = (pr.bottom - sr.top) / k - 10 }
      sug.style.maxHeight = Math.max(130, Math.min(room, 15.5 * 16)) + 'px';
    }
    addEventListener('resize', function () { if (!sug.hidden) fitSug() });
    function closeSug() { if (sug.hidden) return; if (reduce) { sug.hidden = true; return } A(sug, [{ opacity: 1 }, { opacity: 0, transform: 'translateY(-4px)' }], { duration: 140, easing: SOFT }, function () { sug.hidden = true }) }
    function markHi() { [].forEach.call(sug.querySelectorAll('.bx-si'), function (b, i) { b.classList.toggle('hi', i === hi); if (i === hi) b.scrollIntoView({ block: 'nearest' }) }) }
    function pick(p) { inp.value = ''; inp.blur(); go({ k: 'p', id: p.id }) }
    inp.addEventListener('focus', openSug); inp.addEventListener('click', openSug);
    inp.addEventListener('input', function () { if (sug.hidden) openSug(); else { list(inp.value); fitSug() } });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (sug.hidden) openSug(); if (!shown.length) return; hi = (hi + (e.key === 'ArrowDown' ? 1 : -1) + shown.length) % shown.length; markHi() }
      else if (e.key === 'Enter') { e.preventDefault(); var q = inp.value.trim(); if (!q && shown[hi]) pick(shown[hi]); else if (q) { inp.value = ''; inp.blur(); submit(q) } }
      else if (e.key === 'Escape') { closeSug(); inp.blur() }
    });
    sug.addEventListener('pointerdown', function (e) { e.preventDefault() });
    sug.addEventListener('click', function (e) { var b = e.target.closest('.bx-si'); if (b) pick(shown[+b.getAttribute('data-i')]) });
    sug.addEventListener('pointermove', function (e) { var b = e.target.closest('.bx-si'); if (b && +b.getAttribute('data-i') !== hi) { hi = +b.getAttribute('data-i'); markHi() } });
    bx.addEventListener('pointerdown', function (e) { if (!qw.contains(e.target)) closeSug() });
    /* the address bar */
    addr.addEventListener('focus', function () { setTimeout(function () { addr.select() }, 0) });
    addr.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); var v = addr.value; addr.blur(); submit(v) } else if (e.key === 'Escape') { addr.blur(); addr.value = pageUrl(T[cur].h[T[cur].i]) } });
    addr.addEventListener('blur', function () { addr.value = pageUrl(T[cur].h[T[cur].i]) });
    /* buttons, links and tabs */
    nav.addEventListener('click', function (e) {
      var n = e.target.closest('[data-n]'); if (!n || n.disabled) return; var t = T[cur], k = n.getAttribute('data-n');
      if (k === 'b' && t.i > 0) { t.i--; drawTabs(); render(-1) } else if (k === 'f' && t.i < t.h.length - 1) { t.i++; drawTabs(); render(1) } else if (k === 'r') { var spin = n.querySelector('svg'); if (spin.animate && !reduce) spin.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }], { duration: 500, easing: SOFT }); render(0) }
    });
    site.addEventListener('click', function (e) {
      var r = e.target.closest('[data-p]'); if (r) { e.preventDefault(); go({ k: 'p', id: r.getAttribute('data-p') }); return }
      var j = e.target.closest('[data-j]'); if (j) jump(j.getAttribute('data-j'));
    });
    tabs.addEventListener('click', function (e) {
      var x = e.target.closest('[data-x]'); if (x) { e.stopPropagation(); var k = +x.getAttribute('data-x'); T.splice(k, 1); if (cur >= T.length) cur = T.length - 1; else if (k < cur) cur--; drawTabs(); render(0, true); return }
      if (e.target.closest('.bx-plus')) { newTab(); setTimeout(function () { inp.focus() }, 50); return }
      var t = e.target.closest('[data-t]'); if (t && +t.getAttribute('data-t') !== cur) { cur = +t.getAttribute('data-t'); drawTabs(); render(0) }
    });
    newTab();
  })();

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
    function on() { return web.open && !web.min && !bx.classList.contains('away') && seen && !document.hidden && !win.classList.contains('off') && !win.classList.contains('dmin') }
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
    sp.innerHTML = '<div class="sp-hd"><img class="sp-art" alt="" decoding="async"><div><small>Playlist</small><h4>Matin\'s playlist</h4><p><b>Matin</b> · ' + tr.length + ' songs, ' + (hr ? hr + ' hr ' : '') + mn + ' min</p></div></div>' +
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
    /* start at the top, unless the song that\'s on is further down the list */
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
  function wallNow() { try { dispatchEvent(new Event('deskresize')) } catch (x) {} }
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
  /* the same move without stretching: one even scale, centres lined up, so icons and widgets keep their real proportions */
  /* folder icons keep their size and only travel, centre to centre */
  function slideC(b, a) { return T(b.left + b.width / 2 - (a.left + a.width / 2), b.top + b.height / 2 - (a.top + a.height / 2)) }
  function move(e, b, a) { return e.matches('.icons a') ? slideC(b, a) : even(b, a) }
  function even(b, a) { var s = Math.sqrt((b.width * b.height) / Math.max(1, a.width * a.height)); return T(b.left + b.width / 2 - (a.left + a.width * s / 2), b.top + b.height / 2 - (a.top + a.height * s / 2), s) }
  function openApps() { return apps.filter(function (a) { return a.open && !a.min }) }
  /* an open app window glides from where it was on screen to its new place, at its own proportions */
  function appGlide(a, b, D, run) {
    var lr = layer.getBoundingClientRect(), s = Math.sqrt((b.width * b.height) / Math.max(1, a.ww * a.hh));
    var tx = b.left + b.width / 2 - lr.left - a.ww * s / 2, ty = b.top + b.height / 2 - lr.top - a.hh * s / 2;
    a._from = T(tx, ty, s); run.push(a.w.animate([{ transform: a._from }, { transform: T(a.x, a.y) }], { duration: D, easing: OUT, fill: 'both' }));
  }
  /* moving the window to a new parent resets every scroll position inside it, so lists would jump back to the top for a
     frame. These remember where each one was and put it back straight after the move */
  function scrolls() { return [].slice.call(win.querySelectorAll('.os-w *')).filter(function (e) { return e.scrollTop || e.scrollLeft }).map(function (e) { return [e, e.scrollTop, e.scrollLeft] }) }
  function unscroll(list) { list.forEach(function (x) { x[0].scrollTop = x[1]; x[0].scrollLeft = x[2] }) }
  function enterFull() {
    if (full) return; full = true; closeStart(); win.classList.add('glide');
    win.classList.add('flat'); win.style.setProperty('--rx', '0deg'); win.style.setProperty('--ry', '0deg');
    var P = pieces(), all = P.fit.concat(P.slide, [win]); settle(all); var OA = openApps(); OA.forEach(function (a) { settle([a.w]) }); var a0 = OA.map(function (a) { return a.w.getBoundingClientRect() });
    root.classList.add('os-full');
    var w0 = win.getBoundingClientRect(), f0 = rects(P.fit), s0 = rects(P.slide);
    memo = { vw: innerWidth, vh: innerHeight, w: w0, f: f0, s: s0 };
    ph = el('div', 'win-ph'); ph.style.height = w0.height + 'px'; fig.insertBefore(ph, win);
    memo.ph = ph.getBoundingClientRect();
    win.style.setProperty('--rx', '0deg'); win.style.setProperty('--ry', '0deg');
    var sk = scrolls();
    host.hidden = false; host.appendChild(win); win.classList.add('full');
    layout(); wallNow(); unscroll(sk);

    ctl.max.setAttribute('aria-label', 'Leave full screen'); ctl.max.innerHTML = I.res;
    if (reduce || !win.animate) { win.classList.remove('glide'); return }
    var f1 = rects(P.fit), s1 = rects(P.slide), D = 640, run = [];
    /* every piece also gets its starting look as a plain style, so the very first frame is already the start of the move
       and nothing can show its final spot for a frame before the animation takes over */
    var held = [];
    function hold(e, from) { held.push([e, e.style.transform]); e.style.transform = from }
    P.fit.forEach(function (e, i) { e.style.transformOrigin = '0 0'; var fr = move(e, f0[i], f1[i]); hold(e, fr); run.push(e.animate([{ transform: fr }, { transform: 'none' }], { duration: D, easing: OUT, fill: 'both' })) });
    P.slide.forEach(function (e, i) { var fr = fromTo(s0[i], s1[i]); hold(e, fr); run.push(e.animate([{ transform: fr }, { transform: 'none' }], { duration: D, easing: OUT, fill: 'both' })) });
    OA.forEach(function (a, i) { appGlide(a, a0[i], D, run); hold(a.w, a._from) });
    var c0 = inset(w0, 14); win.style.clipPath = c0;
    var wa = win.animate([{ clipPath: c0 }, { clipPath: inset({ top: 0, left: 0, right: innerWidth, bottom: innerHeight }, 0) }], { duration: D, easing: OUT, fill: 'both' });
    win._a = wa;
    function done() { win.style.clipPath = ''; win.classList.remove('glide'); held.forEach(function (h) { h[0].style.transform = h[1] }); OA.forEach(function (a) { a.w.style.transform = T(a.x, a.y) }); run.forEach(function (r) { r.cancel() }); wa.cancel(); P.fit.forEach(function (e) { e.style.transformOrigin = '' }) }
    wa._done = done;
    wa.onfinish = function () { if (win._a === wa) win._a = null; done() };
  }
  /* leaving full screen: the window takes its small layout at its final spot straight away, so every piece knows where
     it is going, then each one glides there from where it was. Behind them a copy of the wallpaper frame closes down
     onto the window. Nothing fades out and nothing snaps at the end */
  function exitFull(then) {
    if (!full) { then && then(); return }
    win.classList.add('glide');
    var P = pieces(); settle(P.fit.concat(P.slide, [win]));
    ctl.max.setAttribute('aria-label', 'Full screen'); ctl.max.innerHTML = I.max;
    var f1 = rects(P.fit), s1 = rects(P.slide), wr = win.getBoundingClientRect(), OA = openApps(); OA.forEach(function (a) { settle([a.w]) }); var a1 = OA.map(function (a) { return a.w.getBoundingClientRect() });
    root.classList.remove('os-full');
    var pn = ph.getBoundingClientRect();
    function home() {
      full = false; win.classList.remove('glide'); var sk2 = scrolls(); fig.insertBefore(win, ph); unscroll(sk2); ph.remove(); ph = null; host.hidden = true;
      win.classList.remove('exiting'); win.style.position = win.style.left = win.style.top = win.style.width = win.style.zIndex = '';
      requestAnimationFrame(function () { requestAnimationFrame(function () { win.classList.remove('flat') }) });
      layout(); then && then();
    }
    if (reduce || !win.animate) { win.classList.remove('full'); home(); return }
    /* the frame: the wallpaper as it looks right now, closing down onto the window */
    var fr = el('div', 'os-frame'), wall = win.querySelector('canvas.wall');
    if (wall) { var cc = document.createElement('canvas'); cc.width = wall.width; cc.height = wall.height; try { cc.getContext('2d').drawImage(wall, 0, 0) } catch (x) {} fr.appendChild(cc) }
    host.insertBefore(fr, win);
    /* the window, already small, at its final spot */
    win.classList.remove('full'); win.classList.add('exiting');
    win.style.position = 'absolute'; win.style.left = pn.left + 'px'; win.style.top = pn.top + 'px'; win.style.width = pn.width + 'px'; win.style.zIndex = '1';
    layout(); wallNow();
    var f2 = rects(P.fit), s2 = rects(P.slide), D = 560, run = [];
    P.fit.forEach(function (e, i) { e.style.transformOrigin = '0 0'; run.push(e.animate([{ transform: move(e, f1[i], f2[i]) }, { transform: 'none' }], { duration: D, easing: OUT })) });
    P.slide.forEach(function (e, i) { run.push(e.animate([{ transform: fromTo(s1[i], s2[i]) }, { transform: 'none' }], { duration: D, easing: OUT })) });
    OA.forEach(function (a, i) { appGlide(a, a1[i], D, run) });
    var to = 'inset(' + pn.top.toFixed(1) + 'px ' + (innerWidth - pn.right).toFixed(1) + 'px ' + (innerHeight - pn.top - win.offsetHeight).toFixed(1) + 'px ' + pn.left.toFixed(1) + 'px round 14px)';
    var fa = fr.animate([{ clipPath: 'inset(0px 0px 0px 0px round 0px)' }, { clipPath: to }], { duration: D, easing: OUT, fill: 'forwards' });
    win._a = fa;
    fa.onfinish = function () {
      if (win._a === fa) win._a = null;
      run.forEach(function (r) { r.cancel() }); P.fit.forEach(function (e) { e.style.transformOrigin = '' });
      fr.remove(); home();
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
  /* full screen on a phone: some apps lay their own bar over the top of the page, which can hide the window's buttons.
     A leave button also sits in the dock, always within thumb reach */
  var exitB = document.createElement('button'); exitB.type = 'button'; exitB.className = 'tb-app tb-exit'; exitB.setAttribute('aria-label', 'Leave full screen');
  exitB.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>';
  var dockEl = tb.querySelector('.dock'); if (dockEl) dockEl.insertBefore(exitB, dockEl.firstChild);
  exitB.addEventListener('click', function () { if (full) exitFull() });
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
