/* Propósito: lógica pura del taller de tarjetas (validación + dibujo canvas 1080² PNG). */

(function (global) {
  "use strict";

  var SIZE = 1080;
  var GUIDE_DEST = 40;
  var GUIDE_MSG = 200;
  var HARD_DEST = 120;
  var HARD_MSG = 600;

  var TEMPLATES = [
    { id: "villa", label: "Villa" },
    { id: "bosque", label: "Bosque" },
    { id: "regalos", label: "Regalos" },
  ];

  function clampText(value, max) {
    return String(value || "").slice(0, max);
  }

  /** Valida destinatario y mensaje; devuelve errores por campo. */
  function validateCard(data) {
    var errors = {};
    var dest = (data.destinatario || "").trim();
    var msg = (data.mensaje || "").trim();
    if (!dest) errors.destinatario = "Escribí a quién va dirigida la tarjeta.";
    else if (dest.length < 2) errors.destinatario = "El nombre debe tener al menos 2 caracteres.";
    if (!msg) errors.mensaje = "Contanos un mensaje para acompañar la tarjeta.";
    else if (msg.length < 10) errors.mensaje = "El mensaje necesita al menos 10 caracteres.";
    return errors;
  }

  function wrapLines(ctx, text, maxWidth) {
    var paragraphs = String(text || "").split("\n");
    var lines = [];
    paragraphs.forEach(function (para) {
      var words = para.split(/\s+/).filter(Boolean);
      if (!words.length) {
        lines.push("");
        return;
      }
      var line = words[0];
      for (var i = 1; i < words.length; i++) {
        var trial = line + " " + words[i];
        if (ctx.measureText(trial).width <= maxWidth) line = trial;
        else {
          lines.push(line);
          line = words[i];
        }
      }
      lines.push(line);
    });
    return lines;
  }

  function drawSnow(ctx, seed) {
    var rng = mulberry32(seed || 1);
    ctx.fillStyle = "rgba(255,250,240,0.85)";
    for (var i = 0; i < 48; i++) {
      var x = rng() * SIZE;
      var y = rng() * SIZE;
      var r = 1.2 + rng() * 2.8;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function drawVilla(ctx) {
    ctx.fillStyle = "#70232F";
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = "#E9DAC3";
    ctx.beginPath();
    ctx.moveTo(0, 896);
    ctx.quadraticCurveTo(270, 783, 648, 891);
    ctx.quadraticCurveTo(900, 960, 1080, 870);
    ctx.lineTo(1080, 1080);
    ctx.lineTo(0, 1080);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#E7B960";
    [[81, 95], [913, 203], [203, 702], [953, 675]].forEach(function (p) {
      star(ctx, p[0], p[1], 14);
    });

    ctx.save();
    ctx.translate(216, 910);
    ctx.scale(3.1, 3.1);
    roundRect(ctx, -22, -8, 44, 36, 2, "#B85B4E");
    ctx.fillStyle = "#183C32";
    ctx.beginPath();
    ctx.moveTo(-30, -6);
    ctx.lineTo(0, -32);
    ctx.lineTo(30, -6);
    ctx.closePath();
    ctx.fill();
    roundRect(ctx, -5, 6, 10, 22, 2, "#E7B960");
    roundRect(ctx, -16, -2, 8, 10, 1, "#E7B960");
    roundRect(ctx, 9, -2, 8, 10, 1, "#E7B960");
    ctx.restore();

    ctx.save();
    ctx.translate(859, 910);
    ctx.scale(1.22, 1.22);
    ctx.fillStyle = "#8C694B";
    ctx.fillRect(-5, 0, 10, 20);
    ctx.fillStyle = "#183C32";
    ctx.beginPath();
    ctx.moveTo(0, -138);
    ctx.lineTo(35, -66);
    ctx.lineTo(22, -66);
    ctx.lineTo(55, -15);
    ctx.lineTo(38, -15);
    ctx.lineTo(66, 23);
    ctx.lineTo(-66, 23);
    ctx.lineTo(-38, -15);
    ctx.lineTo(-55, -15);
    ctx.lineTo(-22, -66);
    ctx.lineTo(-35, -66);
    ctx.closePath();
    ctx.fill();
    star(ctx, 0, -145, 12);
    ctx.fillStyle = "#E7B960";
    [[-12, -68], [17, -30], [-30, 2], [32, 12]].forEach(function (p) {
      ctx.beginPath();
      ctx.arc(p[0], p[1], 4, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function drawBosque(ctx) {
    ctx.fillStyle = "#FFFAF0";
    ctx.fillRect(0, 0, SIZE, SIZE);
    cornerBranch(ctx, 76, 76, 1, 1);
    cornerBranch(ctx, 1004, 76, -1, 1);
    cornerBranch(ctx, 76, 1004, 1, -1);
    cornerBranch(ctx, 1004, 1004, -1, -1);
  }

  function cornerBranch(ctx, x, y, sx, sy) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sx, sy);
    ctx.strokeStyle = "#183C32";
    ctx.lineWidth = 11;
    ctx.beginPath();
    ctx.moveTo(0, 284);
    ctx.quadraticCurveTo(27, 40, 270, 0);
    ctx.stroke();
    ctx.fillStyle = "#183C32";
    var leaves = [
      [22, 200],
      [62, 162],
      [103, 124],
      [143, 86],
      [184, 49],
    ];
    leaves.forEach(function (p) {
      ctx.beginPath();
      ctx.ellipse(p[0] - 10, p[1] - 20, 28, 18, -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(p[0] + 18, p[1] - 28, 24, 16, 0.4, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = "#A72C36";
    ctx.beginPath();
    ctx.arc(76, 81, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(108, 57, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawRegalos(ctx) {
    ctx.fillStyle = "#183C32";
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = "#A72C36";
    ctx.fillRect(0, 92, SIZE, 35);
    ctx.fillRect(797, 0, 35, SIZE);
    ctx.strokeStyle = "#A72C36";
    ctx.lineWidth = 32;
    ctx.beginPath();
    ctx.moveTo(814, 113);
    ctx.bezierCurveTo(617, -51, 608, 154, 814, 113);
    ctx.bezierCurveTo(997, -59, 1021, 146, 814, 113);
    ctx.stroke();
    giftBox(ctx, 197, 915, 3.5);
    giftBox(ctx, 378, 980, 1.9);
    star(ctx, 913, 815, 28);
  }

  function giftBox(ctx, x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    roundRect(ctx, -22, -13, 44, 36, 3, "#A72C36");
    roundRect(ctx, -26, -18, 52, 10, 2, "#A72C36");
    ctx.fillStyle = "#E7B960";
    ctx.fillRect(-4, -18, 8, 41);
    ctx.strokeStyle = "#E7B960";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.bezierCurveTo(-29, -48, -34, -18, 0, -18);
    ctx.bezierCurveTo(29, -48, 34, -18, 0, -18);
    ctx.stroke();
    ctx.restore();
  }

  function roundRect(ctx, x, y, w, h, r, fill) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();
  }

  function star(ctx, x, y, r) {
    ctx.fillStyle = "#E7B960";
    ctx.beginPath();
    for (var i = 0; i < 4; i++) {
      var a = (i * Math.PI) / 2;
      var x1 = x + Math.cos(a) * r;
      var y1 = y + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x1, y1);
      else ctx.lineTo(x1, y1);
      var b = a + Math.PI / 4;
      ctx.quadraticCurveTo(x, y, x + Math.cos(b) * (r * 0.35), y + Math.sin(b) * (r * 0.35));
    }
    ctx.closePath();
    ctx.fill();
  }

  function textTheme(plantilla) {
    if (plantilla === "bosque") {
      return {
        title: "#183C32",
        dest: "#183C32",
        msg: "#183C32",
        titleY: 300,
        safeX: 150,
        safeW: 780,
        destY: 400,
        align: "center",
      };
    }
    if (plantilla === "regalos") {
      return {
        title: "#FFFAF0",
        dest: "#EBDDC8",
        msg: "#FFFAF0",
        titleY: 260,
        safeX: 90,
        safeW: 670,
        destY: 440,
        align: "left",
      };
    }
    return {
      title: "#FFFAF0",
      dest: "#EBDDC8",
      msg: "#FFFAF0",
      titleY: 220,
      safeX: 150,
      safeW: 780,
      destY: 320,
      align: "center",
    };
  }

  /** Dibuja la tarjeta completa en un canvas 2D (1080×1080). */
  function drawCard(ctx, data) {
    var plantilla = data.plantilla || "villa";
    var dest = clampText(data.destinatario, HARD_DEST).trim();
    var msg = clampText(data.mensaje, HARD_MSG);
    var nieve = !!data.nieve;
    var firma = !!data.firma;

    if (plantilla === "bosque") drawBosque(ctx);
    else if (plantilla === "regalos") drawRegalos(ctx);
    else drawVilla(ctx);

    if (nieve) drawSnow(ctx, plantilla.length * 17 + (dest.length || 3));

    var theme = textTheme(plantilla);
    ctx.textAlign = theme.align;
    ctx.fillStyle = theme.title;
    ctx.font = '600 86px "Fraunces", Georgia, serif';
    var titleX = theme.align === "left" ? theme.safeX : SIZE / 2;
    if (plantilla === "regalos") {
      ctx.fillText("Un regalo", titleX, theme.titleY);
      ctx.fillText("para vos.", titleX, theme.titleY + 92);
    } else {
      ctx.fillText("Feliz Navidad", titleX, theme.titleY);
    }

    ctx.fillStyle = theme.dest;
    ctx.font = '500 42px "Inter", system-ui, sans-serif';
    var destLine = dest ? "Para " + dest : "Para alguien especial";
    ctx.fillText(destLine, titleX, theme.destY);

    ctx.fillStyle = theme.msg;
    ctx.font = '400 40px "Inter", system-ui, sans-serif';
    var lines = wrapLines(ctx, msg || "Escribí un deseo. Los saltos de línea también viajan.", theme.safeW);
    var y = theme.destY + 70;
    lines.forEach(function (line) {
      ctx.fillText(line, titleX, y);
      y += 54;
    });

    if (firma) {
      ctx.fillStyle = theme.msg;
      ctx.font = 'italic 36px "Fraunces", Georgia, serif';
      ctx.fillText("Con cariño · Villa Navidad", titleX, 980);
    }
  }

  /** Exporta PNG desde un canvas; devuelve data URL o null. */
  function exportPngDataUrl(canvas, data) {
    if (!canvas || !canvas.getContext) return null;
    var ctx = canvas.getContext("2d");
    if (!ctx) return null;
    canvas.width = SIZE;
    canvas.height = SIZE;
    drawCard(ctx, data);
    return canvas.toDataURL("image/png");
  }

  function downloadFileName(plantilla) {
    return "tarjeta-navidad-" + (plantilla || "villa") + ".png";
  }

  global.VillaCards = {
    SIZE: SIZE,
    GUIDE_DEST: GUIDE_DEST,
    GUIDE_MSG: GUIDE_MSG,
    HARD_DEST: HARD_DEST,
    HARD_MSG: HARD_MSG,
    TEMPLATES: TEMPLATES,
    clampText: clampText,
    validateCard: validateCard,
    drawCard: drawCard,
    exportPngDataUrl: exportPngDataUrl,
    downloadFileName: downloadFileName,
  };
})(typeof globalThis !== "undefined" ? globalThis : window);
