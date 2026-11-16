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
    var saved = localStorage.getItem(key);
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme = saved || (prefersDark ? "dark" : "light");
    applyTheme(theme);

    var btn = document.getElementById("theme-toggle");
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

  /** Menú hamburguesa con aria-expanded. */
  function initMenu() {
    var toggle = document.getElementById("menu-toggle");
    var panel = document.getElementById("nav-links");
    if (!toggle || !panel) return;

    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      var next = !open;
      toggle.setAttribute("aria-expanded", next ? "true" : "false");
      panel.classList.toggle("is-open", next);
    });

    panel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false");
        panel.classList.remove("is-open");
      });
    });
  }

  /** Contador regresivo a la próxima Navidad (25/dic 00:00 local). */
  function initCountdown() {
    var root = document.getElementById("countdown");
    if (!root) return;

    var elDays = document.getElementById("cd-days");
    var elHours = document.getElementById("cd-hours");
    var elMins = document.getElementById("cd-mins");
    var elSecs = document.getElementById("cd-secs");
    var elTarget = document.getElementById("cd-target");
    var elDone = document.getElementById("cd-done");

    function nextChristmas(from) {
      var y = from.getFullYear();
      var target = new Date(y, 11, 25, 0, 0, 0, 0);
      if (from >= target) {
        target = new Date(y + 1, 11, 25, 0, 0, 0, 0);
      }
      return target;
    }

    function pad(n) {
      return String(n).padStart(2, "0");
    }

    function tick() {
      var now = new Date();
      var target = nextChristmas(now);
      var diff = Math.max(0, Math.floor((target - now) / 1000));
      var days = Math.floor(diff / 86400);
      var hours = Math.floor((diff % 86400) / 3600);
      var mins = Math.floor((diff % 3600) / 60);
      var secs = diff % 60;

      if (elDays) elDays.textContent = pad(days);
      if (elHours) elHours.textContent = pad(hours);
      if (elMins) elMins.textContent = pad(mins);
      if (elSecs) elSecs.textContent = pad(secs);
      if (elTarget) {
        elTarget.textContent =
          "Objetivo " + target.toLocaleDateString("es-AR") + " 00:00 (hora local)";
      }
      if (elDone) {
        elDone.hidden = diff !== 0;
      }
    }

    tick();
    setInterval(tick, 1000);
  }
})();
