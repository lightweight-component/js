import type { CaptureSession } from './types';

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/svg+xml': 'svg',
  'image/webp': 'webp', 'image/bmp': 'bmp', 'image/avif': 'avif',
};

export function sanitizeFragment(html: string, pageUrl: string): HTMLElement {
  const template: HTMLTemplateElement = document.createElement('template');
  template.innerHTML = html;
  template.content.querySelectorAll('script, link[rel~="stylesheet"]').forEach((node) => node.remove());
  template.content.querySelectorAll('*').forEach((element) => {
    for (const attribute of Array.from(element.attributes))
      if (/^on/i.test(attribute.name)) element.removeAttribute(attribute.name);

    element.removeAttribute('srcset');

    for (const name of ['href', 'src', 'poster']) {
      const value = element.getAttribute(name);
      if (!value) continue;
      if (/^\s*javascript:/i.test(value)) element.removeAttribute(name);
      else element.setAttribute(name, absoluteUrl(value, pageUrl));
    }

    const style: string | null = element.getAttribute('style');

    if (style) {
      element.setAttribute('style', style.replace(/url\(\s*(['"]?)(.*?)\1\s*\)/gi, (full, quote: string, raw: string) => {
        const resolved = absoluteUrl(raw, pageUrl);
        return resolved === raw && !/^(?:https?:|data:)/i.test(raw) ? full : `url(${quote}${resolved}${quote})`;
      }));
    }
  });

  const wrapper = document.createElement('div');
  wrapper.append(template.content.cloneNode(true));

  return wrapper;
}

export function buildHtml(title: string, content: string, sourceUrl: string): string {
  return `<!doctype html>\n<html lang="zh-CN">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<title>${escapeHtml(title)}</title>\n</head>\n<body>\n${content}\n<!-- Source: ${escapeHtml(sourceUrl)} -->\n</body>\n</html>\n`;
}

export function taskFolderName(title: string, date: Date): string {
  const safe: string = sanitizeFilename(title).slice(0, 80) || 'web-copy';
  const timestamp: string = [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('')
    + `-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;

  return `${safe}-${timestamp}`;
}

export function chooseFilename(
  session: CaptureSession,
  resourceIndex: number,
  finalUrl: string,
  contentType: string,
  naming: 'original' | 'sequence',
  used: Set<string>,
): string {
  const ext: string = extensionFor(contentType, finalUrl);
  let stem: string = naming === 'sequence' ? String(resourceIndex + 1) : stemFromUrl(finalUrl) || `image-${resourceIndex + 1}`;
  stem = sanitizeFilename(stem) || `image-${resourceIndex + 1}`;
  let candidate: string = `${stem}.${ext}`;
  let suffix: number = 2;

  while (used.has(candidate.toLowerCase())) 
    candidate = `${stem}-${suffix++}.${ext}`;
  
  used.add(candidate.toLowerCase());

  return candidate;
}

export function extensionFor(contentType: string, url: string): string {
  const normalized: string = contentType.split(';')[0].trim().toLowerCase();

  if (EXTENSIONS[normalized])
    return EXTENSIONS[normalized];

  try {
    const match: RegExpMatchArray | null = new URL(url).pathname.match(/\.([a-z0-9]{2,5})$/i);

    if (match)
      return match[1].toLowerCase().replace('jpeg', 'jpg');
  } catch { /* fall through */ }

  return 'bin';
}

export function mimeSupportsWebpConversion(mime: string): boolean {
  return ['image/jpeg', 'image/png', 'image/bmp'].includes(mime.split(';')[0].toLowerCase());
}

export function replaceResource(root: HTMLElement, id: string, originalUrl: string, localUrl: string, pageUrl: string): void {
  const image: HTMLImageElement | null = root.querySelector(`[data-web-copy-resource="${CSS.escape(id)}"]`);

  if (image) {
    image.setAttribute('src', localUrl);
    image.removeAttribute('data-web-copy-resource');
    image.removeAttribute('srcset');
  }

  root.querySelectorAll<HTMLElement>('[style]').forEach((element) => {
    const style = element.getAttribute('style');

    if (!style)
      return;

    const replaced: string = style.replace(/url\(\s*(['"]?)(.*?)\1\s*\)/gi, (full, quote: string, raw: string): string => {
      try {
        return new URL(raw, pageUrl).href === originalUrl ? `url(${quote}${localUrl}${quote})` : full;
      } catch { return full; }
    });

    element.setAttribute('style', replaced);
  });
}

export function stripInternalMarkers(root: HTMLElement): void {
  root.querySelectorAll('[data-web-copy-resource]').forEach((node) => node.removeAttribute('data-web-copy-resource'));
}

function absoluteUrl(value: string, base: string): string {
  try { return new URL(value, base).href; } catch { return value; }
}

function stemFromUrl(url: string): string {
  try {
    const name: string = decodeURIComponent(new URL(url).pathname.split('/').pop() || '');
    return name.replace(/\.[^.]+$/, '');
  } catch { return ''; }
}

function sanitizeFilename(value: string): string {
  return value.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').replace(/[. ]+$/g, '').trim();
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
}

function pad(value: number): string { 
  return String(value).padStart(2, '0');
}
