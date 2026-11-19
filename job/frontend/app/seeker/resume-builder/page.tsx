"use client";

import { useMemo, useRef, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useToast } from "@/components/ui/Toast";
import { printHtml } from "@/lib/print-html";
import {
  buildResumeHtml,
  canRenderPdf,
  cleanResume,
  downloadResumePdf,
  type ResumeData,
  type ResumeEducation as Education,
  type ResumeExperience as Experience,
} from "@/lib/resume-pdf";
import { useAuth } from "@/lib/auth-context";
import { useLocalStorage } from "@/lib/use-local-storage";
import {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Sparkles,
  Eye,
  Plus,
  Trash2,
  Download,
  Check,
  Loader2,
  RotateCcw,
} from "lucide-react";

const steps = [
  { id: "personal", label: "Personal info", icon: <User size={16} /> },
  { id: "summary", label: "Summary", icon: <FileText size={16} /> },
  { id: "experience", label: "Work experience", icon: <Briefcase size={16} /> },
  { id: "education", label: "Education", icon: <GraduationCap size={16} /> },
  { id: "skills", label: "Skills", icon: <Sparkles size={16} /> },
  { id: "preview", label: "Preview & export", icon: <Eye size={16} /> },
] as const;

/** Unique even on plain-http deployments, where crypto.randomUUID() is unavailable. */
function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function ResumeBuilderPage() {
  const toast = useToast();
  const { user } = useAuth();
  const [stepIdx, setStepIdx] = useState(0);
  const [busy, setBusy] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const warnedRef = useRef(false);
  const step = steps[stepIdx];

  // Start from the logged-in user's own profile; the draft is then auto-saved per user on this device.
  const defaults = useMemo<ResumeData>(
    () => ({
      personal: {
        name: user?.name ?? "",
        title: user?.designation || user?.profession || "",
        email: user?.email ?? "",
        phone: user?.phone ?? "",
        location: [user?.city, user?.state].filter(Boolean).join(", "),
      },
      summary: user?.bio ?? "",
      experience: [],
      education: [],
      skills: [],
    }),
    [user]
  );
  const [stored, saveDraft] = useLocalStorage<Partial<ResumeData>>(`resume-builder-draft:${user?.id ?? "guest"}`);
  const resume = useMemo<ResumeData>(
    () => ({
      personal: { ...defaults.personal, ...(stored?.personal ?? {}) },
      summary: typeof stored?.summary === "string" ? stored.summary : defaults.summary,
      experience: Array.isArray(stored?.experience) ? stored.experience : defaults.experience,
      education: Array.isArray(stored?.education) ? stored.education : defaults.education,
      skills: Array.isArray(stored?.skills) ? stored.skills : defaults.skills,
    }),
    [stored, defaults]
  );
  const { personal, summary, experience, education, skills } = resume;

  function update(patch: Partial<ResumeData>) {
    const ok = saveDraft({ ...resume, ...patch });
    if (!ok && !warnedRef.current) {
      warnedRef.current = true;
      toast("Browser storage is full or blocked, so your draft won't be remembered after you close this tab.", "info");
    }
  }
  const setPersonalField = (k: keyof ResumeData["personal"], v: string) =>
    update({ personal: { ...personal, [k]: v } });

  function addExperience() {
    update({ experience: [...experience, { id: newId(), role: "", company: "", from: "", to: "", details: "" }] });
  }
  function updateExperience(id: string, patch: Partial<Experience>) {
    update({ experience: experience.map((x) => (x.id === id ? { ...x, ...patch } : x)) });
  }
  function removeExperience(id: string) {
    update({ experience: experience.filter((x) => x.id !== id) });
  }

  function addEducation() {
    update({ education: [...education, { id: newId(), school: "", degree: "", year: "" }] });
  }
  function updateEducation(id: string, patch: Partial<Education>) {
    update({ education: education.map((x) => (x.id === id ? { ...x, ...patch } : x)) });
  }
  function removeEducation(id: string) {
    update({ education: education.filter((x) => x.id !== id) });
  }

  function addSkill() {
    // Allow "Figma, React, SQL" in one go; ignore duplicates regardless of case.
    const incoming = skillInput.split(",").map((x) => x.trim()).filter(Boolean);
    const next = [...skills];
    for (const v of incoming) {
      if (v.length <= 40 && !next.some((k) => k.toLowerCase() === v.toLowerCase())) next.push(v);
    }
    if (next.length !== skills.length) update({ skills: next });
    setSkillInput("");
  }
  function removeSkill(s: string) {
    update({ skills: skills.filter((x) => x !== s) });
  }

  function startOver() {
    if (!window.confirm("Clear everything and start again from your profile details?")) return;
    saveDraft({ ...defaults });
    setStepIdx(0);
    toast("Resume reset.", "info");
  }

  async function downloadPdf() {
    if (busy) return;
    if (!personal.name.trim()) {
      setStepIdx(0);
      return toast("Add your name before downloading.", "error");
    }
    setBusy(true);
    try {
      const data = cleanResume(resume);
      if (canRenderPdf(data)) {
        await downloadResumePdf(data);
        toast("Your resume PDF has been downloaded.", "success");
      } else if (printHtml(buildResumeHtml(data))) {
        // Hindi/Gujarati/emoji text can't be drawn with built-in PDF fonts, so let the browser render it.
        toast('In the print dialog, choose "Save as PDF" as the destination.', "info");
      } else {
        toast("Couldn't create the PDF in this browser.", "error");
      }
    } catch (err) {
      console.error("Resume PDF failed", err);
      toast("Couldn't create the PDF. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  }

  // Strength is based on what the user has really filled in (blank rows don't count).
  const checks = [
    { ok: !!personal.name.trim() && !!personal.title.trim(), tip: "Add your name and job title" },
    { ok: summary.trim().length >= 40, tip: "Write a summary of at least 40 characters" },
    { ok: experience.some((e) => e.role.trim() && e.company.trim()), tip: "Add at least one role with a title and company" },
    { ok: education.some((e) => e.school.trim()), tip: "Add your school or college" },
    { ok: skills.length >= 3, tip: "Add at least 3 skills" },
  ];
  const completeness = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);
  const missing = checks.filter((c) => !c.ok);
  const shownExperience = cleanResume(resume).experience;
  const shownEducation = cleanResume(resume).education;

  return (
    <div>
      <PageHeader
        title="Resume builder"
        subtitle="Fill in each step. Your resume updates on the right as you type."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={startOver}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface hover:bg-background text-ink px-3.5 py-2.5 text-sm font-semibold"
            >
              <RotateCcw size={15} /> Start over
            </button>
            <button
              onClick={downloadPdf}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-ink-900 px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Download PDF
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-[220px_minmax(0,1fr)_380px] gap-6">
        {/* Step list */}
        <div className="rounded-2xl border border-border bg-surface p-3 h-fit">
          <div className="px-2 py-2 mb-1">
            <div className="flex items-center justify-between text-xs text-muted mb-1.5">
              <span>Resume strength</span>
              <span className="font-semibold text-ink">{completeness}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-border overflow-hidden">
              <div className="h-full bg-brand-500 rounded-full" style={{ width: `${completeness}%` }} />
            </div>
          </div>
          <nav className="flex xl:flex-col gap-1 overflow-x-auto xl:overflow-visible">
            {steps.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setStepIdx(i)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-colors whitespace-nowrap shrink-0 ${
                  i === stepIdx ? "bg-brand-50 text-brand-700" : "text-muted hover:bg-background"
                }`}
              >
                <span className={`h-6 w-6 rounded-full grid place-items-center text-[10px] font-bold shrink-0 ${
                  i < stepIdx ? "bg-good-500 text-white" : i === stepIdx ? "bg-brand-500 text-ink-900" : "bg-border text-muted"
                }`}>
                  {i < stepIdx ? <Check size={12} /> : i + 1}
                </span>
                {s.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Form panel */}
        <div className="rounded-2xl border border-border bg-surface p-6 min-w-0">
          {step.id === "personal" && (
            <div className="flex flex-col gap-4">
              <h2 className="font-display font-semibold text-lg mb-1">Personal info</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full name" value={personal.name} onChange={(v) => setPersonalField("name", v)} />
                <Field label="Job title" value={personal.title} onChange={(v) => setPersonalField("title", v)} />
                <Field label="Email" type="email" value={personal.email} onChange={(v) => setPersonalField("email", v)} />
                <Field label="Phone" type="tel" value={personal.phone} onChange={(v) => setPersonalField("phone", v)} />
                <Field label="Location" value={personal.location} onChange={(v) => setPersonalField("location", v)} className="sm:col-span-2" />
              </div>
            </div>
          )}

          {step.id === "summary" && (
            <div>
              <h2 className="font-display font-semibold text-lg mb-1">Summary</h2>
              <p className="text-sm text-muted mb-4">Write 2–3 lines about who you are and what you&apos;re good at.</p>
              <textarea
                value={summary}
                onChange={(e) => update({ summary: e.target.value })}
                placeholder="e.g. Marketing executive with 3 years of experience in lead generation and social media campaigns."
                rows={6}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 resize-none"
              />
              <p className="text-xs text-muted mt-2">{summary.length} characters{summary.trim().length < 40 && " · aim for at least 40"}</p>
            </div>
          )}

          {step.id === "experience" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-lg">Work experience</h2>
                <button onClick={addExperience} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
                  <Plus size={15} /> Add role
                </button>
              </div>
              <div className="flex flex-col gap-5">
                {experience.map((exp) => (
                  <div key={exp.id} className="rounded-xl border border-border p-4 relative">
                    <button
                      onClick={() => removeExperience(exp.id)}
                      aria-label="Remove role"
                      className="absolute top-3 right-3 text-muted hover:text-bad-500"
                    >
                      <Trash2 size={15} />
                    </button>
                    <div className="grid sm:grid-cols-2 gap-3 mb-3">
                      <Field label="Job title" value={exp.role} onChange={(v) => updateExperience(exp.id, { role: v })} />
                      <Field label="Company" value={exp.company} onChange={(v) => updateExperience(exp.id, { company: v })} />
                      <Field label="From" value={exp.from} onChange={(v) => updateExperience(exp.id, { from: v })} placeholder="2023" />
                      <Field label="To" value={exp.to} onChange={(v) => updateExperience(exp.id, { to: v })} placeholder="Present" />
                    </div>
                    <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">What did you do</label>
                    <textarea
                      value={exp.details}
                      onChange={(e) => updateExperience(exp.id, { details: e.target.value })}
                      rows={3}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 resize-none"
                    />
                  </div>
                ))}
                {experience.length === 0 && (
                  <p className="text-sm text-muted text-center py-6">No work history added yet.</p>
                )}
              </div>
            </div>
          )}

          {step.id === "education" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-lg">Education</h2>
                <button onClick={addEducation} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
                  <Plus size={15} /> Add school
                </button>
              </div>
              <div className="flex flex-col gap-4">
                {education.map((ed) => (
                  <div key={ed.id} className="rounded-xl border border-border p-4 relative">
                    <button
                      onClick={() => removeEducation(ed.id)}
                      aria-label="Remove school"
                      className="absolute top-3 right-3 text-muted hover:text-bad-500"
                    >
                      <Trash2 size={15} />
                    </button>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Field label="School / college" value={ed.school} onChange={(v) => updateEducation(ed.id, { school: v })} className="sm:col-span-2" />
                      <Field label="Degree" value={ed.degree} onChange={(v) => updateEducation(ed.id, { degree: v })} />
                      <Field label="Years" value={ed.year} onChange={(v) => updateEducation(ed.id, { year: v })} placeholder="2016 – 2020" />
                    </div>
                  </div>
                ))}
                {education.length === 0 && (
                  <p className="text-sm text-muted text-center py-6">No education added yet.</p>
                )}
              </div>
            </div>
          )}

          {step.id === "skills" && (
            <div>
              <h2 className="font-display font-semibold text-lg mb-1">Skills</h2>
              <p className="text-sm text-muted mb-4">Add the skills you want recruiters to see first.</p>
              <div className="flex gap-2 mb-4">
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                  placeholder="Type a skill and press Enter (or separate with commas)"
                  className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-brand-400"
                />
                <button onClick={addSkill} className="rounded-xl bg-brand-500 hover:bg-brand-600 text-ink-900 font-semibold px-4 text-sm">
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.length === 0 && <p className="text-sm text-muted">No skills added yet.</p>}
                {skills.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 text-brand-700 text-sm font-medium px-3 py-1.5">
                    {s}
                    <button onClick={() => removeSkill(s)} aria-label={`Remove ${s}`} className="text-brand-700/60 hover:text-brand-700">×</button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {step.id === "preview" && (
            <div>
              <h2 className="font-display font-semibold text-lg mb-1">All done</h2>
              <p className="text-sm text-muted mb-5">Your resume is shown in the live preview. Download it, or go back and edit any step.</p>
              {missing.length === 0 ? (
                <div className="rounded-xl bg-good-100 text-good-500 text-sm font-medium px-4 py-3 flex items-center gap-2 mb-5">
                  <Check size={16} /> Resume strength: {completeness}%
                </div>
              ) : (
                <div className="rounded-xl bg-brand-50 text-brand-700 text-sm px-4 py-3 mb-5">
                  <p className="font-semibold mb-1">Resume strength: {completeness}%. To make it stronger:</p>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {missing.map((m) => (
                      <li key={m.tip}>{m.tip}</li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                onClick={downloadPdf}
                disabled={busy}
                className="w-full rounded-xl bg-brand-500 hover:bg-brand-600 text-ink-900 font-semibold py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {busy ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Download as PDF
              </button>
            </div>
          )}

          <p className="text-[11px] text-muted mt-6">Your draft is saved automatically on this device.</p>
          <div className="flex items-center justify-between mt-3 pt-5 border-t border-border">
            <button
              disabled={stepIdx === 0}
              onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
              className="text-sm font-semibold text-muted disabled:opacity-30"
            >
              Back
            </button>
            <button
              disabled={stepIdx === steps.length - 1}
              onClick={() => setStepIdx((i) => Math.min(steps.length - 1, i + 1))}
              className="rounded-xl bg-brand-500 hover:bg-brand-600 text-ink-900 font-semibold px-5 py-2.5 text-sm disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>

        {/* Live preview */}
        <div className="rounded-2xl border border-border bg-surface p-6 h-fit xl:sticky xl:top-24 min-w-0">
          <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-muted uppercase tracking-wide">
            <Eye size={14} /> Live preview
          </div>
          <div className="rounded-xl border border-border bg-white p-6 text-sm break-words">
            <p className="font-display font-bold text-ink text-lg">{personal.name || "Your name"}</p>
            <p className="text-brand-600 font-medium">{personal.title || "Your job title"}</p>
            <p className="text-xs text-muted mt-1">
              {[personal.email, personal.phone, personal.location].filter(Boolean).join(" · ")}
            </p>

            {summary.trim() && (
              <>
                <div className="h-px bg-border my-4" />
                <p className="text-xs font-semibold text-ink uppercase tracking-wide mb-1.5">Summary</p>
                <p className="text-muted text-xs leading-relaxed whitespace-pre-line">{summary}</p>
              </>
            )}

            {shownExperience.length > 0 && (
              <>
                <div className="h-px bg-border my-4" />
                <p className="text-xs font-semibold text-ink uppercase tracking-wide mb-2">Experience</p>
                <div className="flex flex-col gap-3">
                  {shownExperience.map((exp) => (
                    <div key={exp.id}>
                      <div className="flex justify-between items-baseline">
                        <p className="font-medium text-ink text-xs">{exp.role || "Role"} · {exp.company || "Company"}</p>
                        <span className="text-[10px] text-muted whitespace-nowrap">{exp.from}{exp.to ? ` – ${exp.to}` : ""}</span>
                      </div>
                      {exp.details && <p className="text-muted text-xs mt-0.5 whitespace-pre-line">{exp.details}</p>}
                    </div>
                  ))}
                </div>
              </>
            )}

            {shownEducation.length > 0 && (
              <>
                <div className="h-px bg-border my-4" />
                <p className="text-xs font-semibold text-ink uppercase tracking-wide mb-2">Education</p>
                <div className="flex flex-col gap-2">
                  {shownEducation.map((ed) => (
                    <div key={ed.id} className="flex justify-between items-baseline">
                      <p className="text-ink text-xs">{ed.degree || "Degree"} · {ed.school || "School"}</p>
                      <span className="text-[10px] text-muted whitespace-nowrap">{ed.year}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {skills.length > 0 && (
              <>
                <div className="h-px bg-border my-4" />
                <p className="text-xs font-semibold text-ink uppercase tracking-wide mb-2">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s) => (
                    <span key={s} className="text-[10px] bg-background rounded-full px-2 py-1 text-ink">{s}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "tel";
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-brand-400"
      />
    </div>
  );
}
