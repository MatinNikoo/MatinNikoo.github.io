/* The GIF boxes on the Aura desktop, working like aura_gif.pyw.
   Visitors can drop in their own GIF (or pick one), slide it to choose which part shows, pause it and
   change its speed. Their GIF never leaves their browser; it is kept on their device so it's still
   there next visit, and Reset brings back the original. */
(function () {
  var boxes = [].slice.call(document.querySelectorAll('.desk .gif[data-key]'));
  if (!boxes.length) return;
  var SPEEDS = [.25, .5, 1, 1.5, 2], canDecode = 'ImageDecoder' in window;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- tiny storage for a visitor's own GIFs, only in their browser ---- */
  var dbp = null;
  function db() {
    if (dbp) return dbp;
    dbp = new Promise(function (ok, no) {
      try { var r = indexedDB.open('aura-gifs', 1); r.onupgradeneeded = function () { r.result.createObjectStore('g') }; r.onsuccess = function () { ok(r.result) }; r.onerror = no } catch (e) { no(e) }
    });
    return dbp;
  }
  function put(k, v) { return db().then(function (d) { return new Promise(function (ok) { var t = d.transaction('g', 'readwrite'); v == null ? t.objectStore('g').delete(k) : t.objectStore('g').put(v, k); t.oncomplete = ok; t.onerror = ok }) }).catch(function () {}) }
  function get(k) { return db().then(function (d) { return new Promise(function (ok) { var r = d.transaction('g').objectStore('g').get(k); r.onsuccess = function () { ok(r.result) }; r.onerror = function () { ok(null) } }) }).catch(function () { return null }) }

  var css = document.createElement('style'); css.textContent = [
    '.desk .gif{touch-action:pan-y;cursor:grab}',
    '.desk .gif.panning{cursor:grabbing}',
    '.desk .gif canvas.gf{position:absolute;inset:0;width:100%;height:100%;display:block}',
    '.desk .gif img{object-position:var(--px,50%) var(--py,50%)}',
    '.gctl{position:absolute;z-index:2;left:.5rem;bottom:.5rem;display:flex;gap:2px;padding:3px;border-radius:9px;background:rgba(12,12,14,.62);',
      'backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.1);opacity:0;transform:translateY(4px);transition:opacity .22s ease,transform .22s ease}',
    '.desk .gif:hover .gctl,.gctl:focus-within,.desk .gif.drop .gctl{opacity:1;transform:none}',
    '@media (hover:none){.gctl{opacity:1;transform:none}}',
    '.gctl button{font:500 .58rem/1 "Geist Mono",ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.88);background:none;border:0;',
      'border-radius:6px;padding:.38rem .45rem;cursor:pointer;display:inline-flex;align-items:center;gap:.3rem;min-width:1.6rem;justify-content:center}',
    '.gctl button:hover{background:rgba(255,255,255,.12);color:#fff}',
    '.gctl button:focus-visible{outline:2px solid #fff;outline-offset:1px}',
    '.gctl svg{width:.7rem;height:.7rem;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}',
    '.gctl .gp svg{fill:currentColor;stroke:none}',
    '.gctl .gyou i{width:.38rem;height:.38rem;background:var(--signal,#FF5A1F);display:inline-block}',
    '.gctl [hidden]{display:none}',
    /* the always visible way in: a small tag on each box */
    '.gchip{position:absolute;z-index:2;left:.5rem;top:.5rem;display:inline-flex;align-items:center;gap:.4rem;padding:.36rem .55rem .36rem .45rem;border-radius:8px;border:1px solid rgba(255,255,255,.16);',
      'background:rgba(12,12,14,.66);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);color:#fff;font:500 .56rem/1 "Geist Mono",ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;',
      'transition:background .2s,border-color .2s,transform .2s}',
    '.gchip:hover{background:rgba(12,12,14,.86);border-color:rgba(255,255,255,.4)}',
    '.gchip:active{transform:scale(.96)}',
    '.gchip:focus-visible{outline:2px solid #fff;outline-offset:2px}',
    '.gchip svg{width:.62rem;height:.62rem;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}',
    '.gchip i{width:.36rem;height:.36rem;background:var(--signal,#FF5A1F);display:inline-block}',
    /* marching dashes: shown once when the desktop comes into view, and whenever a file is dragged over it */
    '.gant{position:absolute;inset:5px;z-index:2;border-radius:9px;pointer-events:none;opacity:0;transition:opacity .35s ease;',
      'background:linear-gradient(90deg,#fff 50%,transparent 0) 0 0/12px 1.5px repeat-x,linear-gradient(90deg,#fff 50%,transparent 0) 0 100%/12px 1.5px repeat-x,',
      'linear-gradient(0deg,#fff 50%,transparent 0) 0 0/1.5px 12px repeat-y,linear-gradient(0deg,#fff 50%,transparent 0) 100% 0/1.5px 12px repeat-y}',
    '.desk .gif.hint .gant,.desk .gif.ready .gant,.desk .gif.drop .gant{opacity:.85;animation:gant .9s linear infinite}',
    '@keyframes gant{to{background-position:12px 0,-12px 100%,0 -12px,100% 12px}}',
    '.desk .gif.ready::before{content:"Drop it here";position:absolute;inset:5px;z-index:2;border-radius:9px;display:grid;place-items:center;background:rgba(10,10,12,.45);color:#fff;font:500 .62rem/1 "Geist Mono",ui-monospace,monospace;letter-spacing:.16em;text-transform:uppercase}',
    '.desk .gif.hint .gchip{animation:gpulse 1.3s ease-in-out 2}',
    '@keyframes gpulse{50%{border-color:var(--signal,#FF5A1F);box-shadow:0 0 0 4px color-mix(in srgb,var(--signal,#FF5A1F) 30%,transparent)}}',
    '@media (max-width:600px){.gchip{left:.35rem;top:.35rem;font-size:.48rem;padding:.3rem .42rem}}',
    '@media (prefers-reduced-motion:reduce){.gant,.gchip{animation:none!important}}',
    '.desk .gif.drop::before{content:"Drop your GIF";position:absolute;inset:6px;z-index:3;border:1px dashed rgba(255,255,255,.75);border-radius:9px;display:grid;place-items:center;',
      'background:rgba(10,10,12,.55);color:#fff;font:500 .62rem/1 "Geist Mono",ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase}',
    '.gtip{position:absolute;z-index:2;right:.5rem;top:.5rem;font:500 .54rem/1 "Geist Mono",ui-monospace,monospace;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.85);',
      'background:rgba(12,12,14,.6);padding:.3rem .4rem;border-radius:6px;opacity:0;transition:opacity .3s ease;pointer-events:none}',
    '.gtip.on{opacity:1}',
    '@media (max-width:600px){.gctl{left:.35rem;bottom:.35rem}.gctl button{padding:.32rem .36rem;font-size:.5rem}}'
  ].join('\n'); document.head.appendChild(css);

  var I = {
    up: '<svg viewBox="0 0 16 16"><path d="M8 11V3M4.5 6.5 8 3l3.5 3.5M3 13h10"/></svg>',
    pause: '<svg viewBox="0 0 16 16"><rect x="3.5" y="3" width="3" height="10" rx="1"/><rect x="9.5" y="3" width="3" height="10" rx="1"/></svg>',
    play: '<svg viewBox="0 0 16 16"><path d="M4.5 2.8 13 8l-8.5 5.2z"/></svg>',
    reset: '<svg viewBox="0 0 16 16"><path d="M3 8a5 5 0 1 0 1.5-3.6M3 2.5v2.8h2.8"/></svg>'
  };

  var win = boxes[0].closest('.win'), depth = 0;
  function readyOff() { depth = 0; boxes.forEach(function (b) { b.classList.remove('ready') }) }
  function hasFile(e) { return e.dataTransfer && [].indexOf.call(e.dataTransfer.types || [], 'Files') >= 0 }
  if (win) {
    win.addEventListener('dragenter', function (e) { if (!hasFile(e)) return; depth++; boxes.forEach(function (b) { b.classList.add('ready') }) });
    win.addEventListener('dragleave', function (e) { if (!hasFile(e)) return; if (--depth <= 0) readyOff() });
    win.addEventListener('dragover', function (e) { if (hasFile(e)) e.preventDefault() });
    win.addEventListener('drop', function (e) { if (hasFile(e)) { e.preventDefault(); readyOff() } });
    addEventListener('dragend', readyOff);
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return; io.disconnect();
        boxes.forEach(function (b, k) { setTimeout(function () { b.classList.add('hint'); setTimeout(function () { b.classList.remove('hint') }, 2800) }, 500 + k * 250) });
      }, { threshold: .55 }); io.observe(win);
    }
  }
  boxes.forEach(function (box) {
    var key = box.getAttribute('data-key'), orig = (window.AURA_IMG || {})[key];
    var st = { speed: 1, paused: false, px: 50, py: 50, mine: false }, img = null, cv = null, ctx = null;
    var dec = null, frames = 0, fi = 0, timer = 0, gen = 0, visible = true, objUrl = null;

    var ctl = document.createElement('div'); ctl.className = 'gctl';
    ctl.innerHTML = '<button type="button" class="gp" aria-label="Pause"></button>' +
      '<button type="button" class="gs" aria-label="Speed" hidden>1x</button>' +
      '<button type="button" class="gr" aria-label="Back to the original GIF" hidden>' + I.reset + '</button>';
    var file = document.createElement('input'); file.type = 'file'; file.accept = 'image/gif,image/webp,image/png,image/jpeg,image/avif'; file.hidden = true;
    var tip = document.createElement('span'); tip.className = 'gtip'; tip.textContent = 'Drag to choose what shows';
    var chip = document.createElement('button'); chip.type = 'button'; chip.className = 'gchip'; chip.setAttribute('aria-label', 'Swap in your own GIF');
    chip.innerHTML = '<i></i>Swap GIF';
    var ant = document.createElement('span'); ant.className = 'gant'; ant.setAttribute('aria-hidden', 'true');
    box.appendChild(ant); box.appendChild(chip); box.appendChild(ctl); box.appendChild(file); box.appendChild(tip);
    var bP = ctl.querySelector('.gp'), bS = ctl.querySelector('.gs'), bR = ctl.querySelector('.gr');

    function ui() {
      bP.innerHTML = st.paused ? I.play : I.pause; bP.setAttribute('aria-label', st.paused ? 'Play' : 'Pause');
      bS.hidden = !dec; bS.textContent = (st.speed === .25 ? '¼' : st.speed === .5 ? '½' : st.speed) + 'x';
      bR.hidden = !st.mine; chip.innerHTML = '<i></i>' + (st.mine ? 'Change GIF' : 'Swap GIF'); box.style.setProperty('--px', st.px + '%'); box.style.setProperty('--py', st.py + '%');
    }
    function save() { if (st.mine) put(key + ':s', { speed: st.speed, paused: st.paused, px: st.px, py: st.py }) }

    /* ---- drawing a frame with "cover" fit and the chosen focus point ---- */
    function size() { if (!cv) return; var r = box.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); cv.width = Math.max(1, Math.round(r.width * d)); cv.height = Math.max(1, Math.round(r.height * d)) }
    var lastFrame = null;
    function paint(fr) {
      if (fr) { if (lastFrame && lastFrame !== fr && lastFrame.close) lastFrame.close(); lastFrame = fr }
      fr = lastFrame; if (!fr || !ctx) return;
      var fw = fr.displayWidth || fr.width, fh = fr.displayHeight || fr.height, W = cv.width, H = cv.height;
      var s = Math.max(W / fw, H / fh), dw = fw * s, dh = fh * s;
      ctx.drawImage(fr, (W - dw) * st.px / 100, (H - dh) * st.py / 100, dw, dh);
    }

    /* ---- frame by frame playback with real timing times the chosen speed ---- */
    function stop() { clearTimeout(timer); timer = 0 }
    function tick(g) {
      timer = 0; if (g !== gen || !dec || st.paused || !visible || document.hidden) return;
      dec.decode({ frameIndex: fi }).then(function (r) {
        if (g !== gen) { r.image.close(); return }
        paint(r.image); var d = (r.image.duration || 100000) / 1000; d = Math.max(20, d);
        fi = frames ? (fi + 1) % frames : 0;
        if (frames > 1) timer = setTimeout(function () { tick(g) }, d / st.speed);
      }).catch(function () { fi = 0; if (frames > 1) timer = setTimeout(function () { tick(g) }, 100) });
    }
    function go() { stop(); if (dec && !st.paused && visible && !document.hidden) tick(gen) }

    function clear() { gen++; stop(); if (dec) try { dec.close() } catch (e) {} dec = null; if (lastFrame && lastFrame.close) lastFrame.close(); lastFrame = null;
      if (cv) { cv.remove(); cv = null; ctx = null } if (img) { img.remove(); img = null } }

    function load(src, type) {
      clear(); var g = gen; fi = 0;
      /* plain image first so something shows right away and in every browser */
      img = new Image(); img.alt = ''; img.decoding = 'async';
      img.onload = function () { if (g !== gen) return; box.classList.add('has'); box.style.setProperty('--bgimg', 'url("' + img.src + '")') };
      img.src = src; box.insertBefore(img, ctl);
      if (!canDecode || reduce) { if (st.paused) freeze(); ui(); return }
      fetch(src).then(function (r) { return r.arrayBuffer().then(function (b) { return { b: b, t: type || r.headers.get('content-type') || 'image/gif' } }) }).then(function (o) {
        if (g !== gen) return;
        var t = o.t.split(';')[0]; if (!/^image\/(gif|webp|png|avif|apng)$/.test(t)) t = sniff(o.b) || 'image/gif';
        return ImageDecoder.isTypeSupported(t).then(function (ok) {
          if (!ok || g !== gen) return;
          var d = new ImageDecoder({ data: o.b, type: t });
          return d.tracks.ready.then(function () {
            if (g !== gen) { d.close(); return }
            frames = d.tracks.selectedTrack ? d.tracks.selectedTrack.frameCount : 1;
            dec = d; cv = document.createElement('canvas'); cv.className = 'gf'; ctx = cv.getContext('2d'); size(); box.insertBefore(cv, ctl);
            if (img) { img.remove(); img = null }
            ui(); if (st.paused) d.decode({ frameIndex: 0 }).then(function (r) { if (g === gen) paint(r.image) }); else go();
          });
        });
      }).catch(function () {}).then(ui);
    }
    function sniff(b) { var u = new Uint8Array(b, 0, 12); if (u[0] === 0x47 && u[1] === 0x49) return 'image/gif'; if (u[8] === 0x57 && u[9] === 0x45) return 'image/webp'; if (u[1] === 0x50 && u[2] === 0x4E) return 'image/png'; return null }
    /* browsers that can't step through frames: pausing shows a still of the current frame */
    function freeze() {
      if (!img || cv) return;
      try { cv = document.createElement('canvas'); cv.className = 'gf'; ctx = cv.getContext('2d'); size();
        var W = cv.width, H = cv.height, s = Math.max(W / img.naturalWidth, H / img.naturalHeight), dw = img.naturalWidth * s, dh = img.naturalHeight * s;
        ctx.drawImage(img, (W - dw) * st.px / 100, (H - dh) * st.py / 100, dw, dh); box.insertBefore(cv, ctl); img.style.visibility = 'hidden' } catch (e) {}
    }
    function unfreeze() { if (dec || !cv) return; cv.remove(); cv = null; ctx = null; if (img) img.style.visibility = '' }

    function useFile(f) {
      if (!f || !/^image\//.test(f.type)) return;
      if (f.size > 25 * 1024 * 1024) { flash('That file is over 25 MB'); return }
      if (objUrl) URL.revokeObjectURL(objUrl); objUrl = URL.createObjectURL(f);
      st = { speed: 1, paused: false, px: 50, py: 50, mine: true };
      load(objUrl, f.type); put(key, f); save(); flash('Drag to choose what shows', 2600);
    }
    function flash(t, ms) { tip.textContent = t; tip.classList.add('on'); clearTimeout(tip._t); tip._t = setTimeout(function () { tip.classList.remove('on') }, ms || 1800) }

    chip.addEventListener('click', function (e) { e.stopPropagation(); file.click() });
    file.addEventListener('change', function () { useFile(file.files[0]); file.value = '' });
    bP.addEventListener('click', function () { st.paused = !st.paused; if (dec) { st.paused ? stop() : go() } else { st.paused ? freeze() : unfreeze() } ui(); save() });
    bS.addEventListener('click', function () { st.speed = SPEEDS[(SPEEDS.indexOf(st.speed) + 1) % SPEEDS.length]; ui(); save(); go() });
    bR.addEventListener('click', function () { put(key, null); put(key + ':s', null); if (objUrl) URL.revokeObjectURL(objUrl); objUrl = null; st = { speed: 1, paused: false, px: 50, py: 50, mine: false }; if (orig) load(orig); ui() });

    /* drag a file in */
    ['dragenter', 'dragover'].forEach(function (n) { box.addEventListener(n, function (e) { if (e.dataTransfer && [].indexOf.call(e.dataTransfer.types, 'Files') >= 0) { e.preventDefault(); box.classList.add('drop') } }) });
    box.addEventListener('dragleave', function (e) { if (!box.contains(e.relatedTarget)) box.classList.remove('drop') });
    box.addEventListener('drop', function (e) { e.preventDefault(); e.stopPropagation(); box.classList.remove('drop'); readyOff(); useFile(e.dataTransfer.files[0]) });

    /* drag inside the box to choose which part shows (Ctrl + drag in the desktop app) */
    var pan = null;
    box.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 || e.target.closest('.gctl,.gchip') || e.pointerType === 'touch' && !st.mine) return;
      pan = { x: e.clientX, y: e.clientY, px: st.px, py: st.py, id: e.pointerId, moved: false };
    });
    addEventListener('pointermove', function (e) {
      if (!pan || e.pointerId !== pan.id) return;
      var dx = e.clientX - pan.x, dy = e.clientY - pan.y;
      if (!pan.moved) { if (Math.hypot(dx, dy) < 4) return; pan.moved = true; box.classList.add('panning') }
      var r = box.getBoundingClientRect(), src = lastFrame || img; if (!src) return;
      var fw = src.displayWidth || src.naturalWidth || src.width, fh = src.displayHeight || src.naturalHeight || src.height;
      var s = Math.max(r.width / fw, r.height / fh), ox = fw * s - r.width, oy = fh * s - r.height;
      st.px = ox > 1 ? Math.max(0, Math.min(100, pan.px - dx / ox * 100)) : 50;
      st.py = oy > 1 ? Math.max(0, Math.min(100, pan.py - dy / oy * 100)) : 50;
      ui(); if (dec || ctx) { if (ctx) ctx.clearRect(0, 0, cv.width, cv.height); if (dec) paint(); else if (img) { unfreeze(); freeze() } }
    }, { passive: true });
    addEventListener('pointerup', function () { if (pan) { if (pan.moved) save(); pan = null; box.classList.remove('panning') } });

    /* only play while the box is on screen */
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; visible ? go() : stop() }).observe(box);
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : go() });
    var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { size(); paint() }, 150) });

    /* a visitor's own GIF from an earlier visit, otherwise the original */
    Promise.all([get(key), get(key + ':s')]).then(function (v) {
      if (v[0] && v[0].size) { var s = v[1] || {}; st = { speed: s.speed || 1, paused: !!s.paused, px: s.px == null ? 50 : s.px, py: s.py == null ? 50 : s.py, mine: true };
        objUrl = URL.createObjectURL(v[0]); load(objUrl, v[0].type) }
      else if (orig) load(orig);
      ui();
    });
  });
})();
