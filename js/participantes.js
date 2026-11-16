/* Propósito: confirmación con checkbox y botón de audio en la página Participantes. */

(function () {
  "use strict";

  var form = document.getElementById("participantes-form");
  var audioBtn = document.getElementById("participantes-audio-btn");
  var audio = document.getElementById("participantes-audio");

  if (audioBtn && audio) {
    audioBtn.addEventListener("click", function () {
      audio.currentTime = 0;
      var p = audio.play();
      if (p && typeof p.catch === "function") p.catch(function () {});
    });
  }

  if (!form) return;

  var check = document.getElementById("confirmacion");
  var err = document.getElementById("error-confirmacion");
  var success = document.getElementById("participantes-success");

  form.setAttribute("novalidate", "novalidate");
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (err) {
      err.textContent = "";
      err.classList.remove("is-visible");
    }
    if (check && check.closest(".checkbox-row")) {
      check.closest(".checkbox-row").classList.remove("is-invalid");
    }
    if (success) success.classList.remove("is-visible");

    if (!check || !check.checked) {
      if (check && check.closest(".checkbox-row")) {
        check.closest(".checkbox-row").classList.add("is-invalid");
      }
      if (err) {
        err.textContent = "Marcá la casilla para continuar.";
        err.classList.add("is-visible");
      }
      if (check) check.focus();
      return;
    }

    if (success) {
      success.textContent = "Confirmación guardada en el navegador (demo educativa).";
      success.classList.add("is-visible");
    }
  });
})();
