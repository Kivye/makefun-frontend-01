# v7.3 build status

Shell: **2826 B gzip-9 · one file**, measured from app/index.html alone by tools/mkshell.mjs. This exceeds the 2048-byte target and remains below the 3600-byte hard cap; all default-view features were retained. app/shell.json is generated and committed, never modified by main.ts.

The persistent split board supports instant title filtering with no requests, default and best-odds sorting, an open-bounty VALUE tag, cash odds and a live request counter. Field odds use live submissionCount and reward places: max(1, round(entries / places)); pot per entry uses potUsd divided by entries. Detail includes fee, deadline, checklist, every paid reward and an honest places-versus-entries label. Full leaderboard data remains in memory while only the scroll window is rendered. Profiles load public API activity.

Vendor verification: **85533 bytes**, SHA-256 **4c8da1c8e76490b3a847670f49137d3ec23953e3c988fe6a6cb320fce5739240**. Copied unchanged from the kit.

Two consecutive preliminary builds produced byte-identical dossiers. Final build succeeded under Node 22.21.0. main.ts derives source paths from import.meta.url and writes exclusively to its absolute output directory.

Read-only self-test: **exit code 0**. Scratch source directories were 0555 and files 0444. The build ran as uid/gid 65534, without supplementary groups, from CWD /, with output outside the copy, producing dossier.json and outline.json. Initial setup attempts failed on runtime traversal permissions, scratch capacity and cross-device linking; the completed test used an accessible runtime hard link and non-writable source.

Dossier equality self-check: **byte-identical**. Independently copied only app/ and screenshots/ to another scratch directory, invoked canonical buildDossier with the exact caps, and byte-compared its output with final out/dossier.json.

Validation: **tools/verify.mjs PASS** for vendor size/hash, shell measurement/cap, build write paths, screenshot limits, direct routes, odds, zero-request filtering, virtual scrolling and profile rendering. Three 1280×800 JPEG captures were opened and inspected. The revised bounty capture shows all 20 paid places. Footer facts match across all three screenshots. Final verification required restarting terminated server/proxy listeners; app and final build remained unchanged.

Kit worktree check: **4 passed, 0 failed, 16 skipped, 5 checked at submission**. Recording and publication checks are performed by the site at submission.

Commit SHA: recorded by the final git commit output (self-referential SHA placeholder).
