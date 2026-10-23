type CompressOptions = {
  maxBytes: number;
  maxDimension: number;
  quality?: number;
};

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to read image'));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Image compression failed'));
      resolve(blob);
    }, type, quality);
  });
}

function renameWithExtension(name: string, ext: string): string {
  const idx = name.lastIndexOf('.');
  const base = idx > 0 ? name.slice(0, idx) : name;
  return `${base}.${ext}`;
}

async function compressWithCanvas(
  img: HTMLImageElement,
  originalName: string,
  outType: string,
  opts: CompressOptions,
): Promise<File> {
  const startQuality = opts.quality ?? 0.86;
  let scale = Math.min(1, opts.maxDimension / Math.max(img.width, img.height));
  let bestBlob: Blob | null = null;
  let bestSize = Number.POSITIVE_INFINITY;

  for (let attempt = 0; attempt < 6; attempt++) {
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');
    ctx.drawImage(img, 0, 0, width, height);

    const qualitySteps = outType === 'image/png' ? [undefined] : [startQuality, 0.78, 0.7, 0.62, 0.55];
    for (const q of qualitySteps) {
      const blob = await canvasToBlob(canvas, outType, q);
      if (blob.size < bestSize) {
        bestSize = blob.size;
        bestBlob = blob;
      }
      if (blob.size <= opts.maxBytes) {
        bestBlob = blob;
        bestSize = blob.size;
        break;
      }
    }
    if (bestSize <= opts.maxBytes) break;
    scale *= 0.82;
  }

  if (!bestBlob) throw new Error('Unable to compress image');
  const ext = outType === 'image/webp' ? 'webp' : outType === 'image/png' ? 'png' : 'jpg';
  const outName = renameWithExtension(originalName, ext);
  return new File([bestBlob], outName, { type: outType, lastModified: Date.now() });
}

function normalizeImageType(file: File): string {
  const type = (file.type || '').toLowerCase();
  if (type === 'image/jpg' || type === 'image/jpeg') return 'image/jpeg';
  if (type === 'image/png' || type === 'image/webp') return type;
  const name = file.name.toLowerCase();
  if (name.endsWith('.png')) return 'image/png';
  if (name.endsWith('.webp')) return 'image/webp';
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg';
  return type;
}

export async function compressImageForUpload(file: File, opts: CompressOptions): Promise<File> {
  const type = normalizeImageType(file);
  if (!type.startsWith('image/')) {
    throw new Error('Not an image file. Use JPG, PNG, or WebP.');
  }
  // HEIC / BMP / GIF etc. often decode poorly or are rejected by PHP.
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(type)) {
    throw new Error('Use a JPG, PNG, or WebP photo. This format is not supported.');
  }
  if (file.size <= opts.maxBytes) return file;

  const img = await loadImage(file);
  const isPng = type === 'image/png';
  // PNG photos are often huge; convert to JPEG to fit strict PHP upload limits.
  const targetType = isPng ? 'image/jpeg' : type === 'image/webp' ? 'image/webp' : 'image/jpeg';
  const compressed = await compressWithCanvas(img, file.name, targetType, opts);
  return compressed.size < file.size ? compressed : file;
}

export async function compressImagesForUpload(files: File[], opts: CompressOptions): Promise<File[]> {
  const out: File[] = [];
  for (const file of files) {
    out.push(await compressImageForUpload(file, opts));
  }
  return out;
}

