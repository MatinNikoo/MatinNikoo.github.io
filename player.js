/* The site's music player, drawn like the Aura now playing widget (aura_widget.pyw).
   One song, two views: the card pinned to the corner of every page, and the card on the desktop
   in the Aura project. Both stay in sync. Nothing plays until someone presses play. */
(function () {
  if (window.__mnPlayer) return; window.__mnPlayer = 1;
  var BASE = (document.currentScript && document.currentScript.src || location.href).replace(/[^\/]*$/, '');
  var SRC = BASE + 'music.mp3', COVER = BASE + 'innerbloom-cover.png', START = 245, DUR = 578.6, KEY = 'mn-player', STALE = 30 * 60 * 1000;
  var TITLE = 'Innerbloom', ARTIST = 'RÜFÜS DU SOL';
  /* colors from Aura's palette_from() run on the cover */
  var C = { bg: '#3d2117', text: '#fad5c8', sub: '#e0ab99', bar: '#f77c51' };

  function load() { try { var s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && Date.now() - s.ts < STALE) return s } catch (e) {} return null }
  var saved = load();
  var st = { t: saved ? saved.t : START, playing: saved ? saved.playing : false, muted: saved ? saved.muted : false,
             min: saved ? saved.min : matchMedia('(max-width:600px)').matches };
  function save() { try { localStorage.setItem(KEY, JSON.stringify({ t: st.t, playing: st.playing, muted: st.muted, min: st.min, ts: Date.now() })) } catch (e) {} }

  var E = 'cubic-bezier(.2,.8,.2,1)';
  var css = document.createElement('style'); css.textContent = [
    /* the card itself: sizes follow aura_widget.pyw (400 x 132, radius 26, art as tall as the card) */
    '.ac{--h:132px;--bg:' + C.bg + ';--tx:' + C.text + ';--sub:' + C.sub + ';--bar:' + C.bar + ';position:relative;height:var(--h);border-radius:calc(var(--h)*.197);overflow:hidden;isolation:isolate;background:var(--bg);',
      'font-family:"Segoe UI Variable Display","Segoe UI",Geist,Inter,system-ui,sans-serif;color:var(--tx);-webkit-font-smoothing:antialiased;user-select:none;-webkit-user-select:none;text-align:left;line-height:normal;letter-spacing:normal}',
    '.ac *{box-sizing:border-box}',
    '.ac-blur{position:absolute;inset:-30px;background:var(--cover) center/cover;filter:blur(26px) saturate(1.1);opacity:.7;z-index:-2}',
    '.ac-blur::after{content:"";position:absolute;inset:0;background:var(--bg);opacity:.65}',
    '.ac::after{content:"";position:absolute;inset:0;border-radius:inherit;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);pointer-events:none}',
    '.ac-art{position:absolute;left:0;top:0;width:var(--h);height:var(--h);background:var(--cover) center/cover;',
      '-webkit-mask-image:linear-gradient(90deg,#000 0%,#000 30%,rgba(0,0,0,.894) 45%,rgba(0,0,0,.647) 60%,rgba(0,0,0,.345) 75%,rgba(0,0,0,.118) 88%,transparent 100%);',
      'mask-image:linear-gradient(90deg,#000 0%,#000 30%,rgba(0,0,0,.894) 45%,rgba(0,0,0,.647) 60%,rgba(0,0,0,.345) 75%,rgba(0,0,0,.118) 88%,transparent 100%)}',
    '.ac-body{position:absolute;left:calc(var(--h) + 8px);right:calc(var(--h)*.182);top:0;bottom:0}',
    '.ac-t{position:absolute;left:0;right:0;top:calc(var(--h)*.227);font-size:calc(var(--h)*.121);font-weight:600;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.ac-ar{position:absolute;left:0;right:0;top:calc(var(--h)*.4);font-size:calc(var(--h)*.0985);line-height:1.5;color:var(--sub);opacity:.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.ac-seek{position:absolute;left:0;right:0;top:calc(var(--h)*.659 - 8px);height:20px;cursor:pointer;touch-action:none}',
    '.ac-track{position:absolute;left:0;right:0;top:8px;height:4px;border-radius:2px;background:color-mix(in srgb,var(--bar) 23.5%,transparent)}',
    '.ac-fill{position:absolute;left:0;top:0;height:4px;min-width:4px;border-radius:2px;background:var(--bar)}',
    '.ac-knob{position:absolute;top:50%;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;background:var(--tx);box-shadow:0 1px 4px rgba(0,0,0,.4);opacity:0;transform:scale(.6);transition:opacity .2s,transform .2s}',
    '.ac:hover .ac-knob,.ac.drag .ac-knob,.ac-seek:focus-visible .ac-knob{opacity:1;transform:scale(1)}',
    '.ac-seek:focus-visible{outline:none}.ac-seek:focus-visible .ac-track{box-shadow:0 0 0 2px rgba(255,255,255,.5)}',
    '.ac-time{position:absolute;top:calc(var(--h)*.758);font-size:calc(var(--h)*.083);font-weight:500;line-height:1.3;color:var(--sub);opacity:.67;font-variant-numeric:tabular-nums}',
    '.ac-cur{left:0}.ac-dur{right:0}',
    '.ac button{font:inherit;color:inherit;background:none;border:0;padding:0;margin:0;cursor:pointer;-webkit-tap-highlight-color:transparent;box-shadow:none;text-transform:none;letter-spacing:normal}',
    '.ac button:focus-visible{outline:2px solid rgba(255,255,255,.6);outline-offset:2px;opacity:1}',
    /* play and pause in the middle, shown on hover the way Aura shows its controls */
    '.ac-tog{position:absolute;left:50%;top:calc(var(--h)*.81 - 13px);width:26px;height:26px;margin-left:-13px;display:grid;place-items:center;color:var(--tx);opacity:0;transition:opacity .22s ease,transform .15s;border-radius:50%}',
    '.ac-tog:active{transform:scale(.9)}',
    '.ac-tog svg{width:14px;height:14px;fill:currentColor;opacity:.92}',
    '.ac:hover .ac-tog,.ac:not(.on) .ac-tog{opacity:1}',
    '.ac .ac-pa{display:none}.ac.on .ac-pa{display:block}.ac.on .ac-pl{display:none}',
    '.ac.wait .ac-tog{animation:acping 1.6s ease-out infinite}',
    '@keyframes acping{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--tx) 50%,transparent)}100%{box-shadow:0 0 0 9px transparent}}',
    '@media (hover:none){.ac-tog{opacity:1}.ac-knob{opacity:1;transform:scale(.8)}}',
    /* the floating one */
    '.mp{position:fixed;right:max(16px,env(safe-area-inset-right));bottom:max(16px,env(safe-area-inset-bottom));z-index:60;width:min(400px,calc(100vw - 32px));',
      'box-shadow:0 6px 26px rgba(0,0,0,.47);transition:width .45s ' + E + ',height .45s ' + E + ',border-radius .45s ' + E + ',transform .5s ' + E + ',opacity .5s ease}',
    '.mp.mp-in{transform:translateY(12px);opacity:0}',
    '.mp-cor{position:absolute;top:12px;right:14px;display:flex;gap:2px;opacity:0;transition:opacity .22s ease}',
    '.mp:hover .mp-cor,.mp-cor:focus-within{opacity:1}',
    '.mp-ic{width:22px;height:22px;border-radius:7px;display:grid;place-items:center;color:var(--sub)}',
    '.mp-ic:hover{background:rgba(255,255,255,.1);color:var(--tx)}',
    '.mp-ic svg{width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}',
    '@media (hover:none){.mp-cor{opacity:1}}',
    '.mp-open{display:none}',
    '.mp.min{width:64px;--h:64px;border-radius:18px}',
    '.mp.min .ac-body,.mp.min .mp-cor,.mp.min .ac-blur{display:none}',
    '.mp.min .ac-art{-webkit-mask-image:none;mask-image:none}',
    '.mp.min .mp-open{display:block;position:absolute;inset:0;border-radius:inherit}',
    '.mp-eq{position:absolute;right:10px;bottom:10px;display:none;gap:2px;align-items:flex-end;height:12px;padding:3px;border-radius:5px;background:rgba(0,0,0,.45)}',
    '.mp-eq b{width:2px;height:3px;background:var(--bar);border-radius:1px}',
    '.mp.min.on .mp-eq{display:flex}',
    '.mp.on .mp-eq b{animation:mpeq .9s ease-in-out infinite alternate}.mp.on .mp-eq b:nth-child(2){animation-delay:-.3s}.mp.on .mp-eq b:nth-child(3){animation-delay:-.6s}',
    '@keyframes mpeq{from{height:2px}to{height:8px}}',
    '@media (prefers-reduced-motion:reduce){.ac,.ac *{animation:none!important;transition:none!important}}',
    '@media print{.mp{display:none}}'
  ].join('\n'); document.head.appendChild(css);

  var I = {
    play: '<svg class="ac-pl" viewBox="0 0 14 14" aria-hidden="true"><path d="M2.5 0.5L14 7L2.5 13.5z"/></svg>',
    pause: '<svg class="ac-pa" viewBox="0 0 14 14" aria-hidden="true"><rect x="2" y="0.5" width="3.4" height="13" rx="1.4"/><rect x="8.6" y="0.5" width="3.4" height="13" rx="1.4"/></svg>',
    vol: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 6h2.2L8 3.2v9.6L4.7 10H2.5z"/><path d="M10.6 5.6a3.4 3.4 0 0 1 0 4.8M12.6 3.8a6 6 0 0 1 0 8.4"/></svg>',
    mute: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 6h2.2L8 3.2v9.6L4.7 10H2.5z"/><path d="M10.5 6l4 4M14.5 6l-4 4"/></svg>',
    fold: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 8h8"/></svg>'
  };
  function fmt(s) { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2) }

  var au = new Audio(); au.preload = 'none'; au.src = SRC; au.volume = .8;
  var dragging = null, pending = false, views = [];
  function D() { return au.duration || DUR }

  /* one card. extra = markup for the floating version's own buttons */
  function makeView(el, extra) {
    el.classList.add('ac'); el.style.setProperty('--cover', 'url("' + COVER + '")');
    el.innerHTML =
      '<div class="ac-blur" aria-hidden="true"></div><div class="ac-art" aria-hidden="true"></div>' +
      '<div class="ac-body">' +
        '<div class="ac-t">' + TITLE + '</div><div class="ac-ar">' + ARTIST + '</div>' +
        '<div class="ac-seek" role="slider" tabindex="0" aria-label="Seek" aria-valuemin="0"><div class="ac-track"><div class="ac-fill"></div></div><div class="ac-knob"></div></div>' +
        '<span class="ac-time ac-cur">0:00</span><span class="ac-time ac-dur">' + fmt(DUR) + '</span>' +
        '<button class="ac-tog" type="button" aria-label="Play">' + I.play + I.pause + '</button>' +
      '</div>' + (extra || '');
    var q = function (s) { return el.querySelector(s) };
    var v = { el: el, seek: q('.ac-seek'), fill: q('.ac-fill'), knob: q('.ac-knob'), cur: q('.ac-cur'), dur: q('.ac-dur'), tog: q('.ac-tog'), ar: q('.ac-ar') };
    v.tog.addEventListener('click', toggle);
    function tAt(e) { var r = v.seek.getBoundingClientRect(); return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * D() }
    v.seek.addEventListener('pointerdown', function (e) { dragging = v; el.classList.add('drag'); v.seek.setPointerCapture(e.pointerId); st.t = tAt(e); paint() });
    v.seek.addEventListener('pointermove', function (e) { if (dragging !== v) return; st.t = tAt(e); paint() });
    function end() { if (dragging !== v) return; dragging = null; el.classList.remove('drag'); seekTo(st.t); save() }
    v.seek.addEventListener('pointerup', end); v.seek.addEventListener('pointercancel', end);
    v.seek.addEventListener('keydown', function (e) {
      var d = { ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5, PageUp: 30, PageDown: -30 }[e.key];
      if (e.key === 'Home') d = -1e9; if (e.key === 'End') d = 1e9;
      if (d == null) return; e.preventDefault(); seekTo(Math.max(0, Math.min(D() - 1, st.t + d))); save();
    });
    views.push(v); return v;
  }

  function paint() {
    var t = st.t, f = Math.max(0, Math.min(1, t / D())) * 100;
    views.forEach(function (v) {
      v.fill.style.width = f + '%'; v.knob.style.left = f + '%'; v.cur.textContent = fmt(t); v.dur.textContent = fmt(D());
      v.seek.setAttribute('aria-valuemax', Math.round(D())); v.seek.setAttribute('aria-valuenow', Math.round(t)); v.seek.setAttribute('aria-valuetext', fmt(t) + ' of ' + fmt(D()));
    });
  }
  function emit() { try { dispatchEvent(new CustomEvent('mnplayer', { detail: { playing: !au.paused, t: st.t, dur: D() } })) } catch (e) {} }
  function ui() {
    var on = !au.paused;
    views.forEach(function (v) { v.el.classList.toggle('on', on); v.tog.setAttribute('aria-label', on ? 'Pause' : 'Play ' + TITLE) });
    fl.classList.toggle('min', !!st.min);
    muteB.innerHTML = st.muted ? I.mute : I.vol; muteB.setAttribute('aria-label', st.muted ? 'Unmute' : 'Mute');
    au.muted = !!st.muted; emit();
  }
  function note(msg) { views.forEach(function (v) { v.el.classList.toggle('wait', !!msg); v.ar.textContent = msg || ARTIST }) }
  function seekTo(t) { st.t = t; if (au.readyState > 0) au.currentTime = t; paint() }
  function play() {
    note('');
    var want = st.t;
    if (au.readyState === 0) { pending = true; au.preload = 'auto'; au.addEventListener('loadedmetadata', function f() { au.removeEventListener('loadedmetadata', f); au.currentTime = want; pending = false }); au.load() }
    else au.currentTime = want;
    var pr = au.play(); st.playing = true; save(); ui();
    if (pr && pr.catch) pr.catch(function () { st.playing = false; ui(); note('Press play to keep listening'); save() });
  }
  function pause() { au.pause(); st.playing = false; if (!pending) st.t = au.currentTime; save(); ui() }
  function toggle() { au.paused ? play() : pause() }

  /* the floating card */
  var fl = document.createElement('section');
  fl.className = 'mp mp-in'; fl.setAttribute('aria-label', 'Music player');
  makeView(fl,
    '<div class="mp-cor"><button class="mp-ic mp-mute" type="button" aria-label="Mute"></button>' +
      '<button class="mp-ic mp-fold" type="button" aria-label="Fold the player">' + I.fold + '</button></div>' +
    '<span class="mp-eq" aria-hidden="true"><b></b><b></b><b></b></span>' +
    '<button class="mp-open" type="button" aria-label="Open the music player"></button>');
  var muteB = fl.querySelector('.mp-mute');
  fl.querySelector('.mp-open').addEventListener('click', function () { st.min = false; save(); ui() });
  fl.querySelector('.mp-fold').addEventListener('click', function () { st.min = true; save(); ui() });
  muteB.addEventListener('click', function () { st.muted = !st.muted; save(); ui() });

  au.addEventListener('timeupdate', function () { if (dragging || pending) return; st.t = au.currentTime; paint(); emit() });
  au.addEventListener('loadedmetadata', paint);
  au.addEventListener('play', ui); au.addEventListener('pause', ui);
  au.addEventListener('ended', function () { st.playing = false; st.t = 0; paint(); save(); ui() });
  setInterval(function () { if (!au.paused) save() }, 1000);
  addEventListener('pagehide', function () { if (!au.paused && !pending) st.t = au.currentTime; save() });
  addEventListener('storage', function (e) { if (e.key !== KEY || !e.newValue) return; try { var s = JSON.parse(e.newValue); if (s.playing && !au.paused) { au.pause(); st.playing = false; ui() } } catch (x) {} });

  window.mnPlayer = { toggle: toggle };
  function mount() {
    /* any element with data-aura-card becomes a second, in-page card */
    [].forEach.call(document.querySelectorAll('[data-aura-card]'), function (el) { makeView(el) });
    document.body.appendChild(fl); paint(); ui();
    requestAnimationFrame(function () { requestAnimationFrame(function () { fl.classList.remove('mp-in') }) });
    if (st.playing) play();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
