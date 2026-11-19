"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { useLocalStorage } from "@/lib/use-local-storage";
import { moderationQueue as initialQueue } from "@/lib/data";
import { CheckCircle2, XCircle, ShieldAlert, AlertTriangle } from "lucide-react";

export default function ModerationPage() {
  const toast = useToast();
  // Decisions are remembered so reviewed posts don't reappear on reload.
  const [decisions, writeDecisions] = useLocalStorage<Record<string, "approved" | "rejected">>("jobportal_moderation");
  const queue = initialQueue.filter((m) => !decisions?.[m.id]);

  function resolve(m: (typeof initialQueue)[number], decision: "approved" | "rejected") {
    writeDecisions({ ...(decisions ?? {}), [m.id]: decision });
    toast(
      decision === "approved" ? `"${m.title}" approved and sent live.` : `"${m.title}" rejected — the employer will be notified.`,
      decision === "approved" ? "success" : "info"
    );
  }

  return (
    <div>
      <PageHeader
        title="Job posting moderation"
        subtitle="Every job post is checked for spam and scams before it goes live."
      />

      <div className="rounded-2xl border border-brand-100 bg-brand-50 px-5 py-4 flex items-center gap-3 mb-6">
        <ShieldAlert size={20} className="text-brand-600 shrink-0" />
        <p className="text-sm text-brand-700">
          The fraud-detection engine auto-flags unrealistic salaries, upfront-payment requests, and domain mismatches — routed here for human review.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {queue.map((m) => (
          <div key={m.id} className="rounded-2xl border border-border bg-surface p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-bad-100 text-bad-500 grid place-items-center shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-ink">{m.title}</p>
                <Badge tone={m.risk === "High" ? "bad" : m.risk === "Medium" ? "warn" : "neutral"}>{m.risk} risk</Badge>
              </div>
              <p className="text-sm text-muted mt-1">{m.company} · Flag reason: {m.flag}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => resolve(m, "approved")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-good-500/30 bg-good-100 text-good-500 px-3.5 py-2 text-sm font-semibold"
              >
                <CheckCircle2 size={15} /> Approve
              </button>
              <button
                onClick={() => resolve(m, "rejected")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-bad-500/30 bg-bad-100 text-bad-500 px-3.5 py-2 text-sm font-semibold"
              >
                <XCircle size={15} /> Reject
              </button>
            </div>
          </div>
        ))}
        {queue.length === 0 && (
          <div className="text-center py-16 text-muted text-sm rounded-2xl border border-dashed border-border">
            Queue clear — no postings awaiting review.
          </div>
        )}
      </div>
    </div>
  );
}
