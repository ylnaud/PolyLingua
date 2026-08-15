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
