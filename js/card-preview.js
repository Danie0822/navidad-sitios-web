/* Propósito: arte SVG de las plantillas villa/bosque/regalos (preview y PNG). */

(function (global) {
  "use strict";

  var TEMPLATES = [
    { id: "villa", label: "Villa" },
    { id: "bosque", label: "Bosque" },
    { id: "regalos", label: "Regalos" },
  ];

  function villaSvg() {
    return (
      '<svg viewBox="0 0 1080 1080" class="card-svg" aria-hidden="true">' +
      '<rect width="1080" height="1080" fill="#183C32"/>' +
      '<path d="M0 896 Q270 783 648 891 T1080 870 V1080 H0 Z" fill="#E9DAC3"/>' +
      '<g class="anim-star">' +
      '<path d="M81 95 Q86 103 95 108 Q86 113 81 122 Q76 113 67 108 Q76 103 81 95" fill="#E7B960"/>' +
      '<path d="M913 203 Q918 211 927 216 Q918 221 913 230 Q908 221 899 216 Q908 211 913 203" fill="#E7B960"/>' +
      '<path d="M203 702 Q208 710 216 716 Q208 721 203 730 Q198 721 189 716 Q198 710 203 702" fill="#E7B960"/>' +
      '<path d="M953 675 Q958 683 967 689 Q958 694 953 703 Q948 694 939 689 Q948 683 953 675" fill="#E7B960"/>' +
      "</g>" +
      '<g transform="translate(216 910) scale(3.1)">' +
      '<rect x="-22" y="-8" width="44" height="36" rx="2" fill="#E9DAC3"/>' +
      '<path d="M-30 -6 L0 -32 L30 -6 Z" fill="#183C32"/>' +
      '<rect x="-5" y="6" width="10" height="22" rx="2" fill="#E7B960" class="anim-window"/>' +
      '<rect x="-16" y="-2" width="8" height="10" rx="1" fill="#E7B960"/>' +
      '<rect x="9" y="-2" width="8" height="10" rx="1" fill="#E7B960"/>' +
      "</g>" +
      '<g transform="translate(859 910) scale(1.22)">' +
      '<rect x="-5" y="0" width="10" height="20" fill="#8C694B"/>' +
      '<g class="anim-tree"><path d="M0 -138 L35 -66 H22 L55 -15 H38 L66 23 H-66 L-38 -15 H-55 L-22 -66 H-35 Z" fill="#183C32"/></g>' +
      '<g class="anim-star-sm"><path d="M0 -157 Q2 -147 12 -145 Q2 -143 0 -133 Q-2 -143 -12 -145 Q-2 -147 0 -157" fill="#E7B960"/></g>' +
      '<circle cx="-12" cy="-68" r="4" fill="#E7B960"/><circle cx="17" cy="-30" r="4" fill="#E7B960"/>' +
      '<circle cx="-30" cy="2" r="4" fill="#E7B960"/><circle cx="32" cy="12" r="4" fill="#E7B960"/>' +
      "</g></svg>"
    );
  }

  function cornerBranch() {
    return (
      '<path d="M0 284 Q27 40 270 0" stroke="#183C32" stroke-width="11" fill="none"/>' +
      '<path d="M22 200 q-54 -11 -38 -70 q59 16 38 70 M30 192 q8 -65 68 -49 q-16 54 -68 49" fill="#183C32"/>' +
      '<path d="M62 162 q-54 -11 -38 -70 q59 16 38 70 M70 154 q8 -65 68 -49 q-16 54 -68 49" fill="#183C32"/>' +
      '<path d="M103 124 q-54 -11 -38 -70 q59 16 38 70 M111 116 q8 -65 68 -49 q-16 54 -68 49" fill="#183C32"/>' +
      '<path d="M143 86 q-54 -11 -38 -70 q59 16 38 70 M151 78 q8 -65 68 -49 q-16 54 -68 49" fill="#183C32"/>' +
      '<path d="M184 49 q-54 -11 -38 -70 q59 16 38 70 M192 41 q8 -65 68 -49 q-16 54 -68 49" fill="#183C32"/>' +
      '<circle cx="76" cy="81" r="13" fill="#183C32"/><circle cx="108" cy="57" r="11" fill="#183C32"/>'
    );
  }

  function bosqueSvg() {
    return (
      '<svg viewBox="0 0 1080 1080" class="card-svg" aria-hidden="true">' +
      '<rect width="1080" height="1080" fill="#FFFAF0"/>' +
      '<g transform="translate(76 76)"><g class="anim-forest">' +
      cornerBranch() +
      "</g></g>" +
      '<g transform="translate(1004 76) scale(-1 1)"><g class="anim-forest">' +
      cornerBranch() +
      "</g></g>" +
      '<g transform="translate(76 1004) scale(1 -1)"><g class="anim-forest">' +
      cornerBranch() +
      "</g></g>" +
      '<g transform="translate(1004 1004) scale(-1 -1)"><g class="anim-forest">' +
      cornerBranch() +
      "</g></g></svg>"
    );
  }

  function regalosSvg() {
    return (
      '<svg viewBox="0 0 1080 1080" class="card-svg" aria-hidden="true">' +
      '<rect width="1080" height="1080" fill="#183C32"/>' +
      '<rect y="92" width="1080" height="35" fill="#E7B960"/>' +
      '<rect x="797" width="35" height="1080" fill="#E7B960"/>' +
      '<g class="anim-ribbon"><path d="M814 113 C617 -51 608 154 814 113 C997 -59 1021 146 814 113" stroke="#E7B960" stroke-width="32" fill="none"/></g>' +
      '<g transform="translate(197 915) scale(3.5)">' +
      '<g class="anim-gift-lid"><rect x="-26" y="-18" width="52" height="10" rx="2" fill="#E7B960"/>' +
      '<path d="M0 -18 C-29 -48 -34 -18 0 -18 C29 -48 34 -18 0 -18" stroke="#FFFAF0" stroke-width="5" fill="none"/></g>' +
      '<rect x="-22" y="-13" width="44" height="36" rx="3" fill="#E7B960"/>' +
      '<rect x="-4" y="-18" width="8" height="41" fill="#FFFAF0"/></g>' +
      '<g transform="translate(378 980) scale(1.9)">' +
      '<rect x="-22" y="-13" width="44" height="36" rx="3" fill="#E7B960"/>' +
      '<rect x="-26" y="-18" width="52" height="10" rx="2" fill="#E7B960"/>' +
      '<rect x="-4" y="-18" width="8" height="41" fill="#FFFAF0"/>' +
      '<path d="M0 -18 C-29 -48 -34 -18 0 -18 C29 -48 34 -18 0 -18" stroke="#FFFAF0" stroke-width="5" fill="none"/></g>' +
      '<g class="anim-star-sm"><path d="M913 791 Q918 810 937 816 Q918 821 913 840 Q908 821 889 816 Q908 810 913 791" fill="#E7B960"/></g>' +
      "</svg>"
    );
  }

  function artFor(plantilla) {
    if (plantilla === "bosque") return bosqueSvg();
    if (plantilla === "regalos") return regalosSvg();
    return villaSvg();
  }

  /** Pinta la tarjeta en un nodo (modos: preview, thumb o export). */
  function renderCard(root, data, mode) {
    mode = mode || "preview";
    var plantilla = data.plantilla || "villa";
    var dest = (data.destinatario || "").trim();
    var msg = data.mensaje || "";
    var staticArt = mode === "export" || mode === "thumb";
    var showText = mode !== "thumb";

    root.className = "card-art" + (staticArt ? "" : " motion-on");
    root.setAttribute("data-template", plantilla);
    root.setAttribute("data-mode", mode);
    if (mode === "thumb") {
      root.removeAttribute("role");
      root.removeAttribute("aria-label");
    } else {
      root.setAttribute("role", "img");
      root.setAttribute("aria-label", "Tarjeta " + plantilla + (dest ? ", " + dest : ""));
    }

    var title =
      plantilla === "regalos"
        ? 'Un regalo<br>para vos.'
        : "Feliz Navidad";
    var destLine = dest
      ? "Para " + dest
      : mode === "preview"
        ? "Para alguien especial"
        : "";
    var msgLine =
      msg ||
      (mode === "preview" ? "Escribí un deseo. Los saltos de línea también viajan." : "");

    var copy = "";
    if (showText) {
      copy =
        '<div class="card-copy">' +
        '<p class="card-title font-serif">' +
        title +
        "</p>" +
        '<div class="card-safe" data-safe-area>' +
        '<p class="card-dest" data-fit="dest">' +
        escapeHtml(destLine) +
        "</p>" +
        '<p class="card-msg" data-fit="msg">' +
        escapeHtml(msgLine).replace(/\n/g, "<br>") +
        "</p></div></div>";
    }

    root.innerHTML = artFor(plantilla) + copy;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  var SLOP = 3;
  function cardTextOverflows(root) {
    var safe = root.querySelector("[data-safe-area]");
    if (!safe) return true;
    var box = safe.getBoundingClientRect();
    if (box.width < 2 || box.height < 2) return true;
    var parts = root.querySelectorAll("[data-fit]");
    for (var i = 0; i < parts.length; i++) {
      var el = parts[i];
      if (!el.textContent) continue;
      var r = el.getBoundingClientRect();
      if (
        r.bottom - box.bottom > SLOP ||
        r.right - box.right > SLOP ||
        box.left - r.left > SLOP ||
        box.top - r.top > SLOP
      ) {
        return true;
      }
    }
    return false;
  }

  global.VillaCardPreview = {
    TEMPLATES: TEMPLATES,
    renderCard: renderCard,
    cardTextOverflows: cardTextOverflows,
  };
})(typeof globalThis !== "undefined" ? globalThis : window);
