/* Propósito: validación del formulario de tarjetas (campos requeridos y checkbox). */

(function () {
  "use strict";

  var form = document.getElementById("tarjeta-form");
  if (!form) return;

  var nombre = document.getElementById("destinatario");
  var mensaje = document.getElementById("mensaje");
  var consentimiento = document.getElementById("consentimiento");
  var success = document.getElementById("form-success");

  form.setAttribute("novalidate", "novalidate");

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearErrors();

    var ok = true;

    if (!nombre.value.trim()) {
      showError("destinatario", "Escribí a quién va dirigida la tarjeta.");
      ok = false;
    } else if (nombre.value.trim().length < 2) {
      showError("destinatario", "El nombre debe tener al menos 2 caracteres.");
      ok = false;
    }

    if (!mensaje.value.trim()) {
      showError("mensaje", "Contanos un mensaje para acompañar la tarjeta.");
      ok = false;
    } else if (mensaje.value.trim().length < 10) {
      showError("mensaje", "El mensaje necesita al menos 10 caracteres.");
      ok = false;
    }

    if (!consentimiento.checked) {
      showError("consentimiento", "Marcá la casilla para continuar.");
      ok = false;
    }

    if (!ok) {
      var first = form.querySelector(".field-error, .checkbox-row.is-invalid");
      if (first) {
        var focusable = first.matches("input, textarea")
          ? first
          : first.querySelector("input");
        if (focusable) focusable.focus();
      }
      return;
    }

    if (success) {
      success.classList.add("is-visible");
      success.textContent =
        "¡Listo! Pedido simbólico para " +
        nombre.value.trim() +
        ". (Sin envío real: es una demo educativa.)";
    }
    form.reset();
  });

  /** Muestra un mensaje de error asociado a un campo. */
  function showError(fieldId, message) {
    var field = document.getElementById(fieldId);
    var err = document.getElementById("error-" + fieldId);
    if (field) {
      if (field.type === "checkbox") {
        field.closest(".checkbox-row").classList.add("is-invalid");
      } else {
        field.classList.add("field-error");
      }
    }
    if (err) {
      err.textContent = message;
      err.classList.add("is-visible");
    }
  }

  function clearErrors() {
    form.querySelectorAll(".field-error").forEach(function (el) {
      el.classList.remove("field-error");
    });
    form.querySelectorAll(".checkbox-row.is-invalid").forEach(function (el) {
      el.classList.remove("is-invalid");
    });
    form.querySelectorAll(".form-error").forEach(function (el) {
      el.classList.remove("is-visible");
      el.textContent = "";
    });
    if (success) success.classList.remove("is-visible");
  }
})();
