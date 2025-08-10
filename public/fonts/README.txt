Place Brooklyn.woff2 here (licensed).

Why: src/index.css defines a @font-face that points to /fonts/Brooklyn.woff2 for the Customer Stories title typography.

Guidance:
- Ensure you have the legal right to use and distribute the font.
- Preferred build-safe name: Brooklyn.woff2
- After adding, rebuild: npm run build
- If you don’t have the font, the site will fall back to Inter/system fonts and still render correctly.
