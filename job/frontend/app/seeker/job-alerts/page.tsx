"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useToast } from "@/components/ui/Toast";
import { useLocalStorage } from "@/lib/use-local-storage";
import { jobAlerts as initialAlerts } from "@/lib/data";
import { Bell, Trash2, Plus, X } from "lucide-react";

export default function JobAlertsPage() {
  const toast = useToast();
  const [stored, write] = useLocalStorage<(typeof initialAlerts)[number][]>("jobportal_job_alerts");
  const alerts = stored ?? initialAlerts;
  const [showNew, setShowNew] = useState(false);

  function toggle(id: string) {
    const target = alerts.find((x) => x.id === id);
    write(alerts.map((x) => (x.id === id ? { ...x, active: !x.active } : x)));
    if (target) toast(target.active ? "Alert paused." : "Alert turned on.", "info");
  }
  function remove(id: string) {
    write(alerts.filter((x) => x.id !== id));
    toast("Alert deleted.", "info");
  }
  function add(query: string, location: string, frequency: string) {
    write([{ id: `al${Date.now()}`, query, location, frequency, matches: 0, active: true }, ...alerts]);
    setShowNew(false);
    toast(`Alert created for "${query}".`);
  }

  return (
    <div>
      <PageHeader
        title="Job alerts"
        subtitle="Get told when new jobs match your search."
        actions={
          <button onClick={() => setShowNew(true)} className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-ink-900 px-4 py-2.5 text-sm font-semibold">
            <Plus size={16} /> New alert
          </button>
        }
      />

      <div className="flex flex-col gap-3">
        {alerts.map((a) => (
          <div key={a.id} className="rounded-2xl border border-border bg-surface p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 grid place-items-center shrink-0">
              <Bell size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-ink">{a.query}</p>
              <p className="text-xs text-muted mt-0.5">{a.location} · {a.frequency} · {a.matches} new matches</p>
            </div>
            <button
              onClick={() => toggle(a.id)}
              role="switch"
              aria-checked={a.active}
              aria-label={`Alert for ${a.query}`}
              className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${a.active ? "bg-brand-500" : "bg-border"}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${a.active ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
            <button onClick={() => remove(a.id)} aria-label={`Delete alert for ${a.query}`} className="text-muted hover:text-bad-500 shrink-0">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {alerts.length === 0 && (
          <div className="text-center py-16 text-muted text-sm rounded-2xl border border-dashed border-border">
            No alerts yet. Create one to get notified about new jobs.
          </div>
        )}
      </div>

      {showNew && <NewAlertModal onClose={() => setShowNew(false)} onCreate={add} />}
    </div>
  );
}

function NewAlertModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (query: string, location: string, frequency: string) => void;
}) {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [frequency, setFrequency] = useState("Daily");

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface rounded-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-bold">New job alert</h2>
          <button onClick={onClose} className="text-muted hover:text-ink"><X size={20} /></button>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Job title or skill</label>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. Product Designer" className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Location</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Bengaluru or Remote" className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">How often</label>
            <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none">
              <option>Instant</option>
              <option>Daily</option>
              <option>Weekly</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => {
            if (!query.trim()) return toast("Enter a job title or skill for this alert.", "error");
            onCreate(query.trim(), location.trim() || "Any", frequency);
          }}
          className="w-full rounded-xl bg-brand-500 hover:bg-brand-600 text-ink-900 font-semibold py-2.5 text-sm mt-5"
        >
          Create alert
        </button>
      </div>
    </div>
  );
}
