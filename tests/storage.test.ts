import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  today,
  read,
  write,
  exportAll,
  importAll,
  getActiveSprint,
  startSprint,
  markSprintDayDone,
  clearSprint,
  mostRecentLangWithPrefix,
} from '../src/lib/storage';

function createMockStorage(): Storage {
  const store: Record<string, string> = {};
  return new Proxy(
    {
      getItem: (key: string) => (key in store ? store[key] : null),
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        for (const k of Object.keys(store)) delete store[k];
      },
      get length() {
        return Object.keys(store).length;
      },
      key: (index: number) => Object.keys(store)[index] ?? null,
    } as Storage,
    {
      ownKeys: () => Object.keys(store),
      getOwnPropertyDescriptor: (_, prop) => {
        if (typeof prop === 'string' && prop in store) {
          return { configurable: true, enumerable: true, value: store[prop] };
        }
        return undefined;
      },
    },
  );
}

function mockStorageKeys(storage: Storage): string[] {
  const keys: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const k = storage.key(i);
    if (k) keys.push(k);
  }
  return keys;
}

let mockStorage: Storage;

beforeEach(() => {
  mockStorage = createMockStorage();
  vi.stubGlobal('localStorage', mockStorage);
});

describe('today', () => {
  it('returns YYYY-MM-DD format', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 22));
    expect(today()).toBe('2026-08-22');
    vi.useRealTimers();
  });

  it('pads month and day with zeros', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 5));
    expect(today()).toBe('2026-01-05');
    vi.useRealTimers();
  });
});

describe('read / write', () => {
  it('returns null for missing key', () => {
    expect(read('nonexistent')).toBeNull();
  });

  it('writes and reads back a value', () => {
    write('test-key', 'test-value');
    expect(read('test-key')).toBe('test-value');
  });

  it('returns null when localStorage throws', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('denied');
      },
    });
    expect(read('any')).toBeNull();
  });
});

describe('exportAll / importAll', () => {
  it('exports only keys with polylingua- prefix', () => {
    mockStorage.setItem('polylingua-streak', '5');
    mockStorage.setItem('polylingua-theme', 'dark');
    mockStorage.setItem('other-app-key', 'ignored');

    const data = exportAll();
    expect(Object.keys(data)).toHaveLength(2);
    expect(data['polylingua-streak']).toBe('5');
    expect(data['polylingua-theme']).toBe('dark');
    expect(data['other-app-key']).toBeUndefined();
  });

  it('importAll only writes polylingua- keys with string values', () => {
    importAll({
      'polylingua-streak': '10',
      'polylingua-bad': 42,
      'other-key': 'nope',
    });

    expect(read('polylingua-streak')).toBe('10');
    expect(read('polylingua-bad')).toBeNull();
    expect(read('other-key')).toBeNull();
  });

  it('round-trips export → import', () => {
    write('polylingua-a', '1');
    write('polylingua-b', '2');
    const exported = exportAll();

    mockStorage.clear();
    importAll(exported);

    expect(read('polylingua-a')).toBe('1');
    expect(read('polylingua-b')).toBe('2');
  });
});

describe('sprint', () => {
  it('getActiveSprint returns null when no sprint', () => {
    expect(getActiveSprint()).toBeNull();
  });

  it('getActiveSprint returns null for corrupted data', () => {
    write('polylingua-sprint', 'not-json');
    expect(getActiveSprint()).toBeNull();
  });

  it('getActiveSprint returns null for incomplete sprint', () => {
    write('polylingua-sprint', JSON.stringify({ lang: 'de' }));
    expect(getActiveSprint()).toBeNull();
  });

  it('startSprint creates a valid sprint', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 22));

    startSprint('de', 'preposiciones', 'lesson-1');
    const sprint = getActiveSprint();

    expect(sprint).not.toBeNull();
    expect(sprint!.lang).toBe('de');
    expect(sprint!.topic).toBe('preposiciones');
    expect(sprint!.lessonId).toBe('lesson-1');
    expect(sprint!.startDate).toBe('2026-08-22');
    expect(sprint!.days).toEqual([]);

    vi.useRealTimers();
  });

  it('markSprintDayDone adds today to days', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 22));

    startSprint('de', 'casos', 'lesson-2');
    markSprintDayDone('de', 'casos');

    const sprint = getActiveSprint();
    expect(sprint!.days).toEqual(['2026-08-22']);

    vi.useRealTimers();
  });

  it('markSprintDayDone does not duplicate days', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 22));

    startSprint('de', 'casos', 'lesson-2');
    markSprintDayDone('de', 'casos');
    markSprintDayDone('de', 'casos');

    const sprint = getActiveSprint();
    expect(sprint!.days).toEqual(['2026-08-22']);

    vi.useRealTimers();
  });

  it('markSprintDayDone ignores mismatched lang/topic', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 22));

    startSprint('de', 'casos', 'lesson-2');
    markSprintDayDone('fr', 'casos');
    markSprintDayDone('de', 'otro-tema');

    const sprint = getActiveSprint();
    expect(sprint!.days).toEqual([]);

    vi.useRealTimers();
  });

  it('clearSprint makes getActiveSprint return null', () => {
    startSprint('de', 'verbos', 'lesson-3');
    clearSprint();
    expect(getActiveSprint()).toBeNull();
  });
});

describe('mostRecentLangWithPrefix', () => {
  it('finds the language with the most recent date', () => {
    mockStorage.setItem('polylingua-last-de', '2026-08-20');
    mockStorage.setItem('polylingua-last-fr', '2026-08-22');
    mockStorage.setItem('polylingua-last-en', '2026-08-18');

    expect(mostRecentLangWithPrefix('polylingua-last-')).toBe('fr');
  });

  it('returns empty string when no matching keys', () => {
    expect(mostRecentLangWithPrefix('nonexistent-')).toBe('');
  });
});
