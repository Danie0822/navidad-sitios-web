/* Propósito: capturas de tarjetas (preview) y juegos mid-play a 375/1280 bajo /navidad-sitios-web/. */
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const base = "/navidad-sitios-web";
const port = 4174;
const origin = `http://127.0.0.1:${port}${base}`;
const artifacts = "/opt/cursor/artifacts";
mkdirSync(artifacts, { recursive: true });

const server = spawn("node", ["scripts/preview-pages.mjs"], {
  cwd: root,
  env: { ...process.env, PORT: String(port) },
  stdio: ["ignore", "pipe", "pipe"],
});

await new Promise((r) => setTimeout(r, 500));
const browser = await chromium.launch({ headless: true });

try {
  for (const width of [375, 1280]) {
    const context = await browser.newContext({
      viewport: { width, height: width === 375 ? 812 : 900 },
    });
    const page = await context.newPage();

    await page.goto(origin + "/tarjetas.html", { waitUntil: "networkidle" });
    await page.fill("#destinatario", "Daniela");
    await page.fill("#mensaje", "Que esta Navidad te encuentre con paz y muchas ganas.");
    await page.check("#opt-nieve");
    await page.check("#opt-firma");
    await page.locator('[data-template="villa"]').click();
    await page.waitForTimeout(200);
    await page.screenshot({
      path: join(artifacts, `must-tarjetas-preview-${width}.png`),
      fullPage: true,
    });

    await page.goto(origin + "/juegos.html", { waitUntil: "networkidle" });
    const cells = page.locator("#memory-board [role='gridcell']");
    await cells.nth(0).click();
    const symbol = await cells.nth(0).getAttribute("data-symbol");
    await page.locator(`#memory-board [data-symbol="${symbol}"]`).nth(1).click();
    await page.locator("#gifts-start").click();
    await page.locator('#gifts-board [data-window][data-open="true"]').first().waitFor({ timeout: 4000 });
    await page.waitForTimeout(150);
    await page.screenshot({
      path: join(artifacts, `must-juegos-midplay-${width}.png`),
      fullPage: true,
    });

    await context.close();
  }
  console.log("OK capturas MUST en", artifacts);
} finally {
  await browser.close();
  server.kill("SIGTERM");
}
