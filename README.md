# Bounty Timetable

[![make.fun · makefun-frontend-01](https://make.fun/badge/makefun-frontend-01.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![rank](https://make.fun/badge/makefun-frontend-01/Kivye/makefun-frontend-01/rank.svg)](https://make.fun/bounty/makefun-frontend-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![reward](https://make.fun/badge/makefun-frontend-01/Kivye/makefun-frontend-01/reward.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)

Entry for the [make.fun frontend bounty](https://make.fun/bounty/makefun-frontend-01). A compact work board makes deadlines, individual pots, fees and entry counts easy to compare without inventing an aggregate prize figure.

The seven-day rail groups overlapping deadlines. The table sorts accepting bounties first and supports search, category and status filters. Bounty details provide the brief, escrow context and a compact payout schedule. Rankings display API-supplied ranks, handles, titles and scores; phase and view selectors use the same public endpoint without profile fan-out. Public builder profiles complete the four surfaces.

Open these hash routes:

- `#/`
- `#/bounty/makefun-frontend-01`
- `#/bounty/threejs-fps-02/leaderboard?phase=dev&view=performance`
- `#/profile/zkhiel`

All remote data comes from credential-free GET requests to `https://make.fun/api`. The in-memory response cache lasts until reload. No fonts or assets require another origin. The header measures each of the six first-load files with browser gzip compression and sums their compressed lengths; it excludes API data and HTTP overhead.

Run with Node 22.21.0:

```sh
node serve.ts --port 8081
node tools/fwdproxy.mjs
node tools/shoot.mjs
NODE_USE_ENV_PROXY=1 node tools/verify.mjs
MAKEFUN_OUTPUT_DIR=out node main.ts
```

The screenshot script requires playwright-core and a cached Chromium, found automatically or selected through CHROMIUM_PATH. Browser traffic uses the loopback forward proxy on port 18080, which tunnels remote HTTPS through HTTPS_PROXY. Three JPEGs are captured at 1280×800, quality 82, after `window.__shotReady` signals that route rendering and size measurement have settled. Each capture must remain below 256 KiB.

The build copies app/ and screenshots/ to the chosen output and calls the unchanged vendor kit to produce dossier.json. Repeating the build must produce identical bytes. See BUILD-STATUS.md for the validation record. Source is MIT licensed.
