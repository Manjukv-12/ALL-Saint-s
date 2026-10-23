import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import type { ChoirRegistration } from '@/lib/api';
import { uploadFileUrl, uploadFileUrlForExport } from '@/lib/api';

const CLIPBOARD_HEADERS = [
  'ID',
  'Choir name',
  'Choir master',
  'WhatsApp',
  'Email',
  'Video link',
  'SATB download link',
  'Fee proof download link',
  'SATB preview (image only)',
  'Fee preview (image only)',
  'Registered at',
] as const;

function escapeFormulaString(value: string): string {
  return value.replace(/"/g, '""');
}

/** Google Sheets formula: show image in cell for JPG/PNG; otherwise a clickable link. */
function sheetsFilePreviewFormula(fileUrl: string, filename: string | null): string {
  if (!fileUrl || !filename) return '';
  if (/\.(jpe?g|png|gif|webp)$/i.test(filename)) {
    return `=IMAGE("${escapeFormulaString(fileUrl)}")`;
  }
  if (/\.pdf$/i.test(filename)) {
    return `=HYPERLINK("${escapeFormulaString(fileUrl)}","Open PDF")`;
  }
  return `=HYPERLINK("${escapeFormulaString(fileUrl)}","Open file")`;
}

const EXCEL_HEADERS = [
  'ID',
  'Choir name',
  'Choir master',
  'WhatsApp',
  'Email',
  'Video link',
  'SATB file (in images folder)',
  'Fee proof (in images folder)',
  'SATB file URL',
  'Fee proof URL',
  'Registered at',
] as const;

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

function zipImagePath(id: number, kind: 'satb' | 'fee', filename: string): string {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `images/${id}-${kind}-${safe}`;
}

function clipboardRowCells(r: ChoirRegistration, apiKey: string): string[] {
  const satbUrl = r.satb_notation_file ? uploadFileUrlForExport(r.satb_notation_file, apiKey) : '';
  const feeUrl = r.registration_fee_file ? uploadFileUrlForExport(r.registration_fee_file, apiKey) : '';
  return [
    String(r.id),
    r.choir_name ?? '',
    r.choir_master_name ?? '',
    r.whatsapp ?? '',
    r.email ?? '',
    r.video_link ?? '',
    satbUrl,
    feeUrl,
    sheetsFilePreviewFormula(satbUrl, r.satb_notation_file),
    sheetsFilePreviewFormula(feeUrl, r.registration_fee_file),
    formatDate(r.created_at),
  ];
}

function excelRowCells(r: ChoirRegistration, apiKey: string): (string | number)[] {
  const satbZip = r.satb_notation_file ? zipImagePath(r.id, 'satb', r.satb_notation_file) : '';
  const feeZip = r.registration_fee_file ? zipImagePath(r.id, 'fee', r.registration_fee_file) : '';
  return [
    r.id,
    r.choir_name ?? '',
    r.choir_master_name ?? '',
    r.whatsapp ?? '',
    r.email ?? '',
    r.video_link ?? '',
    satbZip,
    feeZip,
    r.satb_notation_file ? uploadFileUrlForExport(r.satb_notation_file, apiKey) : '',
    r.registration_fee_file ? uploadFileUrlForExport(r.registration_fee_file, apiKey) : '',
    formatDate(r.created_at),
  ];
}

function escapeCsvCell(value: string): string {
  const s = String(value ?? '');
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function triggerBrowserDownload(blob: Blob, filename: string): void {
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

function buildXlsxArray(registrations: ChoirRegistration[], apiKey: string): Uint8Array {
  const rows = registrations.map((r) => excelRowCells(r, apiKey));
  const ws = XLSX.utils.aoa_to_sheet([Array.from(EXCEL_HEADERS), ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Registrations');
  return XLSX.write(wb, { bookType: 'xlsx', type: 'array' }) as Uint8Array;
}

async function fetchUploadBlob(filename: string, apiKey: string): Promise<Blob | null> {
  const res = await fetch(uploadFileUrl(filename, apiKey));
  if (!res.ok) return null;
  return res.blob();
}

export const GOOGLE_SHEETS_NEW = 'https://sheets.google.com/create';

export function buildChoirRegistrationsTsv(
  registrations: ChoirRegistration[],
  apiKey: string,
): string {
  if (registrations.length === 0) {
    throw new Error('No registrations to copy.');
  }
  const lines = [
    CLIPBOARD_HEADERS.join('\t'),
    ...registrations.map((r) => clipboardRowCells(r, apiKey).join('\t')),
  ];
  return lines.join('\n');
}

/** Copy during the button click (user gesture) so the clipboard is not cleared. */
export function copyTextForPaste(text: string): boolean {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '0';
    ta.style.left = '0';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    if (ok) return true;
  } catch {
    /* fall through */
  }
  return false;
}

export type ChoirSheetsCopyResult = {
  rowCount: number;
  copied: boolean;
  tsv: string;
};

/**
 * Copies choir data for Google Sheets. Does NOT fill the sheet — user must paste (Ctrl+V) on A1.
 * Google always opens a blank sheet; that is normal.
 */
export async function prepareChoirRegistrationsForGoogleSheets(
  registrations: ChoirRegistration[],
  apiKey: string,
): Promise<ChoirSheetsCopyResult> {
  const tsv = buildChoirRegistrationsTsv(registrations, apiKey);
  let copied = copyTextForPaste(tsv);
  if (!copied) {
    try {
      await navigator.clipboard.writeText(tsv);
      copied = true;
    } catch {
      copied = false;
    }
  }
  return { rowCount: registrations.length, copied, tsv };
}

export function openGoogleSheetsNewTab(): void {
  window.open(GOOGLE_SHEETS_NEW, '_blank', 'noopener,noreferrer');
}

/** @deprecated Use prepareChoirRegistrationsForGoogleSheets + paste guide dialog. */
export async function openChoirRegistrationsInGoogleSheets(
  registrations: ChoirRegistration[],
  apiKey: string,
): Promise<ChoirSheetsCopyResult> {
  return prepareChoirRegistrationsForGoogleSheets(registrations, apiKey);
}

/** Tab-separated text — paste into Google Sheets cell A1 (Ctrl+V). */
export async function copyChoirRegistrationsForGoogleSheets(
  registrations: ChoirRegistration[],
  apiKey: string,
): Promise<void> {
  const { copied } = await prepareChoirRegistrationsForGoogleSheets(registrations, apiKey);
  if (!copied) {
    throw new Error('Could not copy to clipboard. Use the manual copy box on screen.');
  }
}

/** Opens in Excel / LibreOffice as a real table (rows and columns). */
export function downloadChoirRegistrationsXlsx(
  registrations: ChoirRegistration[],
  apiKey: string,
  filenamePrefix = 'choir-registrations',
): void {
  if (registrations.length === 0) {
    throw new Error('No registrations to export.');
  }
  const stamp = new Date().toISOString().slice(0, 10);
  const bytes = buildXlsxArray(registrations, apiKey);
  const blob = new Blob([bytes], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  triggerBrowserDownload(blob, `${filenamePrefix}-${stamp}.xlsx`);
}

/**
 * ZIP with an Excel table plus uploaded SATB / fee files in an images/ folder.
 */
export async function downloadChoirRegistrationsZipBundle(
  registrations: ChoirRegistration[],
  apiKey: string,
  filenamePrefix = 'choir-registrations',
): Promise<{ imageCount: number; missingFiles: number }> {
  if (registrations.length === 0) {
    throw new Error('No registrations to export.');
  }

  const stamp = new Date().toISOString().slice(0, 10);
  const zip = new JSZip();
  const xlsxName = `${filenamePrefix}-${stamp}.xlsx`;
  zip.file(xlsxName, buildXlsxArray(registrations, apiKey));

  let imageCount = 0;
  let missingFiles = 0;

  for (const r of registrations) {
    if (r.satb_notation_file) {
      const blob = await fetchUploadBlob(r.satb_notation_file, apiKey);
      const path = zipImagePath(r.id, 'satb', r.satb_notation_file);
      if (blob) {
        zip.file(path, blob);
        imageCount += 1;
      } else {
        missingFiles += 1;
      }
    }
    if (r.registration_fee_file) {
      const blob = await fetchUploadBlob(r.registration_fee_file, apiKey);
      const path = zipImagePath(r.id, 'fee', r.registration_fee_file);
      if (blob) {
        zip.file(path, blob);
        imageCount += 1;
      } else {
        missingFiles += 1;
      }
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  triggerBrowserDownload(zipBlob, `${filenamePrefix}-${stamp}.zip`);
  return { imageCount, missingFiles };
}

/** Client-side CSV (e.g. filtered rows only). */
export function downloadChoirRegistrationsCsv(
  registrations: ChoirRegistration[],
  apiKey: string,
  filenamePrefix = 'choir-registrations',
): void {
  if (registrations.length === 0) {
    throw new Error('No registrations to export.');
  }
  const stamp = new Date().toISOString().slice(0, 10);
  const lines = [
    CLIPBOARD_HEADERS.map(escapeCsvCell).join(','),
    ...registrations.map((r) => clipboardRowCells(r, apiKey).map(escapeCsvCell).join(',')),
  ];
  const blob = new Blob(['\ufeff' + lines.join('\r\n')], {
    type: 'text/csv;charset=utf-8',
  });
  triggerBrowserDownload(blob, `${filenamePrefix}-${stamp}.csv`);
}

/** @deprecated Use downloadChoirRegistrationsXlsx or downloadChoirRegistrationsZipBundle. */
export async function downloadChoirRegistrationsExcel(
  registrations: ChoirRegistration[],
  apiKey: string,
  filenamePrefix = 'choir-registrations',
): Promise<'xlsx'> {
  downloadChoirRegistrationsXlsx(registrations, apiKey, filenamePrefix);
  return 'xlsx';
}
