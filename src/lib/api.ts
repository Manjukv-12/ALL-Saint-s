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
    if (host === 'localhost' || host === '127.0.0.1') {
      return normalized;
    }
  } catch {
    /* relative URL etc. */
  }
  return normalized;
}

export const API_BASE = resolveApiBase();

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

  try {
    const res = await fetch(`${API_BASE}/api/choir-registration`, {
      method: 'POST',
      body: form,
    });
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
      throw new Error(msg);
    }
    return json;
  } catch (err) {
    const isNetworkError =
      err instanceof TypeError ||
      (err instanceof Error && (err.message === 'Failed to fetch' || err.message.includes('fetch')));
    if (isNetworkError) {
      throw new Error(
        API_BASE
          ? `Connection failed. Is the backend running at ${API_BASE}?`
          : 'Set VITE_API_URL in .env (e.g. http://localhost:3001) and start the backend.'
      );
    }
    throw err;
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

/** URL to download an uploaded file (admin key required). */
export function uploadFileUrl(filename: string, apiKey: string): string {
  const base = API_BASE.replace(/\/$/, '');
  return `${base}/api/uploads/${encodeURIComponent(filename)}?key=${encodeURIComponent(apiKey)}`;
}

export type ChurchEventRow = {
  id: number;
  image: string | null;
  title: string;
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
  data: { title: string; time: string; location: string; description: string; is_active: boolean; image?: File | null },
): Promise<ChurchEventRow> {
  const form = new FormData();
  form.append('title', data.title.trim());
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
  data: { title: string; time: string; location: string; description: string; is_active: boolean; image?: File | null },
): Promise<ChurchEventRow> {
  const form = new FormData();
  form.append('title', data.title.trim());
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
