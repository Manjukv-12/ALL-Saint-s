import { API_BASE } from '@/lib/api';
import { compressImageForUpload } from '@/lib/imageCompression';
import { apiClient, type ApiResponse } from './client';
import type { Member } from './types';

const PHOTO_COMPRESS = { maxBytes: 900_000, maxDimension: 1200, quality: 0.85 };

/** Public URL for a stored member photo filename. */
export function memberPhotoUrl(photo: string | null | undefined): string | null {
  if (!photo) return null;
  const safe = encodeURIComponent(photo.replace(/^.*[\\/]/, ''));
  const base = API_BASE.replace(/\/$/, '');
  return `${base}/api/cm-person-uploads/${safe}`;
}

export async function uploadMemberPhoto(
  memberId: string,
  file: File
): Promise<ApiResponse<Member>> {
  let compressed: File;
  try {
    compressed = await compressImageForUpload(file, PHOTO_COMPRESS);
  } catch (err) {
    return {
      error:
        err instanceof Error && err.message
          ? err.message
          : 'Could not process photo. Use JPG, PNG, or WebP.',
    };
  }

  const form = new FormData();
  form.append('photo', compressed);

  const base = apiClient.getBaseUrl();
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem(apiClient.getAuthTokenKey())
      : null;

  try {
    const response = await fetch(`${base}/api/church-management/members/${memberId}/photo`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    });
    const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    if (!response.ok) {
      return {
        error: (data.error as string) || (data.message as string) || 'Failed to upload photo',
      };
    }
    return { data: data as unknown as Member };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to upload photo' };
  }
}

export async function clearMemberPhoto(memberId: string): Promise<ApiResponse<Member>> {
  const base = apiClient.getBaseUrl();
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem(apiClient.getAuthTokenKey())
      : null;

  try {
    const response = await fetch(`${base}/api/church-management/members/${memberId}/photo`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    if (!response.ok) {
      return {
        error: (data.error as string) || (data.message as string) || 'Failed to remove photo',
      };
    }
    return { data: data as unknown as Member };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to remove photo' };
  }
}

/** Upload a new file and/or clear an existing photo. Returns error message or null. */
export async function syncMemberPhoto(
  memberId: string,
  opts: { file?: File | null; clear?: boolean }
): Promise<string | null> {
  if (opts.file) {
    const res = await uploadMemberPhoto(memberId, opts.file);
    return res.error ?? null;
  }
  if (opts.clear) {
    const res = await clearMemberPhoto(memberId);
    return res.error ?? null;
  }
  return null;
}
