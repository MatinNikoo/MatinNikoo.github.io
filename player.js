/* The site's music player, drawn like the Aura now playing widget (aura_widget.pyw).
   A playlist, shuffled fresh on every visit. Two views stay in sync: the card pinned to the corner of
   every page, and the card on the desktop in the Aura project. Nothing plays until someone presses play.
   The playlist below is written by tools/tracks.py, which also picks each card's colors from its cover. */
(function () {
  if (window.__mnPlayer) return; window.__mnPlayer = 1;
  /* a page opened inside the player's frame borrows the player that is already playing */
  var core = null; try { if (window.parent !== window && window.parent.__mnCore) core = window.parent.__mnCore } catch (e) {}
  if (core) { core.attach(window, document); return }

  var BASE = (document.currentScript && document.currentScript.src || location.href).replace(/[^\/]*$/, '');
  /*TRACKS*/var TRACKS = [{"s":"music/innerbloom.mp3","t":"Innerbloom","a":"RÜFÜS DU SOL","c":"covers/innerbloom.jpg","d":578.7,"p":{"bg":"#17213d","text":"#c8d4fa","sub":"#99abe0","bar":"#678bf7"}},{"s":"music/music-is-better.mp3","t":"Music Is Better","a":"RÜFÜS DU SOL","c":"covers/music-is-better.jpg","d":236.2,"p":{"bg":"#3d2817","text":"#faddc8","sub":"#e0b799","bar":"#f7954a"}},{"s":"music/inner-light.mp3","t":"Inner Light","a":"Elderbrook & Bob Moses","c":"covers/inner-light.jpg","d":258.1,"p":{"bg":"#1d173d","text":"#cfc8fa","sub":"#a399e0","bar":"#644af7"}},{"s":"music/renegade.mp3","t":"Renegade","a":"Kavinsky","c":"covers/renegade.jpg","d":237.2,"p":{"bg":"#3d171a","text":"#fac8cc","sub":"#e0999e","bar":"#f7525f"}},{"s":"music/make-you-feel.mp3","t":"Make You Feel","a":"Fahlberg","c":"covers/make-you-feel.jpg","d":294.9,"p":{"bg":"#192a3d","text":"#c8dffa","sub":"#99bae0","bar":"#82b8f7"}},{"s":"music/set-your-mind.mp3","t":"Set Your Mind","a":"Cristoph & Fahlberg","c":"covers/set-your-mind.jpg","d":204.7,"p":{"bg":"#3d1733","text":"#fac8ed","sub":"#e099cd","bar":"#f76ed3"}},{"s":"music/if-your-girl-only-knew.mp3","t":"If Your Girl Only Knew","a":"Fahlberg x Arodes","c":"covers/if-your-girl-only-knew.jpg","d":198.8,"p":{"bg":"#171e3d","text":"#c8d1fa","sub":"#99a5e0","bar":"#4a68f7"}},{"s":"music/stereo-love.mp3","t":"Stereo Love","a":"Edward Maya & Vika Jigulina","c":"covers/stereo-love.jpg","d":184.4,"p":{"bg":"#171e3d","text":"#c8d1fa","sub":"#99a6e0","bar":"#6984f7"}},{"s":"music/lights.mp3","t":"Lights","a":"Ellie Goulding","c":"covers/lights.jpg","d":257.3,"p":{"bg":"#3d2317","text":"#fad8c8","sub":"#e0b099","bar":"#f78d5b"}},{"s":"music/neverender.mp3","t":"Neverender","a":"Justice & Tame Impala","c":"covers/neverender.jpg","d":266.8,"p":{"bg":"#3d231c","text":"#fad3c8","sub":"#e0a999","bar":"#f7a58d"}},{"s":"music/afterimage.mp3","t":"Afterimage","a":"Justice","c":"covers/afterimage.jpg","d":246.6,"p":{"bg":"#3d231c","text":"#fad3c8","sub":"#e0a999","bar":"#f7a58d"}},{"s":"music/mind-off.mp3","t":"Mind Off","a":"Carlita, WhoMadeWho & Orsay","c":"covers/mind-off.jpg","d":212.9,"p":{"bg":"#173c3d","text":"#c8f9fa","sub":"#99dfe0","bar":"#62f4f7"}},{"s":"music/spiritual-but-not-religious.mp3","t":"Spiritual But Not Religious","a":"Oliver Koletzki","c":"covers/spiritual-but-not-religious.jpg","d":246.8,"p":{"bg":"#1c3a3d","text":"#c8f6fa","sub":"#99dae0","bar":"#8ceef7"}},{"s":"music/sleepwalking.mp3","t":"Sleepwalking","a":"The Chain Gang of 1974","c":"covers/sleepwalking.jpg","d":217.7,"p":{"bg":"#172b3d","text":"#c8e2fa","sub":"#99bee0","bar":"#68b2f7"}},{"s":"music/late-night.mp3","t":"Late Night","a":"Marten Lou x Foals","c":"covers/late-night.jpg","d":259.1,"p":{"bg":"#212b3d","text":"#c8dafa","sub":"#99b3e0","bar":"#8fb6f7"}},{"s":"music/restart-my-heart.mp3","t":"Restart My Heart (Matin Remix)","a":"Astrality & AIKO","c":"covers/restart-my-heart.jpg","d":154.5,"p":{"bg":"#3d1817","text":"#fac9c8","sub":"#e09a99","bar":"#f74d4a"}},{"s":"music/bones.mp3","t":"Bones (Matin Remix)","a":"Oliver Koletzki","c":"covers/bones.jpg","d":328.2,"p":{"bg":"#3d3d3d","text":"#fafafa","sub":"#e0e0e0","bar":"#f7f7f7"}},{"s":"music/daylight.mp3","t":"Daylight (Matin Remix)","a":"TCTS & Hayley May","c":"covers/daylight.jpg","d":137.3,"p":{"bg":"#17303d","text":"#c8e9fa","sub":"#99c8e0","bar":"#4abdf7"}}];/*END*/
  var N = TRACKS.length, KEY = 'mn-player', STALE = 30 * 60 * 1000;
  if (!N) return;

  function shuffle() { var a = [], i, j, x; for (i = 0; i < N; i++) a.push(i); for (i = N - 1; i > 0; i--) { j = Math.floor(Math.random() * (i + 1)); x = a[i]; a[i] = a[j]; a[j] = x } return a }
  function load() { try { var s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && Date.now() - s.ts < STALE && s.order && s.order.length === N) return s } catch (e) {} return null }
  var saved = load(), keepCorner = null; try { keepCorner = (JSON.parse(localStorage.getItem(KEY) || 'null') || {}).corner } catch (e) {}
  /* a new visit gets a new shuffle; moving between pages keeps the same song and spot */
  var st = saved ? { order: saved.order, i: saved.i | 0, t: saved.t || 0, playing: saved.playing, muted: saved.muted, min: saved.min, vol: saved.vol == null ? .8 : saved.vol, corner: saved.corner || 'br' }
                 : { order: shuffle(), i: 0, t: 0, playing: false, muted: false, min: matchMedia('(max-width:600px)').matches, vol: .8, corner: keepCorner || 'br' };
  function save() { try { localStorage.setItem(KEY, JSON.stringify({ order: st.order, i: st.i, t: st.t, playing: st.playing, muted: st.muted, min: st.min, vol: st.vol, corner: st.corner, ts: Date.now() })) } catch (e) {} }
  function cur() { return TRACKS[st.order[st.i]] }

  var E = 'cubic-bezier(.2,.8,.2,1)';
  var CSS = [
    /* card colors fade from song to song */
    '@property --ab{syntax:"<color>";inherits:true;initial-value:#262428}',
    '@property --at{syntax:"<color>";inherits:true;initial-value:#f5f2f6}',
    '@property --as{syntax:"<color>";inherits:true;initial-value:#c8c4cc}',
    '@property --abar{syntax:"<color>";inherits:true;initial-value:#e6e2ea}',
    /* the card itself: sizes follow aura_widget.pyw (400 x 132, radius 26, art as tall as the card) */
    '.ac{--h:calc(132px*var(--mk,1));--r:calc(var(--h)*.197);-webkit-tap-highlight-color:transparent;position:relative;height:var(--h);border-radius:var(--r);isolation:isolate;background:var(--ab);',
      'transition:--ab .9s ease,--at .9s ease,--as .9s ease,--abar .9s ease;',
      'font-family:"Segoe UI Variable Display","Segoe UI",Geist,Inter,system-ui,sans-serif;color:var(--at);-webkit-font-smoothing:antialiased;user-select:none;-webkit-user-select:none;text-align:left;line-height:normal;letter-spacing:normal}',
    '.ac *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}',
    /* everything inside is clipped by its own rounded layer; phones (Safari) otherwise let the blur leak past the corners */
    '.ac-in{position:absolute;inset:0;border-radius:inherit;overflow:hidden;clip-path:inset(0 round var(--r));-webkit-mask-image:-webkit-radial-gradient(white,black);transform:translateZ(0)}',
    '.ac-blur{position:absolute;inset:-40px;will-change:transform;background:var(--cover) 0 50%/auto 140% no-repeat,var(--cover) center/cover;filter:blur(30px) saturate(1.15);opacity:.85;z-index:-2}',
    /* the cover's own colors glow out from behind it and settle into the card color to the right */
    '.ac-blur::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,color-mix(in srgb,var(--ab) 35%,transparent) 0%,color-mix(in srgb,var(--ab) 70%,transparent) 45%,var(--ab) 85%)}',
    '.ac::after{content:"";position:absolute;inset:0;border-radius:inherit;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);pointer-events:none}',
    '.ac-art{position:absolute;left:0;top:0;width:var(--h);height:var(--h);background:var(--cover) center/cover;',
      /* Aura's fade to the right, plus a soft feather on the other three sides so the cover melts into its own glow */
      '-webkit-mask-image:linear-gradient(90deg,rgba(0,0,0,.55) 0%,#000 9%,#000 30%,rgba(0,0,0,.894) 45%,rgba(0,0,0,.647) 60%,rgba(0,0,0,.345) 75%,rgba(0,0,0,.118) 88%,transparent 100%),linear-gradient(180deg,rgba(0,0,0,.55) 0%,#000 10%,#000 90%,rgba(0,0,0,.55) 100%);',
      '-webkit-mask-composite:source-in;mask-composite:intersect;',
      'mask-image:linear-gradient(90deg,rgba(0,0,0,.55) 0%,#000 9%,#000 30%,rgba(0,0,0,.894) 45%,rgba(0,0,0,.647) 60%,rgba(0,0,0,.345) 75%,rgba(0,0,0,.118) 88%,transparent 100%),linear-gradient(180deg,rgba(0,0,0,.55) 0%,#000 10%,#000 90%,rgba(0,0,0,.55) 100%)}',
    /* a song without a cover yet gets a plain note */
    '.ac.nocov .ac-art{background:radial-gradient(circle at 35% 35%,rgba(255,255,255,.14),transparent 60%)}',
    '.ac.nocov .ac-art::after{content:"\\266A";position:absolute;inset:0;display:grid;place-items:center;font-size:calc(var(--h)*.3);color:var(--as);opacity:.6}',
    '.ac.swap .ac-art,.ac.swap .ac-blur{animation:acswap .6s ease}',
    '@keyframes acswap{from{opacity:0}}',
    '.ac-body{position:absolute;left:calc(var(--h) + 8px);right:calc(var(--h)*.182);top:0;bottom:0}',
    '.ac-t{position:absolute;left:0;right:0;top:calc(var(--h)*.227);font-size:calc(var(--h)*.121);font-weight:600;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    /* titles too long for the card scroll to the end, hold, then jump back to the start, like a music app */
    '.ac-t span{display:inline-block}',
    '.ac-t.long{text-overflow:clip;-webkit-mask-image:linear-gradient(90deg,#000 85%,transparent);mask-image:linear-gradient(90deg,#000 85%,transparent)}',
    '.ac-t.long span{animation:acglide var(--gt,9s) linear infinite}',
    '@keyframes acglide{0%,25%{transform:none}70%,90%{transform:translateX(var(--gx));opacity:1}95%{transform:translateX(var(--gx));opacity:0}95.1%{transform:none;opacity:0}100%{transform:none;opacity:1}}',
    '.ac-ar{position:absolute;left:0;right:0;top:calc(var(--h)*.4);font-size:calc(var(--h)*.0985);line-height:1.5;color:var(--as);opacity:.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.ac-seek{position:absolute;left:0;right:0;top:calc(var(--h)*.659 - 8px);height:20px;cursor:pointer;touch-action:none}',
    '.ac-track{position:absolute;left:0;right:0;top:8px;height:4px;border-radius:2px;background:color-mix(in srgb,var(--abar) 23.5%,transparent)}',
    '.ac-fill{position:absolute;left:0;top:0;height:4px;min-width:4px;border-radius:2px;background:var(--abar)}',
    '.ac-knob{position:absolute;top:50%;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;background:var(--at);box-shadow:0 1px 4px rgba(0,0,0,.4);opacity:0;transform:scale(.6);transition:opacity .2s,transform .2s}',
    '.ac:hover .ac-knob,.ac.drag .ac-knob,.ac-seek:focus-visible .ac-knob{opacity:1;transform:scale(1)}',
    '.ac-seek:focus-visible{outline:none}.ac-seek:focus-visible .ac-track{box-shadow:0 0 0 2px rgba(255,255,255,.5)}',
    '.ac-time{position:absolute;top:calc(var(--h)*.758);font-size:calc(var(--h)*.083);font-weight:500;line-height:1.3;color:var(--as);opacity:.67;font-variant-numeric:tabular-nums}',
    '.ac-cur{left:0}.ac-dur{right:0}',
    '.ac button{font:inherit;color:inherit;background:none;border:0;padding:0;margin:0;cursor:pointer;-webkit-tap-highlight-color:transparent;box-shadow:none;text-transform:none;letter-spacing:normal}',
    '.ac button:focus-visible{outline:2px solid rgba(255,255,255,.6);outline-offset:2px;opacity:1}',
    /* back, play and forward in the middle, shown on hover the way Aura shows its controls (30px apart, like Aura) */
    '.ac-ctl{position:absolute;left:50%;top:calc(var(--h)*.81 - 13px);width:86px;height:26px;margin-left:-43px;display:flex;justify-content:space-between;opacity:0;transition:opacity .22s ease}',
    '.ac-ctl button{width:26px;height:26px;display:grid;place-items:center;color:var(--at);border-radius:50%;transition:transform .15s}',
    '.ac-ctl button:active{transform:scale(.88)}',
    '.ac-ctl svg{width:14px;height:14px;fill:currentColor;opacity:.92}',
    '.ac-ctl .ac-sk svg{width:12px;height:12px}',
    '.ac:hover .ac-ctl,.ac:not(.on) .ac-ctl,.ac-ctl:focus-within{opacity:1}',
    '.ac .ac-pa{display:none}.ac.on .ac-pa{display:block}.ac.on .ac-pl{display:none}',
    '.ac.wait .ac-tog{animation:acping 1.6s ease-out infinite}',
    '@keyframes acping{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--at) 50%,transparent)}100%{box-shadow:0 0 0 9px transparent}}',
    '@media (hover:none){.ac-ctl{opacity:1}.ac-knob{opacity:1;transform:scale(.8)}}',
    /* the floating one */
    '.mp{position:fixed;right:max(16px,env(safe-area-inset-right));bottom:max(16px,env(safe-area-inset-bottom));z-index:60;width:min(calc(400px*var(--mk,1)),calc(100vw - 32px));',
      'box-shadow:0 6px 26px rgba(0,0,0,.47);transition:--ab .9s ease,--at .9s ease,--as .9s ease,--abar .9s ease,width .45s ' + E + ',height .45s ' + E + ',border-radius .45s ' + E + ',transform .5s ' + E + ',opacity .5s ease}',
    '.mp.mp-in{transform:translateY(12px);opacity:0}',
    /* drag it to any corner: it tilts with the motion and springs into the nearest corner */
    '.mp{cursor:grab;touch-action:none}.mp button,.mp input,.mp .ac-seek{cursor:pointer}',
    '.mp.c-bl,.mp.c-tl{right:auto;left:max(16px,env(safe-area-inset-left))}',
    '.mp.c-tr,.mp.c-tl{bottom:auto;top:calc(3.6rem + 18px)}',
    '.mp.held{cursor:grabbing;transition:width .45s ' + E + ',height .45s ' + E + ',border-radius .45s ' + E + ',box-shadow .25s ease;box-shadow:0 22px 50px -10px rgba(0,0,0,.55)}',
    '.mp.snap{transition:box-shadow .5s ease,width .45s ' + E + ',height .45s ' + E + ',border-radius .45s ' + E + '}',
    '.mp.held,.mp.snap{will-change:transform}',
    '.mp-cor{position:absolute;top:12px;right:14px;display:flex;gap:2px;opacity:0;transition:opacity .22s ease}',
    '.mp:hover .mp-cor,.mp-cor:focus-within{opacity:1}',
    '.mp-ic{width:22px;height:22px;border-radius:7px;display:grid;place-items:center;color:var(--as)}',
    '.mp-ic:hover{background:rgba(255,255,255,.1);color:var(--at)}',
    '.mp-ic svg{width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}',
    '@media (hover:none){.mp-cor{opacity:1}}',
    /* volume slides out of the speaker button; phones keep their own volume buttons */
    '.mp-vol{display:flex;align-items:center;flex-direction:row-reverse}',
    '.mp-vr{-webkit-appearance:none;appearance:none;width:0;opacity:0;height:22px;margin:0;background:transparent;cursor:pointer;transition:width .3s cubic-bezier(.2,.8,.2,1),opacity .2s ease,margin .3s;--v:80%}',
    '.mp-vol:hover .mp-vr,.mp-vol:focus-within .mp-vr{width:72px;opacity:1;margin-right:4px}',
    '.mp-vr::-webkit-slider-runnable-track{height:3px;border-radius:2px;background:linear-gradient(90deg,var(--at) var(--v),color-mix(in srgb,var(--at) 25%,transparent) var(--v))}',
    '.mp-vr::-moz-range-track{height:3px;border-radius:2px;background:color-mix(in srgb,var(--at) 25%,transparent)}',
    '.mp-vr::-moz-range-progress{height:3px;border-radius:2px;background:var(--at)}',
    '.mp-vr::-webkit-slider-thumb{-webkit-appearance:none;width:10px;height:10px;margin-top:-3.5px;border-radius:50%;background:var(--at);border:0}',
    '.mp-vr::-moz-range-thumb{width:10px;height:10px;border-radius:50%;background:var(--at);border:0}',
    '.mp-vr:focus-visible{outline:none}',
    '@media (hover:none){.mp-vr{display:none}}',
    '.mp-open{display:none}',
    '.mp.min{width:calc(64px*var(--mk,1));--h:calc(64px*var(--mk,1));--r:calc(18px*var(--mk,1))}',
    '@media (max-width:600px){.mp{--h:104px;width:min(340px,calc(100vw - 24px));right:12px;bottom:12px}.mp.c-bl,.mp.c-tl{left:12px}.mp.c-tr,.mp.c-tl{top:68px}.mp.min{width:50px;--h:50px;--r:14px}.mp-eq{right:6px;bottom:6px}.mp-cor{top:8px;right:10px}}',
    '.mp.min .ac-body,.mp.min .mp-cor,.mp.min .ac-blur{display:none}',
    '.mp.min .ac-art{width:100%;height:100%;-webkit-mask-image:none;mask-image:none}',
    '.mp.min .ac-blur{display:none}',
    '.mp.min .mp-open{display:block;position:absolute;inset:0;border-radius:inherit}',
    '.mp-eq{position:absolute;right:10px;bottom:10px;display:none;gap:2px;align-items:flex-end;height:12px;padding:3px;border-radius:5px;background:rgba(0,0,0,.45)}',
    '.mp-eq b{width:2px;height:8px;background:var(--abar);border-radius:1px;transform-origin:50% 100%;transform:scaleY(.35)}',
    '.mp.min.on .mp-eq{display:flex}',
    '.mp.on .mp-eq b{animation:mpeq .9s ease-in-out infinite alternate}.mp.on .mp-eq b:nth-child(2){animation-delay:-.3s}.mp.on .mp-eq b:nth-child(3){animation-delay:-.6s}',
    '@keyframes mpeq{from{transform:scaleY(.25)}to{transform:scaleY(1)}}',
    '@media (prefers-reduced-motion:reduce){.ac,.ac *{animation:none!important;transition:none!important}}',
    '@media print{.mp{display:none}}',
    /* while music plays, other pages of the site open in this frame so the song never stops */
    '.mp-frame{position:fixed;inset:0;z-index:55;background:var(--bg,#ECE9E2);opacity:0;visibility:hidden;transition:opacity .3s ease,visibility 0s .3s}',
    '.mp-frame.on{opacity:1;visibility:visible;transition:opacity .3s ease}',
    '.mp-frame iframe{display:block;width:100%;height:100%;border:0}',
    'html.mp-framed,html.mp-framed body{overflow:hidden}'
  ].join('\n');
  function addCss(doc) { if (doc.getElementById('mp-css')) return; var c = doc.createElement('style'); c.id = 'mp-css'; c.textContent = CSS; (doc.head || doc.documentElement).appendChild(c) }
  addCss(document);

  var I = {
    play: '<svg class="ac-pl" viewBox="0 0 14 14" aria-hidden="true"><path d="M2.5 0.5L14 7L2.5 13.5z"/></svg>',
    pause: '<svg class="ac-pa" viewBox="0 0 14 14" aria-hidden="true"><rect x="2" y="0.5" width="3.4" height="13" rx="1.4"/><rect x="8.6" y="0.5" width="3.4" height="13" rx="1.4"/></svg>',
    prev: '<svg viewBox="0 0 12 12" aria-hidden="true"><rect x="0.6" y="0.5" width="2.2" height="11" rx="1"/><path d="M11 0.5L3.4 6L11 11.5z"/></svg>',
    next: '<svg viewBox="0 0 12 12" aria-hidden="true"><rect x="9.2" y="0.5" width="2.2" height="11" rx="1"/><path d="M1 0.5L8.6 6L1 11.5z"/></svg>',
    vol: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 6h2.2L8 3.2v9.6L4.7 10H2.5z"/><path d="M10.6 5.6a3.4 3.4 0 0 1 0 4.8M12.6 3.8a6 6 0 0 1 0 8.4"/></svg>',
    mute: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 6h2.2L8 3.2v9.6L4.7 10H2.5z"/><path d="M10.5 6l4 4M14.5 6l-4 4"/></svg>',
    fold: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 8h8"/></svg>'
  };
  function fmt(s) { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2) }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;') }

  var au = new Audio(); au.preload = 'none'; au.volume = st.vol;
  var loaded = -1, dragging = null, pending = false, views = [], wins = [window];
  function D() { return (loaded === st.order[st.i] && au.duration) || cur().d }

  /* one card. extra = markup for the floating version's own buttons */
  function makeView(el, extra) {
    el.classList.add('ac');
    el.innerHTML =
      '<div class="ac-in"><div class="ac-blur" aria-hidden="true"></div><div class="ac-art" aria-hidden="true"></div>' +
      '<div class="ac-body">' +
        '<div class="ac-t"></div><div class="ac-ar"></div>' +
        '<div class="ac-seek" role="slider" tabindex="0" aria-label="Seek" aria-valuemin="0"><div class="ac-track"><div class="ac-fill"></div></div><div class="ac-knob"></div></div>' +
        '<span class="ac-time ac-cur">0:00</span><span class="ac-time ac-dur"></span>' +
        '<div class="ac-ctl"><button class="ac-sk ac-prev" type="button" aria-label="Previous song">' + I.prev + '</button>' +
          '<button class="ac-tog" type="button" aria-label="Play">' + I.play + I.pause + '</button>' +
          '<button class="ac-sk ac-next" type="button" aria-label="Next song">' + I.next + '</button></div>' +
      '</div></div>' + (extra || '');
    var q = function (s) { return el.querySelector(s) };
    var v = { el: el, seek: q('.ac-seek'), fill: q('.ac-fill'), knob: q('.ac-knob'), cur: q('.ac-cur'), dur: q('.ac-dur'), tog: q('.ac-tog'), t: q('.ac-t'), ar: q('.ac-ar') };
    v.tog.addEventListener('click', toggle);
    q('.ac-prev').addEventListener('click', prev);
    q('.ac-next').addEventListener('click', function () { next(true) });
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
    views.push(v); dress(v, false); return v;
  }

  /* put the current song's title, artist, cover and colors on a card */
  function dress(v, anim) {
    var tr = cur(), el = v.el, p = tr.p;
    v.t.innerHTML = '<span>' + esc(tr.t) + '</span>'; v.t.title = tr.t;
    requestAnimationFrame(function () { var over = v.t.firstChild.offsetWidth - v.t.clientWidth; v.t.classList.toggle('long', over > 2);
      if (over > 2) { v.t.style.setProperty('--gx', -(over + 12) + 'px'); v.t.style.setProperty('--gt', Math.max(7, over / 12 + 6) + 's') } }); if (!el.classList.contains('wait')) v.ar.textContent = tr.a;
    el.style.setProperty('--ab', p.bg); el.style.setProperty('--at', p.text); el.style.setProperty('--as', p.sub); el.style.setProperty('--abar', p.bar);
    el.style.setProperty('--cover', tr.c ? 'url("' + BASE + tr.c + '")' : 'none'); el.classList.toggle('nocov', !tr.c);
    if (anim) { el.classList.remove('swap'); void el.offsetWidth; el.classList.add('swap') }
  }
  function paint() {
    var t = st.t, d = D(), f = Math.max(0, Math.min(1, t / d)) * 100;
    views.forEach(function (v) {
      v.fill.style.width = f + '%'; v.knob.style.left = f + '%'; v.cur.textContent = fmt(t); v.dur.textContent = fmt(d);
      v.seek.setAttribute('aria-valuemax', Math.round(d)); v.seek.setAttribute('aria-valuenow', Math.round(t)); v.seek.setAttribute('aria-valuetext', fmt(t) + ' of ' + fmt(d));
    });
  }
  function emit() { var tr = cur(), d = { playing: !au.paused, t: st.t, dur: D(), title: tr.t, artist: tr.a }; wins.forEach(function (w) { try { w.dispatchEvent(new w.CustomEvent('mnplayer', { detail: d })) } catch (e) {} }) }
  function ui() {
    var on = !au.paused;
    views.forEach(function (v) { v.el.classList.toggle('on', on); v.tog.setAttribute('aria-label', on ? 'Pause' : 'Play ' + cur().t) });
    fl.classList.toggle('min', !!st.min);
    muteB.innerHTML = st.muted ? I.mute : I.vol; muteB.setAttribute('aria-label', st.muted ? 'Unmute' : 'Mute');
    au.muted = !!st.muted; au.volume = st.vol; var vv = st.muted ? 0 : st.vol; if (+vr.value !== vv) vr.value = vv; vr.style.setProperty('--v', vv * 100 + '%'); emit();
    if ('mediaSession' in navigator) try { navigator.mediaSession.playbackState = on ? 'playing' : 'paused' } catch (e) {}
  }
  function note(msg) { views.forEach(function (v) { v.el.classList.toggle('wait', !!msg); v.ar.textContent = msg || cur().a }) }
  function session() {
    if (!('mediaSession' in navigator) || !window.MediaMetadata) return; var tr = cur();
    try { navigator.mediaSession.metadata = new MediaMetadata({ title: tr.t, artist: tr.a, artwork: tr.c ? [{ src: BASE + tr.c, sizes: '400x400', type: 'image/jpeg' }] : [] }) } catch (e) {}
  }
  function seekTo(t) { st.t = t; if (loaded === st.order[st.i] && au.readyState > 0) au.currentTime = t; paint() }
  function play() {
    note('');
    var want = st.t, k = st.order[st.i];
    if (loaded !== k) { loaded = k; pending = true; au.src = BASE + cur().s; au.preload = 'auto'; au.addEventListener('loadedmetadata', function f() { au.removeEventListener('loadedmetadata', f); if (want > 0) au.currentTime = want; pending = false; paint() }); au.load(); session() }
    else if (Math.abs(au.currentTime - want) > .5) au.currentTime = want;
    var pr = au.play(); st.playing = true; save(); ui();
    if (pr && pr.catch) pr.catch(function (e) { if (e && e.name === 'AbortError') return; st.playing = false; ui(); note('Press play to keep listening'); save() });
  }
  function pause() { au.pause(); st.playing = false; if (!pending && loaded === st.order[st.i]) st.t = au.currentTime; save(); ui() }
  function toggle() { au.paused ? play() : pause() }
  function go(i, keepPlaying) {
    var was = keepPlaying != null ? keepPlaying : !au.paused;
    au.pause(); st.i = (i + N) % N; st.t = 0; loaded = -1;
    views.forEach(function (v) { dress(v, true) }); session(); paint();
    if (was) play(); else { st.playing = false; save(); ui() }
  }
  function next(user) { go(st.i + 1, user ? null : true) }
  /* like most players: back restarts the song unless it just started */
  function prev() { if ((loaded === st.order[st.i] ? au.currentTime : st.t) > 3) { seekTo(0); save() } else go(st.i - 1) }

  /* the floating card */
  var fl = document.createElement('section');
  fl.className = 'mp mp-in'; fl.setAttribute('aria-label', 'Music player');
  makeView(fl,
    '<div class="mp-cor"><span class="mp-vol"><button class="mp-ic mp-mute" type="button" aria-label="Mute"></button><input class="mp-vr" type="range" min="0" max="1" step="0.01" aria-label="Volume"></span>' +
      '<button class="mp-ic mp-fold" type="button" aria-label="Fold the player">' + I.fold + '</button></div>' +
    '<span class="mp-eq" aria-hidden="true"><b></b><b></b><b></b></span>' +
    '<button class="mp-open" type="button" aria-label="Open the music player"></button>');
  var muteB = fl.querySelector('.mp-mute');
  fl.classList.add('c-' + st.corner);
  /* drag to any corner. The card follows the pointer one frame at a time, leans with its speed, and on
     release a small spring carries that speed into the nearest corner, so it lands instead of snapping. */
  (function drag() {
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var sx, sy, px, py, pt, vx = 0, vy = 0, on = false, moved = false, id = null;
    var x = 0, y = 0, rot = 0, sc = 1, tx = 0, ty = 0, trot = 0, tsc = 1, svx = 0, svy = 0, raf = 0, last = 0, mode = '';
    function paint() { fl.style.transform = (x || y || rot || sc !== 1) ? 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) rotate(' + rot.toFixed(3) + 'deg) scale(' + sc.toFixed(4) + ')' : '' }
    function frame(now) {
      raf = 0; var dt = Math.min(.034, (now - (last || now)) / 1000) || .016; last = now;
      if (mode === 'drag') {
        /* follow the finger exactly, ease the lean and the lift */
        x = tx; y = ty; rot += (trot - rot) * (1 - Math.exp(-dt * 14)); sc += (tsc - sc) * (1 - Math.exp(-dt * 16));
        trot *= Math.exp(-dt * 6);
      } else if (mode === 'spring') {
        /* gentle spring: a hint of overshoot, settles in about half a second */
        var k = 210, c = 23;
        svx += (-k * x - c * svx) * dt; svy += (-k * y - c * svy) * dt; x += svx * dt; y += svy * dt;
        rot += (0 - rot) * (1 - Math.exp(-dt * 10)); sc += (1 - sc) * (1 - Math.exp(-dt * 12));
        if (Math.abs(x) < .3 && Math.abs(y) < .3 && Math.abs(svx) < 8 && Math.abs(svy) < 8 && Math.abs(rot) < .05 && Math.abs(sc - 1) < .001) {
          x = y = rot = 0; sc = 1; mode = ''; paint(); fl.classList.remove('snap'); last = 0; return;
        }
      }
      paint(); if (mode) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame) }
    fl.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 || e.target.closest('.ac-ctl,.ac-seek,.mp-cor')) return;
      id = e.pointerId; sx = px = e.clientX; sy = py = e.clientY; pt = performance.now(); vx = vy = 0; on = true; moved = false;
      addEventListener('pointermove', mv, { passive: true }); addEventListener('pointerup', up); addEventListener('pointercancel', up);
    });
    function mv(e) {
      if (!on || e.pointerId !== id) return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (!moved) {
        if (Math.hypot(dx, dy) < 6) return; moved = true; fl.classList.remove('snap'); fl.classList.add('held');
        /* pick up from wherever the card is, even mid spring */
        sx -= x; sy -= y; dx = e.clientX - sx; dy = e.clientY - sy; mode = 'drag'; svx = svy = 0;
      }
      var now = performance.now(), d = Math.max(1, now - pt);
      vx = vx * .6 + (e.clientX - px) / d * .4; vy = vy * .6 + (e.clientY - py) / d * .4; px = e.clientX; py = e.clientY; pt = now;
      tx = dx; ty = dy; tsc = reduce ? 1 : 1.03; trot = reduce ? 0 : Math.max(-6, Math.min(6, vx * 5)); kick();
    }
    function up(e) {
      if (!on || (e && e.pointerId !== id)) return; on = false;
      removeEventListener('pointermove', mv); removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
      if (!moved) return;
      /* where the card is on screen now, ignoring its lean, decides the corner */
      var L0 = fl.offsetLeft, T0 = fl.offsetTop, w = fl.offsetWidth, h = fl.offsetHeight;
      var cx = L0 + x + w / 2, cy = T0 + y + h / 2, c = (cy < innerHeight / 2 ? 't' : 'b') + (cx < innerWidth / 2 ? 'l' : 'r');
      fl.classList.remove('held', 'c-' + st.corner); fl.classList.add('c-' + c);
      /* keep it visually in place, then let the spring bring it home with the speed it was thrown at */
      x += L0 - fl.offsetLeft; y += T0 - fl.offsetTop;
      if (performance.now() - pt > 80) vx = vy = 0;
      svx = Math.max(-2500, Math.min(2500, vx * 1000)); svy = Math.max(-2500, Math.min(2500, vy * 1000));
      if (reduce) { x = y = 0; svx = svy = 0 }
      fl.classList.add('snap'); mode = 'spring'; last = 0; kick();
      st.corner = c; save();
    }
    /* a drag should never count as a tap on whatever was under the finger */
    fl.addEventListener('click', function (e) { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false } }, true);
  })();
  fl.querySelector('.mp-open').addEventListener('click', function () { st.min = false; save(); ui() });
  fl.querySelector('.mp-fold').addEventListener('click', function () { st.min = true; save(); ui() });
  muteB.addEventListener('click', function () { st.muted = !st.muted; if (!st.muted && st.vol < .05) st.vol = .5; save(); ui() });
  var vr = fl.querySelector('.mp-vr');
  vr.addEventListener('input', function () { st.vol = +vr.value; st.muted = st.vol === 0; ui() });
  vr.addEventListener('change', save);

  au.addEventListener('timeupdate', function () { if (dragging || pending || loaded !== st.order[st.i]) return; st.t = au.currentTime; paint(); emit() });
  au.addEventListener('play', ui); au.addEventListener('pause', ui);
  au.addEventListener('ended', function () { next(false) });
  setInterval(function () { if (!au.paused) save() }, 1000);
  addEventListener('pagehide', function () { if (!au.paused && !pending && loaded === st.order[st.i]) st.t = au.currentTime; save() });
  addEventListener('storage', function (e) { if (e.key !== KEY || !e.newValue) return; try { var s = JSON.parse(e.newValue); if (s.playing && !au.paused) { au.pause(); st.playing = false; ui() } } catch (x) {} });
  if ('mediaSession' in navigator) {
    var H = { play: play, pause: pause, previoustrack: prev, nexttrack: function () { next(true) }, seekto: function (d) { seekTo(d.seekTime); save() } };
    for (var h in H) try { navigator.mediaSession.setActionHandler(h, H[h]) } catch (e) {}
  }

  window.mnPlayer = { toggle: toggle, next: function () { next(true) }, prev: prev };

  /* keyboard: space plays or pauses, right and left arrows go to the next or previous song.
     Only while someone is on the page, and never while they're typing, using a slider or a focused control. */
  function keys(e) {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
    var k = e.key, act = k === ' ' || k === 'Spacebar' ? 'toggle' : k === 'ArrowRight' ? 'next' : k === 'ArrowLeft' ? 'prev' : null;
    if (!act) return;
    var t = e.target, tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;
    if (t && t.closest && t.closest('[role="slider"],[role="tab"],[role="listbox"],[role="menu"],[contenteditable]')) return;
    if (act === 'toggle' && t && t.closest && t.closest('button,a,summary,[role="button"]')) return;
    e.preventDefault();
    if (act === 'toggle') toggle(); else if (act === 'next') next(true); else prev();
  }
  document.addEventListener('keydown', keys);

  /* opening pages without leaving this one. Browsers won't start sound on a freshly loaded page,
     so while the music plays, a click to another page of the site opens it in a full screen frame
     over this one. The address bar and the back button still follow along. */
  function page(u) { return u.pathname.replace(/index\.html$/, '') }
  function linkOf(e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return null;
    var a = e.target.closest && e.target.closest('a[href]'); if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return null;
    var u; try { u = new URL(a.href) } catch (x) { return null }
    if (u.origin !== location.origin || !/(\/|\.html)$/.test(u.pathname)) return null;
    return u;
  }
  var fr = null, home = location.href, homeTitle = document.title;
  function hide() {
    if (!fr) return; fr.classList.remove('on'); document.documentElement.classList.remove('mp-framed'); document.title = homeTitle;
    setTimeout(function () { if (!fr.classList.contains('on')) fr.firstChild.src = 'about:blank' }, 350);
  }
  function openFrame(href, push) {
    if (!fr) {
      fr = document.createElement('div'); fr.className = 'mp-frame'; fr.innerHTML = '<iframe title="Page"></iframe>'; document.body.appendChild(fr);
      fr.firstChild.addEventListener('load', function () {
        try { var w = fr.firstChild.contentWindow; if (!w || w.location.href === 'about:blank') return;
          var u = new URL(w.location.href);
          if (page(u) === page(new URL(home))) { hide(); history.replaceState(null, '', home); return }
          document.title = w.document.title; history.replaceState({ mnf: u.href }, '', u.href); w.focus() } catch (x) {}
      });
    }
    fr.firstChild.src = href; document.documentElement.classList.add('mp-framed');
    requestAnimationFrame(function () { fr.classList.add('on') });
    if (push) history.pushState({ mnf: href }, '', href);
  }
  function closeFrame() { if (history.state && history.state.mnf) history.back(); else hide() }
  addEventListener('popstate', function (e) { if (e.state && e.state.mnf) openFrame(e.state.mnf, false); else hide() });
  document.addEventListener('click', function (e) {
    if (au.paused && !pending) return;
    var u = linkOf(e); if (!u || page(u) === page(location)) return;
    e.preventDefault(); openFrame(u.href, true);
  });
  /* a page inside the frame: its own cards join in, and a link back to this page just closes the frame */
  function attach(win, doc) {
    addCss(doc); wins.push(win); win.mnPlayer = window.mnPlayer; doc.addEventListener('keydown', keys);
    function ready() { [].forEach.call(doc.querySelectorAll('[data-aura-card]'), function (el) { makeView(el) }); paint(); ui() }
    if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', ready); else ready();
    win.addEventListener('pagehide', function () { views = views.filter(function (v) { return v.el.ownerDocument !== doc }); wins = wins.filter(function (w) { return w !== win }) });
    doc.addEventListener('click', function (e) {
      var u = linkOf(e); if (!u || page(u) !== page(new URL(home))) return;
      e.preventDefault(); closeFrame();
      if (u.hash) setTimeout(function () { var t = document.querySelector(u.hash); if (t) t.scrollIntoView({ behavior: 'smooth' }) }, 60);
    });
  }
  window.__mnCore = { attach: attach };

  function mount() {
    /* any element with data-aura-card becomes a second, in-page card */
    [].forEach.call(document.querySelectorAll('[data-aura-card]'), function (el) { makeView(el) });
    document.body.appendChild(fl); paint(); ui(); session();
    requestAnimationFrame(function () { requestAnimationFrame(function () { fl.classList.remove('mp-in') }) });
    if (st.playing) play();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
