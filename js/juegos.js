/* Propósito: catálogo de juegos, memoria y regalos escondidos. */

(function () {
  "use strict";

  if (!globalThis.VillaGames) return;
  var G = globalThis.VillaGames;

  initViews();
  initMemory();
  initGifts();

  /** Muestra catálogo, memoria o regalos según el hash de la URL. */
  function initViews() {
    var catalog = document.getElementById("view-catalog");
    var memoria = document.getElementById("view-memoria");
    var regalos = document.getElementById("view-regalos");
    if (!catalog || !memoria || !regalos) return;

    function show(view) {
      catalog.hidden = view !== "catalog";
      memoria.hidden = view !== "memoria";
      regalos.hidden = view !== "regalos";
      if (view === "memoria") {
        var h = document.getElementById("heading-memoria");
        if (h) h.focus();
      } else if (view === "regalos") {
        var hr = document.getElementById("heading-regalos");
        if (hr) hr.focus();
      } else {
        var from = sessionStorage.getItem("villa-from-game");
        var focusMem = document.getElementById("catalog-memoria");
        var focusReg = document.getElementById("catalog-regalos");
        if (from === "memoria" && focusMem) focusMem.focus();
        if (from === "regalos" && focusReg) focusReg.focus();
        sessionStorage.removeItem("villa-from-game");
      }
    }

    function route() {
      var hash = (location.hash || "").replace(/^#/, "");
      if (hash === "memoria") show("memoria");
      else if (hash === "regalos") show("regalos");
      else show("catalog");
    }

    document.querySelectorAll("[data-back]").forEach(function (link) {
      link.addEventListener("click", function () {
        sessionStorage.setItem("villa-from-game", link.getAttribute("data-back") || "");
      });
    });

    window.addEventListener("hashchange", route);
    route();
  }

  function symbolLabel(id) {
    var found = G.MEMORY_SYMBOLS.find(function (s) {
      return s.id === id;
    });
    return found ? found.label : id;
  }

  function iconSvg(id) {
    var paths = {
      regalo:
        '<rect x="-22" y="-13" width="44" height="36" rx="3" fill="#183C32"/><rect x="-26" y="-18" width="52" height="10" rx="2" fill="#183C32"/><rect x="-4" y="-18" width="8" height="41" fill="#E7B960"/><path d="M0 -18 C-29 -48 -34 -18 0 -18 C29 -48 34 -18 0 -18" stroke="#E7B960" stroke-width="5" fill="none"/>',
      campana:
        '<path d="M-23 14 Q-14 3 -14 -12 A14 14 0 0 1 14 -12 Q14 3 23 14 Z" fill="#E7B960" stroke="#183C32" stroke-width="3"/><circle cy="20" r="5" fill="#183C32"/><path d="M0 -31 V-25" stroke="#183C32" stroke-width="5"/>',
      baston:
        '<path d="M-5 28 V-16 C-5 -42 28 -37 23 -13" stroke="#183C32" stroke-width="13" fill="none"/><path d="M-10 -10 L0 -5 M-10 8 L0 13 M-10 24 L0 29 M3 -28 L12 -21" stroke="#FFFAF0" stroke-width="5"/>',
      guante:
        '<path d="M-18 16 V-19 Q-18 -34 -7 -32 Q2 -32 2 -20 V-4 L9 -14 Q18 -22 23 -12 Q27 -4 17 8 L8 23 H-18 Z" fill="#183C32"/><rect x="-22" y="16" width="34" height="13" rx="3" fill="#E7B960"/>',
      estrella:
        '<path d="M0 -30 L9 -10 L31 -8 L15 7 L20 29 L0 18 L-20 29 L-15 7 L-31 -8 L-9 -10 Z" fill="#E7B960" stroke="#183C32" stroke-width="2"/>',
      luna: '<path d="M15 -27 A30 30 0 1 0 28 17 A29 29 0 0 1 15 -27" fill="#E7B960"/>',
      media:
        '<path d="M-12 -25 H12 V9 Q29 13 24 26 Q20 37 6 31 L-14 22 Q-21 18 -12 4 Z" fill="#183C32"/><rect x="-17" y="-29" width="34" height="12" rx="3" fill="#FFFAF0"/>',
      casa:
        '<rect x="-22" y="-8" width="44" height="36" rx="2" fill="#EBDDC8"/><path d="M-30 -6 L0 -32 L30 -6 Z" fill="#183C32"/><rect x="-5" y="6" width="10" height="22" rx="2" fill="#E7B960"/><rect x="-16" y="-2" width="8" height="10" rx="1" fill="#E7B960"/><rect x="9" y="-2" width="8" height="10" rx="1" fill="#E7B960"/>',
    };
    return (
      '<svg viewBox="-36 -40 72 80" aria-hidden="true">' +
      (paths[id] || "") +
      "</svg>"
    );
  }

  /** Juego de memoria: voltear cartas, emparejar, pausar y reiniciar. */
  function initMemory() {
    var board = document.getElementById("memory-board");
    if (!board) return;

    var scoreEl = document.getElementById("memory-score");
    var liveEl = document.getElementById("memory-live");
    var winEl = document.getElementById("memory-win");
    var pauseBtn = document.getElementById("memory-pause");
    var resetBtn = document.getElementById("memory-reset");
    var againBtn = document.getElementById("memory-again");
    var pauseStatus = document.getElementById("memory-pause-status");

    var deck = [];
    var open = [];
    var matched = {};
    var pairs = 0;
    var attempts = 0;
    var lock = false;
    var paused = false;
    var closeTimer = null;

    function finished() {
      return pairs === 8;
    }

    function renderScore() {
      if (scoreEl) scoreEl.textContent = "Parejas " + pairs + "/8 · Intentos " + attempts;
      if (liveEl) {
        liveEl.textContent = finished()
          ? "¡Ocho parejas, una Navidad! " + attempts + " intentos."
          : paused
            ? "Partida pausada"
            : "Parejas " + pairs + " de 8. " + attempts + " intentos.";
      }
      if (winEl) winEl.hidden = !finished();
      if (document.getElementById("memory-attempts-final")) {
        document.getElementById("memory-attempts-final").textContent = attempts + " intentos.";
      }
    }

    function paint() {
      board.innerHTML = "";
      deck.forEach(function (card, idx) {
        var isMatched = !!matched[card.symbol];
        var isOpen = isMatched || open.indexOf(idx) !== -1;
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "memory-cell" + (isMatched ? " memory-hit" : "");
        btn.setAttribute("role", "gridcell");
        btn.setAttribute("data-symbol", card.symbol);
        btn.setAttribute("data-open", isOpen ? "true" : "false");
        btn.setAttribute("data-matched", isMatched ? "true" : "false");
        btn.setAttribute("aria-pressed", isOpen ? "true" : "false");
        btn.setAttribute(
          "aria-label",
          isOpen ? "Carta " + (idx + 1) + ", " + symbolLabel(card.symbol) : "Carta " + (idx + 1) + ", boca abajo"
        );
        btn.disabled = paused || finished() || (lock && !isOpen);
        btn.innerHTML =
          '<span class="memory-face">' +
          '<span class="memory-front" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3.2 Q12.8 8 16.8 8.8 Q12.8 9.6 12 14.4 Q11.2 9.6 7.2 8.8 Q11.2 8 12 3.2" fill="#E7B960"/></svg></span>' +
          '<span class="memory-back" aria-hidden="true">' +
          iconSvg(card.symbol) +
          "</span></span>";
        btn.addEventListener("click", function () {
          onCard(idx);
        });
        board.appendChild(btn);
      });
      renderScore();
    }

    function clearClose() {
      if (closeTimer) {
        window.clearTimeout(closeTimer);
        closeTimer = null;
      }
    }

    function reset() {
      clearClose();
      deck = G.makeMemoryDeck();
      open = [];
      matched = {};
      pairs = 0;
      attempts = 0;
      lock = false;
      paused = false;
      if (pauseBtn) {
        pauseBtn.setAttribute("aria-pressed", "false");
        pauseBtn.textContent = "Pausar";
      }
      if (pauseStatus) pauseStatus.hidden = true;
      paint();
    }

    function onCard(idx) {
      if (paused || finished() || lock) return;
      var card = deck[idx];
      if (!card || matched[card.symbol]) return;
      if (open.indexOf(idx) !== -1) return;
      if (open.length >= 2) return;

      open = open.concat([idx]);
      if (open.length < 2) {
        paint();
        return;
      }

      // Un intento = dos cartas; bloquear clics mientras se comparan.
      lock = true;
      paint();
      var result = G.resolveMemoryFlip(
        { deck: deck, matched: matched, pairs: pairs, attempts: attempts },
        open[0],
        open[1]
      );
      attempts = result.attempts;
      if (result.match) {
        matched = result.matched;
        pairs = result.pairs;
        open = [];
        lock = false;
        paint();
      } else {
        renderScore();
        closeTimer = window.setTimeout(function () {
          open = [];
          lock = false;
          paint();
        }, 1000);
      }
    }

    if (pauseBtn) {
      pauseBtn.addEventListener("click", function () {
        if (finished()) return;
        paused = !paused;
        pauseBtn.setAttribute("aria-pressed", paused ? "true" : "false");
        pauseBtn.textContent = paused ? "Continuar" : "Pausar";
        if (pauseStatus) pauseStatus.hidden = !paused;
        paint();
      });
    }
    if (resetBtn) resetBtn.addEventListener("click", reset);
    if (againBtn) againBtn.addEventListener("click", reset);

    reset();
  }

  /** Juego de regalos escondidos: ventanas, reloj y puntaje. */
  function initGifts() {
    var board = document.getElementById("gifts-board");
    if (!board) return;

    var readyPanel = document.getElementById("gifts-ready");
    var playPanel = document.getElementById("gifts-play");
    var scoreEl = document.getElementById("gifts-score");
    var resultEl = document.getElementById("gifts-result");
    var resultScore = document.getElementById("gifts-result-score");
    var caughtStatus = document.getElementById("gifts-caught");
    var pauseStatus = document.getElementById("gifts-pause-status");
    var startBtn = document.getElementById("gifts-start");
    var pauseBtn = document.getElementById("gifts-pause");
    var resetBtn = document.getElementById("gifts-reset");
    var againBtn = document.getElementById("gifts-again");

    var state = G.createGiftsState();
    var paused = false;
    var focusIdx = 0;
    var remainingRound = G.ROUND_MS;
    var remainingStep = 0;
    var stepKind = "appear";
    var stepTimer = null;
    var stepStarted = 0;
    var roundRaf = 0;
    var lastTick = null;
    var frozenRef = false;

    function setPhase(phase) {
      state.phase = phase;
      if (readyPanel) readyPanel.hidden = phase !== "ready";
      if (playPanel) playPanel.hidden = phase === "ready";
      if (resultEl) resultEl.hidden = phase !== "result";
      board.classList.toggle("is-idle", phase === "result");
    }

    function renderScore() {
      if (scoreEl) {
        scoreEl.textContent = "Tiempo " + state.seconds + "s · Regalos " + state.score;
      }
      if (resultScore) resultScore.textContent = "Atrapaste " + state.score + " regalos";
    }

    function paintWindows() {
      var buttons = board.querySelectorAll("[data-window]");
      buttons.forEach(function (btn) {
        var i = Number(btn.getAttribute("data-window"));
        var isOpen = state.active === i;
        var justCaught = btn.getAttribute("data-caught") === "true" && !isOpen;
        btn.setAttribute("data-open", isOpen ? "true" : "false");
        // Clase roja solo mientras el regalo está en esta ventana.
        btn.classList.toggle("is-gift-active", isOpen);
        btn.setAttribute(
          "aria-label",
          "Ventana " + (i + 1) + (isOpen ? ", con regalo" : ", cerrada")
        );
        btn.tabIndex = focusIdx === i ? 0 : -1;
        btn.disabled = state.phase !== "playing" || paused;
        if (!isOpen && !justCaught) btn.setAttribute("data-caught", "false");
      });
      renderScore();
    }

    function clearStep() {
      if (stepTimer) {
        window.clearTimeout(stepTimer);
        stepTimer = null;
      }
    }

    function stopRound() {
      if (roundRaf) cancelAnimationFrame(roundRaf);
      roundRaf = 0;
      lastTick = null;
      clearStep();
    }

    function endRound() {
      stopRound();
      state.active = null;
      state.appearId += 1;
      state.seconds = 0;
      setPhase("result");
      paintWindows();
    }

    function scheduleStep(kind, ms) {
      clearStep();
      stepKind = kind;
      remainingStep = ms;
      stepStarted = performance.now();
      stepTimer = window.setTimeout(function () {
        if (state.phase !== "playing") return;
        if (kind === "appear") {
          var w = G.pickGiftWindow(state.lastWindow, G.WINDOWS);
          state.lastWindow = w;
          state.capturedId = null;
          state.appearId += 1;
          if (caughtStatus) caughtStatus.hidden = true;
          board.querySelectorAll("[data-window]").forEach(function (b) {
            b.setAttribute("data-caught", "false");
          });
          state.active = w;
          paintWindows();
          scheduleStep("gap", G.APPEAR_MS);
        } else {
          state.active = null;
          paintWindows();
          scheduleStep("appear", G.GAP_MS);
        }
      }, ms);
    }

    function startRoundLoop() {
      var tick = function (t) {
        if (state.phase !== "playing") return;
        if (paused) {
          lastTick = null;
          roundRaf = requestAnimationFrame(tick);
          return;
        }
        if (lastTick == null) lastTick = t;
        var dt = t - lastTick;
        lastTick = t;
        remainingRound = Math.max(0, remainingRound - dt);
        var secs = Math.max(0, Math.ceil(remainingRound / 1000));
        if (secs !== state.seconds) {
          state.seconds = secs;
          renderScore();
        }
        if (remainingRound <= 0) {
          endRound();
          return;
        }
        roundRaf = requestAnimationFrame(tick);
      };
      roundRaf = requestAnimationFrame(tick);
    }

    function start() {
      stopRound();
      state = G.createGiftsState();
      state.phase = "playing";
      paused = false;
      frozenRef = false;
      remainingRound = G.ROUND_MS;
      remainingStep = 0;
      stepKind = "appear";
      if (pauseBtn) {
        pauseBtn.hidden = false;
        pauseBtn.setAttribute("aria-pressed", "false");
        pauseBtn.textContent = "Pausar";
      }
      if (pauseStatus) pauseStatus.hidden = true;
      if (caughtStatus) caughtStatus.hidden = true;
      setPhase("playing");
      paintWindows();
      scheduleStep("appear", 0);
      startRoundLoop();
      var first = board.querySelector('[data-window="0"]');
      if (first) first.focus();
    }

    function reset() {
      stopRound();
      state = G.restartGifts();
      paused = false;
      frozenRef = false;
      if (pauseBtn) pauseBtn.hidden = true;
      if (pauseStatus) pauseStatus.hidden = true;
      if (caughtStatus) caughtStatus.hidden = true;
      setPhase("ready");
      paintWindows();
    }

    function capture(index) {
      if (state.phase !== "playing" || paused || remainingRound <= 0) return;
      var next = G.captureGift(state, index);
      if (next.score === state.score) return;
      state = next;
      var btn = board.querySelector('[data-window="' + index + '"]');
      if (btn) btn.setAttribute("data-caught", "true");
      if (caughtStatus) caughtStatus.hidden = false;
      paintWindows();
      scheduleStep("appear", G.GAP_MS);
    }

    board.innerHTML = "";
    for (var i = 0; i < G.WINDOWS; i++) {
      (function (idx) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "window-btn";
        btn.setAttribute("role", "gridcell");
        btn.setAttribute("data-window", String(idx));
        btn.setAttribute("data-open", "false");
        btn.setAttribute("data-caught", "false");
        btn.tabIndex = idx === 0 ? 0 : -1;
        btn.innerHTML =
          '<span class="window-num">' +
          (idx + 1) +
          "</span>" +
          '<span class="window-inner">' +
          '<span class="window-shutter window-shutter-l" aria-hidden="true"></span>' +
          '<span class="window-shutter window-shutter-r" aria-hidden="true"></span>' +
          '<span class="window-gift" aria-hidden="true">' +
          '<svg width="36" height="36" viewBox="-28 -28 56 56"><rect x="-18" y="-8" width="36" height="28" rx="3" fill="#E7B960"/><rect x="-21" y="-14" width="42" height="8" rx="2" fill="#EBDDC8"/><rect x="-3" y="-14" width="6" height="34" fill="#FFFAF0"/><path d="M0 -14 C-16 -32 -20 -12 0 -14 C16 -32 20 -12 0 -14" stroke="#FFFAF0" stroke-width="3" fill="none"/></svg>' +
          "</span></span>";
        btn.addEventListener("focus", function () {
          focusIdx = idx;
        });
        btn.addEventListener("click", function () {
          capture(idx);
        });
        board.appendChild(btn);
      })(i);
    }

    board.addEventListener("keydown", function (e) {
      var keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Enter", " ", "Escape"];
      var digit = e.key >= "1" && e.key <= "9";
      if (keys.indexOf(e.key) === -1 && !digit) return;
      if (e.key === "Escape") {
        if (state.phase === "playing" && pauseBtn) pauseBtn.click();
        return;
      }
      e.preventDefault();
      if (digit) {
        var di = Number(e.key) - 1;
        focusIdx = di;
        capture(di);
        return;
      }
      if (e.key === "Enter" || e.key === " ") {
        capture(focusIdx);
        return;
      }
      var col = focusIdx % 3;
      var row = Math.floor(focusIdx / 3);
      var next = focusIdx;
      if (e.key === "ArrowLeft") next = row * 3 + Math.max(0, col - 1);
      if (e.key === "ArrowRight") next = row * 3 + Math.min(2, col + 1);
      if (e.key === "ArrowUp") next = Math.max(0, row - 1) * 3 + col;
      if (e.key === "ArrowDown") next = Math.min(2, row + 1) * 3 + col;
      focusIdx = next;
      var el = board.querySelector('[data-window="' + next + '"]');
      if (el) el.focus();
    });

    if (startBtn) startBtn.addEventListener("click", start);
    if (againBtn) againBtn.addEventListener("click", start);
    if (resetBtn) resetBtn.addEventListener("click", reset);
    if (pauseBtn) {
      pauseBtn.addEventListener("click", function () {
        if (state.phase !== "playing") return;
        paused = !paused;
        frozenRef = paused;
        pauseBtn.setAttribute("aria-pressed", paused ? "true" : "false");
        pauseBtn.textContent = paused ? "Continuar" : "Pausar";
        if (pauseStatus) pauseStatus.hidden = !paused;
        if (paused) {
          if (stepTimer) {
            remainingStep = Math.max(0, remainingStep - (performance.now() - stepStarted));
            clearStep();
          }
        } else if (!stepTimer) {
          scheduleStep(stepKind, Math.max(0, remainingStep));
        }
        paintWindows();
      });
    }

    reset();
  }
})();
