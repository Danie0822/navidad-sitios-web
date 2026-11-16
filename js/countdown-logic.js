/* Propósito: lógica pura del contador a Navidad (navegador y tests Node). */

(function (global) {
  "use strict";

  /**
   * Estado del contador para un instante dado.
   * El 25/12 completo muestra Feliz Navidad; desde el 26 se apunta al año siguiente.
   */
  function getCountdownState(now) {
    var y = now.getFullYear();
    var month = now.getMonth();
    var day = now.getDate();
    var isChristmasDay = month === 11 && day === 25;

    if (isChristmasDay) {
      var todayTarget = new Date(y, 11, 25, 0, 0, 0, 0);
      return {
        isChristmasDay: true,
        target: todayTarget,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalSeconds: 0,
      };
    }

    var target = new Date(y, 11, 25, 0, 0, 0, 0);
    if (now > target) {
      target = new Date(y + 1, 11, 25, 0, 0, 0, 0);
    }

    var diff = Math.max(0, Math.floor((target - now) / 1000));
    return {
      isChristmasDay: false,
      target: target,
      days: Math.floor(diff / 86400),
      hours: Math.floor((diff % 86400) / 3600),
      minutes: Math.floor((diff % 3600) / 60),
      seconds: diff % 60,
      totalSeconds: diff,
    };
  }

  global.VillaCountdown = { getCountdownState: getCountdownState };
})(typeof globalThis !== "undefined" ? globalThis : window);
