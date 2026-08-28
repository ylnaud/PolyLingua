/**
 * Shared sound-effects + text-to-speech module. Third deliberate exception to the
 * "no shared JS modules" convention (alongside practiceItemMarkup.ts) — the same
 * mute/synth/speak logic is needed from Practice.astro, SoundEffects.astro, and
 * SoundToggle.astro, and must not drift between them.
 *
 * No audio files, no libraries: sound effects are synthesized at runtime with the
 * Web Audio API, and pronunciation uses the browser's built-in speechSynthesis.
 */

const MUTE_KEY = 'polylingua-sound-muted';

export function isMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setMuted(muted: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, String(muted));
  } catch {
    /* localStorage unavailable */
  }
}

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(
  freq: number,
  startOffset: number,
  duration: number,
  type: OscillatorType = 'sine',
  peakGain = 0.15,
): void {
  const audioCtx = getCtx();
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = audioCtx.currentTime + startOffset;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(peakGain, t0 + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

export function playCorrect(): void {
  if (isMuted()) return;
  tone(880, 0, 0.12);
  tone(1318, 0.09, 0.16);
}

export function playIncorrect(): void {
  if (isMuted()) return;
  tone(220, 0, 0.18, 'triangle', 0.12);
  tone(180, 0.1, 0.22, 'triangle', 0.12);
}

export function playCombo(streak: number): void {
  if (isMuted()) return;
  const level = Math.min(streak - 2, 6);
  const freq = 660 * Math.pow(2, level / 12);
  tone(freq, 0, 0.1, 'triangle', 0.1);
  tone(freq * 1.5, 0.05, 0.12, 'sine', 0.1);
}

export function playAchievement(): void {
  if (isMuted()) return;
  [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.1, 0.18, 'sine', 0.13));
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  // Dispara la carga de voces temprano (asíncrona en el navegador) apenas se
  // importa este módulo, mucho antes del primer click real. Chrome puede
  // reproducir una frase DOS VECES cuando speak() se llama con la lista de
  // voces todavía sin resolver (elige una por default y la vuelve a
  // resolver a mitad de camino) — para cuando el usuario llega a hacer
  // click, ya pasó tiempo de sobra para que la lista esté lista.
  window.speechSynthesis.getVoices();
}

export function speak(text: string, lang: string): void {
  if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const synth = window.speechSynthesis;
  // Cancelar solo cuando hay algo en cola: llamar a cancel() sin necesidad (ej.
  // en el primer click de la sesión, cuando el motor está idle) deja a Chrome en
  // un estado donde el speak() siguiente se descarta en silencio — el usuario
  // ve que "hay que hacer doble click" porque el segundo click recién sale de
  // ese estado colgado. Saltear el cancel() innecesario evita el bug sin
  // introducir ningún delay (mantiene el speak() síncrono con el click, que
  // Safari necesita para no perder el gesto de usuario).
  if (synth.speaking || synth.pending) synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  if (lang) utterance.lang = lang;
  // Fijar la voz explícitamente (sin esperar nada, síncrono) evita que Chrome
  // tenga que resolver una voz por default a mitad de la síntesis — la causa
  // más común de que la misma frase se escuche dos veces. Si la lista todavía
  // no cargó (getVoices() devuelve vacío), sigue igual que antes sin voz fija.
  const voices = synth.getVoices();
  const match = lang
    ? (voices.find((v) => v.lang === lang) ?? voices.find((v) => v.lang.startsWith(lang.split('-')[0])))
    : undefined;
  if (match) utterance.voice = match;
  synth.speak(utterance);
}
