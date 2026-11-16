/* Propósito: menú hamburguesa, foco del H1 y cuenta regresiva a Navidad. */

(function () {
  "use strict";

  initMenu();
  initFocusHeading();
  initCountdown();

  /** Enfoca el H1 visible al cargar (sin desplazar la página). */
  function initFocusHeading() {
    var headings = document.querySelectorAll("main h1[tabindex='-1']");
    var target = null;
    for (var i = 0; i < headings.length; i++) {
      var h = headings[i];
      var section = h.closest("section");
      if (section && section.hidden) continue;
      target = h;
      break;
    }
    if (!target) return;
    try {
      target.focus({ preventScroll: true, focusVisible: true });
    } catch (err) {
      try {
        target.focus({ preventScroll: true });
      } catch (err2) {
        target.focus();
      }
    }
  }

  /** Menú hamburguesa con aria-expanded, Escape y foco. */
  function initMenu() {
    var toggle = document.getElementById("menu-toggle");
    var panel = document.getElementById("nav-links");
    if (!toggle || !panel) return;

    function setOpen(next) {
      toggle.setAttribute("aria-expanded", next ? "true" : "false");
      panel.classList.toggle("is-open", next);
      if (next) {
        var first = panel.querySelector("a");
        if (first) first.focus();
      } else {
        toggle.focus();
      }
    }

    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      setOpen(!open);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      if (toggle.getAttribute("aria-expanded") !== "true") return;
      setOpen(false);
    });

    panel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setOpen(false);
      });
    });
  }

  /** Cuenta regresiva a Navidad: actualiza el panel cada segundo. */
  function initCountdown() {
    var root = document.getElementById("countdown");
    if (!root) return;
    if (!globalThis.VillaCountdown) return;

    var elDays = document.getElementById("cd-days");
    var elHours = document.getElementById("cd-hours");
    var elMins = document.getElementById("cd-mins");
    var elSecs = document.getElementById("cd-secs");
    var elTarget = document.getElementById("cd-target");
    var elDone = document.getElementById("cd-done");

    function pad(n) {
      return String(n).padStart(2, "0");
    }

    function tick() {
      var state = globalThis.VillaCountdown.getCountdownState(new Date());

      if (elDays) elDays.textContent = pad(state.days);
      if (elHours) elHours.textContent = pad(state.hours);
      if (elMins) elMins.textContent = pad(state.minutes);
      if (elSecs) elSecs.textContent = pad(state.seconds);
      if (elTarget) {
        elTarget.textContent =
          "Objetivo " +
          state.target.toLocaleDateString("es-AR") +
          " 00:00 (hora local)";
      }
      if (elDone) {
        elDone.hidden = !state.isChristmasDay;
      }
    }

    tick();
    setInterval(tick, 1000);
  }
})();
