/* Propósito: aplicar el tema guardado o prefers-color-scheme antes del primer paint (sin defer). */
(function () {
  "use strict";
  try {
    var key = "villa-navidad-theme";
    var saved = localStorage.getItem(key);
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme = saved || (prefersDark ? "dark" : "light");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  } catch (e) {
    /* localStorage puede fallar en modo privado; se ignora */
  }
})();
