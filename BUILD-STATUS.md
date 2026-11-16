# v5 build status

The size goal was not achieved. The final six-file desktop shell is 8,146 bytes gzip-9, above the required 5 KB ceiling. It is 2,060 bytes smaller than the 10,206-byte total measured from this session's starting checkout (the task cited a historical v3 measurement of 10,116 bytes). The requested commit title is retained, but “shell halved” is not a claim supported by this result.

All 20 requested text files were read, deleted and recreated with complete writes during this session. The owner JSON is byte-identical to the starting record, the full MIT license is retained, and README contains the three exact make.fun badge lines and bounty links. vendor/makefun-frontend.ts was not modified.

The rewrite uses short shell classes, compact template renderers, a shared row/head helper, promise-based request deduplication and caching, and lazy detail routing. Board data, templates and desktop styles remain entirely in the measured graph. No board dependency is hidden in a lazy file. Detail JavaScript/CSS and mobile CSS remain on demand.

## Measured shell

| File | gzip-9 bytes |
| --- | ---: |
| index.html | 597 |
| style.css | 2,393 |
| main.js | 1,838 |
| views.js | 1,999 |
| api.js | 466 |
| format.js | 853 |
| Total | 8,146 |

The running browser independently compresses the actual served shell and displays 8.0 KB gzip in the header and shared footer. Its native gzip encoder can differ from Node's level-9 encoder. Narrow layouts additionally measure mobile.css. The footer's update time is the initial board fetch time for the current page session; cached route transitions do not pretend to refresh the network data.

## Validation

- Live Chromium route, deep-load, search, request-cache and profile checks passed. Profile widths 390, 650, 700, 768, 800 and 900 px had no horizontal overflow; no browser runtime exceptions occurred.
- The board returned 16 live API rows and retained 52 px row height, the timetable, search/category/status controls and open-first ordering. No API rows were cut.
- Bounty validation found all three participation checkboxes and all 20 reward places. Escrow/deadline/stat facts and expandable brief/prerequisites/rules/resolution remain present.
- Rankings retain medals, wins, win rates, streaks, profile earnings, tie-break rule and phase/view controls. Profiles retain statistics, activity pagination, badges and payout evidence.
- Exactly three live JPEGs at quality 82 and 1280×800: 1-board.jpg 74,125 bytes; 2-bounty.jpg 80,832 bytes; 3-leaderboard.jpg 73,037 bytes. Each is below 256 KiB.
- All final screenshots were opened and visually compared with the starting v3 images. Layout, density, typography and copy were preserved. Different API amounts, counts, rankings and countdowns reflect current live responses.
- All captures share the same footer: 8.0 KB gzip, 16 loaded bounties, Updated 16 Nov, 08:13 UTC. Browser traffic, including loopback requests, used the forward proxy at 127.0.0.1:18080; HTTPS egress used HTTPS_PROXY. The app ran at 127.0.0.1:8081. No response fixtures or interception were used.
- Following the initial screenshots, a separate full-write revision made the API's GET method explicit and moved detail-only route handling to the lazy detail module. Final screenshots and route checks were then repeated.
- Two builds with Node v22.21.0 and MAKEFUN_OUTPUT_DIR=out produced byte-identical complete output trees: 14 files, including dossier.json and outline.json.
- Fresh kit check with --kit . --repo and --worktree: 4 passed, 0 failed. Submission-only and sealed-recording checks remain the platform's checks.

## Commit reference

Starting HEAD: c4429bfbc89b94ccd36f6aa1914fac775acd2eea. This status is written before the v5 commit and included in it. A commit cannot include its own final hash; the resulting full SHA is printed after creation. Requested commit message: v5: v3 complete, shell halved. The size requirement remains unmet despite that prescribed title.
