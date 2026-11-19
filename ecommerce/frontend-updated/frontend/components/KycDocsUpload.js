"use client";

import { useRef, useState } from "react";
import { UploadCloud, X, FileText, Loader2, Check } from "lucide-react";
import api from "@/lib/api";

const isImage = (url) => /\.(png|jpe?g|gif|webp|svg)$/i.test(url || "");

function DocSlot({ label, required, url, folder, onUploaded, onRemove }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file) => {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const uploaded = await api.uploads.uploadOne(file, folder);
      onUploaded(uploaded.url);
    } catch (e) {
      setError("Upload failed — our file storage is having an issue right now. Please try again in a moment.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="rounded-xl border border-dashed p-3" style={{ borderColor: url ? "var(--color-jade)" : "var(--color-line)" }}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-ink">
          {label}
          {required && <span style={{ color: "var(--color-rose)" }}> *</span>}
        </span>
        {url && (
          <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: "var(--color-jade)" }}>
            <Check size={12} /> Uploaded
          </span>
        )}
      </div>

      {url ? (
        <div className="mt-2 flex items-center gap-2">
          <a href={url} target="_blank" rel="noreferrer" className="block h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-line">
            {isImage(url) ? (
              <img src={url} alt={label} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-paper-raised">
                <FileText size={16} style={{ color: "var(--color-ink-muted)" }} />
              </div>
            )}
          </a>
          <div className="flex flex-col gap-1">
            <a href={url} target="_blank" rel="noreferrer" className="text-xs font-semibold hover:underline" style={{ color: "var(--color-jade)" }}>
              View file
            </a>
            <button type="button" onClick={onRemove} className="flex items-center gap-1 text-xs text-ink-muted hover:text-ink">
              <X size={12} /> Replace
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className="mt-2 flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-xs text-ink-muted hover:text-ink"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
          {uploading ? "Uploading…" : "Click or drag file to upload"}
          <input
            ref={inputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
      )}
      {error && <p className="mt-1 text-[11px]" style={{ color: "var(--color-rose)" }}>{error}</p>}
    </div>
  );
}

/**
 * docTypes: [{ key: "gst", label: "GST Certificate", required: true }, ...]
 * value: { gst: "https://...", signature: "https://..." }
 * onChange(nextValue)
 */
export default function KycDocsUpload({ docTypes, value = {}, onChange, folder = "kyc" }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {docTypes.map((d) => (
        <DocSlot
          key={d.key}
          label={d.label}
          required={d.required}
          url={value[d.key]}
          folder={folder}
          onUploaded={(url) => onChange({ ...value, [d.key]: url })}
          onRemove={() => {
            const next = { ...value };
            delete next[d.key];
            onChange(next);
          }}
        />
      ))}
    </div>
  );
}
