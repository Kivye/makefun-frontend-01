# Bounty Timetable v4

[![make.fun · makefun-frontend-01](https://make.fun/badge/makefun-frontend-01.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![rank](https://make.fun/badge/makefun-frontend-01/Kivye/makefun-frontend-01/rank.svg)](https://make.fun/bounty/makefun-frontend-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![reward](https://make.fun/badge/makefun-frontend-01/Kivye/makefun-frontend-01/reward.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)

Bounty Timetable is a compact, read-only frontend for make.fun. It puts available work and approaching deadlines together so builders can scan opportunities, read a brief, inspect results and explore a builder's public record. This entry belongs to the competition at https://make.fun/bounty/makefun-frontend-01.

## Four surfaces

- **Bounty board** (`#/`): open opportunities come first, with search, category and status filters. A seven-day rail highlights the five nearest deadlines; deadlines less than two hours apart share a card, while each bounty keeps its own prize amount.
- **Bounty detail** (`#/bounty/makefun-frontend-01`): the public brief, entry information and a compact payout table.
- **Leaderboard** (`#/bounty/threejs-fps-02/leaderboard?phase=dev&view=performance`): public rankings drawn from the selected leaderboard endpoint.
- **Builder profile** (`#/profile/zkhiel`): a builder's public profile and activity.

The interface uses plain HTML, CSS and JavaScript modules without a framework or build step. Data comes from `https://make.fun/api` through GET requests with credentials omitted. Responses stay in memory for the page lifetime. Countdown labels tick locally; reload to obtain fresh API data.

## Run locally

Use Node 22.21 or a newer Node 22 release:

```sh
node serve.ts --port 8081
```

Open `http://127.0.0.1:8081`. To produce the submission package, run:

```sh
MAKEFUN_OUTPUT_DIR=/tmp/makefun-output node main.ts
```

## First-load size

The header measures gzip bytes for the first-load HTML, stylesheet and JavaScript modules using the browser's CompressionStream API. The v4 capture reported **11.5 KB**; a separate Node gzip-9 measurement totaled **11,736 bytes**. This exceeds the approximate 10 KB target to keep all four surfaces readable.

## Validation and captures

Run `NODE_USE_ENV_PROXY=1 node tools/verify.mjs` on Node 22.21 for the renderer/API checks. The three live-route screenshots are JPEGs captured at 1280×800; `shots.json` lists their routes, required rendered selectors and encoding settings.

For captures, install playwright-core locally, set `CHROMIUM_PATH` to a Chromium executable, and start the local server and `tools/fwdproxy.mjs` before running `node tools/shoot.mjs`. The capture script waits for `window.__shotReady` and checks route errors, tables, overflow and image size within bounded timeouts.

## License

MIT. The competition library in `vendor/makefun-frontend.ts` is unchanged from the kit.
