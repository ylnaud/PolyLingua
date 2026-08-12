---
name: run-polylingua
description: Build, launch, and drive PolyLingua (the Astro static site in this repo) end to end — compile with astro build, serve with astro preview, and exercise a real lesson with the Playwright driver to take a screenshot or smoke-test a change. Use this whenever asked to run, start, launch, build, test, or screenshot PolyLingua, or to confirm a change works in the real app.
---

All paths below are relative to the repo root (`/home/user/PolyLingua`).

PolyLingua is a fully static Astro 7 site — no backend, no SSR adapter. There
is no `chromium-cli` in this environment (checked: not on `PATH`, not on npm,
nowhere on disk), so it isn't the driver here. What's driving it instead is
`.claude/skills/run-polylingua/driver.mjs`, a small Playwright script built
for this repo — every command below was actually run in this container this
session, not inferred from the README.

## Prerequisites

`node_modules` is already populated in a normal checkout of this repo. Only
run this if `node_modules/astro` is missing:

```bash
npm install
```

## Build

```bash
npx astro build
```

Builds ~376 static pages into `dist/`. This is the project's real
correctness check too — a malformed lesson (bad YAML, a Zod schema
violation) fails here loudly, not silently. If a `dist/` from a previous
build already exists, it's stale; always rebuild before driving the app.

## Run (agent path) — this is the one to use

1. Make sure nothing is already listening on the port — **as its own
   command**, not chained with step 2 (see Gotchas: chaining them in one
   shell invocation kills the backgrounded server along with its parent):

   ```bash
   pkill -f "astro preview" 2>/dev/null
   ```

   Then, in a **separate** command, start `astro preview` in the
   background:

   ```bash
   rm -f /tmp/polylingua-preview.log
   nohup npx astro preview --port 4321 > /tmp/polylingua-preview.log 2>&1 &
   sleep 3
   cat /tmp/polylingua-preview.log
   ```

   Look for `"Preview server running at http://localhost:4321"` in the log.

2. Drive it with the smoke flow — opens a real German A1 lesson, answers
   one item of every exercise kind (choice / fill-blank / match / write /
   order), confirms the practice engine reaches its "done" state, and
   optionally screenshots the result:

   ```bash
   node .claude/skills/run-polylingua/driver.mjs smoke --port 4321 --out /tmp/polylingua-smoke.png
   ```

   Verified output from an actual run:
   ```
   OK — Acertaste 8 / 14
   Captura guardada en /tmp/polylingua-smoke.png
   ```
   Exits non-zero with a message if the lesson never reaches "done" or if
   any `pageerror` fired during the flow.

3. For anything beyond the one built-in flow — a different lesson, the
   exam page, `/logros`, `/blog`, the review page — import the driver's
   helpers instead of extending the CLI:

   ```js
   import { launch, seedLocalStorage, screenshot } from './driver.mjs';

   const { browser, page } = await launch();
   await seedLocalStorage(page); // do this before every goto — see Gotchas
   await page.goto('http://localhost:4321/logros/', { waitUntil: 'networkidle' });
   await screenshot(page, '/tmp/logros.png');
   await browser.close();
   ```

4. Stop the server when done:

   ```bash
   npx astro preview stop
   ```

## Run (human path)

```bash
npm run dev
```

Opens a dev server with hot reload — meant for a person with a browser, not
for headless driving. `Ctrl-C` to stop. Not covered further here since the
agent path above is what actually gets used.

## Type check

```bash
npx astro check
```

Runs the Zod content schema + TypeScript checks. Useful before `astro build`
when you want the underlying error instead of a build-time failure.

## Gotchas

- **No `chromium-cli` in this environment.** Confirmed absent from `PATH`,
  npm, and a full-disk `find`. `playwright@1.56.1` is installed globally
  instead, with Chromium already downloaded to `/opt/pw-browsers/chromium`.
  The global playwright package is CommonJS-only, so a plain
  `import { chromium } from 'playwright'` fails with `ERR_MODULE_NOT_FOUND`
  from a script outside `node_modules`. `driver.mjs` already does the
  working import for you:
  ```js
  import pkg from '/opt/node22/lib/node_modules/playwright/index.js';
  const { chromium } = pkg;
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  ```
- **`DailyGoal.astro` blocks every click if you skip `seedLocalStorage`.**
  It shows a `<dialog>` ~400ms after any page loads when no daily goal is
  saved yet, and that dialog intercepts pointer events for the entire
  page — every subsequent Playwright click retries for 30s and times out.
  `CookieNotice.astro` does the same the first time a browser profile
  visits. `driver.mjs`'s `seedLocalStorage(page)` pre-fills both flags via
  `page.addInitScript` before `goto` — always call it first.
- **Chaining `pkill -f "astro preview"` and `nohup ... astro preview &` in
  the same shell invocation kills the backgrounded server along with its
  parent** — the command returns exit code 144, the log file never gets
  created, and `curl` gets connection-refused. This reproduced twice in
  this session. Run the kill and the start as two separate commands (see
  Run step 1 above); started in isolation, the server comes up reliably
  every time.
- **Astro has no default port configured** in `astro.config.mjs` for this
  project — always pass `--port` explicitly to `astro preview` /
  `astro dev` rather than relying on whatever Astro picks.
- **Word-matching for the `order` exercise kind must use exact trimmed
  text, not substring matching.** A short target word (e.g. `"a"`) can be
  a substring of an unrelated word chip (`"vai"`) and Playwright's
  `hasText` filter will grab the wrong one. `driver.mjs`'s `answerItem`
  already handles this correctly — don't swap in a `hasText` filter if you
  extend it.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `astro preview` fails to bind / port already in use | `pkill -f "astro preview"`, then retry the start command. |
| `astro build` fails | Run `npx astro check` first — it surfaces the actual Zod/YAML error instead of the terser build-time message. |
| Driver's `smoke` command times out on a click | You skipped `seedLocalStorage(page)` before `goto`, or navigated before the server finished starting — check the preview log for `"Preview server running"` first. |
| `ERR_MODULE_NOT_FOUND: playwright` | You imported `'playwright'` directly instead of `driver.mjs`'s `launch()` helper, or the absolute path to the global package changed — re-check `npm ls -g --depth=0` for the installed version. |
