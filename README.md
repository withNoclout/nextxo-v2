<div align="center">

# NetXO • Real‑Time Carbon & Traffic Monitor

Vite + React + Tailwind starter with a professional solid “N” favicon/logo and PWA-friendly icons.

</div>

## Features

- Fast Vite + React + TypeScript + Tailwind CSS
- Dark theme baseline with emerald accent
- Ready-to-ship favicon/logo setup (SVG primary + PNG fallbacks)
- Minimal web manifest for add‑to‑home on mobile

## Getting started

1) Install dependencies

```bash
npm install
```

2) Run in dev

```bash
npm run dev
```

Open http://localhost:5173

## Build & preview

```bash
npm run build
npm run preview
```

## Favicon / icons

- Primary SVG: `public/favicon.svg` (black tile, white outline, green→black fade solid “N”).
- PNG fallbacks are generated with Sharp via:

```bash
npm run favicons
```

This exports:

- `public/favicon-32.png`, `public/favicon-16.png`
- `public/apple-touch-icon.png`, `public/apple-touch-icon-180.png`
- `public/android-chrome-192.png`

Head tags (in `index.html`) include a cache‑buster query like `?v=1`. If browsers keep an older icon after deploy, bump to `?v=2`.

Dark tab color: `<meta name="theme-color" content="#0B0C0E">`.

## Manifest

`public/site.webmanifest` includes icons and dark theme/background color. This enables better PWA/add-to-home behavior on Android.

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run preview` — preview built app
- `npm run favicons` — export PNG icons from the SVG

## Deploy

Any static host works (Netlify, Vercel, GitHub Pages, S3, etc.). Serve the `dist/` folder after `npm run build`.

## License

MIT

