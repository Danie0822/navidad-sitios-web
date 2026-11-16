/* Propósito: pausa global de decoración (sesión, reduced-motion y visibilidad). */

(function () {
  "use strict";

  var paused = false;
  var reduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hidden = typeof document !== "undefined" ? document.hidden : false;
  var buttons = [];

  function freeze() {
    return paused || reduced || hidden;
  }

  function syncDataset() {
    document.documentElement.dataset.motion = freeze() ? "paused" : "play";
  }

  function syncButtons() {
    buttons.forEach(function (btn) {
      var play = btn.getAttribute("data-label-play") || "Pausar animaciones";
      var pause = btn.getAttribute("data-label-pause") || "Continuar animaciones";
      btn.setAttribute("aria-pressed", paused ? "true" : "false");
      btn.textContent = paused ? pause : play;
      btn.hidden = !!reduced;
    });
  }

  function setPaused(next) {
    paused = !!next;
    syncDataset();
    syncButtons();
    document.dispatchEvent(new CustomEvent("villa:motion", { detail: { freeze: freeze(), paused: paused } }));
  }

  function togglePaused() {
    setPaused(!paused);
  }

  function bindButton(btn) {
    if (!btn || buttons.indexOf(btn) !== -1) return;
    buttons.push(btn);
    btn.addEventListener("click", function () {
      togglePaused();
    });
  }

  function init() {
    document.querySelectorAll("[data-motion-pause]").forEach(bindButton);
    if (window.matchMedia) {
      var mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      var onMq = function () {
        reduced = mq.matches;
        syncDataset();
        syncButtons();
        document.dispatchEvent(
          new CustomEvent("villa:motion", { detail: { freeze: freeze(), paused: paused } })
        );
      };
      if (mq.addEventListener) mq.addEventListener("change", onMq);
      else if (mq.addListener) mq.addListener(onMq);
    }
    document.addEventListener("visibilitychange", function () {
      hidden = document.hidden;
      syncDataset();
      document.dispatchEvent(
        new CustomEvent("villa:motion", { detail: { freeze: freeze(), paused: paused } })
      );
    });
    syncDataset();
    syncButtons();
  }

  globalThis.VillaMotion = {
    freeze: freeze,
    isPaused: function () {
      return paused;
    },
    isReduced: function () {
      return reduced;
    },
    setPaused: setPaused,
    togglePaused: togglePaused,
    bindButton: bindButton,
    init: init,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
