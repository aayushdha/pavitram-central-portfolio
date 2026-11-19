"use client";

import { useState } from "react";
import { Modal, inputCls, labelCls } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useSavedJobs, useAppliedJobs } from "@/lib/seeker-jobs";
import { seekerProfile } from "@/lib/data";
import { Send, CheckCircle2, Bookmark, BookmarkPlus } from "lucide-react";

export function JobApplyButton({ job }: { job: { id: string; title: string; company: string } }) {
  const toast = useToast();
  const { isSaved, toggle } = useSavedJobs();
  const { hasApplied, apply } = useAppliedJobs();
  const [open, setOpen] = useState(false);
  const [resume, setResume] = useState(seekerProfile.resumeVersions[0]);
  const [note, setNote] = useState("");

  const saved = isSaved(job.id);

  if (hasApplied(job.id)) {
    return (
      <div className="inline-flex items-center gap-2 rounded-xl bg-good-100 text-good-500 font-semibold px-5 py-3 text-sm">
        <CheckCircle2 size={16} /> Application submitted
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setOpen(true)}
          className="rounded-xl bg-brand-500 hover:bg-brand-600 text-ink-900 font-semibold px-6 py-3 text-sm"
        >
          Easy Apply
        </button>
        <button
          onClick={() => {
            toggle(job.id);
            toast(saved ? `Removed "${job.title}" from saved jobs.` : `Saved "${job.title}".`, saved ? "info" : "success");
          }}
          aria-pressed={saved}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-ink hover:border-brand-400"
        >
          {saved ? <Bookmark size={16} className="fill-brand-500 text-brand-500" /> : <BookmarkPlus size={16} />}
          {saved ? "Saved" : "Save"}
        </button>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Apply"
        footer={
          <button
            onClick={() => {
              apply({ jobId: job.id, title: job.title, company: job.company, resume, note: note.trim() });
              toast(`Application sent to ${job.company}.`);
              setOpen(false);
            }}
            className="w-full rounded-xl bg-brand-500 hover:bg-brand-600 text-ink-900 font-semibold py-2.5 text-sm flex items-center justify-center gap-2"
          >
            <Send size={15} /> Submit application
          </button>
        }
      >
        <p className="text-sm text-muted mb-5 -mt-1">{job.title} · {job.company}</p>

        <label className={labelCls}>Choose a resume</label>
        <select value={resume} onChange={(e) => setResume(e.target.value)} className={`${inputCls} mb-4`}>
          {seekerProfile.resumeVersions.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>

        <label className={labelCls}>
          Note to recruiter <span className="normal-case text-muted/70">(optional)</span>
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="Say why you're a good fit for this role..."
          className={`${inputCls} resize-none`}
        />
      </Modal>
    </>
  );
}
