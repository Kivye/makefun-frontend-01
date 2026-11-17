[![make.fun · makefun-frontend-01](https://make.fun/badge/makefun-frontend-01.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![rank](https://make.fun/badge/makefun-frontend-01/Kivye/makefun-frontend-01/rank.svg)](https://make.fun/bounty/makefun-frontend-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![reward](https://make.fun/badge/makefun-frontend-01/Kivye/makefun-frontend-01/reward.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)

A compact bounty desk: persistent board, client-side filtering, field odds, complete rewards and a virtual full leaderboard. Public read-only API data; no dependencies in the browser.

Bounty: https://make.fun/bounty/makefun-frontend-01

Use Node 22: `node tools/mkshell.mjs`, then `MAKEFUN_OUTPUT_DIR=out node main.ts`. Serve with `node serve.ts /absolute/path/to/out`. The canonical build writes exclusively to its output directory and supports a read-only source tree. `node tools/fwdproxy.mjs` and `node tools/shoot.mjs` capture live views; `node tools/verify.mjs` validates source contracts and rendered routes.
