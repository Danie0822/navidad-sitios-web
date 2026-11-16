/* Propósito: verificar rúbrica (grep + Playwright headless) bajo /navidad-sitios-web/. */
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const base = "/navidad-sitios-web";
const port = 4173;
const origin = `http://127.0.0.1:${port}${base}`;
const artifacts = "/opt/cursor/artifacts";
mkdirSync(artifacts, { recursive: true });

function grepHtmlViolations() {
  const htmlFiles = readdirSync(root).filter((f) => f.endsWith(".html"));
  const issues = [];
  for (const file of htmlFiles) {
    const text = readFileSync(join(root, file), "utf8");
    if (/style\s*=\s*["']/.test(text)) issues.push(`${file}: style=""`);
    if (/<style[\s>]/i.test(text)) issues.push(`${file}: <style>`);
    if (/<script(?![^>]*\bsrc=)[^>]*>/i.test(text)) issues.push(`${file}: <script> inline`);
    if (/cdn\.tailwindcss\.com|cdn\.jsdelivr.*tailwind|unpkg\.com\/tailwindcss/i.test(text)) {
      issues.push(`${file}: CDN Tailwind`);
    }
  }
  return issues;
}

function contrastRatio(hexA, hexB) {
  const lum = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    const rgb = [n >> 16, (n >> 8) & 255, n & 255].map((c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  };
  const L1 = lum(hexA);
  const L2 = lum(hexB);
  const hi = Math.max(L1, L2);
  const lo = Math.min(L1, L2);
  return (hi + 0.05) / (lo + 0.05);
}

async function main() {
  for (const script of ["test-countdown.mjs", "test-cards.mjs", "test-games.mjs"]) {
    const unit = spawnSync("node", ["scripts/" + script], {
      cwd: root,
      encoding: "utf8",
    });
    if (unit.status !== 0) {
      console.error(unit.stdout || "");
      console.error(unit.stderr || "");
      console.error("FAIL unit tests:", script);
      process.exit(1);
    }
    console.log((unit.stdout || "").trim());
  }

  const grepIssues = grepHtmlViolations();
  if (grepIssues.length) {
    console.error("FAIL grep:", grepIssues.join("; "));
    process.exit(1);
  }
  console.log('OK grep: 0 style="", 0 <style>, 0 script inline, 0 CDN Tailwind');

  const ctaDark = contrastRatio("#e07078", "#14241f");
  if (ctaDark < 4.5) {
    console.error("FAIL contraste CTA oscuro:", ctaDark.toFixed(3));
    process.exit(1);
  }
  console.log("OK contraste CTA oscuro #e07078/#14241f =", ctaDark.toFixed(3));

  const server = spawn("node", ["scripts/preview-pages.mjs"], {
    cwd: root,
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });

  await new Promise((r) => setTimeout(r, 600));

  const browser = await chromium.launch({ headless: true });
  const pages = ["/", "/tarjetas.html", "/juegos.html", "/participantes.html"];
  const widths = [375, 768, 1280];
  let failed = false;
  const report = [];

  try {
    // prefers-dark sin valor en localStorage → aria-pressed true
    {
      const ctx = await browser.newContext({ colorScheme: "dark" });
      const page = await ctx.newPage();
      await page.goto(origin + "/", { waitUntil: "networkidle" });
      const aria = await page.locator("#theme-toggle").getAttribute("aria-pressed");
      const dark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
      if (!dark || aria !== "true") {
        failed = true;
        report.push(`prefers-dark: aria-pressed=${aria} dark=${dark}`);
      } else {
        report.push("prefers-dark: aria-pressed=true OK");
      }
      await ctx.close();
    }

    for (const path of pages) {
      const consoleErrors = [];
      const badResponses = [];
      const context = await browser.newContext();
      const page = await context.newPage();
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });
      page.on("pageerror", (err) => consoleErrors.push(String(err)));
      page.on("response", (res) => {
        if (res.status() === 404) badResponses.push(res.url());
      });

      const url = origin + path;
      await page.goto(url, { waitUntil: "networkidle" });

      // Menú hamburguesa en móvil: abrir, foco al primer link, Escape cierra y vuelve al botón
      await page.setViewportSize({ width: 375, height: 812 });
      const toggle = page.locator("#menu-toggle");
      await toggle.click();
      const expanded = await toggle.getAttribute("aria-expanded");
      if (expanded !== "true") {
        failed = true;
        report.push(`${path}: menú no abrió (aria-expanded=${expanded})`);
      }
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? el.getAttribute("href") || el.id || el.tagName : null;
      });
      if (focused !== "./index.html" && !String(focused).includes("index.html")) {
        // primer link es Inicio → ./index.html
        const firstHref = await page.locator("#nav-links a").first().getAttribute("href");
        const activeHref = await page.evaluate(() => document.activeElement?.getAttribute?.("href"));
        if (activeHref !== firstHref) {
          failed = true;
          report.push(`${path}: foco al abrir menú = ${activeHref}, esperado ${firstHref}`);
        }
      }

      await page.keyboard.press("Escape");
      const afterEsc = await toggle.getAttribute("aria-expanded");
      const focusBack = await page.evaluate(() => document.activeElement?.id);
      if (afterEsc !== "false") {
        failed = true;
        report.push(`${path}: Escape no cerró (aria-expanded=${afterEsc})`);
      }
      if (focusBack !== "menu-toggle") {
        failed = true;
        report.push(`${path}: Escape no devolvió foco al botón (focus=${focusBack})`);
      }

      // Modo oscuro + persistencia
      await page.locator("#theme-toggle").click();
      const isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
      const stored = await page.evaluate(() => localStorage.getItem("villa-navidad-theme"));
      if (!isDark || stored !== "dark") {
        failed = true;
        report.push(`${path}: modo oscuro no persistió`);
      }
      await page.reload({ waitUntil: "networkidle" });
      const stillDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
      if (!stillDark) {
        failed = true;
        report.push(`${path}: modo oscuro no sobrevivió al reload`);
      }
      await page.locator("#theme-toggle").click();

      if (path.includes("tarjetas")) {
        await page.setViewportSize({ width: 1280, height: 900 });
        const disabled = await page.locator("#download-png").isDisabled();
        if (!disabled) {
          failed = true;
          report.push("tarjetas: Descargar PNG debería estar disabled vacío");
        }
        const disabledBg = await page.locator("#download-png").evaluate((el) => getComputedStyle(el).backgroundColor);
        if (disabledBg === "rgb(167, 44, 54)") {
          failed = true;
          report.push(`tarjetas: disabled se ve como CTA activo (${disabledBg})`);
        } else {
          report.push(`tarjetas: disabled style OK (${disabledBg})`);
        }
        const help = await page.locator("#download-help").textContent();
        if (!/destinatario y mensaje/i.test(help || "")) {
          failed = true;
          report.push("tarjetas: ayuda de validación ausente");
        }

        await page.fill("#dest", "Ana");
        await page.fill("#msg", "Felices fiestas para vos");
        const thumbBtn = page.locator('.template-pick[data-template="bosque"]');
        await thumbBtn.evaluate((el) => el.click());
        const plantilla = await page.locator("#plantilla").inputValue();
        const pressed = await thumbBtn.getAttribute("aria-pressed");
        if (plantilla !== "bosque" || pressed !== "true") {
          failed = true;
          report.push(`tarjetas: plantilla bosque no seleccionada (val=${plantilla}, aria=${pressed})`);
        }
        const kept = await page.locator("#dest").inputValue();
        if (kept !== "Ana") {
          failed = true;
          report.push("tarjetas: cambiar plantilla no conservó campos");
        }

        const [download] = await Promise.all([
          page.waitForEvent("download"),
          page.locator("#download-png").click(),
        ]);
        const dlPath = await download.path();
        if (!dlPath) {
          failed = true;
          report.push("tarjetas: descarga PNG sin path");
        } else {
          const buf = readFileSync(dlPath);
          if (buf.length < 1000 || buf[0] !== 0x89 || buf[1] !== 0x50) {
            failed = true;
            report.push("tarjetas: PNG inválido");
          } else {
            report.push(`tarjetas: PNG OK (${buf.length} bytes)`);
          }
        }
        const ready = await page.locator("#png-ready").evaluate((el) => !el.hidden);
        if (!ready) {
          failed = true;
          report.push("tarjetas: aviso PNG listo no visible");
        }
      }

      if (path.includes("participantes")) {
        const hasVideo = (await page.locator("video source[src*='villa-navidad']").count()) > 0;
        const hasAudio = (await page.locator("audio source[src*='campana']").count()) > 0;
        const imgLink = page.locator('a[href="./index.html"] img.img-thumb');
        const ext = page.locator('.site-footer a[target="_blank"]');
        const box = await page.locator("#confirmacion").boundingBox();
        if (!hasVideo || !hasAudio) {
          failed = true;
          report.push("participantes: falta video/audio");
        }
        if ((await imgLink.count()) < 1) {
          failed = true;
          report.push("participantes: falta imagen como vínculo");
        }
        if ((await ext.count()) < 1) {
          failed = true;
          report.push("participantes: falta enlace externo en footer");
        }
        if (!box || box.width < 44 || box.height < 44) {
          failed = true;
          report.push(`participantes: checkbox hit ${box?.width}x${box?.height}`);
        } else {
          report.push("participantes: video/audio/img-link/checkbox OK");
        }
        await page.locator("#participantes-form button[type='submit']").click();
        const errVisible = await page.locator("#error-confirmacion").evaluate((el) =>
          el.classList.contains("is-visible")
        );
        if (!errVisible) {
          failed = true;
          report.push("participantes: validación checkbox no mostró error");
        }
      }

      if (path.includes("juegos")) {
        const catalogVisible = await page.locator("#view-catalog").isVisible();
        const catCount = await page.locator(".catalog-link").count();
        if (!catalogVisible || catCount !== 2) {
          failed = true;
          report.push(`juegos: selector esperado 2 links, got ${catCount}`);
        }
        const windows = await page.locator("#catalog-regalos .catalog-svg > g").count();
        if (windows < 9) {
          failed = true;
          report.push(`juegos: catálogo regalos ventanas=${windows}, esperado ≥9`);
        }
        const catPause = page.locator("#view-catalog [data-motion-pause]");
        if ((await catPause.count()) < 1) {
          failed = true;
          report.push("juegos: falta PauseButton en catálogo");
        }

        await page.locator("#catalog-memoria").click();
        await page.waitForTimeout(100);
        if (!(await page.locator("#view-memoria").isVisible())) {
          failed = true;
          report.push("juegos: no entró a memoria");
        }
        const cells = page.locator("#memory-board [role='gridcell']");
        const cellCount = await cells.count();
        if (cellCount !== 16) {
          failed = true;
          report.push(`juegos: memoria cartas=${cellCount}, esperado 16`);
        }
        await cells.nth(0).click();
        const symbol = await cells.nth(0).getAttribute("data-symbol");
        const pair = page.locator(`#memory-board [data-symbol="${symbol}"]`);
        await pair.nth(1).click();
        const scoreText = await page.locator("#memory-score").textContent();
        if (!/Parejas 1\/8/.test(scoreText || "")) {
          failed = true;
          report.push(`juegos: memoria no sumó pareja (${scoreText})`);
        }
        await page.locator("#memory-reset").click();
        const resetText = await page.locator("#memory-score").textContent();
        if (!/Parejas 0\/8/.test(resetText || "") || !/Intentos 0/.test(resetText || "")) {
          failed = true;
          report.push(`juegos: memoria reinicio falló (${resetText})`);
        }

        await page.locator('a[data-back="memoria"]').click();
        await page.locator("#catalog-regalos").click();
        await page.waitForTimeout(100);
        await page.locator("#gifts-start").click();
        const open = page.locator('#gifts-board [data-window][data-open="true"]');
        await open.first().waitFor({ timeout: 4000 });
        await open.first().click();
        const giftsScore = await page.locator("#gifts-score").textContent();
        if (!/Regalos 1/.test(giftsScore || "")) {
          failed = true;
          report.push(`juegos: regalos no sumó (${giftsScore})`);
        }
        await page.locator("#gifts-reset").click();
        const playVisible = await page.locator("#gifts-start").isVisible();
        if (!playVisible) {
          failed = true;
          report.push("juegos: regalos reinicio no volvió a Jugar");
        } else {
          report.push("juegos: selector + memoria + regalos OK");
        }
      }

      const slug = path === "/" ? "index" : path.replace(/^\//, "").replace(".html", "");
      for (const w of widths) {
        await page.setViewportSize({ width: w, height: 900 });
        await page.waitForTimeout(200);
        const shot = join(artifacts, `villa-${slug}-${w}.png`);
        await page.screenshot({ path: shot, fullPage: true });
        report.push(`screenshot ${shot}`);
      }

      if (consoleErrors.length) {
        failed = true;
        report.push(`${path}: consola ${consoleErrors.join(" | ")}`);
      }
      if (badResponses.length) {
        failed = true;
        report.push(`${path}: 404 ${badResponses.join(" | ")}`);
      } else {
        report.push(`${path}: 0 respuestas 404, consola limpia`);
      }

      await context.close();
    }
  } finally {
    await browser.close();
    server.kill("SIGTERM");
  }

  writeFileSync(join(artifacts, "verify-report.txt"), report.join("\n") + "\n");
  console.log(report.join("\n"));
  if (failed) {
    console.error("VERIFY FAILED");
    process.exit(1);
  }
  console.log("VERIFY OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
