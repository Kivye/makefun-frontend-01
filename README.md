# Bounty Timetable v4

A read-only make.fun explorer for live opportunities, deadlines, challenge details, public results and builder records. Plain HTML, CSS and JavaScript modules; no framework or build step.

## Routes

- `#/` — open-first board and seven-day deadline rail
- `#/bounty/makefun-frontend-01` — public brief and compact payout table
- `#/bounty/threejs-fps-02/leaderboard?phase=dev&view=performance` — public rankings
- `#/profile/zkhiel` — public builder profile

## Run and package

```sh
node serve.ts --port 8081
MAKEFUN_OUTPUT_DIR=/tmp/makefun-output node main.ts
```

Displayed figures come from `https://make.fun/api`; leaderboard rows use only that endpoint's response. API answers are cached in memory for the page lifetime and are not revalidated. The header measures browser CompressionStream gzip bytes of the HTML, CSS and modules fetched on first load. All API requests are read-only GETs with credentials omitted.

## Screenshots

The three JPEGs are captured from live API routes using `tools/shoot.mjs`, Chromium and `tools/fwdproxy.mjs`. Capture waits for `window.__shotReady` and uses the 1280×800 viewports listed in `shots.json`.

## License

MIT. `vendor/makefun-frontend.ts` is the unchanged competition kit library.

## Validation and capture

Run `node tools/verify.mjs` with proxy-aware Node fetch (`NODE_USE_ENV_PROXY=1` on Node 22.21). Install playwright-core locally for capture; set CHROMIUM_PATH to the cached Chromium executable. Start the server and forward proxy, then run `node tools/shoot.mjs`. Capture fails on route errors, missing tables, overflow or oversized images within bounded timeouts. `shots.json` also records the required rendered selector and JPEG encoding.

The rail shows the five nearest deadlines within seven days, in chronological cards, merging deadlines less than two hours apart; amounts separated by slashes are individual bounty pots, never a shared prize pool. Countdown labels tick locally; this does not refresh API answers. Reload the page to fetch a new snapshot.
