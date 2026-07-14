# dreading-web

Installable **PWA** for the Catholic daily readings — the flagship client of the [`dreading-api`](../dreading-api) platform. Phone-first, offline-capable, no build step.

> **Status — early MVP.** One screen: today's reading with tabbed sections (first reading / psalm / second reading / gospel), an AI reflection (with a kids mode), the message of the day, discussion questions, listen (text-to-speech), share, a reading streak, and date navigation. Installable to the home screen; works offline once opened.

## What it shows

It renders exactly what the API serves — the authentic readings plus the enrichment fields (`reflection`, `kids_reflection`, `message`, `questions`, `image_prompt`). AI-generated content is clearly labeled; the readings themselves are the liturgical text.

## Design

"Liturgical light": indigo-night / parchment, a liturgical-green accent with manuscript gold, scripture set in a serif. The signature is the **illuminated incipit** — the gospel's opening line treated like a manuscript page.

## Run it (no build step)

The API must be reachable with data — bring up the `dreading-api` stack (and populate it, e.g. via `dreading-api/scripts/e2e.sh`). Then serve these static files:

```bash
npm run dev        # python3 -m http.server 5173
# open http://localhost:5173
```

Point it at a different API with `?api=` or `localStorage.dreading_api`:

```
http://localhost:5173/?api=http://localhost:89/api/v1
```

> The API must allow the PWA's origin via CORS (Laravel `config/cors.php`, `paths: ['api/*']`).

## Features

- Tabbed reading sections · AI reflection · **kids mode** · message of the day · discussion questions
- **Listen** (browser text-to-speech, free & offline) · **Share** (Web Share API) · reading **streak** (local)
- Date navigation (‹ Hoy ›) · **installable** (add to home screen) · **offline** (service worker caches shell + last reading)

## Test

```bash
npm test           # node --test (pure logic: date helpers, streak, API client)
```

## Deploy

Static hosting, free tier: Cloudflare Pages, Vercel, or Netlify — just publish this folder. Set the production API base via `?api=` in the deployed URL or bake it into `config.js`.
