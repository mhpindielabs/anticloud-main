// This file contains logic to manipulate images on the client-side using Canvas.
// The core logic is a TypeScript/JavaScript translation of the provided Python example.

// Original hue shifts for the first page of variants
const ORIGINAL_HUE_SHIFTS = [
  +22.5,
  +67.5,
  +112.5,
  +157.5,
  -157.5,
  -112.5,
  -67.5,
];

// New hue shifts for the second page of variants
const NEW_HUE_SHIFTS = [
  +45.0,
  +90.0,
  +135.0,
  +180.0,
  -135.0,
  -90.0,
  -45.0,
  -22.5,
];

/**
 * Converts an RGB color value to HSV.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and v in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSV representation
 */
function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255, g /= 255, b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, v = max;

  const d = max - min;
  s = max == 0 ? 0 : d / max;

  if (max != min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, v];
}

/**
 * Converts an HSV color value to RGB.
 * Assumes h, s, and v are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  v       The value
 * @return  Array           The RGB representation
 */
function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  let r = 0, g = 0, b = 0;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }
  return [r * 255, g * 255, b * 255];
}

async function applyFilter(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    originalImage: HTMLImageElement,
    filter: (r: number, g: number, b: number, a: number) => [number, number, number, number]
): Promise<string> {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImage, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const [r, g, b, a] = filter(data[i], data[i + 1], data[i + 2], data[i + 3]);
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
        data[i + 3] = a;
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
}


export const generateImageVariants = (base64Image: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (!ctx) {
        return reject(new Error("Could not get canvas context"));
      }
      
      const variants: string[] = [];
      
      const createHueShiftFilter = (shift: number) => (r: number, g: number, b: number, a: number): [number, number, number, number] => {
          if (a === 0) return [r, g, b, a];
          let [h, s, v] = rgbToHsv(r, g, b);
          h += shift / 360.0;
          if (h < 0) h += 1;
          if (h > 1) h -= 1;
          const [newR, newG, newB] = hsvToRgb(h, s, v);
          return [newR, newG, newB, a];
      };

      // Page 1 Variants (Original 8)
      // Generate Original Hue Shifted Variants
      for (const shift of ORIGINAL_HUE_SHIFTS) {
        const variantUrl = await applyFilter(canvas, ctx, img, createHueShiftFilter(shift));
        variants.push(variantUrl);
      }

      // Generate Grayscale Variant
      const grayscaleFilter = (r: number, g: number, b: number, a: number): [number, number, number, number] => {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        return [gray, gray, gray, a];
      };
      const grayscaleUrl = await applyFilter(canvas, ctx, img, grayscaleFilter);
      variants.push(grayscaleUrl);

      // Page 2 Variants (New 9)
      // Generate New Hue Shifted Variants
      for (const shift of NEW_HUE_SHIFTS) {
        const variantUrl = await applyFilter(canvas, ctx, img, createHueShiftFilter(shift));
        variants.push(variantUrl);
      }

      // Generate Sepia Variant
      const sepiaFilter = (r: number, g: number, b: number, a: number): [number, number, number, number] => {
        const tr = 0.393 * r + 0.769 * g + 0.189 * b;
        const tg = 0.349 * r + 0.686 * g + 0.168 * b;
        const tb = 0.272 * r + 0.534 * g + 0.131 * b;
        return [Math.min(255, tr), Math.min(255, tg), Math.min(255, tb), a];
      };
      const sepiaUrl = await applyFilter(canvas, ctx, img, sepiaFilter);
      variants.push(sepiaUrl);

      resolve(variants);
    };
    img.onerror = () => {
      reject(new Error("Failed to load image for processing."));
    };
    img.src = base64Image;
  });
};

export const urlToBase64 = async (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }
            ctx.drawImage(img, 0, 0);
            try {
                resolve(canvas.toDataURL('image/png'));
            } catch (e) {
                reject(new Error(`Canvas toDataURL failed: ${e}`));
            }
        };
        img.onerror = () => {
            reject(new Error(`Failed to load image from URL: ${url}`));
        };
        // Add cache buster only for non-relative URLs
        const fetchUrl = url.startsWith('/') ? url : `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`;
        img.src = fetchUrl;
    });
};
