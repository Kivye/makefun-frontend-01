# Build Status · v3

The v3 rewrite restores `app/` as the only frontend tree. The duplicate `src/` tree and `tools/build.mjs` are removed. The public explorer has four routes: the timetable, bounty detail, competition leaderboard and builder profile. This session did not make another fee payment or submit an entry.

## Live Captures

`tools/shoot.mjs` served the app on `127.0.0.1:8081` and used the loopback forward proxy on port `18080`. Chromium read the public make.fun API directly; no fixture or response interception was used. The capture checked HTTP 200 API responses, route content, a 19-row board, active filter state, identical footer metadata, the profile at desktop and mobile sizes, and the 256 KiB image cap.

- `screenshots/1-board.jpg`: live timetable, 1280×800, 80,575 bytes.
- `screenshots/2-bounty.jpg`: makefun-frontend-01, 1280×800, 81,812 bytes; live pot $595.50, $0.50 entry fee, locked escrow, deadline, 20 rewards and participation checklist.
- `screenshots/3-leaderboard.jpg`: threejs-fps-02 development/performance, 1280×800, 74,425 bytes; API wins and win rates, profile earnings, medals and tie-break rule.

Each screenshot was opened and inspected after the final capture. The shared footer reports the same measured shell size, 19 loaded bounties and API-refresh time in all three images.

## Size And Dossier

The desktop shell files fetched by the initial module graph (`index.html`, `style.css`, `main.js`, `views.js`, `api.js`, `format.js`) total 10,116 bytes gzip-9. The browser-measured badge displays 9.9 KB. Detail modules load on demand; the responsive stylesheet loads and is measured at viewport widths up to 900 px.

`main.ts` copied the app and all three captures into two separate output directories. The two `dossier.json` files, both `outline.json` files and the complete output trees compared byte-identical. The outline lists declarations and a feature line for every source file. The vendored dossier library was not edited.

## Checks

- `node tools/verify.mjs`: pass against live public API data; 19 board rows, all four renderers and request deduplication.
- `node tools/verify.mjs --browser`: pass; four deep links, viewport widths from 390 to 900 px, and no browser runtime errors.
- `node tools/shoot.mjs`: pass; three fresh live screenshots and desktop/mobile profile smoke check.
- `node --check` for the app modules, `main.ts` and tooling; `git diff --check`: pass.
- No payment or submission was performed.
