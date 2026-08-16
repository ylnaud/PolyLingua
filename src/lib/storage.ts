export function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function yesterday(dateStr: string): string {
  return addDays(dateStr, -1);
}

export function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* localStorage unavailable */
  }
}

const APP_PREFIX = 'polylingua-';

// Vuelca todo el progreso (racha, SRS, vocabulario, logros, preferencias)
// a un objeto plano — usado por la copia de seguridad de /logros para
// exportar todo lo que vive en localStorage bajo el prefijo de la app,
// sin arrastrar keys de otro origen que pudieran compartir el mismo
// localStorage (no debería pasar, pero es una guarda barata).
export function exportAll(): Record<string, string> {
  const data: Record<string, string> = {};
  try {
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith(APP_PREFIX)) continue;
      const value = localStorage.getItem(key);
      if (value !== null) data[key] = value;
    }
  } catch {
    /* localStorage unavailable */
  }
  return data;
}

// Contraparte de exportAll(): escribe de vuelta cada key, ignorando
// cualquier entrada que no tenga el prefijo de la app o cuyo valor no sea
// texto — así un archivo de backup editado a mano o corrupto no puede
// inyectar keys arbitrarias en localStorage.
export function importAll(data: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(data)) {
    if (!key.startsWith(APP_PREFIX)) continue;
    if (typeof value !== 'string') continue;
    write(key, value);
  }
}

const SPRINT_KEY = 'polylingua-sprint';
export const SPRINT_LENGTH_DAYS = 7;

export interface Sprint {
  lang: string;
  topic: string;
  lessonId: string;
  startDate: string;
  days: string[];
}

// El "sprint" semanal (ver /logros y /idiomas/[lang]/repasar) es, en
// esencia, un recordatorio de "repasá este tema en N días distintos" — no
// reinventa el filtro por tema del repaso, solo cuenta en qué fechas se usó.
export function getActiveSprint(): Sprint | null {
  const raw = read(SPRINT_KEY);
  if (!raw) return null;
  try {
    const sprint = JSON.parse(raw) as Partial<Sprint>;
    if (!sprint.lang || !sprint.topic || !Array.isArray(sprint.days)) return null;
    return sprint as Sprint;
  } catch {
    return null;
  }
}

export function startSprint(lang: string, topic: string, lessonId: string): void {
  const sprint: Sprint = { lang, topic, lessonId, startDate: today(), days: [] };
  write(SPRINT_KEY, JSON.stringify(sprint));
}

export function markSprintDayDone(lang: string, topic: string): void {
  const sprint = getActiveSprint();
  if (!sprint || sprint.lang !== lang || sprint.topic !== topic) return;
  const t = today();
  if (!sprint.days.includes(t)) sprint.days.push(t);
  write(SPRINT_KEY, JSON.stringify(sprint));
}

export function clearSprint(): void {
  write(SPRINT_KEY, '{}');
}

// Busca, entre las keys "<prefix><idioma>-...", la del idioma con la fecha
// más reciente guardada como valor — usado por los selectores de idioma de
// /practica-libre y /repasar para saltar directo al idioma que el usuario
// usó últimamente.
export function mostRecentLangWithPrefix(prefix: string): string {
  let latestLang = '';
  let latestDate = '';
  try {
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith(prefix)) continue;
      const lang = key.slice(prefix.length).split('-')[0];
      const date = localStorage.getItem(key) ?? '';
      if (date > latestDate) {
        latestDate = date;
        latestLang = lang;
      }
    }
  } catch {
    /* localStorage unavailable */
  }
  return latestLang;
}
