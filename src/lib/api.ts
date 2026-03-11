/**
 * Choir registration API client.
 * Set VITE_API_URL in .env (e.g. http://localhost:3001).
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

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
 * Files: satb_notation (optional), registration_fee_file (optional).
 */
export async function submitChoirRegistration(data: {
  choir_name: string;
  choir_master_name: string;
  whatsapp: string;
  email: string;
  video_link?: string;
  satb_notation?: File | null;
  registration_fee_file?: File | null;
}): Promise<{ success: boolean; id?: number }> {
  const form = new FormData();
  form.append('choir_name', data.choir_name.trim());
  form.append('choir_master_name', data.choir_master_name.trim());
  form.append('whatsapp', data.whatsapp.trim());
  form.append('email', data.email.trim());
  if (data.video_link?.trim()) form.append('video_link', data.video_link.trim());
  if (data.satb_notation) form.append('satb_notation', data.satb_notation);
  if (data.registration_fee_file) form.append('registration_fee_file', data.registration_fee_file);

  try {
    const res = await fetch(`${API_BASE}/api/choir-registration`, {
      method: 'POST',
      body: form,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || json.message || 'Registration failed');
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
