"use client";

import { useRef, useState } from "react";
import { UploadCloud, X, FileText, Loader2 } from "lucide-react";
import api from "@/lib/api";

const isImage = (mimeType, url) =>
  (mimeType && mimeType.startsWith("image/")) || /\.(png|jpe?g|gif|webp|svg)$/i.test(url || "");

/**
 * Real file upload widget backed by the Nest /uploads endpoint (MinIO/S3).
 *
 * value:  array of { id, url, name, mimeType } already uploaded
 * onChange(nextValue): called any time the list changes (after an upload
 *   finishes, or a file is removed)
 * multiple: allow more than one file
 * folder: which folder/prefix to store the file under (e.g. "vendor-kyc")
 * accept: input accept attribute
 */
export default function FileUpload({
  value = [],
  onChange,
  multiple = false,
  folder = "uploads",
  accept = "image/*,application/pdf",
  label,
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    setError("");
    setUploading(true);
    try {
      if (multiple && files.length > 1) {
        const uploaded = await api.uploads.uploadMany(files, folder);
        onChange(multiple ? [...value, ...uploaded] : uploaded);
      } else {
        const uploaded = await api.uploads.uploadOne(files[0], folder);
        onChange(multiple ? [...value, uploaded] : [uploaded]);
      }
    } catch (e) {
      setError("Upload failed — our file storage is having an issue right now. Please try again in a moment.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = (id) => onChange(value.filter((f) => f.id !== id));

  return (
    <div>
      {label && <span className="text-xs font-medium text-ink-muted">{label}</span>}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className="mt-1 flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed px-4 py-6 text-center transition-colors hover:border-[var(--color-jade)]"
        style={{ borderColor: "var(--color-line)" }}
      >
        {uploading ? (
          <Loader2 size={18} className="animate-spin" style={{ color: "var(--color-jade)" }} />
        ) : (
          <UploadCloud size={18} style={{ color: "var(--color-jade)" }} />
        )}
        <span className="text-xs font-medium text-ink">
          {uploading ? "Uploading…" : "Click to upload, or drag & drop"}
        </span>
        <span className="text-[11px] text-ink-muted">Images or PDF, up to 10MB each</span>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <p className="mt-1.5 text-xs" style={{ color: "var(--color-rose)" }}>
          {error}
        </p>
      )}

      {value.length > 0 && (
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {value.map((f) => (
            <div key={f.id || f.url} className="group relative overflow-hidden rounded-lg border border-line bg-paper-raised">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(f.id);
                }}
                className="absolute right-1 top-1 z-10 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove file"
              >
                <X size={11} />
              </button>
              {isImage(f.mimeType, f.url) ? (
                <img src={f.url} alt="" className="h-20 w-full object-cover" />
              ) : (
                <div className="flex h-20 w-full flex-col items-center justify-center gap-1 px-1">
                  <FileText size={18} style={{ color: "var(--color-ink-muted)" }} />
                  <span className="line-clamp-1 text-[9px] text-ink-muted">{f.key?.split("/").pop() || "file"}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
