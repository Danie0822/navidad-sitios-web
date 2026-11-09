/* Propósito: empaquetar evidencia QA después de la suite, no en tests paralelos. */
import { execSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'

const dir = '/opt/cursor/artifacts'
if (!existsSync(dir)) process.exit(0)
const files = readdirSync(dir)
  .filter((f) => !f.endsWith('.zip'))
  .map((f) => `${dir}/${f}`)
if (!files.length) process.exit(0)
execSync(`zip -q -j ${dir}/villa-v2-evidencia.zip ${files.join(' ')}`)
console.log(`zip ${dir}/villa-v2-evidencia.zip (${files.length} archivos)`)
