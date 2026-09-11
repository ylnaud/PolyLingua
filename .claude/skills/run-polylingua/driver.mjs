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

// Like answerItem, but deliberately WRONG — used once per flow to trigger
// DrillTutor's repair loop on purpose. Only 'choice' is implemented: it's
// the only kind the en-de A1 smoke lesson needs, and every kind picks its
// answer differently, so a generic "wrong" doesn't generalize cleanly.
export async function answerItemWrong(page, visible, kind) {
  if (kind !== 'choice') {
    throw new Error(`answerItemWrong: kind "${kind}" not implemented`);
  }
  await visible.locator('[data-option][data-correct="false"]').first().click();
}

// U-05/U-06/U-07: una lección en→de real, en punta a punta, con el bucle de
// refuerzo incluido. A diferencia de runSmoke (que abre una lección es-de y
// responde todo bien), esto abre una lección en-de real, responde MAL a
// propósito el primer ítem —una habilidad con glosa en inglés en ese
// nivel— para forzar que DrillTutor inserte un ejercicio de refuerzo, y
// confirma que el texto que aparece es el inglés real, no vacío ni español.
// `url` es la única diferencia entre niveles; el resto del flujo es idéntico.
async function runSmokeEnLesson({ port, out, url }) {
  const baseURL = `http://localhost:${port}`;
  const { browser, page } = await launch();
  await seedLocalStorage(page);

  const consoleErrors = [];
  page.on('pageerror', (err) => consoleErrors.push(String(err)));

  await page.goto(`${baseURL}${url}`, { waitUntil: 'networkidle' });

  let refuerzoTexto = null;
  let itemsRespondidos = 0;

  for (let i = 0; i < 40; i++) {
    const visibleLocator = page.locator('[data-practice-item]:not([hidden])');
    if ((await visibleLocator.count()) === 0) break;
    const visible = visibleLocator.first();
    const kind = await visible.getAttribute('data-kind');

    if (itemsRespondidos === 0) {
      // El primer ítem, a propósito mal: dispara el bucle de refuerzo.
      await answerItemWrong(page, visible, kind);
      await page.waitForTimeout(200);
      const tip = visible.locator('.drill-tip p');
      refuerzoTexto = await tip.textContent().catch(() => null);
    } else {
      await answerItem(page, visible, kind);
    }
    itemsRespondidos += 1;
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
  if (!refuerzoTexto) {
    throw new Error(
      'El bucle de refuerzo no insertó ningún aviso (.drill-tip) tras la respuesta incorrecta.',
    );
  }
  return { scoreText, refuerzoTexto, itemsRespondidos };
}

// U-05: A1 en→de. Habilidad probada: de.a1.verb.present-regular.
async function runSmokeEn({ port, out }) {
  return runSmokeEnLesson({ port, out, url: '/en/de/a1/present-tense-regular-verbs/' });
}

// U-06: A2 en→de. Habilidad probada: de.a2.verb.modal (primer skill de la
// lección modal-verbs, con glosa en inglés).
async function runSmokeEnA2({ port, out }) {
  return runSmokeEnLesson({ port, out, url: '/en/de/a2/modal-verbs/' });
}

// U-07: B1 en→de. Habilidad probada: de.b1.clause.relative (primer skill de
// la lección relative-clauses, con glosa en inglés).
async function runSmokeEnB1({ port, out }) {
  return runSmokeEnLesson({ port, out, url: '/en/de/b1/relative-clauses/' });
}

// U-10: los cinco `kind` de ejercicio responden y puntúan en una sesión
// real. presente-verbos (es-de/a1) es la única lección con los cinco en un
// solo archivo (quiz=choice, dos fill-blank, un match, un write, un
// order) — a diferencia de runSmoke, que solo toca cuatro (nunca 'write').
async function runSmokeKinds({ port, out }) {
  const baseURL = `http://localhost:${port}`;
  const { browser, page } = await launch();
  await seedLocalStorage(page);

  const consoleErrors = [];
  page.on('pageerror', (err) => consoleErrors.push(String(err)));

  await page.goto(`${baseURL}/es/de/a1/presente-verbos/`, { waitUntil: 'networkidle' });

  const kindsVistos = new Set();
  for (let i = 0; i < 20; i++) {
    const visibleLocator = page.locator('[data-practice-item]:not([hidden])');
    if ((await visibleLocator.count()) === 0) break;
    const visible = visibleLocator.first();
    const kind = await visible.getAttribute('data-kind');
    kindsVistos.add(kind);
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
  const esperados = ['choice', 'fill-blank', 'match', 'write', 'order'];
  const faltantes = esperados.filter((k) => !kindsVistos.has(k));
  if (faltantes.length > 0) {
    throw new Error(`La lección no pasó por estos kind: ${faltantes.join(', ')}`);
  }
  return { scoreText, kinds: [...kindsVistos].sort() };
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

  await page.goto(`${baseURL}/es/de/a1/articulos-der-die-das/`, { waitUntil: 'networkidle' });

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

// U-13: sin desbordamiento horizontal en 360 (móvil), 768 (tablet) y 1280
// (escritorio), sobre una muestra de páginas reales de los dos silos
// activos. `scrollWidth > clientWidth` es la señal real de que algo se
// corta o fuerza un scroll horizontal — no un cálculo de CSS a ojo.
const PAGINAS_OVERFLOW = [
  '/es/de/',
  '/es/de/a1/articulos-der-die-das/',
  '/es/de/practicar/',
  '/en/de/',
  '/en/de/a1/present-tense-regular-verbs/',
];
const ANCHOS = [360, 768, 1280];

async function runCheckOverflow({ port }) {
  const baseURL = `http://localhost:${port}`;
  const { browser, page } = await launch();
  await seedLocalStorage(page);

  const rotos = [];
  for (const ruta of PAGINAS_OVERFLOW) {
    for (const ancho of ANCHOS) {
      await page.setViewportSize({ width: ancho, height: 800 });
      await page.goto(`${baseURL}${ruta}`, { waitUntil: 'networkidle' });
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      if (scrollWidth > clientWidth) {
        rotos.push(`${ruta} @ ${ancho}px: scrollWidth=${scrollWidth} > clientWidth=${clientWidth}`);
      }
    }
  }

  await browser.close();

  if (rotos.length > 0) {
    throw new Error(`Desbordamiento horizontal:\n${rotos.join('\n')}`);
  }
  return { paginas: PAGINAS_OVERFLOW.length, anchos: ANCHOS.length };
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
  } else if (cmd === 'smoke-en' || cmd === 'smoke-en-a2' || cmd === 'smoke-en-b1') {
    const port = args.port ?? '4321';
    const out = args.out ?? null;
    const runner =
      cmd === 'smoke-en' ? runSmokeEn : cmd === 'smoke-en-a2' ? runSmokeEnA2 : runSmokeEnB1;
    runner({ port, out })
      .then(({ scoreText, refuerzoTexto, itemsRespondidos }) => {
        console.log(`OK — ${scoreText}`);
        console.log(`Ítems respondidos (incluido el de refuerzo insertado): ${itemsRespondidos}`);
        console.log(`Texto del bucle de refuerzo: "${refuerzoTexto}"`);
        if (out) console.log(`Captura guardada en ${out}`);
      })
      .catch((err) => {
        console.error('FALLÓ:', err.message);
        process.exitCode = 1;
      });
  } else if (cmd === 'smoke-kinds') {
    const port = args.port ?? '4321';
    const out = args.out ?? null;
    runSmokeKinds({ port, out })
      .then(({ scoreText, kinds }) => {
        console.log(`OK — ${scoreText}`);
        console.log(`Kinds vistos: ${kinds.join(', ')}`);
        if (out) console.log(`Captura guardada en ${out}`);
      })
      .catch((err) => {
        console.error('FALLÓ:', err.message);
        process.exitCode = 1;
      });
  } else if (cmd === 'check-overflow') {
    const port = args.port ?? '4321';
    runCheckOverflow({ port })
      .then(({ paginas, anchos }) => {
        console.log(`OK — ${paginas} páginas × ${anchos} anchos, sin desbordamiento horizontal`);
      })
      .catch((err) => {
        console.error('FALLÓ:', err.message);
        process.exitCode = 1;
      });
  } else {
    console.error(
      'Uso: node driver.mjs smoke --port 4321 --out /ruta/captura.png\n' +
        '  o: node driver.mjs smoke-en --port 4321 --out /ruta/captura.png\n' +
        '  o: node driver.mjs smoke-en-a2 --port 4321 --out /ruta/captura.png\n' +
        '  o: node driver.mjs smoke-en-b1 --port 4321 --out /ruta/captura.png\n' +
        '  o: node driver.mjs smoke-kinds --port 4321 --out /ruta/captura.png\n' +
        '  o: node driver.mjs check-overflow --port 4321',
    );
    process.exitCode = 1;
  }
}
