import { describe, it, expect } from 'vitest';
import { addDays, yesterday } from '../src/lib/storage';

describe('addDays', () => {
  it('adds positive days', () => {
    expect(addDays('2024-01-15', 3)).toBe('2024-01-18');
  });

  it('crosses month boundary', () => {
    expect(addDays('2024-01-30', 5)).toBe('2024-02-04');
  });

  it('crosses year boundary', () => {
    expect(addDays('2024-12-30', 5)).toBe('2025-01-04');
  });

  it('subtracts days with negative value', () => {
    expect(addDays('2024-03-01', -1)).toBe('2024-02-29');
  });
});

describe('yesterday', () => {
  it('returns the previous day', () => {
    expect(yesterday('2024-06-15')).toBe('2024-06-14');
  });

  it('crosses month boundary', () => {
    expect(yesterday('2024-03-01')).toBe('2024-02-29');
  });
});
