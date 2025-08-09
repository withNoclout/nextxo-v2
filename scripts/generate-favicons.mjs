import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import sharp from 'sharp'

const root = new URL('..', import.meta.url)
const toPath = (p) => resolve(new URL(p, root).pathname)

const svgPath = toPath('public/favicon.svg')
const outDir = toPath('public')
const targets = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'favicon-48x48.png' },
  { size: 180, name: 'apple-touch-icon.png' },
]

async function run() {
  const svg = await readFile(svgPath)
  await mkdir(outDir, { recursive: true })
  await Promise.all(
    targets.map(async ({ size, name }) => {
      const buf = await sharp(svg).resize(size, size, { fit: 'cover' }).png({ compressionLevel: 9 }).toBuffer()
      await writeFile(resolve(outDir, name), buf)
    })
  )
  console.log('Generated favicons:', targets.map(t => t.name).join(', '))
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
