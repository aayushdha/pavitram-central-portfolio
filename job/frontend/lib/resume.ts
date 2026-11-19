"use client";

import { useAuth } from "./auth-context";
import { useLocalStorage } from "./use-local-storage";
import type { ApiUser } from "./api-client";

export type Experience = { id: string; role: string; company: string; from: string; to: string; details: string };
export type Education = { id: string; school: string; degree: string; year: string };
export type ResumeData = {
  personal: { name: string; title: string; email: string; phone: string; location: string };
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
};

/** Starts from the signed-in account — never from somebody else's sample data. */
export function defaultResume(user: ApiUser | null): ResumeData {
  return {
    personal: {
      name: user?.name ?? "",
      title: "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      location: [user?.city, user?.state].filter(Boolean).join(", "),
    },
    summary: "",
    experience: [{ id: "exp-default", role: "", company: "", from: "", to: "", details: "" }],
    education: [{ id: "edu-default", school: "", degree: "", year: "" }],
    skills: [],
  };
}

export const hasText = (s: string) => s.trim().length > 0;
export const filledExperience = (r: ResumeData) => r.experience.filter((e) => hasText(e.role) || hasText(e.company));
export const filledEducation = (r: ResumeData) => r.education.filter((e) => hasText(e.school) || hasText(e.degree));

/** What's still missing, with the builder step that fixes it. Drives the strength meter. */
export type Check = { label: string; points: number; done: boolean; step: number };
export function resumeChecks(r: ResumeData): Check[] {
  const p = r.personal;
  return [
    { label: "Add your full name", points: 10, done: hasText(p.name), step: 0 },
    { label: "Add a job title", points: 10, done: hasText(p.title), step: 0 },
    { label: "Add your email", points: 10, done: /^\S+@\S+\.\S+$/.test(p.email.trim()), step: 0 },
    { label: "Add your phone number", points: 5, done: p.phone.replace(/\D/g, "").length >= 8, step: 0 },
    { label: "Add your location", points: 5, done: hasText(p.location), step: 0 },
    { label: "Write a summary (50+ characters)", points: 15, done: r.summary.trim().length >= 50, step: 1 },
    { label: "Add a work experience (role + company)", points: 20, done: filledExperience(r).some((e) => hasText(e.role) && hasText(e.company)), step: 2 },
    { label: "Add your education", points: 10, done: filledEducation(r).some((e) => hasText(e.school)), step: 3 },
    { label: "Add at least 3 skills", points: 15, done: r.skills.length >= 3, step: 4 },
  ];
}
export const resumeScore = (r: ResumeData) => resumeChecks(r).reduce((n, c) => n + (c.done ? c.points : 0), 0);

/** True once the person has typed something meaningful (so empty defaults don't count as a resume). */
export const hasResumeContent = (r: ResumeData) =>
  hasText(r.personal.title) || hasText(r.summary) || filledExperience(r).length > 0 || filledEducation(r).length > 0 || r.skills.length > 0;

/** Normalises older/partial saved data so the UI never crashes on missing fields. */
function normalize(raw: ResumeData | null, user: ApiUser | null): ResumeData | null {
  if (!raw) return null;
  const d = defaultResume(user);
  return {
    personal: { ...d.personal, ...raw.personal },
    summary: raw.summary ?? "",
    experience: Array.isArray(raw.experience) && raw.experience.length ? raw.experience : d.experience,
    education: Array.isArray(raw.education) && raw.education.length ? raw.education : d.education,
    skills: Array.isArray(raw.skills) ? raw.skills : [],
  };
}

/** The saved resume for the signed-in user (kept in this browser). */
export function useResume() {
  const { user } = useAuth();
  const [stored, write] = useLocalStorage<ResumeData>(`jobportal_resume_${user?.id ?? "guest"}`);
  const saved = normalize(stored, user);
  return {
    resume: saved ?? defaultResume(user),
    saved, // null until the user has saved something
    defaults: defaultResume(user),
    save: (r: ResumeData) => write(r),
  };
}

// ----------------------------------------------------------------------------
// PDF
// ----------------------------------------------------------------------------

/** Characters the built-in PDF fonts (WinAnsi) can draw. Anything else needs the browser print route. */
const WINANSI_EXTRA = "\u2013\u2014\u2018\u2019\u201C\u201D\u2022\u2026\u20AC\u2122";
function pdfSafe(text: string) {
  return text.replace(/₹\s?/g, "Rs. ").replace(/[\u00A0\u2009\u202F]/g, " ");
}
function canDrawInPdf(text: string) {
  for (const ch of pdfSafe(text)) {
    const c = ch.codePointAt(0)!;
    if (c === 9 || c === 10 || c === 13) continue;
    if (c >= 32 && c <= 126) continue;
    if (c >= 160 && c <= 255) continue;
    if (WINANSI_EXTRA.includes(ch)) continue;
    return false;
  }
  return true;
}

function allText(r: ResumeData) {
  return [
    ...Object.values(r.personal),
    r.summary,
    ...r.experience.flatMap((e) => [e.role, e.company, e.from, e.to, e.details]),
    ...r.education.flatMap((e) => [e.school, e.degree, e.year]),
    ...r.skills,
  ].join("\n");
}

/** Resumes with scripts like Devanagari can't be drawn with the built-in PDF fonts. */
export const needsPrintFallback = (r: ResumeData) => !canDrawInPdf(allText(r));

export function resumeFileName(r: ResumeData) {
  const base = r.personal.name.trim().replace(/[^\p{L}\p{N}]+/gu, "_").replace(/^_+|_+$/g, "") || "My";
  return `${base}_Resume.pdf`;
}

/** Builds a real, text-selectable PDF and returns it as a Blob (nothing is uploaded anywhere). */
export async function buildResumePdf(r: ResumeData): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const H = 297;
  const M = 18;
  const contentW = W - M * 2;
  let y = M;

  const ink: [number, number, number] = [26, 34, 56];
  const muted: [number, number, number] = [107, 111, 123];
  const accent: [number, number, number] = [122, 95, 0];
  const rule: [number, number, number] = [214, 207, 190];
  const t = pdfSafe;

  doc.setProperties({ title: `${r.personal.name} — Resume`, author: r.personal.name });

  const ensure = (needed: number) => {
    if (y + needed > H - M) {
      doc.addPage();
      y = M;
    }
  };
  const lineH = (size: number) => size * 0.3528 * 1.38;

  function text(str: string, opts: { size: number; bold?: boolean; color?: [number, number, number]; x?: number; align?: "left" | "right"; width?: number }) {
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(opts.size);
    doc.setTextColor(...(opts.color ?? ink));
    const lines: string[] = doc.splitTextToSize(t(str), opts.width ?? contentW);
    for (const line of lines) {
      ensure(lineH(opts.size));
      y += lineH(opts.size);
      doc.text(line, opts.align === "right" ? (opts.x ?? W - M) : (opts.x ?? M), y - lineH(opts.size) * 0.22, { align: opts.align ?? "left" });
    }
    return lines.length;
  }

  function section(title: string) {
    ensure(16);
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...ink);
    doc.text(title.toUpperCase(), M, y + 3);
    y += 4.6;
    doc.setDrawColor(...rule);
    doc.setLineWidth(0.25);
    doc.line(M, y, W - M, y);
    y += 1.8;
  }

  // Header
  text(r.personal.name || "Your name", { size: 20, bold: true });
  if (hasText(r.personal.title)) text(r.personal.title, { size: 11.5, bold: true, color: accent });
  const contact = [r.personal.email, r.personal.phone, r.personal.location].filter(hasText).join("   |   ");
  if (contact) text(contact, { size: 9, color: muted });

  if (hasText(r.summary)) {
    section("Summary");
    text(r.summary.trim(), { size: 10 });
  }

  const exps = filledExperience(r);
  if (exps.length) {
    section("Experience");
    exps.forEach((e, i) => {
      if (i) y += 2.5;
      ensure(20);
      const dates = [e.from, e.to].filter(hasText).join(" – ");
      const head = [e.role, e.company].filter(hasText).join("  |  ");
      const startY = y;
      if (dates) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const dw = doc.getTextWidth(t(dates));
        text(head, { size: 10.5, bold: true, width: contentW - dw - 4 });
        const endY = y;
        y = startY;
        text(dates, { size: 9, color: muted, align: "right" });
        y = Math.max(endY, y);
      } else {
        text(head, { size: 10.5, bold: true });
      }
      for (const raw of e.details.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)) {
        const bullet = /^[-•*]\s*/.test(raw) ? raw.replace(/^[-•*]\s*/, "") : raw;
        if (e.details.includes("\n")) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(...ink);
          ensure(lineH(10));
          doc.text("•", M + 1, y + lineH(10) * 0.78);
          text(bullet, { size: 10, x: M + 5, width: contentW - 5 });
        } else {
          text(bullet, { size: 10 });
        }
      }
    });
  }

  const edus = filledEducation(r);
  if (edus.length) {
    section("Education");
    edus.forEach((ed, i) => {
      if (i) y += 1.5;
      ensure(10);
      const startY = y;
      const head = [ed.degree, ed.school].filter(hasText).join("  |  ");
      if (hasText(ed.year)) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const dw = doc.getTextWidth(t(ed.year));
        text(head, { size: 10.5, bold: true, width: contentW - dw - 4 });
        const endY = y;
        y = startY;
        text(ed.year, { size: 9, color: muted, align: "right" });
        y = Math.max(endY, y);
      } else {
        text(head, { size: 10.5, bold: true });
      }
    });
  }

  if (r.skills.length) {
    section("Skills");
    text(r.skills.join("   •   "), { size: 10 });
  }

  return doc.output("blob");
}

export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
