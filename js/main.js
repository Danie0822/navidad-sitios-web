/* Propósito: menú hamburguesa, modo oscuro persistente y cuenta regresiva a Navidad. */

(function () {
  "use strict";

  initDarkMode();
  initMenu();
  initCountdown();

  /** Aplica y guarda el tema claro/oscuro en localStorage. */
  function initDarkMode() {
    var root = document.documentElement;
    var key = "villa-navidad-theme";
    var btn = document.getElementById("theme-toggle");
    var saved = localStorage.getItem(key);
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme = saved || (prefersDark ? "dark" : "light");

    applyTheme(theme);

    if (!btn) return;

    btn.addEventListener("click", function () {
      var next = root.classList.contains("dark") ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem(key, next);
    });

    function applyTheme(mode) {
      if (mode === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
      if (btn) {
        btn.setAttribute("aria-pressed", mode === "dark" ? "true" : "false");
        btn.setAttribute(
          "aria-label",
          mode === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
        );
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

  /** Contador regresivo a la próxima Navidad (25/dic; todo el 25 muestra Feliz Navidad). */
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
        /* Excepción PO aprobada: formato 25/12 (es-AR), no el 12/25 de React. */
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
