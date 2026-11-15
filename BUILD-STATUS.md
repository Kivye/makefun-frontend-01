# Build verification

Completed the four-surface vanilla frontend and live capture workflow. No fee payment or submission was initiated in this continuation.

## Final live screenshots

Captured directly from the app served on 127.0.0.1:8081 through the local forward proxy on port 18080. Chromium loaded the public make.fun API itself; there was no response interception, fixture injection, or image editing. Every final API response was HTTP 200. All three images were opened and visually inspected after the final capture.

- `1-board.jpg`: root board, 1280×800, 76,880 bytes.
- `2-bounty.jpg`: makefun-frontend-01 detail, 1280×800, 87,402 bytes; live pot $550, $0.50 entry fee, deadline and rewards visible.
- `3-leaderboard.jpg`: threejs-fps-02, development/performance, 1280×800, 71,959 bytes; live ranked entries and API-defined metrics visible.

The public API intermittently returned 503 while under load. GET requests now explicitly accept JSON and retry 429/503 at most twice, respecting Retry-After with a bounded delay. The final capture completed without retries. Profile rendering passed the fixture browser checks; a separate live profile request did not finish during this session, so it is not represented as a live screenshot.

## Validation

- Renderer/API checks and browser deep links for all four surfaces pass, including filtering, mobile overflow, runtime errors, request deduplication, minute caching and conditional ETag 304.
- Desktop board and leaderboard spacing revised after inspecting live screenshots, followed by fresh captures.
- Unchanged vendor library compared against the kit.
- Node 22 main.ts produced `/tmp/makefun-final-a/dossier.json` and `/tmp/makefun-final-b/dossier.json`; recursive comparison of both complete output directories found no differences.
- `git diff --check` passes.
- Kit check with `--worktree`, run inside the kit: 4 passed, 0 failed; remote/transcript checks remain the site's checks at submission.

Operator performs submission after the recording is sealed. Do not pay again.
