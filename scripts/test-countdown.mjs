/* Propósito: pruebas unitarias del contador con reloj falso (24/25/26 dic). */
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(resolve(root, "js/countdown-logic.js"), "utf8");
const sandbox = { globalThis: {} };
sandbox.globalThis = sandbox;
vm.runInNewContext(src, sandbox);
const { getCountdownState } = sandbox.VillaCountdown;

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function run() {
  const y = 2026;

  // 24/12 23:59:59 → queda 1 s para Navidad 2026
  const eve = getCountdownState(new Date(y, 11, 24, 23, 59, 59));
  assert(!eve.isChristmasDay, "24/12 no es día de Navidad");
  assert(eve.totalSeconds === 1, "24/12 23:59:59 debe quedar 1 s, got " + eve.totalSeconds);
  assert(eve.target.getFullYear() === y, "target año 2026");

  // 25/12 00:00 → Feliz Navidad
  const midnight = getCountdownState(new Date(y, 11, 25, 0, 0, 0));
  assert(midnight.isChristmasDay, "25/12 00:00 debe ser Navidad");
  assert(midnight.totalSeconds === 0, "25/12 00:00 totalSeconds 0");
  assert(midnight.target.getFullYear() === y, "no debe saltar a 2027 a las 00:00");

  // 25/12 18:00 → sigue Feliz Navidad
  const afternoon = getCountdownState(new Date(y, 11, 25, 18, 0, 0));
  assert(afternoon.isChristmasDay, "25/12 18:00 debe ser Navidad");
  assert(afternoon.totalSeconds === 0, "25/12 18:00 totalSeconds 0");
  assert(afternoon.target.getFullYear() === y, "25/12 tarde sigue en 2026");

  // 26/12 → cuenta a 2027
  const boxing = getCountdownState(new Date(y, 11, 26, 0, 0, 0));
  assert(!boxing.isChristmasDay, "26/12 no es Navidad");
  assert(boxing.target.getFullYear() === y + 1, "26/12 apunta a 2027");
  assert(boxing.totalSeconds > 0, "26/12 debe tener segundos restantes");

  console.log("OK countdown tests (24/12 23:59:59, 25/12 00:00, 25/12 18:00, 26/12)");
}

run();
