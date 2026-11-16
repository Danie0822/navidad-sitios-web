/* Propósito: sirve el sitio estático bajo /navidad-sitios-web/ como GitHub Pages. */
import http from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { join, resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const base = "/navidad-sitios-web";
const port = Number(process.env.PORT || 4173);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".mp3": "audio/mpeg",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);

  if (!url.pathname.startsWith(base)) {
    res.statusCode = 302;
    res.setHeader("Location", base + "/");
    res.end();
    return;
  }

  let rel = decodeURIComponent(url.pathname.slice(base.length));
  if (!rel || rel === "/") rel = "/index.html";

  const filePath = join(root, rel);
  if (!filePath.startsWith(root) || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Not found");
    return;
  }

  const type = mimeTypes[extname(filePath).toLowerCase()] || "application/octet-stream";
  res.statusCode = 200;
  res.setHeader("Content-Type", type);
  createReadStream(filePath).pipe(res);
});

server.listen(port, () => {
  console.log(`Preview Pages: http://localhost:${port}${base}/`);
});
