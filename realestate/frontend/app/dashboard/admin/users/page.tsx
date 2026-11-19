"use client";

import { useState } from "react";
import { CheckCircle2, Clock, XCircle, PauseCircle, Search } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { adminNav } from "@/lib/nav-config";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { DataTable, Column } from "@/components/ui/DataTable";
import { LoadingRow, ErrorRow } from "@/components/ui/DataState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useApiData } from "@/lib/hooks/useApiData";
import { adminApi } from "@/lib/api/admin";
import { KycDocument, LocalUser } from "@/lib/api/domain-types";

const kycBadge: Record<string, { variant: "verified" | "warning" | "danger"; icon: typeof CheckCircle2 }> = {
  VERIFIED: { variant: "verified", icon: CheckCircle2 },
  PENDING: { variant: "warning", icon: Clock },
  ON_HOLD: { variant: "warning", icon: PauseCircle },
  REJECTED: { variant: "danger", icon: XCircle },
};

async function loadUsersAndKyc() {
  const [usersRes, kycRes] = await Promise.all([adminApi.users(), adminApi.pendingKyc()]);
  return { users: usersRes.users, kycDocuments: kycRes.documents };
}

export default function AdminUsersPage() {
  const { data, loading, error, reload, setData } = useApiData(loadUsersAndKyc);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const users = data?.users ?? [];
  const kycDocuments = data?.kycDocuments ?? [];

  const filtered = users.filter(
    (u) =>
      !query ||
      u.name?.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase()),
  );
  const seekers = filtered.filter((u) => u.roles.length === 1 && u.roles[0] === "SEEKER");
  const ownerAgents = filtered.filter((u) => u.roles.includes("OWNER"));

  async function toggleActive(u: LocalUser) {
    setBusyId(u.id);
    try {
      const res = u.isActive ? await adminApi.deactivateUser(u.id) : await adminApi.activateUser(u.id);
      setData((prev) => (prev ? { ...prev, users: prev.users.map((x) => (x.id === u.id ? res.user : x)) } : prev));
    } catch {
      alert("Could not update this account. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function reviewKyc(doc: KycDocument, status: "VERIFIED" | "ON_HOLD" | "REJECTED") {
    setBusyId(doc.id);
    try {
      await adminApi.reviewKyc(doc.id, status);
      setData((prev) => (prev ? { ...prev, kycDocuments: prev.kycDocuments.filter((d) => d.id !== doc.id) } : prev));
      reload();
    } catch {
      alert("Could not review this document. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  const seekerCols: Column<LocalUser>[] = [
    { header: "Seeker", accessor: (r) => <span className="font-medium text-ink-900">{r.name ?? "—"}</span> },
    { header: "Email", accessor: (r) => r.email },
    { header: "City", accessor: (r) => r.city ?? "—" },
    { header: "Joined", accessor: (r) => new Date(r.createdAt).toLocaleDateString("en-IN") },
    { header: "Status", accessor: (r) => <Badge variant={r.isActive ? "success" : "danger"}>{r.isActive ? "Active" : "Suspended"}</Badge> },
    {
      header: "Actions",
      accessor: (r) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" disabled={busyId === r.id} onClick={() => toggleActive(r)}>
            {busyId === r.id ? "…" : r.isActive ? "Suspend" : "Reactivate"}
          </Button>
        </div>
      ),
      align: "right",
    },
  ];

  const oaCols: Column<LocalUser>[] = [
    {
      header: "Name",
      accessor: (r) => (
        <div>
          <p className="font-medium text-ink-900">{r.name ?? "—"}</p>
          {r.businessName && <p className="text-xs text-text-400">{r.businessName}</p>}
        </div>
      ),
    },
    { header: "Type", accessor: (r) => <Badge variant="neutral">{r.ownerType ?? "OWNER"}</Badge> },
    { header: "City", accessor: (r) => r.city ?? "—" },
    { header: "RERA #", accessor: (r) => (r.reraNumber ? <span className="font-mono text-xs">{r.reraNumber}</span> : "—") },
    {
      header: "KYC",
      accessor: (r) => {
        const cfg = kycBadge[r.kycStatus] ?? kycBadge.PENDING;
        return <Badge variant={cfg.variant}><cfg.icon size={11} /> {r.kycStatus}</Badge>;
      },
    },
    {
      header: "Account",
      accessor: (r) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" disabled={busyId === r.id} onClick={() => toggleActive(r)}>
            {busyId === r.id ? "…" : r.isActive ? "Suspend" : "Reactivate"}
          </Button>
        </div>
      ),
      align: "right",
    },
  ];

  const kycCols: Column<KycDocument>[] = [
    { header: "Document", accessor: (r) => r.docType },
    { header: "User", accessor: (r) => r.user?.name ?? r.user?.email ?? r.userId },
    { header: "Submitted", accessor: (r) => new Date(r.createdAt).toLocaleDateString("en-IN") },
    {
      header: "Review",
      accessor: (r) => (
        <div className="flex justify-end gap-2">
          <Button variant="primary" size="sm" disabled={busyId === r.id} onClick={() => reviewKyc(r, "VERIFIED")}>Approve</Button>
          <Button variant="ghost" size="sm" disabled={busyId === r.id} onClick={() => reviewKyc(r, "ON_HOLD")}>Hold</Button>
          <Button variant="ghost" size="sm" className="text-danger-600" disabled={busyId === r.id} onClick={() => reviewKyc(r, "REJECTED")}>Reject</Button>
        </div>
      ),
      align: "right",
    },
  ];

  return (
    <DashboardShell
      groups={adminNav}
      pageTitle="Users & KYC"
      pageSubtitle="Approve, verify, and manage every account"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-text-400 sm:w-80">
          <Search size={15} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email"
            className="w-full bg-transparent outline-none placeholder:text-text-400"
          />
        </div>
      </div>

      {loading && <LoadingRow label="Loading users…" />}
      {error && <ErrorRow message={error} onRetry={reload} />}

      {!loading && !error && (
        <Card padded={false}>
          <div className="p-5 pb-0 sm:p-6 sm:pb-0">
            <Tabs
              tabs={[
                {
                  label: "Owners / Agents / Builders",
                  count: ownerAgents.length,
                  content: (
                    <div className="pb-5 pt-4">
                      {ownerAgents.length ? <DataTable columns={oaCols} data={ownerAgents} keyField={(r) => r.id} /> : <EmptyState title="No owner/agent/builder accounts" description="They'll show up here once someone registers with that role." />}
                    </div>
                  ),
                },
                {
                  label: "Property Seekers",
                  count: seekers.length,
                  content: (
                    <div className="pb-5 pt-4">
                      {seekers.length ? <DataTable columns={seekerCols} data={seekers} keyField={(r) => r.id} /> : <EmptyState title="No seeker accounts" description="They'll show up here once people sign up." />}
                    </div>
                  ),
                },
                {
                  label: "KYC review queue",
                  count: kycDocuments.length,
                  content: (
                    <div className="pb-5 pt-4">
                      {kycDocuments.length ? <DataTable columns={kycCols} data={kycDocuments} keyField={(r) => r.id} /> : <EmptyState title="Nothing pending" description="No KYC documents are awaiting review right now." />}
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </Card>
      )}
    </DashboardShell>
  );
}
