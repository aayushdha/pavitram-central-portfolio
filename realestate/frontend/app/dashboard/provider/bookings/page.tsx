"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { providerNav } from "@/lib/nav-config";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { LoadingRow, ErrorRow } from "@/components/ui/DataState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useApiData } from "@/lib/hooks/useApiData";
import { serviceBookingsApi } from "@/lib/api/service-bookings";
import { formatINR } from "@/lib/api/format";
import { ServiceBooking, ServiceBookingStatus } from "@/lib/api/domain-types";

const statusVariant: Record<ServiceBookingStatus, "info" | "warning" | "success" | "neutral"> = {
  NEW: "info",
  ACCEPTED: "warning",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
  CANCELLED: "neutral",
};
const statusLabel: Record<ServiceBookingStatus, string> = {
  NEW: "New",
  ACCEPTED: "Accepted",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};
const nextStatus: Partial<Record<ServiceBookingStatus, { next: ServiceBookingStatus; label: string }>> = {
  NEW: { next: "ACCEPTED", label: "Accept" },
  ACCEPTED: { next: "IN_PROGRESS", label: "Start job" },
  IN_PROGRESS: { next: "COMPLETED", label: "Mark complete" },
};

export default function ProviderBookingsPage() {
  const { data, loading, error, reload, setData } = useApiData(() => serviceBookingsApi.mineAsProvider());
  const bookings = data?.bookings ?? [];
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function advance(b: ServiceBooking) {
    const action = nextStatus[b.status];
    if (!action) return;
    setUpdatingId(b.id);
    try {
      const res = await serviceBookingsApi.update(b.id, action.next);
      setData({ bookings: bookings.map((x) => (x.id === b.id ? res.booking : x)) });
    } catch {
      alert("Could not update this booking. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  }

  const cols: Column<ServiceBooking>[] = [
    { header: "Booking", accessor: (r) => <span className="font-mono text-xs">{r.id.slice(0, 8)}</span> },
    { header: "Customer", accessor: (r) => <span className="font-medium text-ink-900">{r.customer?.name ?? "Customer"}</span> },
    { header: "Service", accessor: (r) => r.serviceName },
    { header: "Scheduled", accessor: (r) => new Date(r.scheduledAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) },
    { header: "Amount", accessor: (r) => formatINR(r.amount), align: "right" },
    { header: "Status", accessor: (r) => <Badge variant={statusVariant[r.status]}>{statusLabel[r.status]}</Badge> },
    {
      header: "Actions",
      accessor: (r) => {
        const action = nextStatus[r.status];
        return (
          <div className="flex justify-end gap-2">
            {action && (
              <Button variant="primary" size="sm" disabled={updatingId === r.id} onClick={() => advance(r)}>
                {updatingId === r.id ? "Updating…" : action.label}
              </Button>
            )}
            {r.status === "COMPLETED" && <Badge variant="success">Paid</Badge>}
          </div>
        );
      },
      align: "right",
    },
  ];

  const counts: Record<ServiceBookingStatus, number> = {
    NEW: bookings.filter((b) => b.status === "NEW").length,
    ACCEPTED: bookings.filter((b) => b.status === "ACCEPTED").length,
    IN_PROGRESS: bookings.filter((b) => b.status === "IN_PROGRESS").length,
    COMPLETED: bookings.filter((b) => b.status === "COMPLETED").length,
    CANCELLED: bookings.filter((b) => b.status === "CANCELLED").length,
  };

  return (
    <DashboardShell
      groups={providerNav}
      roleColor="info"
      pageTitle="Bookings"
      pageSubtitle="New → Accepted → In Progress → Completed"
    >
      {loading && <LoadingRow label="Loading your bookings…" />}
      {error && <ErrorRow message={error} onRetry={reload} />}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {(["NEW", "ACCEPTED", "IN_PROGRESS", "COMPLETED"] as ServiceBookingStatus[]).map((s) => (
              <Card key={s}>
                <p className="text-sm text-text-600">{statusLabel[s]}</p>
                <p className="mt-2 font-display text-2xl font-medium text-ink-900">{counts[s]}</p>
              </Card>
            ))}
          </div>

          <Card className="mt-6" padded={false}>
            <div className="p-5 pb-0 sm:p-6 sm:pb-0">
              <CardHeader title="All bookings" />
            </div>
            <div className="px-5 pb-5 sm:px-6 sm:pb-6">
              {bookings.length ? (
                <DataTable columns={cols} data={bookings} keyField={(r) => r.id} />
              ) : (
                <EmptyState title="No bookings yet" description="Bookings from seekers will show up here once your profile is live." />
              )}
            </div>
          </Card>
        </>
      )}
    </DashboardShell>
  );
}
