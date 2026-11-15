# Bounty desk — fast rewards, rankings and builder profiles

[![make.fun bounty](https://make.fun/badge/makefun-frontend-01.svg)](https://make.fun/bounty/makefun-frontend-01)
[![Live rank](https://make.fun/badge/makefun-frontend-01/Kivye/makefun-frontend-01/rank.svg)](https://make.fun/bounty/makefun-frontend-01)
[![Live reward](https://make.fun/badge/makefun-frontend-01/Kivye/makefun-frontend-01/reward.svg)](https://make.fun/bounty/makefun-frontend-01)

A lightweight, read-only make.fun explorer, written from scratch in vanilla ES modules. Four directly addressable surfaces connect the bounty board, full challenge details, top-ten leaderboards, and public builder profiles. No framework, build step, external font, sign-in, or write request.

## Run

Serve `app/` as the web root using any static HTTP server, or run:

```sh
node serve.ts --port 8081
```

Open `http://127.0.0.1:8081/`. Example deep links:

- `#/`
- `#/bounty/makefun-frontend-01`
- `#/bounty/threejs-fps-02/leaderboard?phase=dev&view=performance`
- `#/profile/zkhiel`

The app needs browser access to `https://make.fun/api`. Requests use GET with credentials omitted. A URL-keyed memory cache deduplicates requests, refreshes once per minute, retries temporary 429/503 responses with bounded Retry-After delays, and sends API ETags for conditional 304 responses. Board pages use cursor pagination, text/category filters run locally, profiles reveal solutions ten at a time, and leaderboards request only `rows=first`. API text is escaped, profile links are restricted to HTTPS, and avatars set anonymous CORS before their source.

## Capture and package

Screenshots must be actual live renders; no stored data is bundled into the app. Install `playwright-core` separately for development. Set `PLAYWRIGHT_MODULE` to its absolute entry point if it is not installed locally, and `CHROMIUM_PATH` to a browser executable. With the local server running:

```sh
node tools/fwdproxy.mjs 18080
# In another terminal, with the same proxy environment:
SHOT_PROXY=http://127.0.0.1:18080 node tools/shoot.mjs
```

`shots.json` documents the three 1280×800 routes. Capture waits for `window.__shotReady`, then 700 ms, requires rendered live data, uses JPEG quality 82, checks the 256 KiB cap, and publishes the set only after all captures succeed. Inspect the files before packaging.

```sh
MAKEFUN_OUTPUT_DIR=/tmp/bounty-desk-output /path/to/node22 main.ts
```

`main.ts` uses only Node's standard library and the kit's unchanged dossier vendor. It has no network access, requires exactly three screenshots, copies the static assets and creates the dossier with competition caps. Two runs with the same assets produce the same output bytes.

## Development checks

`node tools/verify.mjs` runs renderer and API cache checks against previously captured API samples when `MAKEFUN_FIXTURE_DIR` points at a directory containing `board.json`, `bounty.json`, `leaderboard.json`, and `profile.json`. This is explicitly fixture testing, never the live screenshot workflow. Set `PLAYWRIGHT_MODULE` and `CHROMIUM_PATH` as above. Add `--browser` to check deep links, filters, mobile width and runtime errors in Chromium. Test renders stay outside `screenshots/`.

MIT licensed. `vendor/makefun-frontend.ts` is provided by the competition kit and copied unchanged.
