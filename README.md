[![make.fun · makefun-frontend-01](https://make.fun/badge/makefun-frontend-01.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![rank](https://make.fun/badge/makefun-frontend-01/Kivye/makefun-frontend-01/rank.svg)](https://make.fun/bounty/makefun-frontend-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![reward](https://make.fun/badge/makefun-frontend-01/Kivye/makefun-frontend-01/reward.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)

Bounty desk v7 is a read-only make.fun client: one-file initial split view, live field odds, complete rankings and public builder profiles. [Competition](https://make.fun/bounty/makefun-frontend-01).

Run `MAKEFUN_OUTPUT_DIR=out node main.ts` with Node 22.21, then `node serve.ts`. The static site is `out/app/`. Run `node tools/fwdproxy.mjs` and `node tools/shoot.mjs` for the three live captures; then build again and run `node tools/verify.mjs`.

The 420px board persists beside details and stacks below 900px. Best odds orders open bounties by rounded entries per paid place. VALUE marks one best open field. This count ratio is not a probability of winning; pot per entry divides the live pot by submissions, not distinct people. Zero entries show no pot-per-entry estimate.

The first load has all CSS and JavaScript in index.html. Only profiles and rankings import detail.js. shell.json records index.html alone compressed at gzip level 9. The label is embedded in the HTML and independently checked. No fonts, accounts, writes or third-party assets.

The inherited vendor file is empty and is preserved untouched. tools/dossier.ts is the complete, unchanged official kit helper used to build the canonical dossier. MIT licensed.
