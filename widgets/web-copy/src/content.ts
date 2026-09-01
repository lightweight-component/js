import type { E } from 'vitest/dist/chunks/environment.d.cL3nLXbE.js';
import type { CaptureSession, CapturedResource } from './types';

const OVERLAY_ID: string = '__web_copy_overlay__';
let active = false;
let hovered: Element | null = null;

chrome.runtime.onMessage.addListener((message: unknown) => {
  if ((message as { type?: string }).type === 'START_SELECTION')
    startSelection();
});

function startSelection(): void {
  if (active)
    return;

  active = true;
  document.documentElement.style.cursor = 'crosshair';
  ensureOverlay();
  window.addEventListener('mousemove', onMove, true);
  window.addEventListener('click', onClick, true);
  window.addEventListener('keydown', onKeyDown, true);
}

function stopSelection(): void {
  active = false;
  hovered = null;
  document.documentElement.style.cursor = '';
  document.getElementById(OVERLAY_ID)?.remove();
  window.removeEventListener('mousemove', onMove, true);
  window.removeEventListener('click', onClick, true);
  window.removeEventListener('keydown', onKeyDown, true);
}

function ensureOverlay(): HTMLDivElement {
  const existing: HTMLDivElement | null = document.getElementById(OVERLAY_ID) as HTMLDivElement | null;

  if (existing)
    return existing;

  const overlay: HTMLDivElement = document.createElement('div');
  overlay.id = OVERLAY_ID;
  Object.assign(overlay.style, {
    position: 'fixed', pointerEvents: 'none', zIndex: '2147483647', border: '2px solid #2563eb',
    background: 'rgba(37, 99, 235, .12)', boxSizing: 'border-box', display: 'none',
  });
  document.documentElement.append(overlay);

  return overlay;
}

function onMove(event: MouseEvent): void {
  const target: Element | null = event.target instanceof Element ? event.target : null;

  if (!target || target.id === OVERLAY_ID)
    return;

  hovered = target;
  const rect = target.getBoundingClientRect();
  const overlay = ensureOverlay();
  Object.assign(overlay.style, {
    display: 'block', left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`,
  });
}

function onKeyDown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.preventDefault();
    event.stopImmediatePropagation();
    stopSelection();
  }
}

function onClick(event: MouseEvent): void {
  if (!hovered)
    return;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  const selected = hovered;
  stopSelection();
  const session = captureElement(selected);
  void chrome.runtime.sendMessage({ type: 'CAPTURE_COMPLETE', session });
}

export function captureElement(selected: Element): CaptureSession {
  const clone: Element = selected.cloneNode(true) as Element;
  const originals: Element[] = [selected, ...Array.from(selected.querySelectorAll('*'))];
  const clones: Element[] = [clone, ...Array.from(clone.querySelectorAll('*'))];
  const resources: CapturedResource[] = [];
  let counter: number = 0;

  originals.forEach((original, index) => {
    const cloned: Element | null = clones[index];

    if (!cloned)
      return;

    if (original instanceof HTMLImageElement && cloned instanceof HTMLImageElement) {
      const url: string | undefined = firstValidUrl(original.currentSrc, original.src, original.dataset.src, original.dataset.original);

      if (url) {
        const id: string = `resource-${++counter}`;
        cloned.dataset.webCopyResource = id;
        cloned.setAttribute('src', url);
        resources.push({ id, url, kind: 'image', element: describeElement(original) });
      }
    }

    for (const url of inlineBackgroundUrls(original.getAttribute('style') || '', document.baseURI)) 
      resources.push({ id: `resource-${++counter}`, url, kind: 'background', element: describeElement(original) });
  });

  return {
    id: crypto.randomUUID(),
    title: document.title || location.hostname || 'web-copy',
    pageUrl: location.href,
    capturedAt: new Date().toISOString(),
    html: clone.outerHTML,
    resources,
  };
}

function firstValidUrl(...values: Array<string | undefined>): string | undefined {
  for (const value of values) {
    if (!value) 
      continue;

    try {
      const url: URL | undefined = new URL(value, document.baseURI);

      if (['http:', 'https:', 'file:', 'data:'].includes(url.protocol)) 
        return url.href;
    } catch { /* Ignore invalid lazy-load attributes. */ }
  }
  return undefined;
}

function inlineBackgroundUrls(style: string, base: string): string[] {
  const urls: string[] = [];
  const pattern: RegExp = /url\(\s*(['"]?)(.*?)\1\s*\)/gi;

  for (const match of style.matchAll(pattern)) {
    try {
      const url: URL | undefined = new URL(match[2], base);

      if (['http:', 'https:', 'file:', 'data:'].includes(url.protocol)) 
        urls.push(url.href);
    } catch { /* Ignore malformed CSS URLs. */ }
  }
  return urls;
}

function describeElement(element: Element): string {
  const id: string = element.id ? `#${element.id}` : '';
  const classes: string = Array.from(element.classList).slice(0, 2).map((name) => `.${name}`).join('');
  
  return `${element.tagName.toLowerCase()}${id}${classes}`;
}
