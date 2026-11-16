/* Propósito: verificar rúbrica (grep + Playwright headless) bajo /navidad-sitios-web/. */
import { spawn } from "node:child_process";
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
    if (/cdn\.tailwindcss|tailwindcss\.com/i.test(text)) issues.push(`${file}: CDN Tailwind`);
  }
  return issues;
}

async function main() {
  const grepIssues = grepHtmlViolations();
  if (grepIssues.length) {
    console.error("FAIL grep:", grepIssues.join("; "));
    process.exit(1);
  }
  console.log("OK grep: 0 style=\"\", 0 <style>, 0 script inline, 0 CDN Tailwind");

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

      // Menú hamburguesa en móvil
      await page.setViewportSize({ width: 375, height: 812 });
      const toggle = page.locator("#menu-toggle");
      await toggle.click();
      const expanded = await toggle.getAttribute("aria-expanded");
      if (expanded !== "true") {
        failed = true;
        report.push(`${path}: menú no abrió (aria-expanded=${expanded})`);
      }
      await toggle.click();

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
      // volver a claro para no contaminar
      await page.locator("#theme-toggle").click();

      // Validación formulario solo en tarjetas
      if (path.includes("tarjetas")) {
        await page.locator("#tarjeta-form button[type='submit']").click();
        const errVisible = await page.locator("#error-destinatario").evaluate((el) =>
          el.classList.contains("is-visible")
        );
        if (!errVisible) {
          failed = true;
          report.push("tarjetas: validación no mostró error");
        }
        await page.fill("#destinatario", "Ana");
        await page.fill("#mensaje", "Felices fiestas para vos");
        await page.check("#consentimiento");
        await page.locator("#tarjeta-form button[type='submit']").click();
        const ok = await page.locator("#form-success").evaluate((el) => el.classList.contains("is-visible"));
        if (!ok) {
          failed = true;
          report.push("tarjetas: éxito de formulario no visible");
        }
      }

      // Capturas responsive
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
