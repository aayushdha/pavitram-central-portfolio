"use client";

import { useState } from "react";
import { useLocalStorage } from "@/lib/use-local-storage";
import { PageHeader } from "@/components/ui/PageHeader";
import { ConfirmModal, inputCls } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/lib/auth-context";
import { Bell, Lock, Eye, Trash2, Check } from "lucide-react";

const tabs = ["Account", "Notifications", "Privacy", "Password"] as const;

const PREFS_KEY = "jobportal_seeker_prefs";
const SUPPORT_EMAIL = "support@jobconnect.com";

const defaultToggles: Record<string, boolean> = {
  "New job matches": true,
  "Application updates": true,
  Messages: true,
  "Weekly digest": false,
  "WhatsApp alerts": false,
  "Show my resume in search": true,
  "Open to work": true,
  "Show profile views": false,
};

export default function SeekerSettingsPage() {
  const toast = useToast();
  const { user, updateProfile } = useAuth();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Account");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Typed values win; otherwise fall back to the signed-in user / saved prefs.
  const [typedName, setName] = useState<string | null>(null);
  const [typedLocation, setLocation] = useState<string | null>(null);
  const name = typedName ?? user?.name ?? "";
  const location = typedLocation ?? [user?.city, user?.state].filter(Boolean).join(", ");

  type Prefs = { language: string; toggles: Record<string, boolean> };
  const [storedPrefs, writePrefs] = useLocalStorage<Prefs>(PREFS_KEY);
  const [draftPrefs, setDraftPrefs] = useState<Prefs | null>(null);
  const prefs: Prefs = draftPrefs ?? {
    language: storedPrefs?.language ?? "English",
    toggles: { ...defaultToggles, ...storedPrefs?.toggles },
  };
  const language = prefs.language;
  const toggles = prefs.toggles;
  const setLanguage = (language: string) => setDraftPrefs({ ...prefs, language });

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteText, setDeleteText] = useState("");

  async function save() {
    if (tab === "Password") {
      if (!pw.current) return toast("Enter your current password.", "error");
      if (pw.next.length < 8) return toast("New password must be at least 8 characters.", "error");
      if (pw.next !== pw.confirm) return toast("New passwords don't match.", "error");
      // The API has no change-password endpoint yet, so be upfront about it.
      toast("Password change isn't enabled on the server yet. Use \"Forgot password\" from support for now.", "info");
      return;
    }

    setSaving(true);
    try {
      if (!writePrefs(prefs)) throw new Error("Could not save preferences in this browser.");
      setDraftPrefs(null);

      if (tab === "Account" && user) {
        const [city, ...rest] = location.split(",").map((x) => x.trim()).filter(Boolean);
        const state = rest.join(", ");
        if (name.trim() !== (user.name || "") || (city ?? "") !== (user.city || "") || state !== (user.state || "")) {
          await updateProfile({ name: name.trim() || undefined, city: city || undefined, state: state || undefined });
        }
      }
      setSaved(true);
      toast("Settings saved.");
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not save settings.", "error");
    } finally {
      setSaving(false);
    }
  }

  function requestDeletion() {
    const subject = encodeURIComponent("Account deletion request");
    const body = encodeURIComponent(
      `Please delete my JobConnect account.\n\nEmail: ${user?.email ?? ""}\nUser ID: ${user?.id ?? ""}`
    );
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    setDeleteOpen(false);
    setDeleteText("");
    toast("Deletion request drafted. Send the email to confirm — you'll stay signed in until it's processed.", "info");
  }

  const setToggle = (label: string, v: boolean) => setDraftPrefs({ ...prefs, toggles: { ...toggles, [label]: v } });

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your account, notifications, and privacy." />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-56 shrink-0 flex lg:flex-col gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                tab === t ? "bg-brand-50 text-brand-700" : "text-muted hover:bg-surface"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 rounded-2xl border border-border bg-surface p-6 max-w-2xl">
          {tab === "Account" && (
            <div className="flex flex-col gap-4">
              <h2 className="font-display font-semibold text-lg mb-1">Account details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <TextField label="Full name" value={name} onChange={setName} />
                <TextField label="Email" value={user?.email ?? ""} readOnly />
                <TextField label="Phone" value={user?.phone ?? ""} readOnly />
                <TextField label="Location (City, State)" value={location} onChange={setLocation} />
              </div>
              <p className="text-xs text-muted -mt-1">Email and phone are tied to your login and can&apos;t be edited here.</p>
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Preferred language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full sm:w-64 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none"
                >
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Gujarati</option>
                </select>
              </div>
            </div>
          )}

          {tab === "Notifications" && (
            <div>
              <h2 className="font-display font-semibold text-lg mb-1 flex items-center gap-2">
                <Bell size={18} className="text-brand-600" /> Notifications
              </h2>
              <p className="text-sm text-muted mb-5">Choose what you want to be told about, and how.</p>
              <div className="flex flex-col divide-y divide-border">
                <ToggleRow label="New job matches" desc="Jobs that fit your profile" on={toggles["New job matches"]} onChange={(v) => setToggle("New job matches", v)} />
                <ToggleRow label="Application updates" desc="When a company changes your status" on={toggles["Application updates"]} onChange={(v) => setToggle("Application updates", v)} />
                <ToggleRow label="Messages" desc="New chats from recruiters" on={toggles["Messages"]} onChange={(v) => setToggle("Messages", v)} />
                <ToggleRow label="Weekly digest" desc="A summary email every Monday" on={toggles["Weekly digest"]} onChange={(v) => setToggle("Weekly digest", v)} />
                <ToggleRow label="WhatsApp alerts" desc="Get key updates on WhatsApp" on={toggles["WhatsApp alerts"]} onChange={(v) => setToggle("WhatsApp alerts", v)} />
              </div>
            </div>
          )}

          {tab === "Privacy" && (
            <div>
              <h2 className="font-display font-semibold text-lg mb-1 flex items-center gap-2">
                <Eye size={18} className="text-brand-600" /> Privacy
              </h2>
              <p className="text-sm text-muted mb-5">Control who can see your profile and resume.</p>
              <div className="flex flex-col divide-y divide-border">
                <ToggleRow label="Show my resume in search" desc="Recruiters can find you in resume search" on={toggles["Show my resume in search"]} onChange={(v) => setToggle("Show my resume in search", v)} />
                <ToggleRow label="Open to work" desc="Show recruiters only, not your current employer" on={toggles["Open to work"]} onChange={(v) => setToggle("Open to work", v)} />
                <ToggleRow label="Show profile views" desc="Let people know you viewed their profile" on={toggles["Show profile views"]} onChange={(v) => setToggle("Show profile views", v)} />
              </div>
              <div className="mt-6 pt-5 border-t border-border">
                <p className="text-sm font-semibold text-bad-500 flex items-center gap-2 mb-1">
                  <Trash2 size={15} /> Delete account
                </p>
                <p className="text-xs text-muted mb-3">This removes your profile, resume, and applications. This can&apos;t be undone.</p>
                <button onClick={() => setDeleteOpen(true)} className="text-sm font-semibold text-bad-500 border border-bad-500/30 rounded-xl px-4 py-2">
                  Delete my account
                </button>
              </div>
            </div>
          )}

          {tab === "Password" && (
            <div className="flex flex-col gap-4 max-w-sm">
              <h2 className="font-display font-semibold text-lg mb-1 flex items-center gap-2">
                <Lock size={18} className="text-brand-600" /> Change password
              </h2>
              <TextField label="Current password" type="password" value={pw.current} onChange={(v) => setPw((p) => ({ ...p, current: v }))} />
              <TextField label="New password" type="password" value={pw.next} onChange={(v) => setPw((p) => ({ ...p, next: v }))} />
              <TextField label="Confirm new password" type="password" value={pw.confirm} onChange={(v) => setPw((p) => ({ ...p, confirm: v }))} />
            </div>
          )}

          <div className="flex items-center gap-3 mt-8 pt-5 border-t border-border">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-xl bg-brand-500 hover:bg-brand-600 text-ink-900 font-semibold px-5 py-2.5 text-sm disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            {saved && (
              <span className="text-sm text-good-500 font-medium flex items-center gap-1">
                <Check size={15} /> Saved
              </span>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteText("");
        }}
        onConfirm={requestDeletion}
        title="Delete your account?"
        message="This removes your profile, resume, and applications. Type DELETE to confirm — we'll draft the request email to support."
        confirmLabel="Request deletion"
        danger
        confirmDisabled={deleteText !== "DELETE"}
      >
        <input
          value={deleteText}
          onChange={(e) => setDeleteText(e.target.value)}
          placeholder="Type DELETE"
          className={`${inputCls} mt-4`}
        />
      </ConfirmModal>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  readOnly = false,
  type = "text",
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full rounded-xl border border-border px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 ${
          readOnly ? "bg-surface text-muted cursor-not-allowed" : "bg-background"
        }`}
      />
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  on,
  onChange,
}: {
  label: string;
  desc: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3.5">
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="text-xs text-muted">{desc}</p>
      </div>
      <button
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => onChange(!on)}
        className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${on ? "bg-brand-500" : "bg-border"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            on ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
