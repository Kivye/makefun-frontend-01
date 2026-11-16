# make.fun Bounty desk · v6.1

[![make.fun · makefun-frontend-01](https://make.fun/badge/makefun-frontend-01.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![rank](https://make.fun/badge/makefun-frontend-01/Kivye/makefun-frontend-01/rank.svg)](https://make.fun/bounty/makefun-frontend-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![reward](https://make.fun/badge/makefun-frontend-01/Kivye/makefun-frontend-01/reward.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)

A persistent opportunity board beside the brief, ranking or builder profile. Built for the [make.fun frontend bounty](https://make.fun/bounty/makefun-frontend-01). All remote data comes from read-only GET requests to https://make.fun/api. There are no external fonts or framework dependencies.

The 420 px board retains search, category and status filters, open-first sorting, all returned rows and an expandable deadline window. The default split opens a live bounty immediately. Detail panes retain the full brief, prerequisites, rules, judging facts, three participation checkboxes, every payout place, escrow/dispute facts and dates. Repeated reward amounts are grouped into explicit ranges; expand the ladder for individual places.

Rankings keep every API row, medals, wins, win-rate bars, profile earnings, phase/view controls and tie-break facts. Profiles retain public links, statistics, paginated activity, a badge shelf and payout evidence. Missing public data is shown as unavailable. Hash routes support `#/bounty/<slug>`, `#/leaderboard/<slug>`, the earlier `#/bounty/<slug>/leaderboard` form and `#/profile/<handle>`. Below 900 px the board appears above the detail.

Use Node 22: `MAKEFUN_OUTPUT_DIR=out node main.ts` generates the deterministic dossier through the unchanged kit module. `node serve.ts --port 8081` serves the app. The build measures gzip-9 of index.html, style.css, main.js, views.js, api.js and format.js into app/shell.json; the UI displays that exact total. The full default brief renderer is part of these six files. Profile and ranking modules/styles load on demand. Requests are cached and deduplicated per session; the footer honestly records the first API fetch time.

Run `node tools/fwdproxy.mjs 18080`, then `node tools/shoot.mjs` with CHROMIUM_PATH set to the installed Chromium executable. All browser requests pass through that proxy; HTTPS tunnels through HTTPS_PROXY. The capture script waits for window.__shotReady and writes exactly three 1280×800 quality-82 JPEGs. `node tools/verify.mjs` checks the shell budget and live interactions.

See BUILD-STATUS.md for this session's verification. MIT licensed.
