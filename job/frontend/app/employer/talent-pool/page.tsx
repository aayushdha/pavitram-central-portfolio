"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { MatchRing } from "@/components/ui/MatchRing";
import { ConfirmModal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useLocalStorage } from "@/lib/use-local-storage";
import { talentPool as initialPool } from "@/lib/data";
import { MapPin, Briefcase, Trash2, MessageSquare } from "lucide-react";

const POOL_KEY = "jobportal_employer_talent_pool";

type Pooled = (typeof initialPool)[number];

export default function TalentPoolPage() {
  const toast = useToast();
  const [stored, write] = useLocalStorage<Pooled[]>(POOL_KEY);
  const pool: Pooled[] = stored ?? initialPool;
  const [removing, setRemoving] = useState<Pooled | null>(null);

  function remove(c: Pooled) {
    write(pool.filter((p) => p.id !== c.id));
    toast(`${c.name} removed from your talent pool.`, "info");
    setRemoving(null);
  }

  return (
    <div>
      <PageHeader title="Talent pool" subtitle="Candidates you've saved for roles that open up later." />

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {pool.map((c) => (
          <div key={c.id} className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-11 w-11 rounded-full bg-brand-50 text-brand-700 grid place-items-center text-sm font-semibold shrink-0">
                  {c.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{c.name}</p>
                  <p className="text-xs text-muted truncate">{c.role}</p>
                </div>
              </div>
              <MatchRing value={c.score} size={36} />
            </div>
            <div className="flex items-center gap-3 text-xs text-muted mb-2">
              <span className="flex items-center gap-1"><Briefcase size={11} /> {c.experience}</span>
              <span className="flex items-center gap-1"><MapPin size={11} /> {c.location}</span>
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {c.skills.map((s) => (
                <Badge key={s} tone="neutral">{s}</Badge>
              ))}
            </div>
            <Badge tone="brand">{c.tag}</Badge>
            <p className="text-[11px] text-muted mt-3 mb-3">Saved on {c.savedOn}</p>
            <div className="flex gap-2">
              <Link
                href={`/employer/messages?to=${c.id}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-ink-900 text-sm font-semibold py-2"
              >
                <MessageSquare size={14} /> Message
              </Link>
              <button
                onClick={() => setRemoving(c)}
                aria-label={`Remove ${c.name}`}
                className="rounded-xl border border-border px-3 text-muted hover:text-bad-500 hover:border-bad-300"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
        {pool.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted text-sm rounded-2xl border border-dashed border-border">
            No saved candidates yet.
          </div>
        )}
      </div>

      <ConfirmModal
        open={removing !== null}
        onClose={() => setRemoving(null)}
        onConfirm={() => removing && remove(removing)}
        title="Remove from talent pool?"
        message={`${removing?.name ?? "This candidate"} will no longer be saved for future roles.`}
        confirmLabel="Remove"
        danger
      />
    </div>
  );
}
