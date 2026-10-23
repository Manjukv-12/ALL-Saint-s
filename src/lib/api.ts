/**
 * Choir registration API client.
 * Production: set VITE_API_URL (e.g. https://yoursite.com/backend-php).
 * Local dev: if VITE_API_URL points at the live site, requests are routed via
 * Vite proxy at /backend-php to avoid CORS (see vite.config.ts).
 */

function resolveApiBase(): string {
  const raw = (import.meta.env.VITE_API_URL as string | undefined)?.trim() ?? '';
  const normalized = raw.replace(/\/$/, '');
  if (!import.meta.env.DEV) return normalized;

  // Empty in dev: use same-origin /api/* → VITE_API_LOCAL_PROXY_TARGET (local PHP), not production.
  // To call live Hostinger from dev instead, set VITE_API_URL=https://csiallsaintstcr.com/backend-php
  if (!normalized) return '';
  try {
    const u = new URL(normalized);
    const host = u.hostname;
    if (host === 'csiallsaintstcr.com' || host.endsWith('.csiallsaintstcr.com')) {
      return '/backend-php';
    }
    // Local PHP: use VITE_API_URL directly. Do NOT return '' here — that forces same-origin
    // /api on :5173 and multipart POSTs often fail with 500 text/plain via Vite’s proxy.
    // Calling http://127.0.0.1:8080 from the Vite dev origin (e.g. :5173) is cross-origin → CORS unless PHP
    // sends Access-Control-Allow-Origin. Prefer same-origin /api via Vite proxy (vite.config.ts).
    // If multipart choir POST fails through the proxy, set VITE_API_USE_DIRECT_LOCAL=1 in .env.local and add
    // CORS headers on PHP for your dev origin, or use production API via csiallsaintstcr.com URL.
    if (host === 'localhost' || host === '127.0.0.1') {
      const useDirect =
        String(import.meta.env.VITE_API_USE_DIRECT_LOCAL ?? '').trim() === '1';
      if (useDirect) return normalized;
      return '';
    }
  } catch {
    /* relative URL etc. */
  }
  return normalized;
}

export const API_BASE = resolveApiBase();

const DEFAULT_EXPORT_FILES_BASE = 'https://csiallsaintstcr.com/backend-php';

/** Local `php -S :8080 router.php` serves /api/* at the host root (no /backend-php). */
function normalizeExportFilesBase(base: string): string {
  const b = base.replace(/\/$/, '');
  if (/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)\/backend-php$/i.test(b)) {
    return b.replace(/\/backend-php$/, '');
  }
  return b;
}

/** Absolute API base for file links in exports (Google Sheets, Excel). Never a bare `/api/...` path. */
export function exportFilesApiBase(): string {
  const explicit = (import.meta.env.VITE_EXPORT_FILES_BASE as string | undefined)?.trim().replace(/\/$/, '');
  if (explicit?.startsWith('http')) return normalizeExportFilesBase(explicit);

  const viteUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim().replace(/\/$/, '');
  if (viteUrl?.startsWith('http')) return normalizeExportFilesBase(viteUrl);

  if (API_BASE.startsWith('http')) return normalizeExportFilesBase(API_BASE);

  if (typeof window !== 'undefined') {
    const prefix = API_BASE || '/backend-php';
    const path = prefix.startsWith('/') ? prefix : `/${prefix}`;
    return normalizeExportFilesBase(`${window.location.origin}${path}`);
  }

  return DEFAULT_EXPORT_FILES_BASE;
}

export type ChoirRegistration = {
  id: number;
  choir_name: string;
  choir_master_name: string;
  whatsapp: string;
  email: string;
  satb_notation_file: string | null;
  registration_fee_file: string | null;
  video_link: string | null;
  created_at: string;
};

/** GET /api/health */
export async function apiHealth(): Promise<{ ok: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  } catch (err) {
    const isNetworkError =
      err instanceof TypeError ||
      (err instanceof Error && (err.message === 'Failed to fetch' || err.message.includes('fetch')));
    if (isNetworkError) {
      throw new Error(
        API_BASE
          ? `Cannot reach server at ${API_BASE}. Is the backend running?`
          : 'Set VITE_API_URL in .env (e.g. http://localhost:3001) and ensure the backend is running.'
      );
    }
    throw err;
  }
}

/**
 * POST /api/choir-registration (multipart/form-data).
 * Fields: choir_name, choir_master_name, whatsapp, email, video_link (optional).
 * Files: satb_notation (required), registration_fee_file (required).
 */
export class ChoirRegistrationDuplicateError extends Error {
  constructor(
    message: string,
    public field?: string,
  ) {
    super(message);
    this.name = 'ChoirRegistrationDuplicateError';
    this.field = field;
  }
}

export async function checkChoirRegistrationDuplicate(fields: {
  whatsapp: string;
  email: string;
  video_link: string;
}): Promise<{ duplicate: boolean; message: string }> {
  const body = new URLSearchParams();
  body.set('check_only', '1');
  body.set('whatsapp', fields.whatsapp.trim());
  body.set('email', fields.email.trim());
  body.set('video_link', fields.video_link.trim());
  const res = await fetch(`${API_BASE}/api/choir-registration`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const json = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    duplicate?: boolean;
    message?: string;
  };
  return {
    duplicate: !!json.duplicate,
    message: json.message ?? '',
  };
}

/** Max per file (must match backend-php config.php $MAX_FILE_SIZE). */
export const CHOIR_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;

export function formatChoirUploadSizeError(fileLabel: string, bytes: number): string {
  const mb = (bytes / (1024 * 1024)).toFixed(1);
  const maxMb = CHOIR_UPLOAD_MAX_BYTES / (1024 * 1024);
  return `${fileLabel} is ${mb} MB. Maximum is ${maxMb} MB per file. Compress the PDF or use a smaller photo.`;
}

export async function submitChoirRegistration(data: {
  choir_name: string;
  choir_master_name: string;
  whatsapp: string;
  email: string;
  video_link: string;
  satb_notation: File;
  registration_fee_file: File;
}): Promise<{ success: boolean; id?: number }> {
  const form = new FormData();
  form.append('choir_name', data.choir_name.trim());
  form.append('choir_master_name', data.choir_master_name.trim());
  form.append('whatsapp', data.whatsapp.trim());
  form.append('email', data.email.trim());
  form.append('video_link', data.video_link.trim());
  form.append('satb_notation', data.satb_notation);
  form.append('registration_fee_file', data.registration_fee_file);

  const uploadBytes = data.satb_notation.size + data.registration_fee_file.size;
  const controller = new AbortController();
  // Slow mobile uploads: allow up to 5 minutes before the browser gives up.
  const timeoutMs = Math.min(300_000, 120_000 + Math.ceil(uploadBytes / 40_000));
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_BASE}/api/choir-registration`, {
      method: 'POST',
      body: form,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const raw = await res.text();
    let json: Record<string, unknown> = {};
    try {
      json = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    } catch {
      if (!res.ok) {
        const hint = raw.trim().slice(0, 400);
        throw new Error(
          hint || `Registration failed (HTTP ${res.status}). Check the terminal running php -S for the PHP error.`
        );
      }
    }
    if (!res.ok) {
      const msg =
        (typeof json.error === 'string' && json.error) ||
        (typeof json.message === 'string' && json.message) ||
        'Registration failed';
      if (json.error === 'duplicate' || res.status === 409) {
        throw new ChoirRegistrationDuplicateError(
          typeof json.message === 'string' ? json.message : 'A registration with this WhatsApp, email, or video link already exists.',
          typeof json.field === 'string' ? json.field : undefined,
        );
      }
      throw new Error(msg);
    }
    return json;
  } catch (err) {
    if (err instanceof ChoirRegistrationDuplicateError) {
      throw err;
    }
    const isNetworkError =
      err instanceof TypeError ||
      (err instanceof Error && (err.message === 'Failed to fetch' || err.message.includes('fetch')));
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(
        'Upload took too long and was cancelled. Use Wi‑Fi, keep this tab open, and try files under 10 MB each.'
      );
    }
    if (isNetworkError) {
      const totalMb = (uploadBytes / (1024 * 1024)).toFixed(1);
      throw new Error(
        `Upload failed (${totalMb} MB total). This often happens on slow or mobile networks when the connection drops. ` +
          'Use Wi‑Fi, stay on this page until finished, and keep each file under 10 MB. Then try again.'
      );
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * GET /api/choir-registrations (requires admin API key).
 * Pass key via header or query.
 */
export async function getChoirRegistrations(apiKey: string): Promise<{
  count: number;
  registrations: ChoirRegistration[];
}> {
  try {
    const res = await fetch(`${API_BASE}/api/choir-registrations`, {
      headers: { 'x-api-key': apiKey },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || 'Failed to load registrations');
    return json;
  } catch (err) {
    const isNetworkError =
      err instanceof TypeError ||
      (err instanceof Error && (err.message === 'Failed to fetch' || err.message.includes('fetch')));
    if (isNetworkError) {
      throw new Error(
        API_BASE
          ? `Connection failed. Is the backend running at ${API_BASE}?`
          : 'Set VITE_API_URL in .env and start the backend.'
      );
    }
    throw err;
  }
}

/** URL to download an uploaded file in the admin UI (admin key required). */
export function uploadFileUrl(filename: string, apiKey: string): string {
  const base = normalizeExportFilesBase(
    API_BASE.startsWith('http')
      ? API_BASE
      : `${typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:8080'}${API_BASE || '/backend-php'}`,
  );
  const safeName = filename.split(/[/\\]/).pop() || filename;
  return `${base}/api/uploads/${encodeURIComponent(safeName)}?key=${encodeURIComponent(apiKey)}`;
}

/** Full https URL for spreadsheets — Google Sheets cannot use `/api/uploads/...` paths. */
export function uploadFileUrlForExport(filename: string, apiKey: string): string {
  const base = exportFilesApiBase();
  const safeName = filename.split(/[/\\]/).pop() || filename;
  return `${base}/api/uploads/${encodeURIComponent(safeName)}?key=${encodeURIComponent(apiKey)}`;
}

/** Server export URLs — use window.location.href so the browser saves the file directly. */
export function choirRegistrationsCsvDownloadUrl(apiKey: string): string {
  const base = API_BASE.replace(/\/$/, '');
  const q = new URLSearchParams({ format: 'csv', key: apiKey });
  return `${base}/api/choir-registrations?${q.toString()}`;
}

export function choirRegistrationsXlsxDownloadUrl(apiKey: string): string {
  const base = API_BASE.replace(/\/$/, '');
  const q = new URLSearchParams({ format: 'xlsx', key: apiKey });
  return `${base}/api/choir-registrations?${q.toString()}`;
}

function triggerBrowserFileDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/** Download from PHP with a guaranteed .csv or .xlsx extension (do not open in WordPad). */
export async function downloadChoirRegistrationsFromServer(
  apiKey: string,
  format: 'csv' | 'xlsx',
): Promise<void> {
  const url =
    format === 'csv'
      ? choirRegistrationsCsvDownloadUrl(apiKey)
      : choirRegistrationsXlsxDownloadUrl(apiKey);
  const res = await fetch(url);
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error((json as { error?: string }).error || `Export failed (${res.status})`);
  }
  const blob = await res.blob();
  const head = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
  const looksLikeZip = head[0] === 0x50 && head[1] === 0x4b; // PK — real xlsx/docx
  const looksLikeCsv = format === 'csv';
  if (format === 'xlsx' && !looksLikeZip) {
    const text = await blob.text();
    if (text.includes('Fatal error') || text.includes('mb_strlen') || text.startsWith('{')) {
      throw new Error(
        'Server did not return a valid Excel file (PHP error). Restart the API after updating backend-php, or use Open in Google Sheets / Download CSV.',
      );
    }
  }
  if (!looksLikeZip && !looksLikeCsv) {
    const text = (await blob.text()).slice(0, 200);
    throw new Error(`Unexpected export response: ${text}`);
  }
  const stamp = new Date().toISOString().slice(0, 10);
  const ext = format === 'csv' ? 'csv' : 'xlsx';
  triggerBrowserFileDownload(blob, `choir-registrations-${stamp}.${ext}`);
}


export type ChurchEventRow = {
  id: number;
  image: string | null;
  title: string;
  event_date: string | null;
  time: string | null;
  location: string | null;
  description: string | null;
  is_active: number;
  created_at: string;
};

/** GET /api/events — public; only is_active rows. */
export async function getPublicEvents(): Promise<ChurchEventRow[]> {
  const res = await fetch(`${API_BASE}/api/events`);
  const json = (await res.json().catch(() => ({}))) as { events?: ChurchEventRow[]; error?: string };
  if (!res.ok) {
    throw new Error(json.error || `Failed to load events (${res.status})`);
  }
  return json.events ?? [];
}

/** GET /api/events?all=1 — admin; includes inactive. */
export async function getAllEventsAdmin(apiKey: string): Promise<ChurchEventRow[]> {
  const res = await fetch(`${API_BASE}/api/events?all=1`, {
    headers: { 'x-api-key': apiKey },
  });
  const json = (await res.json().catch(() => ({}))) as { events?: ChurchEventRow[]; error?: string };
  if (!res.ok) throw new Error(json.error || 'Failed to load events');
  return json.events ?? [];
}

/** Absolute URL for an event card image (public for active events). */
export function eventImageUrl(filename: string | null | undefined): string | null {
  if (!filename?.trim()) return null;
  const base = API_BASE.replace(/\/$/, '');
  return `${base}/api/event-uploads/${encodeURIComponent(filename)}`;
}

function adminHeaders(apiKey: string): HeadersInit {
  return { 'x-api-key': apiKey };
}

/** Lightweight check used once for all admin pages (same ADMIN_API_KEY). */
export async function verifyAdminApiKey(apiKey: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/events?all=1`, {
    headers: adminHeaders(apiKey.trim()),
  });
  const json = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) {
    throw new Error(json.error || 'Invalid admin API key');
  }
}

function apiErrorMessage(
  json: { error?: string; message?: string; hint?: string | null },
  raw: string,
  fallback: string,
): string {
  const parts = [json.error, json.message, json.hint].filter((x): x is string => typeof x === 'string' && x.trim() !== '');
  if (parts.length) return parts.join(' — ');
  return raw.trim().slice(0, 200) || fallback;
}

export async function createEvent(
  apiKey: string,
  data: {
    title: string;
    event_date: string;
    time: string;
    location: string;
    description: string;
    is_active: boolean;
    image?: File | null;
  },
): Promise<ChurchEventRow> {
  const form = new FormData();
  form.append('title', data.title.trim());
  form.append('event_date', data.event_date.trim());
  form.append('time', data.time.trim());
  form.append('location', data.location.trim());
  form.append('description', data.description.trim());
  form.append('is_active', data.is_active ? '1' : '0');
  if (data.image) form.append('image', data.image);
  const res = await fetch(`${API_BASE}/api/events`, { method: 'POST', headers: adminHeaders(apiKey), body: form });
  const raw = await res.text();
  let json: ChurchEventRow & { error?: string; message?: string; hint?: string | null } = {} as ChurchEventRow;
  try {
    json = raw ? (JSON.parse(raw) as ChurchEventRow & { error?: string; message?: string; hint?: string | null }) : json;
  } catch {
    /* */
  }
  if (!res.ok) throw new Error(apiErrorMessage(json, raw, 'Create failed'));
  return json;
}

export async function updateEvent(
  apiKey: string,
  id: number,
  data: {
    title: string;
    event_date: string;
    time: string;
    location: string;
    description: string;
    is_active: boolean;
    image?: File | null;
  },
): Promise<ChurchEventRow> {
  const form = new FormData();
  form.append('title', data.title.trim());
  form.append('event_date', data.event_date.trim());
  form.append('time', data.time.trim());
  form.append('location', data.location.trim());
  form.append('description', data.description.trim());
  form.append('is_active', data.is_active ? '1' : '0');
  if (data.image) form.append('image', data.image);
  const res = await fetch(`${API_BASE}/api/events/${id}`, {
    method: 'POST',
    headers: adminHeaders(apiKey),
    body: form,
  });
  const raw = await res.text();
  let json: ChurchEventRow & { error?: string; message?: string; hint?: string | null } = {} as ChurchEventRow;
  try {
    json = raw ? (JSON.parse(raw) as ChurchEventRow & { error?: string; message?: string; hint?: string | null }) : json;
  } catch {
    /* */
  }
  if (!res.ok) throw new Error(apiErrorMessage(json, raw, 'Update failed'));
  return json;
}

export async function deleteEvent(apiKey: string, id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/events/${id}`, {
    method: 'DELETE',
    headers: adminHeaders(apiKey),
  });
  const raw = await res.text();
  let json: { error?: string; message?: string; hint?: string | null } = {};
  try {
    json = raw ? (JSON.parse(raw) as typeof json) : json;
  } catch {
    /* */
  }
  if (!res.ok) throw new Error(apiErrorMessage(json, raw, 'Delete failed'));
}

export type GalleryImageRow = {
  id: number;
  image: string;
  alt_text: string | null;
  caption: string | null;
  sort_order: number;
  is_active: number;
};

export type GalleryCategoryRow = {
  id: number;
  name: string;
  sort_order: number;
  is_active: number;
  images: GalleryImageRow[];
};

export type GalleryVideoRow = {
  id: number;
  category_id: number | null;
  category_name: string | null;
  category_subtitle: string | null;
  title: string;
  video_url: string;
  thumbnail_url: string | null;
  sort_order: number;
  is_active: number;
};

export type GalleryVideoCategoryRow = {
  id: number;
  name: string;
  subtitle: string | null;
  sort_order: number;
  is_active: number;
};

export type LeadershipMemberRow = {
  id: number;
  /** Stable id from API; use for layout and grouping (titles may be edited). */
  section_key?: string;
  section_name: string;
  name: string;
  role_title: string | null;
  phone: string | null;
  bio: string | null;
  image: string | null;
  sort_order: number;
  is_active: number;
  /** Calendar year for this roster (history / archives). */
  year?: number;
  created_at: string;
};

export type LeadershipSectionRow = {
  id: number;
  section_key: string;
  /** Roster year for this section copy (titles, intro, section photo). */
  year?: number;
  title: string;
  subtitle: string | null;
  description: string | null;
  image: string | null;
  sort_order: number;
  is_active: number;
  created_at: string;
};

export function mediaImageUrl(filename: string | null | undefined, apiKey?: string): string | null {
  if (!filename?.trim()) return null;
  const value = filename.trim();
  // Backward-compatible: some records may store full URLs instead of plain filenames.
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('/')) return value;
  const base = API_BASE.replace(/\/$/, '');
  const keyPart = apiKey ? `?key=${encodeURIComponent(apiKey)}` : '';
  return `${base}/api/media-uploads/${encodeURIComponent(value)}${keyPart}`;
}

export async function getPublicGallery(): Promise<GalleryCategoryRow[]> {
  const res = await fetch(`${API_BASE}/api/gallery`);
  const json = (await res.json().catch(() => ({}))) as { categories?: GalleryCategoryRow[]; error?: string };
  if (!res.ok) throw new Error(json.error || 'Failed to load gallery');
  return json.categories ?? [];
}

export async function getAllGalleryAdmin(apiKey: string): Promise<GalleryCategoryRow[]> {
  const res = await fetch(`${API_BASE}/api/gallery?all=1`, { headers: adminHeaders(apiKey) });
  const json = (await res.json().catch(() => ({}))) as { categories?: GalleryCategoryRow[]; error?: string };
  if (!res.ok) throw new Error(json.error || 'Failed to load gallery');
  return json.categories ?? [];
}

export async function getPublicGalleryVideos(): Promise<GalleryVideoRow[]> {
  const res = await fetch(`${API_BASE}/api/gallery`);
  const json = (await res.json().catch(() => ({}))) as { videos?: GalleryVideoRow[]; error?: string };
  if (!res.ok) throw new Error(json.error || 'Failed to load gallery videos');
  return json.videos ?? [];
}

export async function getAllGalleryVideosAdmin(apiKey: string): Promise<GalleryVideoRow[]> {
  const res = await fetch(`${API_BASE}/api/gallery?all=1`, { headers: adminHeaders(apiKey) });
  const json = (await res.json().catch(() => ({}))) as { videos?: GalleryVideoRow[]; error?: string };
  if (!res.ok) throw new Error(json.error || 'Failed to load gallery videos');
  return json.videos ?? [];
}

export async function getAllGalleryVideoCategoriesAdmin(apiKey: string): Promise<GalleryVideoCategoryRow[]> {
  const res = await fetch(`${API_BASE}/api/gallery?all=1`, { headers: adminHeaders(apiKey) });
  const json = (await res.json().catch(() => ({}))) as { video_categories?: GalleryVideoCategoryRow[]; error?: string };
  if (!res.ok) throw new Error(json.error || 'Failed to load video categories');
  return json.video_categories ?? [];
}

export async function createGalleryCategory(apiKey: string, data: { name: string; sort_order: number; is_active: boolean }): Promise<void> {
  const form = new FormData();
  form.append('name', data.name.trim());
  form.append('sort_order', String(data.sort_order));
  form.append('is_active', data.is_active ? '1' : '0');
  const res = await fetch(`${API_BASE}/api/gallery/categories`, { method: 'POST', headers: adminHeaders(apiKey), body: form });
  const raw = await res.text();
  if (!res.ok) throw new Error(raw || 'Create category failed');
}

export async function updateGalleryCategory(apiKey: string, id: number, data: { name: string; sort_order: number; is_active: boolean }): Promise<void> {
  const form = new FormData();
  form.append('name', data.name.trim());
  form.append('sort_order', String(data.sort_order));
  form.append('is_active', data.is_active ? '1' : '0');
  const res = await fetch(`${API_BASE}/api/gallery/categories/${id}`, { method: 'POST', headers: adminHeaders(apiKey), body: form });
  const raw = await res.text();
  if (!res.ok) throw new Error(raw || 'Update category failed');
}

export async function deleteGalleryCategory(apiKey: string, id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/gallery/categories/${id}`, { method: 'DELETE', headers: adminHeaders(apiKey) });
  const raw = await res.text();
  if (!res.ok) throw new Error(raw || 'Delete category failed');
}

export async function bulkUploadGalleryImages(
  apiKey: string,
  data: { category_id: number; files: File[]; alt_text: string; caption: string; sort_order: number; is_active: boolean },
): Promise<void> {
  const MAX_REQUEST_BYTES = 7_500_000;

  const chunks: File[][] = [];
  let current: File[] = [];
  let runningBytes = 0;
  for (const file of data.files) {
    const size = Math.max(1, file.size);
    if (current.length > 0 && runningBytes + size > MAX_REQUEST_BYTES) {
      chunks.push(current);
      current = [];
      runningBytes = 0;
    }
    current.push(file);
    runningBytes += size;
  }
  if (current.length > 0) chunks.push(current);

  for (const files of chunks) {
    const form = new FormData();
    form.append('category_id', String(data.category_id));
    form.append('alt_text', data.alt_text.trim());
    form.append('caption', data.caption.trim());
    form.append('sort_order', String(data.sort_order));
    form.append('is_active', data.is_active ? '1' : '0');
    files.forEach((f) => form.append('images[]', f));
    const res = await fetch(`${API_BASE}/api/gallery/images/bulk`, { method: 'POST', headers: adminHeaders(apiKey), body: form });
    const raw = await res.text();
    if (!res.ok) throw new Error(raw || 'Bulk upload failed');
  }
}

export async function deleteGalleryImage(apiKey: string, id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/gallery/images/${id}`, { method: 'DELETE', headers: adminHeaders(apiKey) });
  const raw = await res.text();
  if (!res.ok) throw new Error(raw || 'Delete image failed');
}

export async function createGalleryVideo(
  apiKey: string,
  data: {
    category_id: number;
    category_name?: string;
    category_subtitle?: string;
    title: string;
    video_url: string;
    thumbnail_url?: string;
    sort_order: number;
    is_active: boolean;
  },
): Promise<void> {
  const form = new FormData();
  form.append('category_id', String(data.category_id));
  form.append('category_name', (data.category_name ?? '').trim());
  form.append('category_subtitle', (data.category_subtitle ?? '').trim());
  form.append('title', data.title.trim());
  form.append('video_url', data.video_url.trim());
  form.append('thumbnail_url', (data.thumbnail_url ?? '').trim());
  form.append('sort_order', String(data.sort_order));
  form.append('is_active', data.is_active ? '1' : '0');
  const res = await fetch(`${API_BASE}/api/gallery/videos`, { method: 'POST', headers: adminHeaders(apiKey), body: form });
  const raw = await res.text();
  if (!res.ok) throw new Error(raw || 'Create video failed');
}

export async function updateGalleryVideo(
  apiKey: string,
  id: number,
  data: {
    category_id: number;
    category_name?: string;
    category_subtitle?: string;
    title: string;
    video_url: string;
    thumbnail_url?: string;
    sort_order: number;
    is_active: boolean;
  },
): Promise<void> {
  const form = new FormData();
  form.append('category_id', String(data.category_id));
  form.append('category_name', (data.category_name ?? '').trim());
  form.append('category_subtitle', (data.category_subtitle ?? '').trim());
  form.append('title', data.title.trim());
  form.append('video_url', data.video_url.trim());
  form.append('thumbnail_url', (data.thumbnail_url ?? '').trim());
  form.append('sort_order', String(data.sort_order));
  form.append('is_active', data.is_active ? '1' : '0');
  const res = await fetch(`${API_BASE}/api/gallery/videos/${id}`, { method: 'POST', headers: adminHeaders(apiKey), body: form });
  const raw = await res.text();
  if (!res.ok) throw new Error(raw || 'Update video failed');
}

export async function deleteGalleryVideo(apiKey: string, id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/gallery/videos/${id}`, { method: 'DELETE', headers: adminHeaders(apiKey) });
  const raw = await res.text();
  if (!res.ok) throw new Error(raw || 'Delete video failed');
}

export async function createGalleryVideoCategory(
  apiKey: string,
  data: { name: string; subtitle: string; sort_order: number; is_active: boolean },
): Promise<void> {
  const form = new FormData();
  form.append('name', data.name.trim());
  form.append('subtitle', data.subtitle.trim());
  form.append('sort_order', String(data.sort_order));
  form.append('is_active', data.is_active ? '1' : '0');
  const res = await fetch(`${API_BASE}/api/gallery/video-categories`, { method: 'POST', headers: adminHeaders(apiKey), body: form });
  const raw = await res.text();
  if (!res.ok) throw new Error(raw || 'Create video category failed');
}

export async function updateGalleryVideoCategory(
  apiKey: string,
  id: number,
  data: { name: string; subtitle: string; sort_order: number; is_active: boolean },
): Promise<void> {
  const form = new FormData();
  form.append('name', data.name.trim());
  form.append('subtitle', data.subtitle.trim());
  form.append('sort_order', String(data.sort_order));
  form.append('is_active', data.is_active ? '1' : '0');
  const res = await fetch(`${API_BASE}/api/gallery/video-categories/${id}`, { method: 'POST', headers: adminHeaders(apiKey), body: form });
  const raw = await res.text();
  if (!res.ok) throw new Error(raw || 'Update video category failed');
}

export async function deleteGalleryVideoCategory(apiKey: string, id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/gallery/video-categories/${id}`, { method: 'DELETE', headers: adminHeaders(apiKey) });
  const raw = await res.text();
  if (!res.ok) throw new Error(raw || 'Delete video category failed');
}

export type LeadershipYearsResponse = {
  years: number[];
  current_year: number;
};

export type PublicLeadershipResponse = {
  members: LeadershipMemberRow[];
  /** Year the API used for this payload (public default = latest in DB). */
  year: number | null;
};

export async function getLeadershipYears(): Promise<LeadershipYearsResponse> {
  const fallbackYear = new Date().getFullYear();
  const res = await fetch(`${API_BASE}/api/leadership/years`);
  const json = (await res.json().catch(() => ({}))) as LeadershipYearsResponse & { error?: string };
  if (!res.ok) {
    // Backward compatibility: older/local PHP APIs may not have yearly leadership endpoints yet.
    return { years: [fallbackYear], current_year: fallbackYear };
  }
  return {
    years: Array.isArray(json.years) ? json.years : [],
    current_year: typeof json.current_year === 'number' ? json.current_year : fallbackYear,
  };
}

export async function getPublicLeadership(year?: number): Promise<PublicLeadershipResponse> {
  const params = new URLSearchParams();
  if (year != null && year > 0) params.set('year', String(year));
  const qs = params.toString();
  const res = await fetch(`${API_BASE}/api/leadership${qs ? `?${qs}` : ''}`);
  const json = (await res.json().catch(() => ({}))) as {
    members?: LeadershipMemberRow[];
    year?: number | null;
    error?: string;
  };
  if (!res.ok) {
    // Keep page usable if local API is temporarily broken.
    return { members: [], year: null };
  }
  return { members: json.members ?? [], year: json.year ?? null };
}

export async function getAllLeadershipAdmin(apiKey: string, year?: number): Promise<LeadershipMemberRow[]> {
  const params = new URLSearchParams({ all: '1' });
  if (year != null && year > 0) params.set('year', String(year));
  const res = await fetch(`${API_BASE}/api/leadership?${params.toString()}`, { headers: adminHeaders(apiKey) });
  const json = (await res.json().catch(() => ({}))) as { members?: LeadershipMemberRow[]; error?: string };
  if (!res.ok) throw new Error(json.error || 'Failed to load leadership');
  return json.members ?? [];
}

export async function reorderLeadershipMembers(
  apiKey: string,
  body: { section_key: string; year: number; ids: number[] },
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/leadership/reorder`, {
    method: 'POST',
    headers: { ...adminHeaders(apiKey), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const raw = await res.text();
  let json: { error?: string } = {};
  try {
    json = raw ? (JSON.parse(raw) as typeof json) : json;
  } catch {
    /* */
  }
  if (!res.ok) throw new Error(json.error || raw || 'Reorder failed');
}

export async function getPublicLeadershipSections(year?: number): Promise<LeadershipSectionRow[]> {
  const params = new URLSearchParams();
  if (year != null && year > 0) params.set('year', String(year));
  const qs = params.toString();
  const res = await fetch(`${API_BASE}/api/leadership/sections${qs ? `?${qs}` : ''}`);
  const json = (await res.json().catch(() => ({}))) as { sections?: LeadershipSectionRow[]; error?: string };
  if (!res.ok) {
    // Allow page defaults (`leadershipDefaultSections`) to render while backend is being fixed.
    return [];
  }
  return json.sections ?? [];
}

export async function getAllLeadershipSectionsAdmin(apiKey: string, year?: number): Promise<LeadershipSectionRow[]> {
  const params = new URLSearchParams({ all: '1' });
  if (year != null && year > 0) params.set('year', String(year));
  const res = await fetch(`${API_BASE}/api/leadership/sections?${params.toString()}`, { headers: adminHeaders(apiKey) });
  const json = (await res.json().catch(() => ({}))) as { sections?: LeadershipSectionRow[]; error?: string };
  if (!res.ok) throw new Error(json.error || 'Failed to load leadership sections');
  return json.sections ?? [];
}

export async function upsertLeadershipSection(
  apiKey: string,
  sectionKey: string,
  data: {
    title: string;
    subtitle: string;
    description: string;
    sort_order: number;
    is_active: boolean;
    /** Roster year this section copy belongs to (must match admin roster year). */
    year: number;
    image?: File | null;
    /** When true, removes stored section header image (PHP deletes file + clears DB). */
    clear_image?: boolean;
  },
): Promise<void> {
  const form = new FormData();
  form.append('title', data.title.trim());
  form.append('subtitle', data.subtitle.trim());
  // Normalize newlines only; keep internal spaces (public page uses whitespace-pre-wrap).
  form.append('description', data.description.replace(/\r\n/g, '\n').replace(/\r/g, '\n'));
  form.append('sort_order', String(data.sort_order));
  form.append('is_active', data.is_active ? '1' : '0');
  form.append('year', String(data.year));
  if (data.clear_image) form.append('clear_image', '1');
  if (data.image) form.append('image', data.image);
  const res = await fetch(`${API_BASE}/api/leadership/sections/${encodeURIComponent(sectionKey)}`, {
    method: 'POST',
    headers: adminHeaders(apiKey),
    body: form,
  });
  const raw = await res.text();
  if (!res.ok) throw new Error(raw || 'Save section failed');
}

export async function createLeadershipMember(
  apiKey: string,
  data: {
    section_key: string;
    section_name?: string;
    name: string;
    role_title: string;
    phone: string;
    bio: string;
    sort_order: number;
    is_active: boolean;
    year: number;
    image?: File | null;
  },
): Promise<void> {
  const form = new FormData();
  form.append('section_key', data.section_key.trim());
  if (data.section_name?.trim()) form.append('section_name', data.section_name.trim());
  form.append('name', data.name.trim());
  form.append('role_title', data.role_title.trim());
  form.append('phone', data.phone.trim());
  form.append('bio', data.bio.trim());
  form.append('sort_order', String(data.sort_order));
  form.append('is_active', data.is_active ? '1' : '0');
  form.append('year', String(data.year));
  if (data.image) form.append('image', data.image);
  const res = await fetch(`${API_BASE}/api/leadership`, { method: 'POST', headers: adminHeaders(apiKey), body: form });
  const raw = await res.text();
  if (!res.ok) throw new Error(raw || 'Create member failed');
}

export async function updateLeadershipMember(
  apiKey: string,
  id: number,
  data: {
    section_key: string;
    section_name?: string;
    name: string;
    role_title: string;
    phone: string;
    bio: string;
    sort_order: number;
    is_active: boolean;
    year: number;
    image?: File | null;
  },
): Promise<void> {
  const form = new FormData();
  form.append('section_key', data.section_key.trim());
  if (data.section_name?.trim()) form.append('section_name', data.section_name.trim());
  form.append('name', data.name.trim());
  form.append('role_title', data.role_title.trim());
  form.append('phone', data.phone.trim());
  form.append('bio', data.bio.trim());
  form.append('sort_order', String(data.sort_order));
  form.append('is_active', data.is_active ? '1' : '0');
  form.append('year', String(data.year));
  if (data.image) form.append('image', data.image);
  const res = await fetch(`${API_BASE}/api/leadership/${id}`, { method: 'POST', headers: adminHeaders(apiKey), body: form });
  const raw = await res.text();
  if (!res.ok) throw new Error(raw || 'Update member failed');
}

export async function deleteLeadershipMember(apiKey: string, id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/leadership/${id}`, { method: 'DELETE', headers: adminHeaders(apiKey) });
  const raw = await res.text();
  if (!res.ok) throw new Error(raw || 'Delete member failed');
}

export type PastLeaderGroupKey = 'vicars-assistant-vicar' | 'committee';

export type PastLeaderRow = {
  id: number;
  group_key: PastLeaderGroupKey;
  /** Name is required only for vicars-assistant-vicar. */
  name: string | null;
  /** Vicar role, Asst. Vicar role, or custom role text. */
  role_title: string | null;
  /** Manual section/line group (1,2,3...) for page placement. */
  display_section?: number;
  /** Free-text term label (e.g. "2018 - 2021"). */
  duration: string;
  image: string | null;
  sort_order: number;
  is_active: number;
  created_at: string;
};

export async function getPublicPastLeaders(): Promise<PastLeaderRow[]> {
  const res = await fetch(`${API_BASE}/api/past-leaders`);
  const json = (await res.json().catch(() => ({}))) as { items?: PastLeaderRow[]; error?: string };
  if (!res.ok) throw new Error(json.error || 'Failed to load past leaders');
  return json.items ?? [];
}

export async function getAllPastLeadersAdmin(apiKey: string): Promise<PastLeaderRow[]> {
  const res = await fetch(`${API_BASE}/api/past-leaders?all=1`, { headers: adminHeaders(apiKey) });
  const json = (await res.json().catch(() => ({}))) as { items?: PastLeaderRow[]; error?: string };
  if (!res.ok) throw new Error(json.error || 'Failed to load past leaders');
  return json.items ?? [];
}

export async function createPastLeader(
  apiKey: string,
  data: {
    group_key: PastLeaderGroupKey;
    name: string;
    role_title: string;
    display_section?: number;
    duration: string;
    sort_order: number;
    is_active: boolean;
    image?: File | null;
  },
): Promise<void> {
  const form = new FormData();
  form.append('group_key', data.group_key);
  form.append('name', data.name.trim());
  form.append('role_title', data.role_title.trim());
  form.append('display_section', String(data.display_section ?? 1));
  form.append('duration', data.duration.trim());
  form.append('sort_order', String(data.sort_order));
  form.append('is_active', data.is_active ? '1' : '0');
  if (data.image) form.append('image', data.image);
  const res = await fetch(`${API_BASE}/api/past-leaders`, { method: 'POST', headers: adminHeaders(apiKey), body: form });
  const raw = await res.text();
  if (!res.ok) throw new Error(raw || 'Create past leader failed');
}

export async function updatePastLeader(
  apiKey: string,
  id: number,
  data: {
    group_key: PastLeaderGroupKey;
    name: string;
    role_title: string;
    display_section?: number;
    duration: string;
    sort_order: number;
    is_active: boolean;
    image?: File | null;
  },
): Promise<void> {
  const form = new FormData();
  form.append('group_key', data.group_key);
  form.append('name', data.name.trim());
  form.append('role_title', data.role_title.trim());
  form.append('display_section', String(data.display_section ?? 1));
  form.append('duration', data.duration.trim());
  form.append('sort_order', String(data.sort_order));
  form.append('is_active', data.is_active ? '1' : '0');
  if (data.image) form.append('image', data.image);
  const res = await fetch(`${API_BASE}/api/past-leaders/${id}`, { method: 'POST', headers: adminHeaders(apiKey), body: form });
  const raw = await res.text();
  if (!res.ok) throw new Error(raw || 'Update past leader failed');
}

export async function deletePastLeader(apiKey: string, id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/past-leaders/${id}`, { method: 'DELETE', headers: adminHeaders(apiKey) });
  const raw = await res.text();
  if (!res.ok) throw new Error(raw || 'Delete past leader failed');
}

export type EdavakaDhoodhanMeta = {
  pdf_file: string | null;
  image_file: string | null;
  updated_at: string | null;
  server_limits?: {
    upload_max_filesize: string;
    post_max_size: string;
    upload_max_bytes: number;
    post_max_bytes: number;
  };
};

/** Public URL for an uploaded Edavaka Dhoodhan file (PDF or banner image). */
export function edavakaDhoodhanFileUrl(filename: string | null | undefined): string | null {
  if (!filename?.trim()) return null;
  const base = API_BASE.replace(/\/$/, '');
  return `${base}/api/edavaka-dhoodhan/file/${encodeURIComponent(filename.trim())}`;
}

/** GET /api/edavaka-dhoodhan — current PDF filename (banner stays a built-in asset). */
export async function getEdavakaDhoodhan(): Promise<EdavakaDhoodhanMeta> {
  const res = await fetch(`${API_BASE}/api/edavaka-dhoodhan`);
  const json = (await res.json().catch(() => ({}))) as EdavakaDhoodhanMeta & { error?: string };
  if (!res.ok) {
    return { pdf_file: null, image_file: null, updated_at: null };
  }
  return {
    pdf_file: json.pdf_file ?? null,
    image_file: json.image_file ?? null,
    updated_at: json.updated_at ?? null,
    server_limits: json.server_limits,
  };
}

/** POST /api/edavaka-dhoodhan — upload monthly PDF (admin). */
export async function uploadEdavakaDhoodhan(apiKey: string, pdf: File): Promise<EdavakaDhoodhanMeta> {
  const form = new FormData();
  form.append('pdf', pdf);
  const res = await fetch(`${API_BASE}/api/edavaka-dhoodhan`, {
    method: 'POST',
    headers: adminHeaders(apiKey),
    body: form,
  });
  const raw = await res.text();
  let json: EdavakaDhoodhanMeta & { error?: string } = {};
  try {
    json = JSON.parse(raw) as EdavakaDhoodhanMeta & { error?: string };
  } catch {
    if (!res.ok) throw new Error(raw.trim() || 'Upload failed');
  }
  if (!res.ok) throw new Error(json.error || raw.trim() || 'Upload failed');
  return {
    pdf_file: json.pdf_file ?? null,
    image_file: json.image_file ?? null,
    updated_at: json.updated_at ?? null,
  };
}
