# Full rewrite validation — 16 November 2026 UTC

Every requested text file was deleted and then authored in one complete write in this session: the six app files, main.ts, serve.ts, shots.json, .gitignore, LICENSE, README.md, this record and the three tools. No patch or line edit was used. The original kit vendor remains byte-identical to starter/vendor/makefun-frontend.ts.

The Bounty Timetable layout retains its 50 px header, 76 px hero, 72 px deadline rail and 44 px alternating board rows. Eleven complete rows fit the 1280×800 capture. All four hash surfaces use public credential-free GET API requests, page-lifetime caching and readiness signals. Rankings make no profile fan-out requests.

After opening and visually inspecting all three first captures, a separate full-file rewrite of app/format.js improved invalid-number handling and case-insensitive paid status detection. Edge-case assertions passed. All three routes were recaptured and every final JPEG was opened and inspected again.

Validation:

- Live renderer/API checks passed with 18 board records, deadline-based acceptance, escaping, ordering, all four renderers and request deduplication.
- Browser checks passed: search, Open filter, direct profile URL, no ranking profile fan-out, no JavaScript exceptions, no desktop overflow and no board overflow at 390 px.
- Exactly three JPEGs at 1280×800, quality 82: 1-board.jpg 119,827 bytes; 2-bounty.jpg 146,001 bytes; 3-leaderboard.jpg 78,181 bytes. Each is below 256 KiB.
- Measured browser header: 9.6 KB gzip for the six first-load assets. Independent Node gzip sum: 9,825 bytes, reduced from the earlier 11.5 KB display. API response bytes are excluded.
- Two builds using Node v22.21.0 and MAKEFUN_OUTPUT_DIR=out yielded byte-identical dossier.json. Dossier SHA-256: c8979722e7022ba93735bbf204487ac3690ef17e8ed9400522a1412af8a6807b.
- Kit worktree check: 4 passed, 0 failed, 16 skipped, 5 checked at submission. The first worktree check required an explicit SPDX identifier; LICENSE was deleted and fully rewritten with SPDX-License-Identifier: MIT plus the complete MIT grant and disclaimer, then the check passed.
- Vendor comparison and git diff --check passed. The kit's sealed transcript/authorship and submission-only checks run server-side, not in this local command.

Commit reference available before this delivery commit: 55be2d8c256bf0b3c728086424bd48e243e7d73b (base). This record is included in the commit named `v4: full rewrite, dense timetable`. Its own content-derived SHA cannot be embedded in itself; the exact delivery SHA and push result are reported after commit creation.
