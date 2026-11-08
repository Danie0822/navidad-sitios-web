// Propósito: servidor estático local que monta la build en /navidad-sitios-web/
import http from 'node:http'
import { readFileSync, createReadStream, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import mime from 'mime'

const dist = resolve(process.cwd(), 'dist')
const base = '/navidad-sitios-web'
const port = Number(process.env.PORT || 5174)

const indexHtml = readFileSync(join(dist, 'index.html'))

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host}`)
  // Solo servimos bajo la subruta
  if (!url.pathname.startsWith(base)) {
    res.statusCode = 302
    res.setHeader('Location', base + '/')
    res.end()
    return
  }
  // Assets
  if (url.pathname.startsWith(base + '/assets/')) {
    const rel = url.pathname.replace(base + '/', '')
    const filePath = join(dist, rel)
    if (!existsSync(filePath)) {
      res.statusCode = 404
      res.end('Not found')
      return
    }
    res.setHeader('Content-Type', mime.getType(filePath) || 'application/octet-stream')
    createReadStream(filePath).pipe(res)
    return
  }
  // SPA fallback -> index.html
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.end(indexHtml)
})

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Preview Pages: http://localhost:${port}${base}/`)
})
