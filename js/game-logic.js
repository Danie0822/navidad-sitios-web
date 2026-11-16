/* Propósito: lógica pura de memoria (parejas) y regalos escondidos (puntaje/reinicio). */

(function (global) {
  "use strict";

  var MEMORY_SYMBOLS = [
    { id: "regalo", label: "regalo" },
    { id: "campana", label: "campana" },
    { id: "baston", label: "bastón de caramelo" },
    { id: "guante", label: "guante" },
    { id: "estrella", label: "estrella de cinco puntas" },
    { id: "luna", label: "luna creciente" },
    { id: "media", label: "media" },
    { id: "casa", label: "casa" },
  ];

  function shuffle(items, rng) {
    var next = items.slice();
    var random = rng || Math.random;
    for (var i = next.length - 1; i > 0; i--) {
      var j = Math.floor(random() * (i + 1));
      var tmp = next[i];
      next[i] = next[j];
      next[j] = tmp;
    }
    return next;
  }

  /** Arma el mazo de 16 cartas (8 pares) y lo mezcla. */
  function makeMemoryDeck(rng) {
    var pairs = [];
    MEMORY_SYMBOLS.forEach(function (s) {
      pairs.push({ symbol: s.id });
      pairs.push({ symbol: s.id });
    });
    return shuffle(pairs, rng).map(function (c, i) {
      return { uid: i + 1, symbol: c.symbol };
    });
  }

  /** Compara dos cartas abiertas y actualiza parejas e intentos. */
  function resolveMemoryFlip(state, a, b) {
    var deck = state.deck;
    var matched = {};
    Object.keys(state.matched || {}).forEach(function (k) {
      matched[k] = true;
    });
    var attempts = (state.attempts || 0) + 1;
    var pairs = state.pairs || 0;
    var match = false;
    if (a !== b && deck[a] && deck[b] && deck[a].symbol === deck[b].symbol) {
      matched[deck[a].symbol] = true;
      pairs += 1;
      match = true;
    }
    return {
      match: match,
      pairs: pairs,
      attempts: attempts,
      matched: matched,
      finished: pairs === 8,
    };
  }

  function createGiftsState() {
    return {
      phase: "ready",
      score: 0,
      seconds: 30,
      active: null,
      lastWindow: null,
      appearId: 0,
      capturedId: null,
    };
  }

  /** Suma un punto si se tocó la ventana con el regalo activo. */
  function captureGift(state, index) {
    if (state.phase !== "playing") return state;
    if (state.active !== index) return state;
    if (state.capturedId === state.appearId) return state;
    return Object.assign({}, state, {
      score: state.score + 1,
      capturedId: state.appearId,
      active: null,
    });
  }

  function pickGiftWindow(lastWindow, windows, rng) {
    var n = windows || 9;
    var random = rng || Math.random;
    var next = Math.floor(random() * n);
    if (lastWindow != null && n > 1) {
      var guard = 0;
      while (next === lastWindow && guard++ < 8) next = Math.floor(random() * n);
      if (next === lastWindow) next = (next + 1) % n;
    }
    return next;
  }

  function restartGifts() {
    return createGiftsState();
  }

  global.VillaGames = {
    MEMORY_SYMBOLS: MEMORY_SYMBOLS,
    shuffle: shuffle,
    makeMemoryDeck: makeMemoryDeck,
    resolveMemoryFlip: resolveMemoryFlip,
    createGiftsState: createGiftsState,
    captureGift: captureGift,
    pickGiftWindow: pickGiftWindow,
    restartGifts: restartGifts,
    ROUND_MS: 30000,
    APPEAR_MS: 1800,
    GAP_MS: 350,
    WINDOWS: 9,
  };
})(typeof globalThis !== "undefined" ? globalThis : window);
