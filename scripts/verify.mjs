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
  const countdown = spawnSync("node", ["scripts/test-countdown.mjs"], {
    cwd: root,
    encoding: "utf8",
  });
  if (countdown.status !== 0) {
    console.error(countdown.stdout || "");
    console.error(countdown.stderr || "");
    console.error("FAIL countdown unit tests");
    process.exit(1);
  }
  console.log((countdown.stdout || "").trim());

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
  const pages = ["/", "/tarjetas.html", "/juegos.html"];
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
        await page.locator("#tarjeta-form button[type='submit']").click();
        const errVisible = await page.locator("#error-destinatario").evaluate((el) =>
          el.classList.contains("is-visible")
        );
        if (!errVisible) {
          failed = true;
          report.push("tarjetas: validación no mostró error");
        }

        const box = await page.locator("#consentimiento").boundingBox();
        if (!box || box.width < 44 || box.height < 44) {
          failed = true;
          report.push(`tarjetas: checkbox hit ${box?.width}x${box?.height}`);
        } else {
          report.push(`tarjetas: checkbox ${box.width}x${box.height}`);
        }

        const footerLink = await page.locator(".site-footer a").first().boundingBox();
        if (!footerLink || footerLink.height < 24) {
          failed = true;
          report.push(`tarjetas: footer link h=${footerLink?.height}`);
        }

        await page.fill("#destinatario", "Ana");
        await page.fill("#mensaje", "Felices fiestas para vos");
        await page.check("#consentimiento");
        await page.locator("#tarjeta-form button[type='submit']").click();
        const ok = await page.locator("#form-success").evaluate((el) =>
          el.classList.contains("is-visible")
        );
        if (!ok) {
          failed = true;
          report.push("tarjetas: éxito de formulario no visible");
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
