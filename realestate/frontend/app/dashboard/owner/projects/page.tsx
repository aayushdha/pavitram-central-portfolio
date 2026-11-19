"use client";

import { Plus, MapPin, Trash2 } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ownerNav } from "@/lib/nav-config";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SegmentedBar } from "@/components/ui/ProgressBar";
import { LoadingRow, ErrorRow } from "@/components/ui/DataState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useApiData } from "@/lib/hooks/useApiData";
import { projectsApi } from "@/lib/api/projects";

export default function OwnerProjectsPage() {
  const { data, loading, error, reload, setData } = useApiData(() => projectsApi.mine());
  const projects = data?.projects ?? [];

  async function handleDelete(id: string) {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    try {
      await projectsApi.remove(id);
      setData((prev) => (prev ? { projects: prev.projects.filter((p) => p.id !== id) } : prev));
    } catch {
      alert("Could not delete this project. Please try again.");
    }
  }

  return (
    <DashboardShell
      groups={ownerNav}
      roleColor="brass"
      pageTitle="Builder projects"
      pageSubtitle="Manage project pages, units, and updates"
    >
      <div className="mb-5 flex justify-end">
        <Button href="/dashboard/owner/projects/new" variant="primary" size="sm" icon={<Plus size={14} />}>New project</Button>
      </div>

      {loading && <LoadingRow label="Loading your projects…" />}
      {error && <ErrorRow message={error} onRetry={reload} />}

      {!loading && !error && (
        projects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            description="Launch your first project microsite — master plan, unit inventory, amenities and more."
            action={<Button href="/dashboard/owner/projects/new" variant="primary" size="sm">New project</Button>}
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {projects.map((p) => {
              const available = p.units?.reduce((sum, u) => sum + (u.unitsAvailable ?? 0), 0) ?? 0;
              const takenUp = Math.max(p.totalUnits - available, 0);
              return (
                <Card key={p.id}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-lg font-medium text-ink-900">{p.name}</h3>
                      <p className="mt-1 flex items-center gap-1 text-xs text-text-500">
                        <MapPin size={12} /> {p.city} · {p.towers} towers · {p.totalUnits} units
                      </p>
                    </div>
                    <Badge variant={p.reraVerified ? "verified" : "warning"}>
                      {p.reraVerified ? "RERA Verified" : "RERA Pending"}
                    </Badge>
                  </div>

                  <p className="mt-3 font-mono text-xs text-text-400">{p.rera ?? "No RERA number added"}</p>

                  <div className="mt-2">
                    <Badge variant={p.moderationStatus === "APPROVED" ? "success" : p.moderationStatus === "PENDING_REVIEW" ? "warning" : "neutral"}>
                      {p.moderationStatus === "APPROVED" ? "Live" : p.moderationStatus === "PENDING_REVIEW" ? "Under review" : p.moderationStatus}
                    </Badge>
                  </div>

                  {p.totalUnits > 0 && (
                    <div className="mt-5">
                      <p className="mb-2 text-xs font-medium text-text-600">Unit inventory</p>
                      <SegmentedBar
                        segments={[
                          { value: available, color: "#C9A227", label: "Available" },
                          { value: takenUp, color: "#1A2238", label: "Booked / Sold" },
                        ]}
                      />
                    </div>
                  )}

                  <div className="mt-5 flex gap-2 border-t border-stone-100 pt-4">
                    <Button href={`/dashboard/owner/projects/new?edit=${p.id}`} variant="outline" size="sm" className="flex-1">Edit project</Button>
                    <Button variant="ghost" size="sm" className="flex-1 text-danger-600" icon={<Trash2 size={13} />} onClick={() => handleDelete(p.id)}>Delete</Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      )}

      <Card className="mt-6">
        <p className="font-medium text-ink-900">Construction status updates</p>
        <p className="mt-1 text-sm text-text-600">
          Periodic progress photos and videos post directly to each project&apos;s microsite and
          notify interested seekers and existing bookers automatically.
        </p>
      </Card>
    </DashboardShell>
  );
}
