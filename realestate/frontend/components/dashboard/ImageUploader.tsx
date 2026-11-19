"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X, AlertCircle } from "lucide-react";
import { uploadImage } from "@/lib/api/storage";

export function ImageUploader({
  images,
  onChange,
  max = 10,
}: {
  images: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);
    const files = Array.from(fileList).slice(0, Math.max(0, max - images.length));
    if (files.length === 0) {
      setError(`You can add up to ${max} photos.`);
      return;
    }

    setUploading(true);
    const uploaded: string[] = [];
    try {
      for (const file of files) {
        if (file.size > 8 * 1024 * 1024) {
          setError(`"${file.name}" is larger than 8MB and was skipped.`);
          continue;
        }
        const res = await uploadImage(file);
        uploaded.push(res.url);
      }
      if (uploaded.length) onChange([...images, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload one or more photos. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((url, i) => (
          <div key={url + i} className="group relative aspect-square overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remove photo"
            >
              <X size={13} />
            </button>
          </div>
        ))}

        {images.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-stone-300 text-text-400 hover:border-brass-400 hover:text-brass-600 disabled:opacity-60"
          >
            {uploading ? <Loader2 size={20} className="animate-spin" /> : <ImagePlus size={20} />}
            <span className="text-[11px] font-medium">{uploading ? "Uploading…" : "Add photo"}</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-danger-50 p-2.5 text-xs text-danger-700">
          <AlertCircle size={13} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}
      <p className="mt-2 text-xs text-text-400">JPEG, PNG, WebP or AVIF, up to 8MB each — {images.length}/{max} added.</p>
    </div>
  );
}
