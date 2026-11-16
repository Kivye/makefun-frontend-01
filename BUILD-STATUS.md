# v7 build status

One-file shell: **3,405 B gzip-9**, measured by Node 22.21.0 gzipSync(level: 9) over app/index.html alone. Below the 3,600 B hard cap; the 3,200 B aspirational target was not reached. app/shell.json and the operational-strip label match. The default board and frontend bounty load no separate script, stylesheet or shell metadata. Rankings and profiles import detail.js on demand.

Field odds use submissionCount and the number of reward places: max(1, round(entries / places)). Board rows show 1 in N; Best odds puts open fields first, smallest N first, and exactly one best open field has VALUE. Detail shows entries, paid places, 1 in N cashes and pot per submission to two decimals. The metric is labeled places ÷ entries from live API counts, not a win prediction. No odds requests are made. Zero entries display no pot-per-entry estimate.

Validation completed:
- Initial dossier builds using Node 22.21.0 and MAKEFUN_OUTPUT_DIR=out were byte-identical across every output file (initial shell 3,503 B).
- Three live Chromium JPEGs through 127.0.0.1:18080 forwarding via HTTPS_PROXY, 1280 × 800, quality 82: 1-board.jpg 130,905 B; 2-bounty.jpg 130,754 B; 3-leaderboard.jpg 104,413 B. All opened and visually inspected.
- A separate later full-file revision tightened reward spacing so all 20 frontend places fit above the footer. The honest size label moved into the 48px operational strip. Captures were replaced and inspected again after revisions.
- Final dossier build completed after app revisions; app/ is frozen and main.ts has not been run again.
- tools/verify.mjs passed: exact single-file gzip, embedded label, output identity, canonical kit dossier, exactly three JPEGs under 256 KiB, MIT SPDX line, no separate default assets, 420px board, 20 visible rewards, VALUE, sort switching, direct leaderboard with all 5,808 API rows, direct public profile and stacking below 900px.
- Footer facts match in all three images: one file, 46 bounties, GET-only API and USDC rewards.

Consolidation: app/api.js, app/format.js, app/views.js, app/main.js, app/style.css, app/detail.css and app/mobile.css were deleted; their default responsibilities are inline in app/index.html. No references remain. app/detail.js contains lazy rankings and profiles. All requested text files were deleted and fully written, including unchanged-content owner.json and LICENSE. README retains all three badges and the bounty link.

The inherited vendor/makefun-frontend.ts is empty and was untouched as instructed. tools/dossier.ts is an unchanged complete copy of the official kit helper and builds the canonical dossier. Initial kit screenshots were replaced by the three live captures before the final build.

Kit check passed: **4 passed, 0 failed, 16 skipped, 5 checked at submission**. It checks intake requirements; it does not run grading or certify transcripts.

Pre-commit kit command: node cli/makefun.mjs check --kit . --repo /home/hatch/workspace/makefun/entries/makefun-frontend-01/repo-v7 --worktree, from the supplied kit directory.

Commit: <commit sha> (full SHA printed in the final session response).
