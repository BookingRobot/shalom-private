/**
 * More pictures for a note: only images (a file, a paste with Ctrl+V or a drop). Each is made
 * smaller in the browser (longest side up to 1600 px, WebP) so the whole note stays small.
 */
export const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
export const MAX_PICTURES = 5; // the marked-spot screenshot included
export const MAX_FILE = 15 * 1024 * 1024; // what we accept before making it smaller
const MAX_SIDE = 1600;
const TARGET = 700 * 1024;
export const MAX_TOTAL = 4.5 * 1024 * 1024;

export const isImage = (f: Blob) => IMAGE_TYPES.includes(f.type);

function encode(c: HTMLCanvasElement, q: number): Promise<Blob | null> {
  return new Promise((resolve) => c.toBlob((b) => resolve(b), 'image/webp', q));
}

/** The picture ready to send, or null when it is not an image the browser can read. */
export async function prepareImage(file: Blob): Promise<Blob | null> {
  if (!isImage(file) || file.size > MAX_FILE) return null;
  try {
    const bmp = await createImageBitmap(file);
    let scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
    let q = 0.85;
    for (let i = 0; i < 5; i++) {
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(bmp.width * scale));
      c.height = Math.max(1, Math.round(bmp.height * scale));
      c.getContext('2d')?.drawImage(bmp, 0, 0, c.width, c.height);
      const out = await encode(c, q);
      if (out && out.type === 'image/webp' && out.size <= TARGET) return out;
      // a small original that the browser cannot make WebP of goes as it is
      if (!out || out.type !== 'image/webp') return file.size <= TARGET ? file : null;
      scale *= 0.8;
      q = Math.max(0.6, q - 0.08);
    }
    return null;
  } catch {
    return null;
  }
}
