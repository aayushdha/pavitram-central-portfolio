"use client";

import { useState } from "react";
import { UploadCloud, FileCheck2, X } from "lucide-react";

export function FileDropzone({
  label,
  hint,
  multiple = false,
}: {
  label: string;
  hint?: string;
  multiple?: boolean;
}) {
  const [files, setFiles] = useState<string[]>([]);

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const names = Array.from(fileList).map((f) => f.name);
    setFiles((prev) => (multiple ? [...prev, ...names] : names.slice(0, 1)));
  }

  return (
    <div>
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-300 bg-stone-50/60 px-6 py-8 text-center transition-colors hover:border-brass-400 hover:bg-brass-50/40">
        <UploadCloud size={22} className="text-text-400" />
        <span className="text-sm font-medium text-ink-900">{label}</span>
        {hint && <span className="text-xs text-text-400">{hint}</span>}
        <input
          type="file"
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>

      {files.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {files.map((name, i) => (
            <li
              key={`${name}-${i}`}
              className="flex items-center justify-between gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs text-text-700"
            >
              <span className="flex min-w-0 items-center gap-2">
                <FileCheck2 size={13} className="shrink-0 text-brass-600" />
                <span className="truncate">{name}</span>
              </span>
              <button
                type="button"
                onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                className="shrink-0 text-text-400 hover:text-danger-600"
              >
                <X size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
