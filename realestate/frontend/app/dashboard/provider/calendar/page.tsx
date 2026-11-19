"use client";

import { useState } from "react";
import { MapPin, Info } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { providerNav } from "@/lib/nav-config";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, Select } from "@/components/ui/FormField";
import { LoadingRow, ErrorRow } from "@/components/ui/DataState";
import { useApiData } from "@/lib/hooks/useApiData";
import { providersApi } from "@/lib/api/providers";
import { ServiceCategory } from "@/lib/api/domain-types";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = ["9 AM", "11 AM", "1 PM", "3 PM", "5 PM", "7 PM"];
const categories: { value: ServiceCategory; label: string }[] = [
  { value: "MATERIAL_SUPPLIERS", label: "Material Suppliers" },
  { value: "LEGAL_SERVICES", label: "Legal Services" },
  { value: "HOME_SERVICES", label: "Home Services" },
  { value: "FINANCE_LOANS", label: "Finance & Loans" },
];

export default function ProviderCalendarPage() {
  const { data, loading, error, reload, setData } = useApiData(() => providersApi.mine());
  const profile = data?.profile ?? null;
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ displayName: "", category: "HOME_SERVICES" as ServiceCategory, specialty: "", city: "", priceFrom: "" });
  const [saving, setSaving] = useState(false);

  function startEdit() {
    setForm({
      displayName: profile?.displayName ?? "",
      category: profile?.category ?? "HOME_SERVICES",
      specialty: profile?.specialty ?? "",
      city: profile?.city ?? "",
      priceFrom: profile?.priceFrom ?? "",
    });
    setEditing(true);
  }

  async function saveProfile() {
    if (!form.displayName.trim() || !form.city.trim()) {
      alert("Business name and city are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await providersApi.upsertMine({
        displayName: form.displayName.trim(),
        category: form.category,
        specialty: form.specialty.trim() || undefined,
        city: form.city.trim(),
        priceFrom: form.priceFrom.trim() || undefined,
      });
      setData({ profile: res.profile });
      setEditing(false);
    } catch {
      alert("Could not save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function toggle(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <DashboardShell
      groups={providerNav}
      roleColor="info"
      pageTitle="Profile & availability"
      pageSubtitle="Business details, working hours & service area"
    >
      {loading && <LoadingRow label="Loading your profile…" />}
      {error && <ErrorRow message={error} onRetry={reload} />}

      {!loading && !error && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2" padded={false}>
            <div className="p-5 pb-0 sm:p-6 sm:pb-0">
              <CardHeader
                eyebrow="This week"
                title="Availability grid"
                subtitle="Tap a slot to mark yourself available for bookings (visual preview — not saved to the backend yet)"
              />
            </div>
            <div className="overflow-x-auto p-5 pt-0 sm:p-6 sm:pt-0">
              <table className="w-full min-w-max border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="w-16 py-2 text-left text-xs text-text-400"> </th>
                    {days.map((d) => (
                      <th key={d} className="px-1.5 py-2 text-center text-xs font-medium text-text-500">{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {hours.map((h) => (
                    <tr key={h}>
                      <td className="py-1 pr-2 text-xs text-text-400">{h}</td>
                      {days.map((d) => {
                        const key = `${d}-${h}`;
                        const isSelected = selected.has(key);
                        return (
                          <td key={key} className="p-1">
                            <button
                              onClick={() => toggle(key)}
                              className={`h-8 w-full rounded-md text-[10px] font-medium transition-colors ${
                                isSelected ? "bg-brand-600 text-white" : "bg-stone-50 text-text-400 hover:bg-brand-100"
                              }`}
                            >
                              {isSelected ? "Open" : ""}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-info-100/30 p-3 text-xs text-text-600">
                <Info size={13} className="mt-0.5 shrink-0 text-info-600" />
                Working-hours storage isn&apos;t modeled on the backend yet — this grid is a visual preview.
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader eyebrow="Marketplace" title="Business profile" />
            {editing ? (
              <div className="space-y-3">
                <Field label="Business name">
                  <TextInput value={form.displayName} onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))} />
                </Field>
                <Field label="Category">
                  <Select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ServiceCategory }))}>
                    {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </Select>
                </Field>
                <Field label="Specialty">
                  <TextInput value={form.specialty} onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))} placeholder="e.g. Electrical & Plumbing" />
                </Field>
                <Field label="City">
                  <TextInput value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} placeholder="Ahmedabad" />
                </Field>
                <Field label="Starting price" hint="Free text, e.g. ₹499">
                  <TextInput value={form.priceFrom} onChange={(e) => setForm((f) => ({ ...f, priceFrom: e.target.value }))} />
                </Field>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" className="flex-1" onClick={saveProfile} disabled={saving}>
                    {saving ? "Saving…" : "Save"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
                </div>
              </div>
            ) : profile ? (
              <div className="space-y-2">
                <li className="flex items-center justify-between rounded-xl border border-stone-200 p-3">
                  <span className="flex items-center gap-2 text-sm text-text-700">
                    <MapPin size={13} className="text-brand-600" /> {profile.city}
                  </span>
                  <Badge variant={profile.verified ? "verified" : "warning"}>{profile.verified ? "Verified" : "Pending"}</Badge>
                </li>
                <p className="px-1 text-sm text-text-600">
                  <span className="font-medium text-ink-900">{profile.displayName}</span> · {profile.category.replace("_", " ")}
                  {profile.specialty ? ` · ${profile.specialty}` : ""}
                </p>
                <Button variant="outline" size="sm" className="mt-3 w-full" onClick={startEdit}>Edit profile</Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-text-500">You haven&apos;t set up a provider profile yet.</p>
                <Button variant="primary" size="sm" className="w-full" onClick={startEdit}>Set up profile</Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </DashboardShell>
  );
}
