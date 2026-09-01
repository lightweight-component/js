import { putSession } from './session-db';
import type { CaptureSession, FetchResult } from './types';

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) 
    return;
  
  try {
    await chrome.tabs.sendMessage(tab.id, { type: 'START_SELECTION' });
  } catch {
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
    await chrome.tabs.sendMessage(tab.id, { type: 'START_SELECTION' });
  }
});

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  const payload = message as { type?: string; session?: CaptureSession; url?: string; pageUrl?: string };
  
  if (payload.type === 'CAPTURE_COMPLETE' && payload.session) {
    void putSession(payload.session)
      .then(() => chrome.tabs.create({ url: chrome.runtime.getURL(`export.html?session=${payload.session!.id}`) }))
      .then(() => sendResponse({ ok: true }))
      .catch((error: unknown) => sendResponse({ ok: false, error: String(error) }));
    
      return true;
  }

  if (payload.type === 'FETCH_IMAGE' && payload.url) {
    void fetchImage(payload.url, payload.pageUrl).then(sendResponse);
    return true;
  }

  return false;
});

async function fetchImage(url: string, pageUrl?: string): Promise<FetchResult> {
  try {
    const response = await fetch(url, {
      cache: 'default',
      credentials: 'include',
      referrer: pageUrl,
    });

    if (!response.ok) 
      throw new Error(`HTTP ${response.status} ${response.statusText}`);

    const blob: Blob = await response.blob();

    return {
      ok: true,
      requestedUrl: url,
      finalUrl: response.url || url,
      contentType: blob.type || response.headers.get('content-type') || 'application/octet-stream',
      data: await blobToDataUrl(blob),
    };
  } catch (error) {
    return { ok: false, requestedUrl: url, error: error instanceof Error ? error.message : String(error) };
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return blob.arrayBuffer().then((buffer) => {
    const bytes: Uint8Array = new Uint8Array(buffer);
    let binary: string = '';
    const chunkSize: number = 0x8000;

    for (let offset = 0; offset < bytes.length; offset += chunkSize)
      binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));

    return `data:${blob.type || 'application/octet-stream'};base64,${btoa(binary)}`;
  });
}
