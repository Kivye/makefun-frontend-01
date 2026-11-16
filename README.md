# Bounty Timetable

[![make.fun · makefun-frontend-01](https://make.fun/badge/makefun-frontend-01.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![rank](https://make.fun/badge/makefun-frontend-01/Kivye/makefun-frontend-01/rank.svg)](https://make.fun/bounty/makefun-frontend-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![reward](https://make.fun/badge/makefun-frontend-01/Kivye/makefun-frontend-01/reward.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)

A dense, read-only view of public make.fun opportunities. Competition: https://make.fun/bounty/makefun-frontend-01.

The board combines open-first ordering, a seven-day deadline rail, search, category selection and All/Open/Ended filters. Nearby deadlines share a card without combining unrelated prize totals. Detail pages present the brief, escrow context, entry statistics and the first five payout places. Rankings use the public API's rank, handle, entry title and score fields, with phase and view controls. Builder profiles show public records and entries.

Routes:

- `#/`
- `#/bounty/makefun-frontend-01`
- `#/bounty/threejs-fps-02/leaderboard?phase=dev&view=performance`
- `#/profile/zkhiel`

No framework, remote fonts or external asset origins are needed. Public data is fetched only through credential-free GET requests to `https://make.fun/api`. Requests are deduplicated in memory; reload for fresh data. Countdown labels update locally. The header measures the summed gzip sizes of all six initial application files with CompressionStream; API payloads are excluded.

Use Node 22.21:

```sh
node serve.ts --port 8081
NODE_USE_ENV_PROXY=1 node tools/verify.mjs
MAKEFUN_OUTPUT_DIR=out node main.ts
```

For live screenshots, run `node tools/fwdproxy.mjs` alongside the static server. Set `CHROMIUM_PATH` to a cached Chromium executable and run `node tools/shoot.mjs` with playwright-core installed locally. All browser traffic passes through the loopback proxy; remote HTTPS tunnels use HTTPS_PROXY. The capture tool waits for `window.__shotReady`, checks rendering and writes exactly three 1280×800 quality-82 JPEGs under 256 KiB each.

`main.ts` stages the application and captures, then calls the unchanged kit library to produce a deterministic dossier. BUILD-STATUS.md records the final checks. MIT licensed; `vendor/makefun-frontend.ts` is the original kit file.
