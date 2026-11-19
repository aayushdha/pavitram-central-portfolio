"use client";

import { useState, useSyncExternalStore } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { MatchRing } from "@/components/ui/MatchRing";
import { Modal, inputCls, labelCls } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useLocalStorage } from "@/lib/use-local-storage";
import { candidates as initialCandidates, Candidate, pipelineStages, PipelineStage } from "@/lib/data";
import { Search, SlidersHorizontal, MapPin, Briefcase, CalendarClock, Video, Users } from "lucide-react";

const CANDIDATES_KEY = "jobportal_employer_candidates";

type Item = Candidate & { interview?: string };

const columnTone: Record<PipelineStage, string> = {
  Applied: "bg-[#F0F1F6]",
  Shortlisted: "bg-warn-100",
  Assessment: "bg-brand-50",
  Interview: "bg-[#E8E5FF]",
  Offer: "bg-good-100",
  Hired: "bg-good-100",
  Rejected: "bg-bad-100",
};

const interviewers = [
  "Rhea Sen — Engineering Manager",
  "Kabir Anand — Talent Partner",
  "Meera Iyer — Hiring Manager",
];

const earlyStages: PipelineStage[] = ["Applied", "Shortlisted", "Assessment"];

type Filters = { minScore: number; location: string; notice: string; job: string };
const noFilters: Filters = { minScore: 0, location: "", notice: "", job: "" };

function noticeDays(n: string) {
  if (/immediate/i.test(n)) return 0;
  const m = n.match(/\d+/);
  return m ? Number(m[0]) : 999;
}

export default function CandidatesPage() {
  const toast = useToast();
  const [stored, write] = useLocalStorage<Item[]>(CANDIDATES_KEY);
  const items: Item[] = stored ?? initialCandidates;
  const [dragId, setDragId] = useState<string | null>(null);

  // Header search sends users here with ?q=... — use it until they type something else.
  const [typedQuery, setTypedQuery] = useState<string | null>(null);
  const urlQuery = useSyncExternalStore(
    () => () => {},
    () => new URLSearchParams(window.location.search).get("q") ?? "",
    () => ""
  );
  const query = typedQuery ?? urlQuery;

  const [scheduleFor, setScheduleFor] = useState<Item | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(noFilters);

  function save(next: Item[]) {
    if (!write(next)) toast("Saved for this session only — browser storage is unavailable.", "info");
  }

  function moveCandidate(id: string, stage: PipelineStage) {
    const c = items.find((x) => x.id === id);
    if (!c || c.stage === stage) return;
    save(items.map((x) => (x.id === id ? { ...x, stage } : x)));
    toast(`${c.name} moved to ${stage}.`);
  }

  const activeFilterCount =
    (filters.minScore > 0 ? 1 : 0) + (filters.location ? 1 : 0) + (filters.notice ? 1 : 0) + (filters.job ? 1 : 0);

  const q = query.trim().toLowerCase();
  const filtered = items.filter((c) => {
    if (
      q &&
      !(
        c.name.toLowerCase().includes(q) ||
        c.appliedFor.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.skills.some((s) => s.toLowerCase().includes(q))
      )
    ) {
      return false;
    }
    if (c.score < filters.minScore) return false;
    if (filters.location && c.location !== filters.location) return false;
    if (filters.job && c.appliedFor !== filters.job) return false;
    if (filters.notice && noticeDays(c.notice) > Number(filters.notice)) return false;
    return true;
  });

  const locations = [...new Set(items.map((c) => c.location))].sort();
  const jobsList = [...new Set(items.map((c) => c.appliedFor))].sort();

  return (
    <div>
      <PageHeader
        title="Candidates & ATS pipeline"
        subtitle="Drag candidates between stages, or search the resume list directly."
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2.5 flex-1">
          <Search size={16} className="text-muted" />
          <input
            value={query}
            onChange={(e) => setTypedQuery(e.target.value)}
            placeholder="Search by name, skill, role or location..."
            className="flex-1 outline-none text-sm bg-transparent"
          />
        </div>
        <button
          onClick={() => setFiltersOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-ink hover:border-brand-400"
        >
          <SlidersHorizontal size={16} /> Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 h-5 min-w-5 px-1 rounded-full bg-brand-500 text-ink-900 text-[11px] font-bold grid place-items-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {(q || activeFilterCount > 0) && (
        <div className="flex items-center gap-3 mb-4 text-sm text-muted">
          <span className="flex items-center gap-1.5">
            <Users size={14} /> {filtered.length} of {items.length} candidates
          </span>
          <button
            onClick={() => {
              setTypedQuery("");
              setFilters(noFilters);
            }}
            className="font-semibold text-brand-600"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {pipelineStages.map((stage) => {
          const stageItems = filtered.filter((c) => c.stage === stage);
          return (
            <div
              key={stage}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragId) moveCandidate(dragId, stage);
                setDragId(null);
              }}
              className="w-72 shrink-0 flex flex-col"
            >
              <div className={`rounded-xl px-3 py-2 mb-3 flex items-center justify-between ${columnTone[stage]}`}>
                <span className="text-sm font-semibold text-ink">{stage}</span>
                <span className="text-xs font-semibold text-ink/60 bg-white/60 rounded-full px-2 py-0.5">
                  {stageItems.length}
                </span>
              </div>
              <div className="flex flex-col gap-3 min-h-[200px]">
                {stageItems.map((c) => (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={() => setDragId(c.id)}
                    onDragEnd={() => setDragId(null)}
                    className="rounded-xl border border-border bg-surface p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-9 w-9 rounded-full bg-brand-50 text-brand-700 grid place-items-center text-xs font-semibold shrink-0">
                          {c.initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-ink truncate">{c.name}</p>
                          <p className="text-[11px] text-muted truncate">{c.appliedFor}</p>
                        </div>
                      </div>
                      <MatchRing value={c.score} size={34} />
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-muted mb-2">
                      <span className="flex items-center gap-1"><Briefcase size={11} /> {c.experience}</span>
                      <span className="flex items-center gap-1"><MapPin size={11} /> {c.location}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {c.skills.map((s) => (
                        <Badge key={s} tone="neutral" className="!px-2 !py-0.5 !text-[10px]">{s}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border text-[11px] text-muted">
                      <span>{c.ctc} CTC</span>
                      <span>Notice: {c.notice}</span>
                    </div>
                    {c.interview && (
                      <p className="mt-2 text-[11px] font-medium text-brand-700 bg-brand-50 rounded-lg px-2 py-1.5 flex items-center gap-1.5">
                        <CalendarClock size={11} className="shrink-0" /> {c.interview}
                      </p>
                    )}
                    <select
                      value={c.stage}
                      onChange={(e) => moveCandidate(c.id, e.target.value as PipelineStage)}
                      aria-label={`Move ${c.name} to stage`}
                      className="w-full mt-2.5 rounded-lg border border-border bg-background text-xs text-muted py-1.5 px-2 outline-none"
                    >
                      {pipelineStages.map((s) => (
                        <option key={s} value={s}>
                          Move to: {s}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setScheduleFor(c)}
                      className="w-full mt-2 inline-flex items-center justify-center gap-1.5 rounded-lg border border-brand-200 text-brand-700 text-xs font-semibold py-1.5 hover:bg-brand-50"
                    >
                      <CalendarClock size={12} /> {c.interview ? "Reschedule" : "Schedule interview"}
                    </button>
                  </div>
                ))}
                {stageItems.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted">
                    Drop candidates here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <FiltersModal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        value={filters}
        onApply={(f) => {
          setFilters(f);
          setFiltersOpen(false);
        }}
        locations={locations}
        jobs={jobsList}
      />

      {scheduleFor && (
        <ScheduleModal
          key={scheduleFor.id}
          candidate={scheduleFor}
          onClose={() => setScheduleFor(null)}
          onSend={(label) => {
            const c = scheduleFor;
            save(
              items.map((x) =>
                x.id === c.id
                  ? { ...x, interview: label, stage: earlyStages.includes(x.stage) ? "Interview" : x.stage }
                  : x
              )
            );
            toast(`Interview invite sent to ${c.name}.`);
            setScheduleFor(null);
          }}
        />
      )}
    </div>
  );
}

function FiltersModal({
  open,
  onClose,
  value,
  onApply,
  locations,
  jobs,
}: {
  open: boolean;
  onClose: () => void;
  value: Filters;
  onApply: (f: Filters) => void;
  locations: string[];
  jobs: string[];
}) {
  // Re-mount the form each time it opens so it starts from the applied filters.
  return (
    <Modal open={open} onClose={onClose} title="Filter candidates">
      {open && <FiltersForm value={value} onApply={onApply} onClose={onClose} locations={locations} jobs={jobs} />}
    </Modal>
  );
}

function FiltersForm({
  value,
  onApply,
  onClose,
  locations,
  jobs,
}: {
  value: Filters;
  onApply: (f: Filters) => void;
  onClose: () => void;
  locations: string[];
  jobs: string[];
}) {
  const [f, setF] = useState<Filters>(value);
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className={labelCls}>Minimum match score: {f.minScore}%</label>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={f.minScore}
          onChange={(e) => setF({ ...f, minScore: Number(e.target.value) })}
          className="w-full accent-[var(--brand-500)]"
        />
      </div>
      <div>
        <label className={labelCls}>Applied for</label>
        <select value={f.job} onChange={(e) => setF({ ...f, job: e.target.value })} className={inputCls}>
          <option value="">Any role</option>
          {jobs.map((j) => (
            <option key={j}>{j}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelCls}>Location</label>
        <select value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} className={inputCls}>
          <option value="">Any location</option>
          {locations.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelCls}>Notice period</label>
        <select value={f.notice} onChange={(e) => setF({ ...f, notice: e.target.value })} className={inputCls}>
          <option value="">Any</option>
          <option value="0">Immediate</option>
          <option value="15">Up to 15 days</option>
          <option value="30">Up to 30 days</option>
          <option value="60">Up to 60 days</option>
          <option value="90">Up to 90 days</option>
        </select>
      </div>
      <div className="flex gap-3 pt-2 pb-2">
        <button
          onClick={() => onApply(noFilters)}
          className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold text-ink hover:border-brand-400"
        >
          Reset
        </button>
        <button onClick={onClose} className="rounded-xl border border-border text-muted px-4 text-sm font-medium">
          Cancel
        </button>
        <button
          onClick={() => onApply(f)}
          className="flex-1 rounded-xl bg-brand-500 hover:bg-brand-600 text-ink-900 font-semibold py-2.5 text-sm"
        >
          Apply
        </button>
      </div>
    </div>
  );
}

function ScheduleModal({
  candidate,
  onClose,
  onSend,
}: {
  candidate: Item;
  onClose: () => void;
  onSend: (label: string) => void;
}) {
  const toast = useToast();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [mode, setMode] = useState<"Video call" | "In person">("Video call");
  const [interviewer, setInterviewer] = useState(interviewers[0]);

  function send() {
    if (!date || !time) return toast("Pick a date and time for the interview.", "error");
    const when = new Date(`${date}T${time}`);
    if (Number.isNaN(when.getTime())) return toast("That date or time isn't valid.", "error");
    if (when.getTime() < Date.now()) return toast("Choose a time in the future.", "error");
    const label = `${when.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}, ${when.toLocaleTimeString(
      "en-US",
      { hour: "numeric", minute: "2-digit" }
    )} · ${mode} · ${interviewer.split(" — ")[0]}`;
    onSend(label);
  }

  const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time

  return (
    <Modal open onClose={onClose} title="Schedule interview" maxWidth="max-w-sm">
      <p className="text-sm text-muted mb-5 -mt-1">
        {candidate.name} · {candidate.appliedFor}
      </p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className={labelCls}>Date</label>
          <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Time</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputCls} />
        </div>
      </div>

      <label className={labelCls}>Interview mode</label>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode("Video call")}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl border text-sm font-semibold py-2 ${
            mode === "Video call" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-border text-muted"
          }`}
        >
          <Video size={14} /> Video call
        </button>
        <button
          onClick={() => setMode("In person")}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl border text-sm font-semibold py-2 ${
            mode === "In person" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-border text-muted"
          }`}
        >
          <MapPin size={14} /> In person
        </button>
      </div>

      <label className={labelCls}>Interviewer</label>
      <select value={interviewer} onChange={(e) => setInterviewer(e.target.value)} className={`${inputCls} mb-5`}>
        {interviewers.map((i) => (
          <option key={i}>{i}</option>
        ))}
      </select>

      <button onClick={send} className="w-full rounded-xl bg-brand-500 hover:bg-brand-600 text-ink-900 font-semibold py-2.5 text-sm">
        Send invite
      </button>
    </Modal>
  );
}
