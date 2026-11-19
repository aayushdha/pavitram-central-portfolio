"use client";

import { useState } from "react";
import { Plus, Upload, Trash2, Pencil } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ownerNav } from "@/lib/nav-config";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { LoadingRow, ErrorRow } from "@/components/ui/DataState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useApiData } from "@/lib/hooks/useApiData";
import { propertiesApi } from "@/lib/api/properties";
import { Property } from "@/lib/api/domain-types";

const statusVariant: Record<Property["status"], "success" | "warning" | "neutral" | "danger"> = {
  APPROVED: "success",
  PENDING_REVIEW: "warning",
  FLAGGED: "warning",
  REJECTED: "danger",
};
const statusLabel: Record<Property["status"], string> = {
  APPROVED: "Live",
  PENDING_REVIEW: "Under Review",
  FLAGGED: "Flagged",
  REJECTED: "Rejected",
};

export default function OwnerListingsPage() {
  const { data, loading, error, reload, setData } = useApiData(() => propertiesApi.mine());
  const properties = data?.properties ?? [];
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await propertiesApi.remove(id);
      setData((prev) => (prev ? { properties: prev.properties.filter((p) => p.id !== id) } : prev));
    } catch {
      alert("Could not delete this listing. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  const cols: Column<Property>[] = [
    {
      header: "Listing",
      accessor: (r) => (
        <div>
          <p className="font-medium text-ink-900">{r.title}</p>
          <p className="font-mono text-xs text-text-400">{r.id}</p>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (r) => <Badge variant={statusVariant[r.status]}>{statusLabel[r.status]}</Badge>,
    },
    { header: "Views", accessor: (r) => r.views, align: "center" },
    { header: "Shortlists", accessor: (r) => r.shortlists, align: "center" },
    { header: "Inquiries", accessor: (r) => r.inquiries, align: "center" },
    {
      header: "Actions",
      accessor: (r) => (
        <div className="flex justify-end gap-2">
          <Button href={`/dashboard/owner/listings/new?edit=${r.id}`} variant="outline" size="sm" icon={<Pencil size={12} />}>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash2 size={12} />}
            disabled={deletingId === r.id}
            onClick={() => handleDelete(r.id)}
          >
            {deletingId === r.id ? "Deleting…" : "Delete"}
          </Button>
        </div>
      ),
      align: "right",
    },
  ];

  const live = properties.filter((p) => p.status === "APPROVED").length;
  const pending = properties.filter((p) => p.status === "PENDING_REVIEW").length;
  const other = properties.length - live - pending;

  return (
    <DashboardShell
      groups={ownerNav}
      roleColor="brass"
      pageTitle="My listings"
      pageSubtitle="Create, manage and boost your property listings"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-text-600">
          {properties.length} listings · {live} live, {pending} under review{other ? `, ${other} other` : ""}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={<Upload size={14} />} disabled title="Bulk CSV upload — coming soon">
            Bulk upload (CSV)
          </Button>
          <Button href="/dashboard/owner/listings/new" variant="primary" size="sm" icon={<Plus size={14} />}>
            New listing
          </Button>
        </div>
      </div>

      {loading && <LoadingRow label="Loading your listings…" />}
      {error && <ErrorRow message={error} onRetry={reload} />}

      {!loading && !error && (
        <Card padded={false}>
          <div className="p-5 pb-5 sm:p-6">
            {properties.length ? (
              <DataTable columns={cols} data={properties} keyField={(r) => r.id} />
            ) : (
              <EmptyState
                title="No listings yet"
                description="Post your first property — it goes live once our moderation team approves it."
                action={<Button href="/dashboard/owner/listings/new" variant="primary" size="sm">Post a property</Button>}
              />
            )}
          </div>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader eyebrow="Listing builder" title="Rich listing fields, in one flow" />
        <div className="grid gap-3 text-sm text-text-600 sm:grid-cols-2">
          <p>· Property type, BHK, carpet / built-up / super built-up area</p>
          <p>· Buy, rent & PG-specific fields (deposit, lease term, sharing type)</p>
          <p>· Photos, videos & optional 3D walkthrough for premium listings</p>
          <p>· Save as a reusable template for recurring listing types</p>
        </div>
      </Card>
    </DashboardShell>
  );
}
