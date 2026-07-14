# CLAUDE.md — dreading-web

Installable PWA (no build step) for the Catholic daily readings. Consumes `dreading-api`; renders readings + AI enrichment. Sibling repos: `dreading-api`, `dreading-scrape`.

## Engineering (harness flow)
- Conventional commits, one logical unit per commit. Test-first for non-trivial logic.
- **Gate before commit**: `npm test` (node --test) green + the app serves and loads.
- Minimal comments; no dead code / stray TODOs / unused code.

## Structure
- `index.html` / `app.css` / `app.js` — the app shell, styles and DOM orchestration.
- `src/format.js`, `src/api.js` — pure logic (dates, streak, API client), unit-tested under `tests/`.
- `config.js` — API base URL (`?api=` / `localStorage` override).
- `manifest.webmanifest`, `sw.js`, `icon.svg` — PWA install + offline.

## Run
- `npm run dev` — static server on :5173. `npm test` — unit tests.
- Needs the API reachable (CORS-enabled) and populated with readings.
