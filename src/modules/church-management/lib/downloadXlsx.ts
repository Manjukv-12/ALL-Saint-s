/** Shared authenticated XLSX download for church-management APIs. */

import { apiClient } from '@/modules/church-management/api/client';

function authHeaders(): HeadersInit {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem(apiClient.getAuthTokenKey()) : null;
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function filenameFromResponse(response: Response, fallback: string): string {
  const disposition = response.headers.get('Content-Disposition') ?? '';
  const utfMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) {
    try {
      return decodeURIComponent(utfMatch[1].trim());
    } catch {
      // fall through
    }
  }
  const match = disposition.match(/filename="?([^";\n]+)"?/i);
  if (match?.[1]) return match[1].trim();
  return fallback;
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

/**
 * Fetch an XLSX endpoint and save it. Rejects if the server returned HTML/JSON instead of a real workbook.
 */
export async function downloadChurchMgmtXlsx(
  pathWithQuery: string,
  fallbackFilename: string
): Promise<void> {
  const baseUrl = apiClient.getBaseUrl();
  const response = await fetch(`${baseUrl}${pathWithQuery}`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    let message = 'Failed to download Excel';
    try {
      const body = (await response.json()) as { error?: string };
      if (body?.error) message = body.error;
    } catch {
      // not JSON
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const head = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
  const looksLikeZip = head[0] === 0x50 && head[1] === 0x4b; // PK — real xlsx
  if (!looksLikeZip) {
    const text = (await blob.text()).slice(0, 240);
    if (text.includes('Fatal error') || text.includes('Class') || text.startsWith('{')) {
      throw new Error(
        'Server did not return a valid Excel file. Restart the API after updating backend-php, then try again.'
      );
    }
    throw new Error(`Unexpected export response: ${text || 'empty'}`);
  }

  triggerDownload(blob, filenameFromResponse(response, fallbackFilename));
}
