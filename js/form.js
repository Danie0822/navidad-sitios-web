/* Propósito: formulario de tarjetas, vista previa y descarga PNG 1080. */

(function () {
  "use strict";

  var form = document.getElementById("tarjeta-form");
  var previewHost = document.getElementById("card-preview-live");
  var exportHost = document.getElementById("card-export");
  var scaleBox = document.getElementById("card-preview-frame");
  if (!form || !previewHost || !exportHost || !globalThis.VillaCards || !globalThis.VillaCardPreview) {
    return;
  }

  var Cards = globalThis.VillaCards;
  var Preview = globalThis.VillaCardPreview;
  var destEl = document.getElementById("dest");
  var msgEl = document.getElementById("msg");
  var plantillaInput = document.getElementById("plantilla");
  var downloadBtn = document.getElementById("download-png");
  var help = document.getElementById("download-help");
  var ready = document.getElementById("png-ready");
  var countDest = document.getElementById("count-dest");
  var countMsg = document.getElementById("count-msg");
  var pauseBtn = document.getElementById("preview-pause");
  var overflow = false;
  var exporting = false;
  var editing = false;
  var paused = false;

  form.setAttribute("novalidate", "novalidate");

  function data() {
    return {
      destinatario: Cards.clampText(destEl.value, Cards.HARD_DEST),
      mensaje: Cards.clampText(msgEl.value, Cards.HARD_MSG),
      plantilla: plantillaInput.value || "villa",
    };
  }

  function setPlantilla(id) {
    plantillaInput.value = id;
    document.querySelectorAll(".template-pick").forEach(function (btn) {
      var on = btn.getAttribute("data-template") === id;
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.classList.toggle("is-selected", on);
    });
    refresh();
  }

  function updateCounters() {
    if (countDest) {
      countDest.textContent =
        destEl.value.length +
        "/" +
        Cards.HARD_DEST +
        (destEl.value.length > Cards.GUIDE_DEST ? " · guía sugerida 40" : "");
    }
    if (countMsg) {
      countMsg.textContent =
        msgEl.value.length +
        "/" +
        Cards.HARD_MSG +
        (msgEl.value.length > Cards.GUIDE_MSG ? " · guía sugerida 200" : "");
    }
  }

  function applyZoom() {
    if (!scaleBox) return;
    var zoom = scaleBox.clientWidth / 1080;
    var inner = scaleBox.querySelector(".card-scale");
    if (inner) {
      inner.style.width = "1080px";
      inner.style.height = "1080px";
      inner.style.zoom = String(zoom);
    }
  }

  /** Actualiza preview, miniaturas y estado del botón de descarga. */
  function refresh() {
    var d = data();
    Preview.renderCard(previewHost, d, "preview");
    Preview.renderCard(exportHost, d, "export");
    document.querySelectorAll(".thumb-art").forEach(function (wrap) {
      var id = wrap.getAttribute("data-thumb");
      var node = wrap.querySelector(".card-art");
      if (!node) {
        node = document.createElement("div");
        wrap.appendChild(node);
      }
      Preview.renderCard(node, { destinatario: "", mensaje: "", plantilla: id }, "thumb");
    });
    document.querySelectorAll(".template-pick").forEach(function (btn) {
      var mark = btn.querySelector(".chosen-mark");
      if (mark) mark.hidden = btn.getAttribute("aria-pressed") !== "true";
    });
    applyZoom();
    checkOverflow();
    updateDownloadState();
    if (ready) ready.hidden = true;
  }

  function checkOverflow() {
    overflow = Preview.cardTextOverflows(exportHost);
    if (scaleBox) scaleBox.setAttribute("data-fits", overflow ? "false" : "true");
  }

  function updateDownloadState() {
    var d = data();
    var missing = !d.destinatario.trim() || !d.mensaje.trim();
    var can = !missing && !overflow && !exporting;
    if (downloadBtn) downloadBtn.disabled = !can;
    if (help) {
      if (missing) help.textContent = "Escribí destinatario y mensaje para descargar.";
      else if (overflow)
        help.textContent =
          "El texto no entra en el área segura de esta plantilla. Conservamos lo que escribiste; acortá o cambiá de diseño para descargar.";
      else if (exporting) help.textContent = "Preparando PNG…";
      else help.textContent = "Descarga solo la tarjeta, sin chrome ni animación.";
      if (overflow) help.setAttribute("role", "status");
      else help.removeAttribute("role");
    }
  }

  /** Genera y descarga el PNG 1080×1080 de la tarjeta. */
  async function handleExport() {
    var d = data();
    var missing = !d.destinatario.trim() || !d.mensaje.trim();
    if (missing || exporting) {
      updateDownloadState();
      return;
    }
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    await new Promise(function (r) {
      requestAnimationFrame(function () {
        requestAnimationFrame(r);
      });
    });
    if (Preview.cardTextOverflows(exportHost)) {
      overflow = true;
      updateDownloadState();
      return;
    }
    try {
      exporting = true;
      updateDownloadState();
      var toPng = globalThis.HtmlToImage && globalThis.HtmlToImage.toPng;
      if (!toPng) throw new Error("html-to-image no disponible");
      var dataUrl = await toPng(exportHost, {
        cacheBust: true,
        pixelRatio: 1,
        width: 1080,
        height: 1080,
        canvasWidth: 1080,
        canvasHeight: 1080,
        skipFonts: false,
        style: {
          transform: "none",
          width: "1080px",
          height: "1080px",
          left: "0",
          top: "0",
          position: "static",
          opacity: "1",
        },
      });
      var a = document.createElement("a");
      a.href = dataUrl;
      a.download = Cards.downloadFileName(d.plantilla);
      a.click();
      if (ready) ready.hidden = false;
    } catch (err) {
      console.error(err);
      if (help) help.textContent = "No se pudo exportar. Probá de nuevo; tus textos se conservan.";
    } finally {
      exporting = false;
      updateDownloadState();
    }
  }

  document.querySelectorAll(".template-pick").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setPlantilla(btn.getAttribute("data-template"));
    });
  });

  ["input", "change"].forEach(function (evt) {
    form.addEventListener(evt, function () {
      destEl.value = Cards.clampText(destEl.value, Cards.HARD_DEST);
      msgEl.value = Cards.clampText(msgEl.value, Cards.HARD_MSG);
      updateCounters();
      refresh();
    });
  });

  destEl.addEventListener("focus", function () {
    editing = true;
    syncMotion();
  });
  msgEl.addEventListener("focus", function () {
    editing = true;
    syncMotion();
  });
  destEl.addEventListener("blur", function () {
    editing = false;
    syncMotion();
  });
  msgEl.addEventListener("blur", function () {
    editing = false;
    syncMotion();
  });

  function syncMotion() {
    var freeze = paused || editing;
    if (scaleBox) scaleBox.setAttribute("data-motion", freeze ? "paused" : "play");
  }

  if (pauseBtn) {
    pauseBtn.addEventListener("click", function () {
      paused = !paused;
      pauseBtn.setAttribute("aria-pressed", paused ? "true" : "false");
      pauseBtn.textContent = paused ? "Continuar animación" : "Pausar animación";
      syncMotion();
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    void handleExport();
  });
  if (downloadBtn) {
    downloadBtn.addEventListener("click", function () {
      void handleExport();
    });
  }

  if (window.ResizeObserver && scaleBox) {
    new ResizeObserver(applyZoom).observe(scaleBox);
  }

  document.querySelectorAll(".thumb-art").forEach(function (wrap) {
    if (!wrap.querySelector(".card-art")) {
      var node = document.createElement("div");
      wrap.appendChild(node);
    }
  });

  setPlantilla(plantillaInput.value || "villa");
  updateCounters();
  syncMotion();
  refresh();
})();
