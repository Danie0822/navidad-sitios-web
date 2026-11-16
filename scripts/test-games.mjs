/* Propósito: pruebas unitarias de memoria (parejas/reinicio) y regalos (puntaje). */
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(resolve(root, "js/game-logic.js"), "utf8");
const sandbox = { globalThis: {} };
sandbox.globalThis = sandbox;
vm.runInNewContext(src, sandbox);
const G = sandbox.VillaGames;

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function run() {
  const deck = G.makeMemoryDeck(() => 0.1);
  assert(deck.length === 16, "mazo 16 cartas");
  const counts = {};
  deck.forEach((c) => {
    counts[c.symbol] = (counts[c.symbol] || 0) + 1;
  });
  Object.keys(counts).forEach((k) => assert(counts[k] === 2, "par de " + k));

  const bySymbol = {};
  deck.forEach((c, i) => {
    if (!bySymbol[c.symbol]) bySymbol[c.symbol] = [];
    bySymbol[c.symbol].push(i);
  });
  const symbol = Object.keys(bySymbol)[0];
  const [a, b] = bySymbol[symbol];
  const hit = G.resolveMemoryFlip({ deck, matched: {}, pairs: 0, attempts: 0 }, a, b);
  assert(hit.match === true, "acierto por ID");
  assert(hit.pairs === 1, "suma pareja");
  assert(hit.attempts === 1, "suma intento");

  const missIdx = deck.findIndex((c, i) => i !== a && c.symbol !== symbol);
  const miss = G.resolveMemoryFlip({ deck, matched: {}, pairs: 0, attempts: 0 }, a, missIdx);
  assert(miss.match === false, "fallo no suma pareja");
  assert(miss.pairs === 0, "parejas siguen 0");

  let gifts = G.createGiftsState();
  gifts.phase = "playing";
  gifts.active = 3;
  gifts.appearId = 7;
  gifts = G.captureGift(gifts, 3);
  assert(gifts.score === 1, "captura +1");
  const again = G.captureGift(gifts, 3);
  assert(again.score === 1, "no duplica en misma aparición");

  const wrong = G.captureGift(
    { phase: "playing", active: 2, appearId: 1, capturedId: null, score: 0 },
    5
  );
  assert(wrong.score === 0, "ventana incorrecta no suma");

  const restarted = G.restartGifts();
  assert(restarted.score === 0 && restarted.phase === "ready", "reinicio regalos");

  const w1 = G.pickGiftWindow(0, 9, () => 0);
  assert(w1 !== 0, "evita repetir ventana cuando puede");

  console.log("OK game tests (parejas, score, reinicio, captura atómica)");
}

run();
