/* Propósito: taller de tarjetas — plantillas, vista previa en vivo y descarga PNG por canvas. */

(function () {
  "use strict";

  var form = document.getElementById("tarjeta-form");
  var canvas = document.getElementById("card-canvas");
  if (!form || !canvas || !globalThis.VillaCards) return;

  var Cards = globalThis.VillaCards;
  var nombre = document.getElementById("destinatario");
  var mensaje = document.getElementById("mensaje");
  var nieve = document.getElementById("opt-nieve");
  var firma = document.getElementById("opt-firma");
  var downloadBtn = document.getElementById("download-png");
  var help = document.getElementById("download-help");
  var ready = document.getElementById("png-ready");
  var countDest = document.getElementById("count-dest");
  var countMsg = document.getElementById("count-msg");
  var plantillaInput = document.getElementById("plantilla");
  var templateLinks = document.querySelectorAll("[data-template]");

  form.setAttribute("novalidate", "novalidate");

  function currentData() {
    return {
      destinatario: Cards.clampText(nombre.value, Cards.HARD_DEST),
      mensaje: Cards.clampText(mensaje.value, Cards.HARD_MSG),
      plantilla: plantillaInput.value || "villa",
      nieve: !!(nieve && nieve.checked),
      firma: !!(firma && firma.checked),
    };
  }

  function setPlantilla(id) {
    plantillaInput.value = id;
    templateLinks.forEach(function (link) {
      var selected = link.getAttribute("data-template") === id;
      link.setAttribute("aria-pressed", selected ? "true" : "false");
      link.classList.toggle("is-selected", selected);
    });
    redraw();
  }

  function updateCounters() {
    if (countDest) {
      countDest.textContent =
        nombre.value.length +
        "/" +
        Cards.HARD_DEST +
        (nombre.value.length > Cards.GUIDE_DEST ? " · guía sugerida 40" : "");
    }
    if (countMsg) {
      countMsg.textContent =
        mensaje.value.length +
        "/" +
        Cards.HARD_MSG +
        (mensaje.value.length > Cards.GUIDE_MSG ? " · guía sugerida 200" : "");
    }
  }

  /** Redibuja la vista previa en el canvas. */
  function redraw() {
    var data = currentData();
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = Cards.SIZE;
    canvas.height = Cards.SIZE;
    Cards.drawCard(ctx, data);
    if (ready) ready.hidden = true;
    updateDownloadState();
  }

  function updateDownloadState() {
    var data = currentData();
    var errors = Cards.validateCard(data);
    var missing = !!(errors.destinatario || errors.mensaje);
    if (downloadBtn) downloadBtn.disabled = missing;
    if (help) {
      help.textContent = missing
        ? "Escribí destinatario y mensaje para descargar."
        : "Descarga solo la tarjeta PNG 1080×1080, sin chrome.";
    }
  }

  function clearErrors() {
    form.querySelectorAll(".field-error").forEach(function (el) {
      el.classList.remove("field-error");
    });
    form.querySelectorAll(".form-error").forEach(function (el) {
      el.classList.remove("is-visible");
      el.textContent = "";
    });
  }

  function showError(fieldId, message) {
    var field = document.getElementById(fieldId);
    var err = document.getElementById("error-" + fieldId);
    if (field) field.classList.add("field-error");
    if (err) {
      err.textContent = message;
      err.classList.add("is-visible");
    }
  }

  function downloadPng() {
    clearErrors();
    var data = currentData();
    var errors = Cards.validateCard(data);
    if (errors.destinatario || errors.mensaje) {
      if (errors.destinatario) showError("destinatario", errors.destinatario);
      if (errors.mensaje) showError("mensaje", errors.mensaje);
      var first = form.querySelector(".field-error");
      if (first) first.focus();
      updateDownloadState();
      return;
    }

    var url = Cards.exportPngDataUrl(canvas, data);
    if (!url) {
      if (help) help.textContent = "No se pudo exportar. Probá de nuevo.";
      return;
    }
    var a = document.createElement("a");
    a.href = url;
    a.download = Cards.downloadFileName(data.plantilla);
    a.click();
    if (ready) ready.hidden = false;
  }

  templateLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      setPlantilla(link.getAttribute("data-template"));
    });
  });

  ["input", "change"].forEach(function (evt) {
    form.addEventListener(evt, function () {
      if (nombre.value.length > Cards.HARD_DEST) {
        nombre.value = Cards.clampText(nombre.value, Cards.HARD_DEST);
      }
      if (mensaje.value.length > Cards.HARD_MSG) {
        mensaje.value = Cards.clampText(mensaje.value, Cards.HARD_MSG);
      }
      updateCounters();
      redraw();
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    downloadPng();
  });

  if (downloadBtn) {
    downloadBtn.addEventListener("click", function () {
      downloadPng();
    });
  }

  form.addEventListener("reset", function () {
    window.setTimeout(function () {
      clearErrors();
      setPlantilla("villa");
      updateCounters();
      redraw();
    }, 0);
  });

  setPlantilla(plantillaInput.value || "villa");
  updateCounters();
  redraw();
})();
