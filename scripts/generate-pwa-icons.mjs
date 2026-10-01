import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = join(root, 'public')

async function fromSvg(name, outName, size) {
  const svg = readFileSync(join(publicDir, name))
  await sharp(svg).resize(size, size).png().toFile(join(publicDir, outName))
}

await fromSvg('app-icon.svg', 'pwa-192.png', 192)
await fromSvg('app-icon.svg', 'pwa-512.png', 512)
await fromSvg('app-icon.svg', 'apple-touch-icon.png', 180)
await fromSvg('app-icon-maskable.svg', 'pwa-512-maskable.png', 512)
await fromSvg('app-icon.svg', 'favicon-32.png', 32)

console.log('PWA icons generated in public/')
