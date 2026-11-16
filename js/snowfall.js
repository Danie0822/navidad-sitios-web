/* Propósito: nieve continua confinada al arco (paridad React SnowfallBox). */

(function () {
  "use strict";

  function createLocalFlakes(n, w, h) {
    var flakes = [];
    for (var i = 0; i < n; i++) {
      flakes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: 1 + Math.random() * 2.2,
        speed: 22 + Math.random() * 28,
        swingAmp: 12 + Math.random() * 18,
        swingSpeed: 0.6 + Math.random() * 1.2,
        seed: Math.random() * Math.PI * 2,
      });
    }
    return flakes;
  }

  function drawFlake(ctx, x, y, r) {
    ctx.fillStyle = "rgba(255,250,240,0.92)";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function isFrozen() {
    return globalThis.VillaMotion ? globalThis.VillaMotion.freeze() : false;
  }

  function isReduced() {
    return globalThis.VillaMotion
      ? globalThis.VillaMotion.isReduced()
      : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function initSnowfall() {
    var host = document.getElementById("snowfall-host");
    var cnv = document.getElementById("snowfall-canvas");
    if (!host || !cnv) return;
    if (isReduced()) {
      cnv.remove();
      return;
    }

    var ctx = cnv.getContext("2d");
    if (!ctx) return;

    var dpr = Math.max(1, window.devicePixelRatio || 1);
    var running = true;
    var raf = 0;
    var w = 0;
    var h = 0;
    var inView = true;

    function sizeFromHost() {
      var rect = host.getBoundingClientRect();
      cnv.width = Math.floor(rect.width * dpr);
      cnv.height = Math.floor(rect.height * dpr);
      cnv.style.width = "100%";
      cnv.style.height = "100%";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      w = rect.width;
      h = rect.height;
    }

    sizeFromHost();
    var count = window.matchMedia("(max-width: 767px)").matches ? 8 : 18;
    var flakes = createLocalFlakes(count, w, h);

    if (typeof ResizeObserver !== "undefined") {
      var ro = new ResizeObserver(function () {
        sizeFromHost();
      });
      ro.observe(host);
    }

    if (typeof IntersectionObserver !== "undefined") {
      var io = new IntersectionObserver(
        function (entries) {
          inView = entries[0] ? entries[0].isIntersecting : true;
        },
        { threshold: 0 }
      );
      io.observe(host);
    }

    var last = performance.now();
    function frame(t) {
      if (!running) return;
      var dt = Math.min(0.033, (t - last) / 1000);
      last = t;
      if (!isFrozen() && inView) {
        ctx.clearRect(0, 0, cnv.width, cnv.height);
        for (var i = 0; i < flakes.length; i++) {
          var f = flakes[i];
          f.y += f.speed * dt;
          f.x += Math.sin((t / 1000) * f.swingSpeed + f.seed) * f.swingAmp * dt;
          if (f.y > h + 8) {
            f.y = -8;
            f.x = Math.random() * w;
          }
          if (f.x < -8) f.x = w + 8;
          if (f.x > w + 8) f.x = -8;
          drawFlake(ctx, f.x, f.y, f.size);
        }
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    window.addEventListener("pagehide", function () {
      running = false;
      cancelAnimationFrame(raf);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSnowfall);
  } else {
    initSnowfall();
  }
})();
