import TurndownService from 'turndown';
import './style.css';
import { deleteSession, getSession } from './session-db';
import {
  buildHtml, chooseFilename, mimeSupportsWebpConversion, replaceResource,
  sanitizeFragment, stripInternalMarkers, taskFolderName,
} from './export-utils';
import type { ExportSettings, FetchResult, ReportItem } from './types';

declare global {
  interface Window {
    showDirectoryPicker(options?: { mode?: 'read' | 'readwrite' }): Promise<FileSystemDirectoryHandle>;
  }
}

const sessionId: string | null = new URLSearchParams(location.search).get('session');
const app: HTMLDivElement = document.querySelector<HTMLDivElement>('#app')!;

void initialize();

async function initialize(): Promise<void> {
  if (!sessionId) 
    return renderFatal('缺少导出会话 ID。请重新选择网页区域。');

  const session = await getSession(sessionId);

  if (!session) 
    return renderFatal('导出会话不存在或已过期。请重新选择网页区域。');

  const stored = await chrome.storage.local.get('exportSettings');
  const settings: ExportSettings = {
    markdown: stored.exportSettings?.markdown ?? true,
    naming: stored.exportSettings?.naming ?? 'original',
    convertWebp: stored.exportSettings?.convertWebp ?? false,
  };

  app.innerHTML = `
    <main class="card">
      <div class="eyebrow">WEB COPY</div>
      <h1>导出网页区域</h1>
      <p class="source"><strong>${escapeHtml(session.title)}</strong><br><span>${escapeHtml(session.pageUrl)}</span></p>
      <div class="summary"><span>${session.resources.length}</span> 张待处理图片</div>
      <fieldset>
        <label><input id="markdown" type="checkbox"> 同时保存 Markdown</label>
        <label><input id="webp" type="checkbox"> 将 JPEG、PNG、BMP 转为 WebP（质量 85）</label>
      </fieldset>
      <fieldset><legend>图片文件名</legend>
        <label><input name="naming" value="original" type="radio"> 保持原文件名</label>
        <label><input name="naming" value="sequence" type="radio"> 按 1、2、3… 命名</label>
      </fieldset>
      <button id="export">选择目录并导出</button>
      <div id="status" role="status"></div>
    </main>`;

  const markdown: HTMLInputElement = input('#markdown')!;
  const webp: HTMLInputElement = input('#webp')!;
  markdown.checked = settings.markdown;
  webp.checked = settings.convertWebp;
  input(`input[name="naming"][value="${settings.naming}"]`).checked = true;

  document.querySelector<HTMLButtonElement>('#export')!.addEventListener('click', async () => {
    const button = document.querySelector<HTMLButtonElement>('#export')!;
    const status = document.querySelector<HTMLDivElement>('#status')!;
    const current: ExportSettings = {
      markdown: markdown.checked,
      convertWebp: webp.checked,
      naming: input('input[name="naming"]:checked').value as ExportSettings['naming'],
    };
    await chrome.storage.local.set({ exportSettings: current });
    button.disabled = true;

    try {
      const root = await window.showDirectoryPicker({ mode: 'readwrite' });
      status.textContent = '正在创建目录…';
      const folder = await root.getDirectoryHandle(taskFolderName(session.title, new Date()), { create: true });
      const images = await folder.getDirectoryHandle('images', { create: true });
      const fragment = sanitizeFragment(session.html, session.pageUrl);
      const report: ReportItem[] = [];
      const usedNames = new Set<string>();

      for (let index = 0; index < session.resources.length; index++) {
        const resource = session.resources[index];
        status.textContent = `正在处理图片 ${index + 1} / ${session.resources.length}…`;
        const fetched = await chrome.runtime.sendMessage({ type: 'FETCH_IMAGE', url: resource.url, pageUrl: session.pageUrl }) as FetchResult;
        if (!fetched.ok || !fetched.data) {
          report.push({ id: resource.id, url: resource.url, element: resource.element, status: 'failed', reason: fetched.error || '未知错误' });
          continue;
        }

        let blob: Blob | null = await (await fetch(fetched.data)).blob();
        let contentType: string = fetched.contentType || blob.type;
        let conversionStatus: ReportItem['status'] = 'saved';
        let reason: string | undefined;

        if (current.convertWebp) {
          if (mimeSupportsWebpConversion(contentType)) {
            try {
              blob = await convertToWebp(blob);
              contentType = 'image/webp';
            } catch (error) {
              conversionStatus = 'conversion-failed';
              reason = error instanceof Error ? error.message : String(error);
            }
          } else if (!contentType.startsWith('image/webp')) {
            conversionStatus = 'conversion-skipped';
            reason = '为避免动画或矢量信息丢失，此格式保留原样。';
          }
        }
        const filename = chooseFilename(session, index, fetched.finalUrl || resource.url, contentType, current.naming, usedNames);
        await writeFile(images, filename, blob);
        replaceResource(fragment, resource.id, resource.url, `images/${filename}`, session.pageUrl);
        report.push({ id: resource.id, url: resource.url, element: resource.element, status: conversionStatus, file: `images/${filename}`, reason });
      }

      stripInternalMarkers(fragment);
      const content = fragment.innerHTML;
      await writeFile(folder, 'index.html', new Blob([buildHtml(session.title, content, session.pageUrl)], { type: 'text/html;charset=utf-8' }));
      if (current.markdown) {
        const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
        await writeFile(folder, 'index.md', new Blob([`${turndown.turndown(content)}\n`], { type: 'text/markdown;charset=utf-8' }));
      }
      await writeFile(folder, 'report.json', new Blob([JSON.stringify({ source: session.pageUrl, title: session.title, capturedAt: session.capturedAt, exportedAt: new Date().toISOString(), settings: current, resources: report }, null, 2)], { type: 'application/json' }));
      await deleteSession(session.id);
      const failed = report.filter((item) => item.status === 'failed').length;
      status.className = 'success';
      status.textContent = `导出完成：${report.length - failed} 张图片已保存，${failed} 张失败。`;
    } catch (error) {
      status.className = 'error';
      status.textContent = error instanceof DOMException && error.name === 'AbortError' ? '已取消目录选择。' : `导出失败：${error instanceof Error ? error.message : String(error)}`;
    } finally {
      button.disabled = false;
    }
  });
}

async function convertToWebp(blob: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(blob);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    canvas.getContext('2d', { alpha: true })!.drawImage(bitmap, 0, 0);
    const result = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.85));
    if (!result || result.type !== 'image/webp') throw new Error('当前浏览器无法编码 WebP。');
    return result;
  } finally { bitmap.close(); }
}

async function writeFile(directory: FileSystemDirectoryHandle, name: string, content: Blob): Promise<void> {
  const handle = await directory.getFileHandle(name, { create: true });
  const writable = await handle.createWritable();
  await writable.write(content);
  await writable.close();
}

function input(selector: string): HTMLInputElement { return document.querySelector<HTMLInputElement>(selector)!; }
function escapeHtml(value: string): string { return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!); }
function renderFatal(message: string): void { app.innerHTML = `<main class="card"><h1>无法导出</h1><p class="error">${escapeHtml(message)}</p></main>`; }
