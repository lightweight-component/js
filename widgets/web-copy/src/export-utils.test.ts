// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { buildHtml, chooseFilename, sanitizeFragment, taskFolderName } from './export-utils';
import type { CaptureSession } from './types';

const session: CaptureSession = {
  id: 'test', title: 'A title', pageUrl: 'https://example.com/news/page', capturedAt: '2026-08-06T00:00:00Z', html: '', resources: [],
};

describe('sanitizeFragment', () => {
  it('removes executable content and resolves links', () => {
    const root = sanitizeFragment('<article onclick="bad()"><script>bad()</script><a href="/more">More</a><img src="x.jpg" srcset="x2.jpg 2x"></article>', session.pageUrl);
    expect(root.querySelector('script')).toBeNull();
    expect(root.querySelector('article')?.hasAttribute('onclick')).toBe(false);
    expect(root.querySelector('a')?.getAttribute('href')).toBe('https://example.com/more');
    expect(root.querySelector('img')?.hasAttribute('srcset')).toBe(false);
  });

  it('removes javascript URLs', () => {
    const root = sanitizeFragment('<a href=" javascript:alert(1)">Bad</a>', session.pageUrl);
    expect(root.querySelector('a')?.hasAttribute('href')).toBe(false);
  });
});

describe('file naming', () => {
  it('sanitizes task folder names deterministically', () => {
    expect(taskFolderName('A/B: Story', new Date(2026, 7, 6, 14, 3, 2))).toBe('A_B_ Story-20260806-140302');
  });

  it('deduplicates original image names', () => {
    const used = new Set<string>();
    expect(chooseFilename(session, 0, 'https://cdn.test/photo.jpeg?q=1', 'image/jpeg', 'original', used)).toBe('photo.jpg');
    expect(chooseFilename(session, 1, 'https://cdn.test/photo.jpeg?q=2', 'image/jpeg', 'original', used)).toBe('photo-2.jpg');
  });

  it('uses sequential names', () => {
    expect(chooseFilename(session, 2, 'https://cdn.test/a.png', 'image/webp', 'sequence', new Set())).toBe('3.webp');
  });
});

describe('buildHtml', () => {
  it('creates a complete escaped document', () => {
    const html = buildHtml('A & B', '<main>Hello</main>', session.pageUrl);
    expect(html).toContain('<!doctype html>');
    expect(html).toContain('<title>A &amp; B</title>');
    expect(html).toContain('<main>Hello</main>');
  });
});
