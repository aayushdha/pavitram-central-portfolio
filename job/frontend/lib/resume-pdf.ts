import { escapeHtml as esc } from "./print-html";

export type ResumePersonal = { name: string; title: string; email: string; phone: string; location: string };
export type ResumeExperience = { id: string; role: string; company: string; from: string; to: string; details: string };
export type ResumeEducation = { id: string; school: string; degree: string; year: string };
export type ResumeData = {
  personal: ResumePersonal;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: string[];
};

/** Drops half-filled/blank rows so they never reach the exported file. */
export function cleanResume(d: ResumeData): ResumeData {
  return {
    personal: {
      name: d.personal.name.trim(),
      title: d.personal.title.trim(),
      email: d.personal.email.trim(),
      phone: d.personal.phone.trim(),
      location: d.personal.location.trim(),
    },
    summary: d.summary.trim(),
    experience: d.experience.filter((e) => e.role.trim() || e.company.trim() || e.details.trim()),
    education: d.education.filter((e) => e.school.trim() || e.degree.trim() || e.year.trim()),
    skills: d.skills.map((s) => s.trim()).filter(Boolean),
  };
}

// Characters the built-in PDF fonts (WinAnsi) can draw besides Latin-1.
const WIN_ANSI_EXTRA = new Set([
  0x20ac, 0x201a, 0x0192, 0x201e, 0x2026, 0x2020, 0x2021, 0x02c6, 0x2030, 0x0160, 0x2039, 0x0152, 0x017d, 0x2018,
  0x2019, 0x201c, 0x201d, 0x2022, 0x2013, 0x2014, 0x02dc, 0x2122, 0x0161, 0x203a, 0x0153, 0x017e, 0x0178,
]);

/** The rupee sign isn't in standard PDF fonts, so spell it "Rs." instead of dropping it. */
function pdfText(s: string): string {
  return s
    .replace(/₹\s?/g, "Rs. ")
    .replace(/\u00a0/g, " ")
    .replace(/[\u200b-\u200d\ufeff]/g, "")
    .replace(/\t/g, "  ")
    .replace(/\r\n?/g, "\n");
}

function isPdfSafe(s: string): boolean {
  for (const ch of pdfText(s)) {
    const cp = ch.codePointAt(0)!;
    if (cp === 10 || (cp >= 32 && cp <= 0xff) || WIN_ANSI_EXTRA.has(cp)) continue;
    return false;
  }
  return true;
}

/** True when every character can be drawn with the built-in PDF font (no Hindi/Gujarati/emoji). */
export function canRenderPdf(d: ResumeData): boolean {
  const all = [
    ...Object.values(d.personal),
    d.summary,
    ...d.experience.flatMap((e) => [e.role, e.company, e.from, e.to, e.details]),
    ...d.education.flatMap((e) => [e.school, e.degree, e.year]),
    ...d.skills,
  ];
  return all.every(isPdfSafe);
}

function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function fileNameFor(name: string) {
  const base = name.replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "_");
  return base ? `${base}_Resume.pdf` : "Resume.pdf";
}

/** Builds a real, text-based (selectable / ATS-friendly) A4 PDF and triggers the download. */
export async function downloadResumePdf(input: ResumeData, filename?: string): Promise<void> {
  const d = cleanResume(input);
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  doc.setProperties({ title: `${pdfText(d.personal.name)} - Resume` });

  const W = 210;
  const H = 297;
  const M = 18;
  const CW = W - M * 2;
  const PT = 0.3528; // mm per point
  let y = M;

  const ink = rgb("#1A2238");
  const gold = rgb("#7A5F00");
  const muted = rgb("#6B6F7B");
  const body = rgb("#444444");
  const rule = rgb("#E8E1D2");
  const chip = rgb("#F4F1E8");

  const lh = (size: number) => size * PT * 1.4;
  const need = (h: number) => {
    if (y + h > H - M) {
      doc.addPage();
      y = M;
    }
  };
  const font = (size: number, bold: boolean, color: [number, number, number]) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
  };
  const wrap = (s: string, width: number): string[] => doc.splitTextToSize(pdfText(s), width) as string[];

  // Header
  font(22, true, ink);
  for (const line of wrap(d.personal.name, CW)) {
    need(lh(22));
    y += 22 * PT;
    doc.text(line, M, y);
    y += 1.5;
  }
  if (d.personal.title) {
    font(11, true, gold);
    for (const line of wrap(d.personal.title, CW)) {
      need(lh(11));
      y += lh(11);
      doc.text(line, M, y);
    }
  }
  const contact = [d.personal.email, d.personal.phone, d.personal.location].filter(Boolean).join("  ·  ");
  if (contact) {
    font(9, false, muted);
    for (const line of wrap(contact, CW)) {
      need(lh(9));
      y += lh(9);
      doc.text(line, M, y);
    }
  }

  const section = (label: string) => {
    need(18);
    y += 9;
    font(9, true, ink);
    doc.text(label.toUpperCase(), M, y, { charSpace: 0.4 });
    doc.setDrawColor(rule[0], rule[1], rule[2]);
    doc.setLineWidth(0.25);
    doc.line(M, y + 1.8, W - M, y + 1.8);
    y += 6;
  };

  const entry = (left: string, right: string, details?: string) => {
    font(9.5, false, muted);
    const rightW = right ? doc.getTextWidth(pdfText(right)) + 4 : 0;
    font(10.5, true, ink);
    const titleLines = wrap(left || " ", CW - rightW);
    const detailLines = details ? (font(10, false, body), wrap(details, CW)) : [];
    need(lh(10.5) * titleLines.length + lh(10) * Math.min(2, detailLines.length) + 2);

    font(10.5, true, ink);
    titleLines.forEach((line, i) => {
      y += lh(10.5);
      doc.text(line, M, y);
      if (i === 0 && right) {
        font(9.5, false, muted);
        doc.text(pdfText(right), W - M, y, { align: "right" });
        font(10.5, true, ink);
      }
    });
    if (detailLines.length) {
      font(10, false, body);
      for (const line of detailLines) {
        need(lh(10));
        y += lh(10);
        font(10, false, body);
        doc.text(line, M, y);
      }
    }
    y += 3;
  };

  if (d.summary) {
    section("Summary");
    font(10, false, body);
    for (const line of wrap(d.summary, CW)) {
      need(lh(10));
      y += lh(10);
      doc.text(line, M, y);
    }
  }

  if (d.experience.length) {
    section("Experience");
    for (const e of d.experience) {
      const when = [e.from.trim(), e.to.trim()].filter(Boolean).join(" – ");
      entry([e.role.trim() || "Role", e.company.trim() || "Company"].join("  ·  "), when, e.details.trim());
    }
  }

  if (d.education.length) {
    section("Education");
    for (const e of d.education) {
      entry([e.degree.trim() || "Degree", e.school.trim() || "School"].join("  ·  "), e.year.trim());
    }
  }

  if (d.skills.length) {
    section("Skills");
    font(9, false, ink);
    const chipH = 6;
    const padX = 2.8;
    const gap = 2;
    let x = M;
    y += 1;
    need(chipH + gap);
    for (const s of d.skills) {
      const label = pdfText(s);
      const w = Math.min(CW, doc.getTextWidth(label) + padX * 2);
      if (x + w > W - M) {
        x = M;
        y += chipH + gap;
        need(chipH + gap);
      }
      doc.setFillColor(chip[0], chip[1], chip[2]);
      doc.roundedRect(x, y, w, chipH, 3, 3, "F");
      doc.text(label, x + padX, y + 4.1, { maxWidth: CW - padX * 2 });
      x += w + gap;
    }
  }

  doc.save(filename ?? fileNameFor(d.personal.name));
}

/** HTML version, used only as a print fallback for names/text a PDF font can't draw (Hindi, Gujarati…). */
export function buildResumeHtml(input: ResumeData): string {
  const d = cleanResume(input);
  const exp = d.experience
    .map(
      (e) =>
        `<div class="item"><div class="row"><span>${esc(e.role || "Role")} · ${esc(e.company || "Company")}</span><span class="when">${esc(e.from)}${e.to ? " – " + esc(e.to) : ""}</span></div>${e.details ? `<p>${esc(e.details)}</p>` : ""}</div>`
    )
    .join("");
  const edu = d.education
    .map(
      (ed) =>
        `<div class="item"><div class="row"><span>${esc(ed.degree || "Degree")} · ${esc(ed.school || "School")}</span><span class="when">${esc(ed.year)}</span></div></div>`
    )
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(d.personal.name)} — Resume</title>
<style>
  @page{margin:18mm}
  body{font-family:"Noto Sans","Nirmala UI","Mangal","Shruti",Segoe UI,Arial,sans-serif;color:#1A2238;font-size:13px;line-height:1.5;margin:0;padding:0}
  h1{font-size:24px;margin:0} .title{color:#7A5F00;font-weight:600;margin:2px 0}
  .contact{color:#6B6F7B;font-size:12px} h2{font-size:12px;letter-spacing:.08em;text-transform:uppercase;border-bottom:1px solid #E8E1D2;padding-bottom:3px;margin:20px 0 8px}
  .row{display:flex;justify-content:space-between;gap:12px;font-weight:600} .when{color:#6B6F7B;font-weight:400;white-space:nowrap}
  .item{margin-bottom:10px;break-inside:avoid} .item p{margin:2px 0;color:#444;white-space:pre-line}
  .skills span{display:inline-block;background:#F4F1E8;border-radius:999px;padding:2px 10px;margin:0 6px 6px 0;font-size:12px}
</style></head><body>
<h1>${esc(d.personal.name)}</h1>
${d.personal.title ? `<div class="title">${esc(d.personal.title)}</div>` : ""}
<div class="contact">${esc([d.personal.email, d.personal.phone, d.personal.location].filter(Boolean).join("  ·  "))}</div>
${d.summary ? `<h2>Summary</h2><p style="white-space:pre-line">${esc(d.summary)}</p>` : ""}
${exp ? `<h2>Experience</h2>${exp}` : ""}
${edu ? `<h2>Education</h2>${edu}` : ""}
${d.skills.length ? `<h2>Skills</h2><div class="skills">${d.skills.map((k) => `<span>${esc(k)}</span>`).join("")}</div>` : ""}
</body></html>`;
}
