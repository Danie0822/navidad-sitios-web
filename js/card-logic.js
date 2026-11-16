/* Propósito: validación y límites de texto del taller de tarjetas. */

(function (global) {
  "use strict";

  var GUIDE_DEST = 40;
  var GUIDE_MSG = 200;
  var HARD_DEST = 120;
  var HARD_MSG = 600;

  /** Recorta el texto al máximo permitido. */
  function clampText(value, max) {
    return String(value || "").slice(0, max);
  }

  /** Exige destinatario y mensaje no vacíos. */
  function validateCard(data) {
    var errors = {};
    var dest = (data.destinatario || "").trim();
    var msg = (data.mensaje || "").trim();
    if (!dest) errors.destinatario = "Escribí destinatario y mensaje para descargar.";
    if (!msg) errors.mensaje = "Escribí destinatario y mensaje para descargar.";
    return errors;
  }

  function downloadFileName(plantilla) {
    return "tarjeta-navidad-" + (plantilla || "villa") + ".png";
  }

  global.VillaCards = {
    GUIDE_DEST: GUIDE_DEST,
    GUIDE_MSG: GUIDE_MSG,
    HARD_DEST: HARD_DEST,
    HARD_MSG: HARD_MSG,
    clampText: clampText,
    validateCard: validateCard,
    downloadFileName: downloadFileName,
  };
})(typeof globalThis !== "undefined" ? globalThis : window);
