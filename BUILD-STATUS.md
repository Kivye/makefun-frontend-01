# Full rewrite validation — 16 November 2026

All 16 requested text files were deleted with rm and written in full during this session: app/index.html, app/api.js, app/format.js, app/views.js, app/main.js, app/style.css, main.ts, serve.ts, shots.json, .gitignore, LICENSE, README.md, BUILD-STATUS.md, tools/fwdproxy.mjs, tools/shoot.mjs and tools/verify.mjs. No patching or line-editing was used. The three required badge lines and bounty link remain in README. LICENSE includes the full MIT terms and SPDX declaration.

The v4 Bounty Timetable design retains the 50px header, 76px compact hero, 72px seven-day deadline rail, 44px alternating rows and fixed-width countdowns. Eleven complete rows fit the desktop capture. The four hash surfaces, filters, open-first ordering, compact payout schedule, escrow strip, public profiles and API-only leaderboard fields remain present. Requests are credential-free GETs to make.fun/api with page-lifetime deduplication. There is no profile fan-out from rankings.

After the first three screenshots were opened and visually inspected, app/format.js was deleted and rewritten as a separate revision. It now distinguishes whitespace-only numeric values from genuine zero and normalizes surrounding whitespace in status values. Assertions for both cases passed. The three screenshots were recaptured against final code and opened again for inspection.

Validation results:

- Live API checks passed: 18 board records, all four renderers, escaping, deadline acceptance, ordering and shared GET requests.
- Chromium checks passed through the loopback forward proxy: search, Open filter, direct profile route, no ranking fan-out, no page exceptions, desktop and 390px mobile containment.
- Exactly three 1280×800 quality-82 JPEGs: 1-board.jpg 122256 bytes; 2-bounty.jpg 148428 bytes; 3-leaderboard.jpg 78544 bytes. All are below 262144 bytes.
- Browser first-load chip: 9.5 KB gzip. Independent Node gzip sum: 9778 bytes across the six initial files. This is below 10 KB and below the requested 11.5 KB starting reference; API payloads and HTTP overhead are excluded.
- Node v22.21.0, MAKEFUN_OUTPUT_DIR=out: two successful builds produced byte-identical dossier.json. SHA-256: ba1f688e0005302a63f1bbf2a56f85550b355a640f78f7996d75ed76cd39ae1e.
- Fresh-kit check with --worktree: 4 passed, 0 failed, 16 skipped, 5 checked at submission. The required plain check also returned 0 failed. Sealed transcript/authorship checks are performed server-side and are not certified by this local check.
- vendor/makefun-frontend.ts compares byte-identically with the fresh kit starter. git diff --check passed.

Pre-delivery base SHA: 306ec9822744f59cb9b3b836d6ed697c16afe9e6. This record is included before the delivery commit named “v4: full rewrite, dense timetable”. The delivery commit's own SHA cannot be embedded in its content; its exact full SHA and push outcome are reported in the session's final response.
