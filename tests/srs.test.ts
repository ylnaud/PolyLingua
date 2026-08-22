import { describe, it, expect } from 'vitest';
import { INTERVAL_DAYS, MAX_BOX, MASTERY_LABELS } from '../src/lib/srs';

describe('SRS constants', () => {
  it('MAX_BOX equals INTERVAL_DAYS length', () => {
    expect(MAX_BOX).toBe(INTERVAL_DAYS.length);
  });

  it('MASTERY_LABELS has exactly MAX_BOX entries', () => {
    expect(MASTERY_LABELS).toHaveLength(MAX_BOX);
  });

  it('intervals are all positive', () => {
    for (const d of INTERVAL_DAYS) {
      expect(d).toBeGreaterThan(0);
    }
  });

  it('intervals are in ascending order', () => {
    for (let i = 1; i < INTERVAL_DAYS.length; i++) {
      expect(INTERVAL_DAYS[i]).toBeGreaterThan(INTERVAL_DAYS[i - 1]);
    }
  });

  it('every mastery label is a non-empty string', () => {
    for (const label of MASTERY_LABELS) {
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    }
  });
});
