"use client";

import { useRef, useState } from "react";
/* eslint-disable @next/next/no-img-element */
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Modal, ConfirmModal, inputCls, labelCls } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useLocalStorage } from "@/lib/use-local-storage";
import { imageToDataUrl } from "@/lib/image";
import { employerCompany } from "@/lib/data";
import { Upload, Plus, BadgeCheck, Trash2, Check, X } from "lucide-react";

const COMPANY_KEY = "jobportal_employer_company";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_PHOTOS = 8;
const roles = ["Admin", "Recruiter", "Hiring Manager", "Interviewer"];

type Member = { name: string; role: string; email: string };
type CompanyState = {
  profile: { name: string; industry: string; size: string; website: string; hq: string; about: string };
  team: Member[];
  logo: string | null;
  photos: string[];
};

const defaults: CompanyState = {
  profile: {
    name: employerCompany.name,
    industry: "Financial Services",
    size: "500–1,000 employees",
    website: "www.anthropifinserve.com",
    hq: "Bengaluru, India",
    about:
      "Anthropi Finserve builds lending and payments infrastructure for India's small businesses. We're a 500-person team spread across Bengaluru, Pune and remote.",
  },
  team: [
    { name: "Rhea Sen", role: "Admin", email: "rhea@anthropifinserve.com" },
    { name: "Kabir Anand", role: "Recruiter", email: "kabir@anthropifinserve.com" },
    { name: "Meera Iyer", role: "Hiring Manager", email: "meera@anthropifinserve.com" },
  ],
  logo: null,
  photos: [],
};

export default function CompanyProfilePage() {
  const toast = useToast();
  const [stored, write] = useLocalStorage<CompanyState>(COMPANY_KEY);
  // `draft` holds unsaved edits; until the user edits, show what's saved (or defaults).
  const [draft, setDraft] = useState<CompanyState | null>(null);
  const current: CompanyState = draft ?? {
    profile: { ...defaults.profile, ...stored?.profile },
    team: stored?.team ?? defaults.team,
    logo: stored?.logo ?? null,
    photos: stored?.photos ?? [],
  };
  const update = (patch: Partial<CompanyState>) => setDraft({ ...current, ...patch });
  const setProfile = (k: keyof CompanyState["profile"], v: string) =>
    update({ profile: { ...current.profile, [k]: v } });

  const [saved, setSaved] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invite, setInvite] = useState({ name: "", email: "", role: roles[1] });
  const [removing, setRemoving] = useState<string | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  const initials = current.profile.name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || employerCompany.logo;

  function save() {
    if (!current.profile.name.trim()) return toast("Company name can't be empty.", "error");
    const ok = write(current);
    setDraft(null);
    setSaved(true);
    toast(ok ? "Company profile saved." : "Saved for this session only — browser storage is full or blocked.", ok ? "success" : "info");
    setTimeout(() => setSaved(false), 2000);
  }

  function pickImage(e: React.ChangeEvent<HTMLInputElement>, kind: "logo" | "photo") {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp|svg\+xml)$/.test(file.type)) return toast("Use a PNG, JPG, WebP or SVG image.", "error");
    if (file.size > MAX_IMAGE_BYTES) return toast("Image must be under 5 MB.", "error");

    if (kind === "logo") {
      imageToDataUrl(file, { maxDim: 256, mime: "image/png", minDim: 256 })
        .then((url) => {
          update({ logo: url });
          toast('Logo updated. Click "Save changes" to keep it.', "info");
        })
        .catch((err: Error) => toast(err.message, "error"));
    } else {
      if (current.photos.length >= MAX_PHOTOS) return toast(`You can add up to ${MAX_PHOTOS} photos.`, "error");
      imageToDataUrl(file, { maxDim: 800, mime: "image/jpeg", quality: 0.75 })
        .then((url) => {
          update({ photos: [...current.photos, url] });
          toast('Photo added. Click "Save changes" to keep it.', "info");
        })
        .catch((err: Error) => toast(err.message, "error"));
    }
  }

  function sendInvite() {
    const email = invite.email.trim().toLowerCase();
    if (!invite.name.trim()) return toast("Enter the teammate's name.", "error");
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast("Enter a valid email address.", "error");
    if (current.team.some((m) => m.email.toLowerCase() === email)) return toast("That person is already on the team.", "error");
    update({ team: [...current.team, { name: invite.name.trim(), role: invite.role, email }] });
    setInvite({ name: "", email: "", role: roles[1] });
    setInviteOpen(false);
    toast(`Invite sent to ${email}. Click "Save changes" to keep the team list.`, "info");
  }

  const admins = current.team.filter((m) => m.role === "Admin");
  const isLastAdmin = (m: Member) => m.role === "Admin" && admins.length === 1;

  const renderLogo = (className: string) =>
    current.logo ? (
      <img src={current.logo} alt="Company logo" className={`${className} object-contain bg-white border border-border`} />
    ) : (
      <div className={`${className} bg-brand-50 text-brand-700 grid place-items-center font-display font-bold`}>{initials}</div>
    );

  return (
    <div>
      <PageHeader
        title="Company profile"
        subtitle="This is your public career page. Candidates see this before they apply."
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex items-center gap-4 mb-6">
              {renderLogo("h-16 w-16 rounded-2xl text-xl shrink-0")}
              <div>
                <input
                  ref={logoRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={(e) => pickImage(e, "logo")}
                  className="hidden"
                />
                <div className="flex items-center gap-4">
                  <button onClick={() => logoRef.current?.click()} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
                    <Upload size={14} /> {current.logo ? "Change logo" : "Upload logo"}
                  </button>
                  {current.logo && (
                    <button onClick={() => update({ logo: null })} className="text-sm font-semibold text-bad-500">
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted mt-1">PNG or SVG, at least 256×256px</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <TextField label="Company name" value={current.profile.name} onChange={(v) => setProfile("name", v)} />
              <div className="grid sm:grid-cols-2 gap-4">
                <TextField label="Industry" value={current.profile.industry} onChange={(v) => setProfile("industry", v)} />
                <TextField label="Company size" value={current.profile.size} onChange={(v) => setProfile("size", v)} />
                <TextField label="Website" value={current.profile.website} onChange={(v) => setProfile("website", v)} />
                <TextField label="Headquarters" value={current.profile.hq} onChange={(v) => setProfile("hq", v)} />
              </div>
              <div>
                <label className={labelCls}>About us</label>
                <textarea
                  rows={4}
                  value={current.profile.about}
                  onChange={(e) => setProfile("about", e.target.value)}
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-display font-semibold text-lg mb-1">Culture photos</h2>
            <p className="text-sm text-muted mb-4">Show candidates what it&apos;s like to work here.</p>
            <input
              ref={photoRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => pickImage(e, "photo")}
              className="hidden"
            />
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {current.photos.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                  <img src={src} alt={`Culture photo ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    onClick={() => update({ photos: current.photos.filter((_, j) => j !== i) })}
                    aria-label={`Remove photo ${i + 1}`}
                    className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/60 text-white grid place-items-center opacity-100 sm:opacity-0 group-hover:opacity-100 focus:opacity-100"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
              {current.photos.length < MAX_PHOTOS && (
                <button
                  onClick={() => photoRef.current?.click()}
                  aria-label="Add culture photo"
                  className="aspect-square rounded-xl border border-dashed border-border grid place-items-center text-muted hover:border-brand-400 hover:text-brand-600"
                >
                  <Upload size={18} />
                </button>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display font-semibold text-lg">Team members</h2>
                <p className="text-sm text-muted">People who can post jobs and view candidates for this company.</p>
              </div>
              <button onClick={() => setInviteOpen(true)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 shrink-0">
                <Plus size={15} /> Invite
              </button>
            </div>
            <div className="flex flex-col divide-y divide-border">
              {current.team.map((t) => (
                <div key={t.email} className="py-3 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-brand-50 text-brand-700 grid place-items-center text-xs font-semibold shrink-0">
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink truncate">{t.name}</p>
                    <p className="text-xs text-muted truncate">{t.email}</p>
                  </div>
                  <select
                    value={t.role}
                    onChange={(e) => {
                      if (t.role === "Admin" && e.target.value !== "Admin" && isLastAdmin(t)) {
                        return toast("Keep at least one Admin on the team.", "error");
                      }
                      update({ team: current.team.map((m) => (m.email === t.email ? { ...m, role: e.target.value } : m)) });
                    }}
                    aria-label={`Role for ${t.name}`}
                    className="text-xs rounded-lg border border-border bg-background px-2 py-1.5 outline-none shrink-0"
                  >
                    {roles.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setRemoving(t.email)}
                    disabled={isLastAdmin(t)}
                    title={isLastAdmin(t) ? "The last Admin can't be removed" : "Remove"}
                    aria-label={`Remove ${t.name}`}
                    className="text-muted hover:text-bad-500 shrink-0 disabled:opacity-30 disabled:hover:text-muted disabled:cursor-not-allowed"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={save} className="rounded-xl bg-brand-500 hover:bg-brand-600 text-ink-900 font-semibold px-5 py-2.5 text-sm">
              Save changes
            </button>
            {draft && !saved && <span className="text-xs text-muted">You have unsaved changes</span>}
            {saved && (
              <span className="text-sm text-good-500 font-medium flex items-center gap-1">
                <Check size={15} /> Saved
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex items-center gap-2 mb-1">
              <BadgeCheck size={18} className="text-brand-500" />
              <h2 className="font-display font-semibold">Verified employer</h2>
            </div>
            <p className="text-sm text-muted mb-4">KYC complete. Candidates see a verified badge on your listings.</p>
            <Badge tone="good">Verified · Domain checked</Badge>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-display font-semibold mb-3">Career page preview</h2>
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="h-16 bg-ink-900" />
              <div className="p-4 -mt-8">
                {renderLogo("h-12 w-12 rounded-xl border-2 !border-white")}
                <p className="font-semibold text-ink mt-2 text-sm">{current.profile.name}</p>
                <p className="text-xs text-muted">4 open roles · {current.profile.hq.split(",")[0]}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite a teammate"
        footer={
          <>
            <button onClick={() => setInviteOpen(false)} className="rounded-xl border border-border text-muted hover:text-ink px-4 py-2 text-sm font-medium">
              Cancel
            </button>
            <button onClick={sendInvite} className="rounded-xl bg-brand-500 hover:bg-brand-600 text-ink-900 font-semibold px-4 py-2 text-sm">
              Send invite
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <div>
            <label className={labelCls}>Full name</label>
            <input value={invite.name} onChange={(e) => setInvite((v) => ({ ...v, name: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Work email</label>
            <input type="email" value={invite.email} onChange={(e) => setInvite((v) => ({ ...v, email: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Role</label>
            <select value={invite.role} onChange={(e) => setInvite((v) => ({ ...v, role: e.target.value }))} className={inputCls}>
              {roles.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={removing !== null}
        onClose={() => setRemoving(null)}
        onConfirm={() => {
          const target = current.team.find((m) => m.email === removing);
          update({ team: current.team.filter((m) => m.email !== removing) });
          setRemoving(null);
          if (target) toast(`${target.name} removed. Click "Save changes" to keep this.`, "info");
        }}
        title="Remove team member?"
        message="They will no longer be able to post jobs or view candidates for this company."
        confirmLabel="Remove"
        danger
      />
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
    </div>
  );
}
