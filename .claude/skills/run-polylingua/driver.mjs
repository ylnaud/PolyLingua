#!/usr/bin/env node
// Playwright driver for PolyLingua (static Astro site). chromium-cli is not
// installed in this environment — see SKILL.md for why this exists instead.
//
// Reusable as a library:
//   import { launch, seedLocalStorage, screenshot } from './driver.mjs';
//
// Or as a CLI:
//   node driver.mjs smoke --port 4321 --out /path/to/screenshot.png

import { fileURLToPath } from 'url';
import pkg from '/opt/node22/lib/node_modules/playwright/index.js';

const { chromium } = pkg;
const CHROMIUM_PATH = '/opt/pw-browsers/chromium';

export async function launch() {
  const browser = await chromium.launch({ executablePath: CHROMIUM_PATH });
  const page = await browser.newPage();
  return { browser, page };
}

// Pre-seeds localStorage so the DailyGoal onboarding <dialog> and the
// CookieNotice banner never appear — both intercept clicks otherwise and
// every subsequent Playwright action times out waiting for the real target
// to become clickable.
export async function seedLocalStorage(page) {
  await page.addInitScript(() => {
    try {
      const d = new Date();
      const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      localStorage.setItem('polylingua-goal-date', today);
      localStorage.setItem('polylingua-goal-minutes', '10');
      localStorage.setItem('polylingua-cookie-notice-dismissed', 'true');
    } catch {
      /* localStorage unavailable */
    }
  });
}

export async function screenshot(page, path) {
  await page.screenshot({ path, fullPage: true });
}

// Answers one <Practice> item regardless of its kind (choice / fill-blank /
// write / match / order), the same way a correct user answer would. Reused
// by the smoke flow and by any ad hoc script driving a lesson.
export async function answerItem(page, visible, kind) {
  if (kind === 'choice') {
    await visible.locator('[data-option]').first().click();
  } else if (kind === 'fill-blank' || kind === 'write') {
    const input = visible.locator('[data-answer-input]');
    await input.fill((await input.getAttribute('data-answer')) ?? '');
    await visible.locator('[data-check]').click();
  } else if (kind === 'match') {
    const pairs = await visible.locator('[data-match-item][data-side="left"]').count();
    for (let p = 0; p < pairs; p++) {
      await visible.locator(`[data-match-item][data-side="left"][data-pair="${p}"]`).click();
      await visible.locator(`[data-match-item][data-side="right"][data-pair="${p}"]`).click();
      await page.waitForTimeout(80);
    }
  } else if (kind === 'order') {
    // Match by exact trimmed textContent, not substring (hasText matched
    // the wrong chip for short target words like "a" inside "vai").
    const answer = await visible.locator('[data-order-assembled]').getAttribute('data-answer');
    const words = (answer ?? '').split(' ');
    const chipHandles = await visible.locator('[data-word-chip]').all();
    const used = new Set();
    for (const w of words) {
      for (let ci = 0; ci < chipHandles.length; ci++) {
        if (used.has(ci)) continue;
        const text = ((await chipHandles[ci].textContent()) ?? '').trim();
        if (text === w) {
          await chipHandles[ci].click();
          used.add(ci);
          break;
        }
      }
    }
    await visible.locator('[data-check]').click();
  }
}

// Full end-to-end flow: open a real lesson, answer every item it contains
// (one of each exercise kind, in this specific lesson), confirm the
// practice engine reached its "done" state, and optionally screenshot it.
async function runSmoke({ port, out }) {
  const baseURL = `http://localhost:${port}`;
  const { browser, page } = await launch();
  await seedLocalStorage(page);

  const consoleErrors = [];
  page.on('pageerror', (err) => consoleErrors.push(String(err)));

  await page.goto(`${baseURL}/idiomas/de/a1/articulos-der-die-das/`, { waitUntil: 'networkidle' });

  for (let i = 0; i < 30; i++) {
    const visibleLocator = page.locator('[data-practice-item]:not([hidden])');
    if ((await visibleLocator.count()) === 0) break;
    const visible = visibleLocator.first();
    const kind = await visible.getAttribute('data-kind');
    await answerItem(page, visible, kind);
    await page.waitForTimeout(120);
    const nextBtn = visible.locator('[data-next]');
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
    } else {
      break;
    }
  }

  await page.waitForTimeout(300);
  const scoreText = await page
    .locator('[data-score-text]')
    .textContent()
    .catch(() => null);

  if (out) await screenshot(page, out);
  await browser.close();

  if (!scoreText) {
    throw new Error(
      'No se encontró el texto de puntaje final — el flujo de la lección no llegó a completarse.',
    );
  }
  if (consoleErrors.length > 0) {
    throw new Error(`Errores de consola durante el flujo: ${consoleErrors.join('; ')}`);
  }
  return scoreText;
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i].startsWith('--')) {
      out[argv[i].slice(2)] = argv[i + 1];
      i += 1;
    }
  }
  return out;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  const [, , cmd, ...rest] = process.argv;
  const args = parseArgs(rest);

  if (cmd === 'smoke') {
    const port = args.port ?? '4321';
    const out = args.out ?? null;
    runSmoke({ port, out })
      .then((scoreText) => {
        console.log(`OK — ${scoreText}`);
        if (out) console.log(`Captura guardada en ${out}`);
      })
      .catch((err) => {
        console.error('FALLÓ:', err.message);
        process.exitCode = 1;
      });
  } else {
    console.error('Uso: node driver.mjs smoke --port 4321 --out /ruta/captura.png');
    process.exitCode = 1;
  }
}
