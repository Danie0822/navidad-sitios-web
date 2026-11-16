/* Propósito: pruebas unitarias de validación del taller (paridad React CardEditor). */
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(resolve(root, "js/card-logic.js"), "utf8");
const sandbox = { globalThis: {} };
sandbox.globalThis = sandbox;
vm.runInNewContext(src, sandbox);
const Cards = sandbox.VillaCards;

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function run() {
  const empty = Cards.validateCard({ destinatario: "", mensaje: "" });
  assert(empty.destinatario, "exige destinatario");
  assert(empty.mensaje, "exige mensaje");

  const ok = Cards.validateCard({
    destinatario: "Ana",
    mensaje: "Felices fiestas para vos",
  });
  assert(!ok.destinatario && !ok.mensaje, "formulario válido");

  assert(Cards.downloadFileName("bosque") === "tarjeta-navidad-bosque.png", "nombre PNG");
  assert(Cards.clampText("abcdef", 3) === "abc", "clamp texto");
  assert(Cards.HARD_DEST === 120 && Cards.HARD_MSG === 600, "límites React");

  console.log("OK card tests (validación, clamp, límites React)");
}

run();
