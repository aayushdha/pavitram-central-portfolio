"use client";

import { useState } from "react";
import { Plus, Bell, X } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { seekerNav } from "@/lib/nav-config";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/FormField";
import { LoadingRow, ErrorRow } from "@/components/ui/DataState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useApiData } from "@/lib/hooks/useApiData";
import { savedSearchesApi } from "@/lib/api/saved-searches";

function describeFilters(filters: Record<string, unknown>): string {
  const parts = Object.entries(filters)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k}: ${v}`);
  return parts.length ? parts.join(" · ") : "All properties";
}

export default function SeekerSavedSearchesPage() {
  const { data, loading, error, reload, setData } = useApiData(() => savedSearchesApi.list());
  const searches = data?.savedSearches ?? [];
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await savedSearchesApi.create({
        name: name.trim(),
        filters: city.trim() ? { city: city.trim() } : {},
        alertsEnabled: true,
      });
      setData({ savedSearches: [res.savedSearch, ...searches] });
      setName("");
      setCity("");
      setShowForm(false);
    } catch {
      alert("Could not save this search. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  async function handleRemove(id: string) {
    const prev = searches;
    setData({ savedSearches: searches.filter((s) => s.id !== id) });
    try {
      await savedSearchesApi.remove(id);
    } catch {
      setData({ savedSearches: prev });
      alert("Could not remove this saved search. Please try again.");
    }
  }

  return (
    <DashboardShell
      groups={seekerNav}
      pageTitle="Saved searches"
      pageSubtitle="Get notified the moment a matching listing appears"
    >
      <div className="mb-5 flex justify-end gap-2">
        <Button href="/properties" variant="outline" size="sm">Browse properties</Button>
        <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setShowForm((s) => !s)}>
          New search
        </Button>
      </div>

      {showForm && (
        <Card className="mb-5">
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <TextInput placeholder="Name this search, e.g. '3BHK in Bodakdev'" value={name} onChange={(e) => setName(e.target.value)} />
            <TextInput placeholder="City (optional)" value={city} onChange={(e) => setCity(e.target.value)} />
            <Button variant="primary" size="md" onClick={handleCreate} disabled={creating || !name.trim()}>
              {creating ? "Saving…" : "Save"}
            </Button>
          </div>
        </Card>
      )}

      {loading && <LoadingRow label="Loading your saved searches…" />}
      {error && <ErrorRow message={error} onRetry={reload} />}

      {!loading && !error && (
        searches.length === 0 ? (
          <EmptyState title="No saved searches yet" description="Save a search from the properties page to get alerted about new matches." />
        ) : (
          <div className="space-y-4">
            {searches.map((s) => (
              <Card key={s.id}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-ink-900">{s.name}</p>
                    <p className="mt-1 text-xs text-text-500">{describeFilters(s.filters)}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-text-500">
                      <Bell size={12} /> {s.alertsEnabled ? "Alerts on" : "Alerts off"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="neutral">Saved {new Date(s.createdAt).toLocaleDateString("en-IN")}</Badge>
                    <Button href="/properties" variant="outline" size="sm">View results</Button>
                    <Button variant="ghost" size="sm" icon={<X size={13} />} onClick={() => handleRemove(s.id)}>
                      Remove
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      )}
    </DashboardShell>
  );
}
