/* Propósito: marca el enlace de navegación de la página activa con aria-current. */

(function () {
  "use strict";

  var path = window.location.pathname;
  var file = path.split("/").pop() || "index.html";
  if (file === "" || file === "navidad-sitios-web") {
    file = "index.html";
  }

  document.querySelectorAll(".nav-link[data-page]").forEach(function (link) {
    if (link.getAttribute("data-page") === file) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
})();
