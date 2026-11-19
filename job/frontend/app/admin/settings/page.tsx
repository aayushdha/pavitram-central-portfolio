"use client";

import { useState } from "react";
import { useLocalStorage } from "@/lib/use-local-storage";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Modal, ConfirmModal, inputCls, labelCls } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { Check, Plus, Trash2 } from "lucide-react";

const tabs = ["Platform", "Team & roles", "Fraud rules"] as const;

const adminTeam = [
  { name: "Priya Nair", role: "Super Admin", email: "priya@jobconnect.com" },
  { name: "Arjun Malhotra", role: "Moderator", email: "arjun@jobconnect.com" },
  { name: "Divya Krishnan", role: "Support Lead", email: "divya@jobconnect.com" },
];

const adminRoles = ["Super Admin", "Moderator", "Support Lead"] as const;

const fraudRuleList = [
  "Flag postings that ask for upfront payment",
  "Flag postings with salary claims over ₹1L/week",
  "Flag postings where email domain doesn't match company",
  "Flag duplicate postings from the same employer",
];

const SETTINGS_KEY = "jobportal_admin_settings";

const defaultSettings = {
  platformName: "Pavitram JobConnect",
  supportEmail: "support@jobconnect.com",
  expiry: "15 days",
  requireKyc: true,
  autoFlagSalary: true,
  rules: Object.fromEntries(fraudRuleList.map((r) => [r, true])) as Record<string, boolean>,
};

export default function AdminSettingsPage() {
  const toast = useToast();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Platform");
  const [saved, setSaved] = useState(false);
  type Stored = { settings: typeof defaultSettings; team: typeof adminTeam };
  const [stored, writeStored] = useLocalStorage<Stored>(SETTINGS_KEY);
  // `draft` holds unsaved edits; until the user edits, we show what's saved (or defaults).
  const [draft, setDraft] = useState<Stored | null>(null);
  const current: Stored = draft ?? {
    settings: { ...defaultSettings, ...stored?.settings },
    team: stored?.team ?? adminTeam,
  };
  const settings = current.settings;
  const team = current.team;
  const setSettings = (fn: (v: typeof defaultSettings) => typeof defaultSettings) =>
    setDraft({ ...current, settings: fn(current.settings) });
  const setTeam = (fn: (t: typeof adminTeam) => typeof adminTeam) =>
    setDraft({ ...current, team: fn(current.team) });

  const [inviteOpen, setInviteOpen] = useState(false);
  const [invite, setInvite] = useState({ name: "", email: "", role: adminRoles[1] as string });
  const [removing, setRemoving] = useState<string | null>(null);

  function save() {
    if (!writeStored(current)) {
      toast("Could not save settings in this browser.", "error");
      return;
    }
    setDraft(null);
    setSaved(true);
    toast("Settings saved.");
    setTimeout(() => setSaved(false), 2000);
  }

  function sendInvite() {
    const email = invite.email.trim().toLowerCase();
    if (!invite.name.trim()) return toast("Enter the admin's name.", "error");
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast("Enter a valid email address.", "error");
    if (team.some((a) => a.email.toLowerCase() === email)) return toast("That person is already on the team.", "error");
    setTeam((t) => [...t, { name: invite.name.trim(), role: invite.role, email }]);
    setInvite({ name: "", email: "", role: adminRoles[1] });
    setInviteOpen(false);
    toast(`Invite sent to ${email}. Click "Save changes" to keep the team list.`, "info");
  }

  function confirmRemove() {
    const target = team.find((a) => a.email === removing);
    setTeam((t) => t.filter((a) => a.email !== removing));
    setRemoving(null);
    if (target) toast(`${target.name} removed from the admin team.`);
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Platform-wide settings, admin roles, and fraud rules." />

      <div className="flex items-center gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-sm font-medium px-3.5 py-1.5 rounded-full border transition-colors ${
              tab === t ? "bg-ink-900 text-white border-ink-900" : "border-border text-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Platform" && (
        <div className="rounded-2xl border border-border bg-surface p-6 max-w-xl flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Platform name</label>
            <input value={settings.platformName} onChange={(e) => setSettings((v) => ({ ...v, platformName: e.target.value }))} className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Support email</label>
            <input value={settings.supportEmail} onChange={(e) => setSettings((v) => ({ ...v, supportEmail: e.target.value }))} className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Default job posting expiry</label>
            <select value={settings.expiry} onChange={(e) => setSettings((v) => ({ ...v, expiry: e.target.value }))} className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none">
              <option>15 days</option>
              <option>30 days</option>
              <option>45 days</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={settings.requireKyc} onChange={(e) => setSettings((v) => ({ ...v, requireKyc: e.target.checked }))} className="accent-[var(--brand-500)]" /> Require employer KYC before posting jobs
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={settings.autoFlagSalary} onChange={(e) => setSettings((v) => ({ ...v, autoFlagSalary: e.target.checked }))} className="accent-[var(--brand-500)]" /> Auto-flag jobs with salary above ₹1L/week
          </label>
        </div>
      )}

      {tab === "Team & roles" && (
        <div className="rounded-2xl border border-border bg-surface p-6 max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg">Admin team</h2>
            <button onClick={() => setInviteOpen(true)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
              <Plus size={15} /> Invite admin
            </button>
          </div>
          <div className="flex flex-col divide-y divide-border">
            {team.map((a) => (
              <div key={a.email} className="py-3 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-brand-50 text-brand-700 grid place-items-center text-xs font-semibold shrink-0">
                  {a.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink truncate">{a.name}</p>
                  <p className="text-xs text-muted truncate">{a.email}</p>
                </div>
                <Badge tone="brand">{a.role}</Badge>
                <button
                  onClick={() => setRemoving(a.email)}
                  disabled={a.role === "Super Admin" && team.filter((x) => x.role === "Super Admin").length === 1}
                  title={a.role === "Super Admin" && team.filter((x) => x.role === "Super Admin").length === 1 ? "The last Super Admin can't be removed" : "Remove"}
                  aria-label={`Remove ${a.name}`}
                  className="text-muted hover:text-bad-500 shrink-0 disabled:opacity-30 disabled:hover:text-muted disabled:cursor-not-allowed"
                ><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "Fraud rules" && (
        <div className="rounded-2xl border border-border bg-surface p-6 max-w-xl flex flex-col gap-3">
          {fraudRuleList.map((rule) => (
            <label key={rule} className="flex items-center gap-2 text-sm text-ink p-3 rounded-xl bg-background">
              <input
                type="checkbox"
                checked={settings.rules[rule] ?? true}
                onChange={(e) => setSettings((v) => ({ ...v, rules: { ...v.rules, [rule]: e.target.checked } }))}
                className="accent-[var(--brand-500)]"
              />{" "}
              {rule}
            </label>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 mt-6">
        <button onClick={save} className="rounded-xl bg-brand-500 hover:bg-brand-600 text-ink-900 font-semibold px-5 py-2.5 text-sm">
          Save changes
        </button>
        {saved && <span className="text-sm text-good-500 font-medium flex items-center gap-1"><Check size={15} /> Saved</span>}
      </div>

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite admin"
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
            <label className={labelCls}>Email</label>
            <input type="email" value={invite.email} onChange={(e) => setInvite((v) => ({ ...v, email: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Role</label>
            <select value={invite.role} onChange={(e) => setInvite((v) => ({ ...v, role: e.target.value }))} className={inputCls}>
              {adminRoles.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={removing !== null}
        onClose={() => setRemoving(null)}
        onConfirm={confirmRemove}
        title="Remove admin?"
        message="They will lose access to the admin console."
        confirmLabel="Remove"
        danger
      />
    </div>
  );
}
