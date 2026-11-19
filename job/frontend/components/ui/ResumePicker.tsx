"use client";

import Link from "next/link";
import { inputCls, labelCls } from "@/components/ui/Modal";
import type { ResumeVersion } from "@/lib/resume-versions";

/** Dropdown of the person's real resumes, or a nudge to create one. */
export function ResumePicker({
  versions,
  value,
  onChange,
}: {
  versions: ResumeVersion[];
  value: string;
  onChange: (id: string) => void;
}) {
  if (versions.length === 0) {
    return (
      <div className="mb-4">
        <label className={labelCls}>Resume</label>
        <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted">
          You don&apos;t have a resume yet.{" "}
          <Link href="/seeker/resume-builder" className="text-brand-600 font-semibold">
            Build one
          </Link>{" "}
          or{" "}
          <Link href="/seeker/profile" className="text-brand-600 font-semibold">
            upload a file
          </Link>
          , then come back to apply.
        </div>
      </div>
    );
  }
  const current = versions.some((v) => v.id === value) ? value : versions[0].id;
  return (
    <div className="mb-4">
      <label className={labelCls}>Choose a resume</label>
      <select value={current} onChange={(e) => onChange(e.target.value)} className={inputCls}>
        {versions.map((v) => (
          <option key={v.id} value={v.id}>
            {v.name}
          </option>
        ))}
      </select>
    </div>
  );
}
