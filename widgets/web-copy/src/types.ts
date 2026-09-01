export type ResourceKind = 'image' | 'background';

export interface CapturedResource {
  id: string;
  url: string;
  kind: ResourceKind;
  element: string;
}

export interface CaptureSession {
  id: string;
  title: string;
  pageUrl: string;
  capturedAt: string;
  html: string;
  resources: CapturedResource[];
}

export interface ExportSettings {
  markdown: boolean;
  naming: 'original' | 'sequence';
  convertWebp: boolean;
}

export interface FetchResult {
  ok: boolean;
  requestedUrl: string;
  finalUrl?: string;
  contentType?: string;
  data?: string;
  error?: string;
}

export interface ReportItem {
  id: string;
  url: string;
  element: string;
  status: 'saved' | 'failed' | 'conversion-skipped' | 'conversion-failed';
  file?: string;
  reason?: string;
}
