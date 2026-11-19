/**
 * Reads an image file and returns a small data URL (resized) suitable for
 * keeping in localStorage. SVGs are passed through as-is.
 */
export function imageToDataUrl(
  file: File,
  opts: { maxDim: number; mime?: "image/jpeg" | "image/png"; quality?: number; minDim?: number }
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.onload = () => {
      const src = String(reader.result);
      if (file.type === "image/svg+xml") {
        if (src.length > 300_000) return reject(new Error("SVG is too large (max ~200 KB)."));
        return resolve(src);
      }
      const img = new Image();
      img.onerror = () => reject(new Error("That doesn't look like a valid image."));
      img.onload = () => {
        const { width, height } = img;
        if (opts.minDim && (width < opts.minDim || height < opts.minDim)) {
          return reject(new Error(`Image must be at least ${opts.minDim}×${opts.minDim}px.`));
        }
        const scale = Math.min(1, opts.maxDim / Math.max(width, height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Your browser can't process images."));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL(opts.mime ?? "image/jpeg", opts.quality ?? 0.8));
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}
