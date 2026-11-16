/* Propósito: pruebas unitarias de validación y nombre PNG del taller de tarjetas. */
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

  const short = Cards.validateCard({ destinatario: "A", mensaje: "hola" });
  assert(short.destinatario, "nombre corto");
  assert(short.mensaje, "mensaje corto");

  const ok = Cards.validateCard({
    destinatario: "Ana",
    mensaje: "Felices fiestas para vos",
  });
  assert(!ok.destinatario && !ok.mensaje, "formulario válido sin errores");

  assert(Cards.downloadFileName("bosque") === "tarjeta-navidad-bosque.png", "nombre PNG");
  assert(Cards.clampText("abcdef", 3) === "abc", "clamp texto");

  // Mock mínimo de canvas 2D para verificar data URL PNG
  const calls = [];
  const fakeCtx = {
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
    font: "",
    textAlign: "center",
    fillRect() {
      calls.push("fillRect");
    },
    beginPath() {},
    moveTo() {},
    lineTo() {},
    quadraticCurveTo() {},
    bezierCurveTo() {},
    closePath() {},
    fill() {
      calls.push("fill");
    },
    stroke() {},
    save() {},
    restore() {},
    translate() {},
    scale() {},
    arc() {},
    arcTo() {},
    ellipse() {},
    measureText(t) {
      return { width: String(t).length * 20 };
    },
    fillText() {
      calls.push("fillText");
    },
  };
  const fakeCanvas = {
    width: 0,
    height: 0,
    getContext() {
      return fakeCtx;
    },
    toDataURL(type) {
      assert(type === "image/png", "tipo PNG");
      return "data:image/png;base64,AAA";
    },
  };

  const url = Cards.exportPngDataUrl(fakeCanvas, {
    destinatario: "Daniel",
    mensaje: "¡Feliz Navidad!",
    plantilla: "villa",
    nieve: true,
    firma: true,
  });
  assert(url.startsWith("data:image/png"), "exporta data URL PNG");
  assert(fakeCanvas.width === 1080 && fakeCanvas.height === 1080, "canvas 1080");
  assert(calls.includes("fillText"), "dibujó texto");
  assert(calls.includes("fillRect"), "dibujó fondo");

  console.log("OK card tests (validación, clamp, export PNG mock)");
}

run();
