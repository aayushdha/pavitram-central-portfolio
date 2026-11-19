"use client";

import { useRef, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, stageTone } from "@/components/ui/Badge";
import { Modal, ConfirmModal, inputCls, labelCls } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { employerJobs } from "@/lib/data";
import { useLocalStorage } from "@/lib/use-local-storage";
import { parseCsv, downloadText } from "@/lib/csv";
import { Plus, Sparkles, Copy, Upload, Send, XCircle, RotateCcw, Download } from "lucide-react";

const statuses = ["All", "Live", "Draft", "Expiring", "Closed"] as const;
const JOBS_KEY = "jobportal_employer_jobs";
const jobTypes = ["Full-time", "Part-time", "Internship", "Contract", "Freelance / Gig"];
const DEFAULT_EXPIRY = "30 days";
const MAX_CSV_BYTES = 1024 * 1024;
const CSV_TEMPLATE =
  "title,department,location,job_type,experience,salary,skills\n" +
  '"Senior Product Designer",Design,Bengaluru,Full-time,4-7 years,₹24L - ₹32L,"Figma, Design Systems"\n';

type Job = (typeof employerJobs)[number] & {
  jobType?: string;
  experience?: string;
  salary?: string;
  skills?: string;
  description?: string;
};

function todayLabel() {
  return new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

let idCounter = 0;
function newId() {
  idCounter += 1;
  return `ej-${Date.now().toString(36)}-${idCounter}`;
}

export default function EmployerJobsPage() {
  const toast = useToast();
  const [stored, write] = useLocalStorage<Job[]>(JOBS_KEY);
  const jobs: Job[] = stored ?? employerJobs;
  const [filter, setFilter] = useState<(typeof statuses)[number]>("All");
  const [showBuilder, setShowBuilder] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [closing, setClosing] = useState<Job | null>(null);

  const rows = jobs.filter((j) => filter === "All" || j.status === filter);

  function save(next: Job[]) {
    if (!write(next)) toast("Saved for this session only — browser storage is unavailable.", "info");
  }

  function duplicate(job: Job) {
    save([
      { ...job, id: newId(), title: `${job.title} (Copy)`, status: "Draft", applicants: 0, posted: "—", expiresIn: "—" },
      ...jobs,
    ]);
    toast(`Duplicated "${job.title}" as a draft.`);
  }

  function setStatus(id: string, status: string) {
    save(
      jobs.map((j) =>
        j.id === id
          ? {
              ...j,
              status,
              posted: status === "Live" && j.posted === "—" ? todayLabel() : j.posted,
              expiresIn: status === "Live" ? (j.expiresIn === "—" ? DEFAULT_EXPIRY : j.expiresIn) : "—",
            }
          : j
      )
    );
  }

  function rowAction(j: Job) {
    if (j.status === "Draft") {
      setStatus(j.id, "Live");
      toast(`"${j.title}" is now live.`);
    } else if (j.status === "Closed") {
      setStatus(j.id, "Live");
      toast(`"${j.title}" reopened.`);
    } else {
      setClosing(j);
    }
  }

  function actionLabel(j: Job) {
    return j.status === "Draft" ? "Publish" : j.status === "Closed" ? "Reopen" : "Close job";
  }

  return (
    <div>
      <PageHeader
        title="Job postings"
        subtitle="Create, copy, and manage every job post from one place."
        actions={
          <>
            <button
              onClick={() => setShowBulk(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-ink hover:border-brand-400"
            >
              <Upload size={16} /> Bulk upload
            </button>
            <button
              onClick={() => setShowBuilder(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 text-ink-900 px-4 py-2.5 text-sm font-semibold hover:bg-brand-600"
            >
              <Plus size={16} /> Post a job
            </button>
          </>
        }
      />

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-sm font-medium px-3.5 py-1.5 rounded-full border transition-colors ${
              filter === s ? "bg-ink-900 text-white border-ink-900" : "border-border text-muted hover:border-brand-400"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-surface overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted uppercase tracking-wide border-b border-border">
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Department</th>
              <th className="px-5 py-3 font-medium">Location</th>
              <th className="px-5 py-3 font-medium">Applicants</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Expires</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((j) => (
              <tr key={j.id} className="hover:bg-background/60">
                <td className="px-5 py-3.5 font-medium text-ink">
                  <div className="flex items-center gap-2">
                    {j.title}
                    {j.sponsored && <Sparkles size={13} className="text-spark-500" />}
                  </div>
                </td>
                <td className="px-5 py-3.5 text-muted">{j.dept}</td>
                <td className="px-5 py-3.5 text-muted">{j.location}</td>
                <td className="px-5 py-3.5 text-muted">{j.applicants}</td>
                <td className="px-5 py-3.5">
                  <Badge tone={stageTone(j.status)}>{j.status}</Badge>
                </td>
                <td className="px-5 py-3.5 text-muted">{j.expiresIn}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3 justify-end">
                    <button
                      onClick={() => rowAction(j)}
                      className="text-muted hover:text-brand-600"
                      title={actionLabel(j)}
                      aria-label={actionLabel(j)}
                    >
                      {j.status === "Draft" ? <Send size={15} /> : j.status === "Closed" ? <RotateCcw size={15} /> : <XCircle size={15} />}
                    </button>
                    <button
                      onClick={() => duplicate(j)}
                      className="text-muted hover:text-brand-600"
                      title="Duplicate"
                      aria-label="Duplicate"
                    >
                      <Copy size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-muted">
                  No postings in this status.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <JobBuilderModal
        open={showBuilder}
        onClose={() => setShowBuilder(false)}
        onCreate={(job, publish) => {
          save([job, ...jobs]);
          setShowBuilder(false);
          toast(publish ? `"${job.title}" is now live.` : `"${job.title}" saved as a draft.`);
        }}
      />

      <BulkUploadModal
        open={showBulk}
        onClose={() => setShowBulk(false)}
        onImport={(list) => {
          save([...list, ...jobs]);
          setShowBulk(false);
          toast(`${list.length} job${list.length > 1 ? "s" : ""} imported as drafts.`);
        }}
      />

      <ConfirmModal
        open={closing !== null}
        onClose={() => setClosing(null)}
        onConfirm={() => {
          if (closing) {
            setStatus(closing.id, "Closed");
            toast(`"${closing.title}" closed.`, "info");
          }
          setClosing(null);
        }}
        title="Close this job?"
        message="Candidates will no longer be able to apply. You can reopen it any time."
        confirmLabel="Close job"
        danger
      />
    </div>
  );
}

const emptyForm = {
  title: "",
  skills: "",
  experience: "",
  salary: "",
  location: "",
  dept: "",
  jobType: jobTypes[0],
  description: "",
  sponsored: false,
};

function JobBuilderModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (job: Job, publish: boolean) => void;
}) {
  const toast = useToast();
  const [form, setForm] = useState(emptyForm);
  const set = <K extends keyof typeof emptyForm>(k: K, v: (typeof emptyForm)[K]) => setForm((f) => ({ ...f, [k]: v }));

  function submit(publish: boolean) {
    if (!form.title.trim()) return toast("Add a job title.", "error");
    if (!form.location.trim()) return toast("Add a location.", "error");
    if (publish && form.description.trim().length < 20) {
      return toast("Add a short description (at least 20 characters) before publishing.", "error");
    }
    onCreate(
      {
        id: newId(),
        title: form.title.trim(),
        dept: form.dept.trim() || "General",
        location: form.location.trim(),
        applicants: 0,
        status: publish ? "Live" : "Draft",
        posted: publish ? todayLabel() : "—",
        expiresIn: publish ? DEFAULT_EXPIRY : "—",
        sponsored: form.sponsored,
        jobType: form.jobType,
        experience: form.experience.trim(),
        salary: form.salary.trim(),
        skills: form.skills.trim(),
        description: form.description.trim(),
      },
      publish
    );
    setForm(emptyForm);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Post a new job"
      maxWidth="max-w-lg"
      footer={
        <div className="flex gap-3 w-full">
          <button onClick={() => submit(false)} className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold text-ink hover:border-brand-400">
            Save as draft
          </button>
          <button onClick={() => submit(true)} className="flex-1 rounded-xl bg-brand-500 text-ink-900 py-2.5 text-sm font-semibold hover:bg-brand-600">
            Publish job
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Job title" placeholder="e.g. Senior Product Designer" value={form.title} onChange={(v) => set("title", v)} />
        <Field label="Skills required" placeholder="Figma, Design Systems, User Research" value={form.skills} onChange={(v) => set("skills", v)} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Experience range" placeholder="4–7 years" value={form.experience} onChange={(v) => set("experience", v)} />
          <Field label="Salary range" placeholder="₹24L – ₹32L (optional)" value={form.salary} onChange={(v) => set("salary", v)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Location" placeholder="Bengaluru" value={form.location} onChange={(v) => set("location", v)} />
          <Field label="Department" placeholder="Design" value={form.dept} onChange={(v) => set("dept", v)} />
        </div>
        <div>
          <label className={labelCls}>Job type</label>
          <select value={form.jobType} onChange={(e) => set("jobType", e.target.value)} className={inputCls}>
            {jobTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Description</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Role responsibilities, requirements, and team context..."
            className={`${inputCls} resize-none`}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={form.sponsored}
            onChange={(e) => set("sponsored", e.target.checked)}
            className="accent-[var(--brand-500)]"
          />{" "}
          Boost as a featured / sponsored listing
        </label>
      </div>
    </Modal>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputCls} placeholder:text-muted/70`}
      />
    </div>
  );
}

function BulkUploadModal({
  open,
  onClose,
  onImport,
}: {
  open: boolean;
  onClose: () => void;
  onImport: (jobs: Job[]) => void;
}) {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [parsed, setParsed] = useState<{ fileName: string; valid: Job[]; errors: string[] } | null>(null);

  function close() {
    setParsed(null);
    onClose();
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!/\.csv$/i.test(file.name)) return toast("Please choose a .csv file.", "error");
    if (file.size > MAX_CSV_BYTES) return toast("CSV must be under 1 MB.", "error");

    const rows = parseCsv(await file.text());
    if (rows.length < 2) return toast("The file has no job rows.", "error");

    const header = rows[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
    const col = (name: string) => header.indexOf(name);
    if (col("title") === -1 || col("location") === -1) {
      return toast('CSV needs at least "title" and "location" columns. Download the template to see the format.', "error");
    }

    const valid: Job[] = [];
    const errors: string[] = [];
    rows.slice(1, 201).forEach((r, i) => {
      const get = (name: string) => (col(name) === -1 ? "" : (r[col(name)] ?? "").trim());
      const line = i + 2;
      if (!get("title")) return errors.push(`Row ${line}: missing title`);
      if (!get("location")) return errors.push(`Row ${line}: missing location`);
      valid.push({
        id: newId(),
        title: get("title"),
        dept: get("department") || "General",
        location: get("location"),
        applicants: 0,
        status: "Draft",
        posted: "—",
        expiresIn: "—",
        sponsored: false,
        jobType: get("job_type") || jobTypes[0],
        experience: get("experience"),
        salary: get("salary"),
        skills: get("skills"),
      });
    });
    if (rows.length > 201) errors.push("Only the first 200 rows were read.");
    setParsed({ fileName: file.name, valid, errors });
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Bulk upload jobs"
      footer={
        <>
          <button onClick={close} className="rounded-xl border border-border text-muted hover:text-ink px-4 py-2 text-sm font-medium">
            Cancel
          </button>
          <button
            disabled={!parsed || parsed.valid.length === 0}
            onClick={() => {
              if (parsed) {
                onImport(parsed.valid);
                setParsed(null);
              }
            }}
            className="rounded-xl bg-brand-500 hover:bg-brand-600 text-ink-900 font-semibold px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Import {parsed ? parsed.valid.length : 0} job{parsed?.valid.length === 1 ? "" : "s"}
          </button>
        </>
      }
    >
      <p className="text-muted mb-3">
        Upload a CSV with one job per row. Jobs are added as drafts so you can review them before publishing.
      </p>
      <button
        onClick={() => downloadText("jobs-template.csv", CSV_TEMPLATE, "text/csv;charset=utf-8")}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 mb-4"
      >
        <Download size={14} /> Download template
      </button>
      <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={onFile} className="hidden" />
      <button
        onClick={() => fileRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 border border-dashed border-border rounded-xl p-4 text-sm text-muted hover:border-brand-400 hover:text-brand-600"
      >
        <Upload size={15} /> {parsed ? parsed.fileName : "Choose CSV file"}
      </button>
      {parsed && (
        <div className="mt-4 text-sm">
          <p className="text-good-500 font-medium">
            {parsed.valid.length} valid row{parsed.valid.length === 1 ? "" : "s"} ready to import.
          </p>
          {parsed.errors.length > 0 && (
            <ul className="mt-2 text-bad-500 text-xs list-disc pl-4 max-h-24 overflow-y-auto">
              {parsed.errors.slice(0, 8).map((er) => (
                <li key={er}>{er}</li>
              ))}
              {parsed.errors.length > 8 && <li>…and {parsed.errors.length - 8} more</li>}
            </ul>
          )}
        </div>
      )}
    </Modal>
  );
}
