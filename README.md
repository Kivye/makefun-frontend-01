# Bounty Timetable · v5

[![make.fun · makefun-frontend-01](https://make.fun/badge/makefun-frontend-01.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![rank](https://make.fun/badge/makefun-frontend-01/Kivye/makefun-frontend-01/rank.svg)](https://make.fun/bounty/makefun-frontend-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![reward](https://make.fun/badge/makefun-frontend-01/Kivye/makefun-frontend-01/reward.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)

Your next build. On the clock. A static, read-only frontend for the [make.fun bounty](https://make.fun/bounty/makefun-frontend-01), using only public GET responses from https://make.fun/api.

Run `node serve.ts --port 8081` with Node 22. The app has four deep-linkable hash routes: `#/`, `#/bounty/makefun-frontend-01`, `#/bounty/threejs-fps-02/leaderboard?phase=dev&view=performance`, and `#/profile/zkhiel`.

The board keeps the fourteen-day timetable, search/category/status filters, open-first ordering and every API row. Bounty details retain the participation checklist, complete payout ladder, expandable brief/rules and escrow/date facts. Rankings retain medals, match wins, win rates, streaks, profile earnings, phase/view selectors and tie-break rules. Profiles include activity pagination, statistics, badges and payout evidence.

Requests are deduplicated and cached for this page session. The shared footer's update time records that session's initial board fetch, rather than implying a background refresh. No cached response is presented as a subsequent network refresh. Missing fields remain unavailable. Detail JavaScript/CSS and mobile CSS load on demand. The size badge measures the actual six shell files, plus mobile CSS on narrow screens, using browser gzip; `tools/verify.mjs` also reports exact gzip-9 bytes.

Capture live screenshots using `node tools/fwdproxy.mjs 18080` and `node tools/shoot.mjs`. Chromium routes every request through the loopback proxy, which tunnels remote HTTPS through HTTPS_PROXY. Set CHROMIUM_PATH and optionally PLAYWRIGHT_MODULE for the local installation. The capture script waits for window.__shotReady, checks the full surfaces and publishes exactly three 1280×800 quality-82 JPEGs only after validation.

Run `node tools/verify.mjs` for shell and render checks. Run `MAKEFUN_OUTPUT_DIR=out node main.ts` to stage app/, screenshots/, a deterministic outline and the kit dossier. The unchanged vendor/makefun-frontend.ts owns dossier generation. No build step or external font is needed by the app.

MIT licensed. See BUILD-STATUS.md for this session's measured result and validation.
