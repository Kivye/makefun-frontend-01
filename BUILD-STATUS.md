# v7.4h build status

Shell: **3287 B gzip-9**, measured by tools/mkshell.mjs from app/index.html alone. One-file default load; three direct lazy routes and four later module files. This exceeds the requested 2048/2900-byte targets, but is below the 3600-byte platform cap. The inline board, detail, shared CSS and cache logic remain feature complete; the current implementation did not achieve the requested smaller floor.

Canonical vendor verified before main.ts was authored: 85533 bytes; SHA256 4c8da1c8e76490b3a847670f49137d3ec23953e3c988fe6a6cb320fce5739240.

Node 22 builds produced byte-identical dossier and outline outputs. After final built-output captures, the final build was rerun. Read-only scratch-copy self-test: exit 0, CWD /, output outside the copy, dossier.json and outline.json present. This test used permission removal on the copy, not a read-only bind mount. Canonical dossier equality: byte-identical against a fresh app/screenshots-only assembly. tools/verify.mjs PASS: vendor, shell, output-only write paths, canonical dossier equality, screenshot caps, direct routes, board filter restoration, virtual-window scroll update and memory bookmark. Kit check: 4 passed, 0 failed, 16 skipped, 5 checked at submission.

Three live screenshots were captured at 1280×800 as JPEG quality 82 and opened for inspection. Board, standings and profile are unmistakably distinct. Board has more than nine visible rows with six open countdowns; standings has ten complete ranked rows with rates and 90% intervals; profile has five stat boxes and six prize-bearing activity rows. No screenshot is blank. Browser image failures affect some third-party avatar images returned by the API; missing avatars use initials where the payload has no image.

Requirements 1–12:

1. Cover selects makefun-frontend-01 using live pot, fee, entries and deadline. Open-by-deadline bounties precede closed ones.
2. Visible Closing soon / Biggest pot / Most entries / Best odds pills and category pills appear on cover.
3. All views show API requests, unchanged (304), and memory counts; warmed captures show nonzero memory reuse.
4. Cover lists every live reward amount with proportional bars; amounts include the fee share. Base/fee components are not separately displayed.
5. Standings rows show API avatars when present, initials otherwise, judge rate bars and low–high 90% intervals.
6. Profile has large initials fallback, five stats and populated results. It uses rows rather than the requested entry-card grid; selected builder has no avatar in payload.
7. Six deadline-open bounty rows with live countdowns are visible on cover.
8. Ten full ranked rows are visible in the standings screenshot. Full data contains 7244 ranked entries; DOM uses a window with spacers.
9. More than nine board rows visible; six open.
10. Warm-up board/bounty/standings/profile navigation precedes captures. Counters show memory hits. No 304 was observed in captures; refresh revalidation logic sends If-None-Match when explicitly requested through the shared get helper.
11. tidy-meteor-25 has six displayed entries with recorded place and prize.
12. Three routes are lazy-imported. Shell size target was missed: actual 3287 B, stated above and generated in shell.json.

Other limitations: footer is below the viewport when the full board extends the document, so its facts are not visible in the screenshots. Detail countdown updates in header at hourly display precision. The full-brief view is deliberately secondary. Owner metadata, MIT license and required README badges are present.

Commit: recorded by the final git commit output (BUILD-STATUS is part of that commit).
