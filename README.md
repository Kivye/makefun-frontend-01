# Bounty Timetable

[![make.fun · makefun-frontend-01](https://make.fun/badge/makefun-frontend-01.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![rank](https://make.fun/badge/makefun-frontend-01/Kivye/makefun-frontend-01/rank.svg)](https://make.fun/bounty/makefun-frontend-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![reward](https://make.fun/badge/makefun-frontend-01/Kivye/makefun-frontend-01/reward.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)

“Your next build. On the clock.” A read-only make.fun explorer for live opportunities, their deadlines, challenge details, public results and builder records. The interface is plain HTML, CSS and JavaScript modules with no framework or build step.

## Run locally

Node 22 or later serves the files directly from `app/`:

```sh
node serve.ts --port 8081
```

Open `http://127.0.0.1:8081/`. Supported routes include:

- `#/` — opportunity board and 14-day deadline rail
- `#/bounty/makefun-frontend-01` — public bounty brief and reward ladder
- `#/bounty/threejs-fps-02/leaderboard?phase=dev&view=performance` — public rankings
- `#/profile/zkhiel` — builder activity, record and payouts

Displayed bounty, entry, rank and builder figures come from `https://make.fun/api`; missing API fields remain unavailable. Career totals and payouts on rankings come from each listed builder's public profile response, while match wins and win rate come from the competition leaderboard response. The header measures the six-file desktop shell with the browser's gzip stream. Detail modules load on demand; tablet and phone widths also load a responsive stylesheet, which is included in their measurement. All API requests are read-only GETs with credentials omitted.

## Live screenshots

The repository's three JPEGs are captured from the running app with Chromium against make.fun's live API. Install `playwright-core` outside the app tree and set `PLAYWRIGHT_MODULE` if needed, along with `CHROMIUM_PATH` to a local Chromium executable. The forward proxy lets Chromium reach the API through the environment egress proxy:

```sh
node tools/fwdproxy.mjs 18080
SHOT_PROXY=http://127.0.0.1:18080 node tools/shoot.mjs
```

`shots.json` records the three 1280×800 routes. Capture visits them in one live session so the fixed footer metadata is identical. It checks the live API responses and route content, plus the profile on desktop and mobile, and publishes the new images only after every check succeeds.

## Dossier

With exactly three screenshots in `screenshots/`, stage the entry outside the source tree:

```sh
MAKEFUN_OUTPUT_DIR=/tmp/makefun-output node main.ts
```

`main.ts` copies `app/` and `screenshots/`, creates the platform dossier using the unchanged `vendor/makefun-frontend.ts`, and writes `outline.json` with each source file's feature summary and declarations. Both the outline and dossier are deterministic for unchanged inputs.

## License

MIT. The competition dossier library in `vendor/makefun-frontend.ts` is provided by the make.fun kit and remains unchanged.
