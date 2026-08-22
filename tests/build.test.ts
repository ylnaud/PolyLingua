import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

function countHtmlFiles(dir: string): number {
  let count = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      count += countHtmlFiles(full);
    } else if (entry.name.endsWith('.html')) {
      count++;
    }
  }
  return count;
}

describe('astro build', () => {
  it('builds successfully', () => {
    const result = execSync('npx astro build', {
      cwd: join(import.meta.dirname, '..'),
      encoding: 'utf-8',
      timeout: 60_000,
    });
    expect(result).toContain('Complete!');
  });

  it('generates at least 500 HTML pages', () => {
    const distDir = join(import.meta.dirname, '..', 'dist');
    const htmlCount = countHtmlFiles(distDir);
    expect(htmlCount).toBeGreaterThanOrEqual(500);
  });

  it('dist directory contains sitemap', () => {
    const distDir = join(import.meta.dirname, '..', 'dist');
    const files = readdirSync(distDir);
    expect(files).toContain('sitemap-index.xml');
  });
});
