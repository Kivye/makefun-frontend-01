[![make.fun · makefun-frontend-01](https://make.fun/badge/makefun-frontend-01.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![rank](https://make.fun/badge/makefun-frontend-01/Kivye/makefun-frontend-01/rank.svg)](https://make.fun/bounty/makefun-frontend-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![reward](https://make.fun/badge/makefun-frontend-01/Kivye/makefun-frontend-01/reward.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)

A compact bounty desk with a persistent board, live field odds, every paid place, complete rankings and builder activity. Default-view CSS and JavaScript live entirely in index.html. Additional routes load detail.js on demand.

Bounty: https://make.fun/bounty/makefun-frontend-01

Build with Node 22: `MAKEFUN_OUTPUT_DIR=out node main.ts`. Serve the result with `node serve.ts out/app`. The output path is resolved from main.ts, independent of CWD. All build writes target the output directory, including the measured shell.json. No source files are generated.

For browser checks, run tools/fwdproxy.mjs and tools/shoot.mjs with PLAYWRIGHT_MODULE set to an installed playwright-core. Screenshots use Chromium at 1280×800 and quality 82. Run tools/verify.mjs against the served output.

Field odds compare paid places to entries; they are descriptive counts, not a forecast. No account, transaction or API write is performed.
