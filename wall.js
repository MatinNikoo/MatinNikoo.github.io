/* Desktop wallpaper: a slow liquid printed with the site's dither, in the page's ink on graphite.
   It's drawn tiny (one pixel per 3 screen pixels) and scaled up with crisp edges, at about 12 frames
   a second and only while the window is on screen, so it costs almost nothing. */
(function () {
  var win = document.querySelector('.visual.showcase .win'); if (!win) return;
  var cv = document.createElement('canvas'); cv.className = 'wall'; cv.setAttribute('aria-hidden', 'true');
  win.insertBefore(cv, win.firstChild);
  var g = cv.getContext('2d', { alpha: false }), W = 0, H = 0, img = null, buf = null, colW, colA, colG, cell = 3;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, visible = false, timer = 0, t0 = performance.now();
  var B = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];          // 4x4 ordered dither
  var pal = [];

  function rgb(c) { var x = document.createElement('canvas').getContext('2d'); x.fillStyle = '#000'; x.fillStyle = c; var v = x.fillStyle;
    if (v[0] === '#') return [parseInt(v.slice(1, 3), 16), parseInt(v.slice(3, 5), 16), parseInt(v.slice(5, 7), 16)];
    var m = v.match(/[\d.]+/g); return m ? [+m[0], +m[1], +m[2]] : [255, 90, 31] }
  function colors() {
    var s = rgb(getComputedStyle(document.documentElement).getPropertyValue('--signal').trim() || '#FF5A1F');
    var mix = function (a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k].map(Math.round) };
    var base = [11, 11, 13], graph = [30, 29, 33];
    pal = [base, graph, mix(graph, s, .28), mix(graph, s, .62), s];
    draw(true);
  }
  /* The pattern is one field laid across the whole page and the window only looks into it, so when the window grows
     or shrinks you see more or less of the same picture instead of a new one. It moves with the page, so scrolling
     never makes it jitter, and the light still comes from the top right of the screen */
  function size() {
    var r = win.getBoundingClientRect(); cell = (window.MN_LITE ? 4 : 3) * (window.MN_K ? MN_K() : 1);
    W = Math.max(8, Math.round(r.width / cell)); H = Math.max(8, Math.round(r.height / cell));
    cv.width = W; cv.height = H; img = g.createImageData(W, H); buf = img.data;
    colW = new Float32Array(W); colA = new Float32Array(W); colG = new Float32Array(W);
    draw(true);
  }
  function draw(force) {
    if (!buf || !pal.length || (!force && (!visible || document.hidden))) return;
    var t = reduce ? 18 : (performance.now() - t0) / 1000, i = 0, r = win.getBoundingClientRect(), VW = innerWidth || 1, VH = innerHeight || 1;
    var cw = r.width / W, chh = r.height / H, ox = r.left + scrollX, oy = r.top + scrollY, aspect = VH / VW;
    for (var x = 0; x < W; x++) {
      var px = ox + (x + .5) * cw, u = px / VW, sx = (r.left + (x + .5) * cw) / VW - .92;
      colW[x] = Math.sin(u * 3.6 + t * .11) * 1.5; colA[x] = u * 4.6 + t * .23; colG[x] = Math.exp(-sx * sx * 3.2);
    }
    for (var y = 0; y < H; y++) {
      var py = oy + (y + .5) * chh, v = py / VH, vy = v * aspect * 1.6, rw = Math.sin(vy * 2.7 - t * .17) * 1.7, rb = vy * 5.2 - t * .19;
      var sv0 = (r.top + (y + .5) * chh) / VH, sc = sv0 < 0 ? 0 : sv0 > 1 ? 1 : sv0, shade = .3 + .38 * (1 - sc), gy = sv0 - .02, gr = Math.exp(-gy * gy * 3.2) * .22;
      var by = ((py / cell) | 0) & 3;
      for (x = 0; x < W; x++) {
        /* two warped sine fields; their zero lines become slow molten ribbons */
        var s2 = Math.sin(colA[x] + rw) + Math.sin(rb + colW[x]) * .85, rib = Math.exp(-s2 * s2 * 3.4);
        var lv = ((rib * shade + colG[x] * gr + .04) * 4.4 + B[by * 4 + ((((ox + x * cw) / cell) | 0) & 3)] / 16 - .5) | 0;
        if (lv < 0) lv = 0; else if (lv > 4) lv = 4;
        var c = pal[lv]; buf[i++] = c[0]; buf[i++] = c[1]; buf[i++] = c[2]; buf[i++] = 255;
      }
    }
    g.putImageData(img, 0, 0);
  }
  function loop() { timer = 0; if (!visible || document.hidden || reduce) return; draw(); timer = setTimeout(loop, window.MN_LITE ? 125 : 83) }
  function wake() { if (!timer && !reduce) loop() }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) wake() }).observe(win); else { visible = true; wake() }
  document.addEventListener('visibilitychange', wake);
  var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(size, 150) });
  addEventListener('themechange', colors);
  /* the desktop going full screen or back: redraw at the new size at once, so there is nothing to swap later */
  addEventListener('deskresize', function () { clearTimeout(rt); size() });
  size(); colors();
})();
