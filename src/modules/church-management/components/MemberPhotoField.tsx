import { useEffect, useRef, useState } from 'react';
import { Camera, ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { compressImageForUpload } from '@/lib/imageCompression';
import { memberPhotoUrl } from '@/modules/church-management/api/memberPhoto';
import { MemberPhotoLightbox } from '@/modules/church-management/components/MemberPhotoLightbox';

export type MemberPhotoSelection = {
  file: File | null;
  /** True when user cleared an existing server photo (and did not pick a new one). */
  clearExisting: boolean;
};

type Props = {
  /** Existing stored filename from the API. */
  existingPhoto?: string | null;
  value: MemberPhotoSelection;
  onChange: (next: MemberPhotoSelection) => void;
  disabled?: boolean;
  className?: string;
};

const EMPTY: MemberPhotoSelection = { file: null, clearExisting: false };

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const ALLOWED_EXT = new Set(['jpg', 'jpeg', 'png', 'webp']);
const ACCEPT = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp';
const PREPARE_OPTS = { maxBytes: 900_000, maxDimension: 1200, quality: 0.85 };

/** Avoid page "blanking" when OS file dialog opens (visibility + scroll-into-view). */
let filePickerOpenCount = 0;
export function isMemberPhotoPickerOpen(): boolean {
  return filePickerOpenCount > 0;
}

export function emptyMemberPhotoSelection(): MemberPhotoSelection {
  return { ...EMPTY };
}

function fileExtension(name: string): string {
  const idx = name.lastIndexOf('.');
  return idx >= 0 ? name.slice(idx + 1).toLowerCase() : '';
}

function validateImageFile(file: File): string | null {
  const ext = fileExtension(file.name);
  const typeOk = ALLOWED_TYPES.has(file.type.toLowerCase());
  const extOk = ALLOWED_EXT.has(ext);
  if (!typeOk && !extOk) {
    return 'Use a JPG, PNG, or WebP photo. HEIC and other formats are not supported.';
  }
  if (file.size > 12 * 1024 * 1024) {
    return 'Photo is too large (max 12 MB). Choose a smaller image.';
  }
  return null;
}

function scrollMain(): HTMLElement | null {
  return document.querySelector('.church-mgmt-admin main');
}

/**
 * Hidden file inputs must NOT use label[htmlFor] / focus scroll.
 * Chrome scrolls the focused input into view and can shove the admin
 * layout into a blank white viewport. Open via input.click() instead,
 * with inputs fixed off-screen.
 */
const hiddenFileInputClass =
  'pointer-events-none fixed left-0 top-0 h-px w-px opacity-0';

export function MemberPhotoField({
  existingPhoto,
  value,
  onChange,
  disabled = false,
  className = '',
}: Props) {
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const pickGen = useRef(0);
  const savedScrollTop = useRef(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [fieldError, setFieldError] = useState('');

  useEffect(() => {
    if (!value.file) {
      setPreviewUrl(null);
      return;
    }
    let url: string;
    try {
      url = URL.createObjectURL(value.file);
    } catch {
      setPreviewUrl(null);
      setFieldError('Could not preview this photo. Try another JPG, PNG, or WebP file.');
      return;
    }
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value.file]);

  const serverUrl =
    !value.file && !value.clearExisting ? memberPhotoUrl(existingPhoto) : null;
  const displayUrl = previewUrl || serverUrl;

  const restoreScrollSoon = () => {
    const top = savedScrollTop.current;
    const apply = () => {
      const main = scrollMain();
      if (main) main.scrollTop = top;
      window.scrollTo(0, 0);
    };
    requestAnimationFrame(() => {
      apply();
      requestAnimationFrame(apply);
      setTimeout(apply, 50);
      setTimeout(apply, 200);
    });
  };

  const openPicker = (kind: 'gallery' | 'camera') => {
    if (disabled || preparing) return;
    setFieldError('');
    const main = scrollMain();
    savedScrollTop.current = main?.scrollTop ?? 0;
    filePickerOpenCount += 1;
    const input = kind === 'gallery' ? galleryRef.current : cameraRef.current;
    // Defer so React finishes the click handler before the OS dialog blocks.
    requestAnimationFrame(() => {
      try {
        input?.click();
      } finally {
        // Dialog may still be open; count is decremented on change/cancel via focus return.
        window.setTimeout(() => {
          filePickerOpenCount = Math.max(0, filePickerOpenCount - 1);
          restoreScrollSoon();
        }, 300);
      }
    });
  };

  const pickFile = async (file: File | undefined) => {
    filePickerOpenCount = Math.max(0, filePickerOpenCount - 1);
    restoreScrollSoon();
    if (!file) return;
    setFieldError('');
    const validationError = validateImageFile(file);
    if (validationError) {
      setFieldError(validationError);
      return;
    }

    const gen = ++pickGen.current;
    setPreparing(true);
    try {
      const prepared = await compressImageForUpload(file, PREPARE_OPTS);
      if (gen !== pickGen.current) return;
      onChange({ file: prepared, clearExisting: false });
      restoreScrollSoon();
    } catch (err) {
      if (gen !== pickGen.current) return;
      const message =
        err instanceof Error && err.message
          ? err.message
          : 'Could not read this photo. Try a different JPG, PNG, or WebP.';
      setFieldError(message);
      onChange({ file: null, clearExisting: false });
    } finally {
      if (gen === pickGen.current) setPreparing(false);
      restoreScrollSoon();
    }
  };

  const clear = () => {
    pickGen.current += 1;
    setPreparing(false);
    setFieldError('');
    if (galleryRef.current) galleryRef.current.value = '';
    if (cameraRef.current) cameraRef.current.value = '';
    onChange({
      file: null,
      clearExisting: !!existingPhoto,
    });
  };

  const busy = disabled || preparing;
  const btnClass = (extra = '') =>
    `inline-flex items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800 disabled:pointer-events-none disabled:opacity-50 ${extra}`;

  return (
    <div className={className}>
      <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Photo <span className="font-normal text-zinc-500">(optional)</span>
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800">
          {preparing ? (
            <Loader2 className="h-7 w-7 animate-spin text-zinc-400" aria-label="Preparing photo" />
          ) : displayUrl ? (
            <button
              type="button"
              className="h-full w-full cursor-zoom-in p-0"
              onClick={() => setLightboxOpen(true)}
              aria-label="View photo larger"
            >
              <img
                src={displayUrl}
                alt=""
                className="h-full w-full object-cover"
                onError={() => {
                  setFieldError('Photo preview failed. Try another JPG, PNG, or WebP.');
                  setPreviewUrl(null);
                }}
              />
            </button>
          ) : (
            <ImagePlus className="h-7 w-7 text-zinc-400" aria-hidden />
          )}
        </div>
        {lightboxOpen && displayUrl && (
          <MemberPhotoLightbox
            src={displayUrl}
            alt="Member photo"
            onClose={() => setLightboxOpen(false)}
          />
        )}
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              className={btnClass()}
              onClick={() => openPicker('gallery')}
            >
              <ImagePlus className="h-4 w-4" aria-hidden />
              Gallery
            </button>
            <button
              type="button"
              disabled={busy}
              className={btnClass()}
              onClick={() => openPicker('camera')}
            >
              <Camera className="h-4 w-4" aria-hidden />
              Camera
            </button>
            {displayUrl && !preparing && (
              <button type="button" disabled={busy} onClick={clear} className={btnClass('text-red-700 dark:text-red-400')}>
                <Trash2 className="h-4 w-4" aria-hidden />
                Remove
              </button>
            )}
          </div>
          <p className="text-xs text-zinc-500">
            JPG, PNG, or WebP only. Large photos are resized automatically.
          </p>
          {fieldError ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {fieldError}
            </p>
          ) : null}
        </div>
      </div>

      {/* Off-screen inputs — never focused via label (avoids blank scroll jump). */}
      <input
        ref={galleryRef}
        type="file"
        accept={ACCEPT}
        tabIndex={-1}
        aria-hidden
        className={hiddenFileInputClass}
        disabled={busy}
        onChange={(e) => {
          void pickFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      <input
        ref={cameraRef}
        type="file"
        accept={ACCEPT}
        capture="environment"
        tabIndex={-1}
        aria-hidden
        className={hiddenFileInputClass}
        disabled={busy}
        onChange={(e) => {
          void pickFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
}
