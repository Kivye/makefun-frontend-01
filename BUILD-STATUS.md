# Build Status · v3 restore

All 20 requested text files were read, deleted with rm, and recreated with one complete write per file in this session. The initial app recreation was byte-identical to the starting v3 working tree. README retains the exact three required make.fun badges and bounty links. The owner record and full MIT license were preserved. vendor/makefun-frontend.ts is untouched.

## Validation

- Live API/render and Chromium checks passed: 18 board rows, all four routes, read-only request deduplication, viewport widths 390–900 px, no horizontal overflow or runtime errors.
- Exactly three JPEGs, quality 82, 1280×800: 1-board.jpg 74,740 bytes; 2-bounty.jpg 80,799 bytes; 3-leaderboard.jpg 73,184 bytes. All are below 256 KiB.
- All three final images were opened and visually inspected. The original 52 px board row density, checklist, full 20-place rewards, escrow/deadline facts, medals, win rates, profile earnings and tie-break rule remain intact.
- Shared footer metadata is identical across the captures: browser-measured 10.0 KB gzip shell, 18 loaded bounties, Updated 16 Nov, 06:10 UTC. The six shell files are unchanged; measured bytes and current API figures are real, not fixed historical values.
- Browser traffic, including loopback HTTP, uses the forward proxy at 127.0.0.1:18080; remote HTTPS uses HTTPS_PROXY. The app is served on 127.0.0.1:8081. No fixtures or response interception were used.
- After capture, app/detail.js was deleted and fully rewritten again to split one combined const declaration. This cleanup changes no output or behavior.
- main.ts was fully rewritten to allow the requested out directory while retaining source-directory protections. Two builds using Node v22.21.0 and MAKEFUN_OUTPUT_DIR=out produced byte-identical complete output trees (14 files), including dossier.json and outline.json.
- Syntax checks and git diff --check passed. The fresh kit check, including --worktree, reported 0 failed. Recording/authorship and submission-only checks are evaluated by the platform, not this local check.

## Commit reference

Validated starting HEAD: d20d96db5692e278019c3286c118a8d764f28d7a. This report is written before the restore commit and included in it. A commit cannot contain its own final SHA; the restore commit's full SHA is printed after creation. Commit message: v3 restore: faithful full rewrite.
