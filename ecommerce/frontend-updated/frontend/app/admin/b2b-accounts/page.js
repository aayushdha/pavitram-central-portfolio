"use client";

import { useState } from "react";
import { Pencil, Trash2, Plus, FileText } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import DataTable from "@/components/DataTable";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import SectionCard from "@/components/SectionCard";
import { Field, Input, Select, Button } from "@/components/Field";
import { adminNav } from "@/lib/adminNav";
import { useStore } from "@/lib/store";
import { Building2 } from "lucide-react";

const emptyForm = { company: "", segment: "Retailer", gstin: "", status: "Under Review", creditLimit: 0, utilized: 0, terms: "Net 30" };

// Pending = submitted KYC, waiting on admin action — same convention as
// the Vendor Lifecycle page, so both KYC queues behave identically.
const isPending = (b) => (b.status || "").toLowerCase() === "under review";

export default function AdminB2BAccountsPage() {
  const { state, businessBuyers } = useStore();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [creditModal, setCreditModal] = useState(null);
  const [kycDocsFor, setKycDocsFor] = useState(null);
  const [tab, setTab] = useState("pending");
  const [rejectFor, setRejectFor] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const pending = state.businessBuyers.filter(isPending);
  const approved = state.businessBuyers.filter((b) => !isPending(b));
  const rows = tab === "pending" ? pending : approved;

  const openAdd = () => { setForm(emptyForm); setModal({ mode: "add" }); };
  const openEdit = (b) => { setForm(b); setModal({ mode: "edit", id: b.id }); };

  const onSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form, creditLimit: Number(form.creditLimit) || 0, utilized: Number(form.utilized) || 0 };
    if (modal.mode === "add") businessBuyers.add(payload, { message: "Business account added", log: `Added B2B account ${payload.company}` });
    else businessBuyers.update(modal.id, payload, { message: "Account updated", log: `Updated B2B account ${payload.company}` });
    setModal(null);
  };

  const approve = (b) =>
    businessBuyers.update(b.id, { status: "Approved", rejectionReason: null }, { message: `${b.company} approved`, log: `Approved B2B account ${b.company}` });

  const remove = (b) => {
    if (confirm(`Remove business account "${b.company}"?`)) businessBuyers.remove(b.id, { message: "Account removed", log: `Removed B2B account ${b.company}` });
  };

  const openReject = (b) => {
    setRejectReason(b.rejectionReason || "");
    setRejectFor(b);
  };
  const confirmReject = () => {
    if (!rejectFor) return;
    if (!rejectReason.trim()) {
      alert("Reject/hold karne ke liye reason likhna zaroori hai — business account ko yahi wapas dikhaya jaayega.");
      return;
    }
    businessBuyers.update(
      rejectFor.id,
      { status: "On Hold", rejectionReason: rejectReason.trim() },
      { message: `${rejectFor.company} put on hold`, log: `Rejected/held B2B account ${rejectFor.company}: ${rejectReason.trim()}` }
    );
    setRejectFor(null);
    setKycDocsFor(null);
  };

  const openCredit = (b) => setCreditModal({ id: b.id, creditLimit: b.creditLimit, terms: b.terms });
  const saveCredit = (e) => {
    e.preventDefault();
    const b = state.businessBuyers.find((x) => x.id === creditModal.id);
    businessBuyers.update(creditModal.id, { creditLimit: Number(creditModal.creditLimit) || 0, terms: creditModal.terms }, {
      message: "Credit limit updated",
      log: `Set credit limit for ${b.company} to ₹${Number(creditModal.creditLimit).toLocaleString("en-IN")} (${creditModal.terms})`,
    });
    setCreditModal(null);
  };

  return (
    <DashboardShell
      title="B2B Account & Contract Governance"
      roleLabel="Super Admin"
      accent="var(--color-ink)"
      nav={adminNav}
      activeHref="/admin/b2b-accounts"
      requireRole="admin"
    >
      <SectionCard icon={Building2} title="Business Buyer Approval Queue" description="Review GSTIN, segment, and credit terms for registered companies. Approve, hold, or adjust credit exposure.">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2 rounded-full border border-line bg-paper-raised p-1">
            <button
              onClick={() => setTab("pending")}
              className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition"
              style={tab === "pending" ? { background: "var(--color-gold-dim)", color: "var(--color-gold)" } : { color: "var(--color-ink-muted)" }}
            >
              Pending Verification
              <span className="grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px]" style={{ background: "var(--color-ink)", color: "white" }}>{pending.length}</span>
            </button>
            <button
              onClick={() => setTab("approved")}
              className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition"
              style={tab === "approved" ? { background: "var(--color-jade-dim)", color: "var(--color-jade)" } : { color: "var(--color-ink-muted)" }}
            >
              Approved / Other
              <span className="grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px]" style={{ background: "var(--color-ink)", color: "white" }}>{approved.length}</span>
            </button>
          </div>
          <Button onClick={openAdd}><Plus size={15} /> Add business account</Button>
        </div>

        {tab === "pending" && pending.length === 0 && (
          <div className="mb-4 rounded-2xl border border-line bg-paper-raised px-4 py-3 text-sm text-ink-muted">
            No business accounts waiting on review right now. Newly submitted KYC applications will appear here.
          </div>
        )}

        <DataTable
          columns={[
            { key: "company", label: "Company" },
            { key: "segment", label: "Segment", render: (r) => <Badge tone="jade">{r.segment}</Badge> },
            { key: "gstin", label: "GSTIN" },
            { key: "terms", label: "Payment Terms" },
            {
              key: "kycDocuments",
              label: "KYC Docs",
              render: (r) => {
                const count = r.kycDocuments ? Object.keys(r.kycDocuments).length : 0;
                return count > 0 ? (
                  <button
                    onClick={() => setKycDocsFor(r)}
                    className="flex items-center gap-1 text-xs font-semibold"
                    style={{ color: "var(--color-jade)" }}
                  >
                    <FileText size={13} /> {count} file{count > 1 ? "s" : ""}
                  </button>
                ) : (
                  <span className="text-xs text-ink-muted">None</span>
                );
              },
            },
            {
              key: "creditLimit",
              label: "Credit (Used / Limit)",
              render: (r) => (r.creditLimit ? `₹${r.utilized.toLocaleString("en-IN")} / ₹${r.creditLimit.toLocaleString("en-IN")}` : "—"),
            },
            {
              key: "status",
              label: "Status",
              render: (r) => (
                <div className="flex flex-col gap-0.5">
                  <Badge tone={r.status === "Approved" ? "jade" : r.status === "On Hold" ? "rose" : "gold"}>
                    {r.status}
                  </Badge>
                  {r.status === "On Hold" && r.rejectionReason && (
                    <span className="max-w-[160px] truncate text-[10px] text-ink-muted" title={r.rejectionReason}>
                      Reason: {r.rejectionReason}
                    </span>
                  )}
                </div>
              ),
            },
            {
              key: "actions",
              label: "Actions",
              render: (r) => (
                <div className="flex flex-wrap items-center gap-2">
                  {r.status !== "Approved" && (
                    <button onClick={() => approve(r)} className="text-xs font-semibold" style={{ color: "var(--color-jade)" }}>Approve</button>
                  )}
                  {r.status !== "On Hold" && (
                    <button onClick={() => openReject(r)} className="text-xs font-semibold" style={{ color: "var(--color-rose)" }}>Reject</button>
                  )}
                  <button onClick={() => openCredit(r)} className="text-xs font-semibold" style={{ color: "var(--color-gold)" }}>Credit</button>
                  <button onClick={() => openEdit(r)} className="text-ink-muted hover:text-ink" aria-label="Edit"><Pencil size={14} /></button>
                  <button onClick={() => remove(r)} style={{ color: "var(--color-rose)" }} aria-label="Delete"><Trash2 size={14} /></button>
                </div>
              ),
            },
          ]}
          rows={rows}
        />
      </SectionCard>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === "add" ? "Add business account" : "Edit business account"}>
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Company name" required>
            <Input required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          </Field>
          <Field label="GSTIN" required>
            <Input required value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Segment">
              <Select value={form.segment} onChange={(e) => setForm({ ...form, segment: e.target.value })}>
                <option>Retailer</option><option>Distributor</option><option>Institutional</option><option>Export</option>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option>Under Review</option><option>Approved</option><option>On Hold</option>
              </Select>
            </Field>
          </div>
          <Button type="submit" className="w-full">{modal?.mode === "add" ? "Add account" : "Save changes"}</Button>
        </form>
      </Modal>

      <Modal open={!!creditModal} onClose={() => setCreditModal(null)} title="Set credit limit & payment terms">
        {creditModal && (
          <form onSubmit={saveCredit} className="space-y-4">
            <Field label="Credit limit (₹)" required>
              <Input type="number" required value={creditModal.creditLimit} onChange={(e) => setCreditModal({ ...creditModal, creditLimit: e.target.value })} />
            </Field>
            <Field label="Payment terms">
              <Select value={creditModal.terms} onChange={(e) => setCreditModal({ ...creditModal, terms: e.target.value })}>
                <option>Net 15</option><option>Net 30</option><option>Net 45</option><option>Net 60</option>
              </Select>
            </Field>
            <Button type="submit" className="w-full">Save credit terms</Button>
          </form>
        )}
      </Modal>

      <Modal open={!!kycDocsFor} onClose={() => setKycDocsFor(null)} title={`${kycDocsFor?.company || ""} — KYC documents`}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {kycDocsFor?.kycDocuments && Object.keys(kycDocsFor.kycDocuments).length > 0 ? (
            Object.entries(kycDocsFor.kycDocuments).map(([label, url]) => (
              <a key={label} href={url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-line">
                {/\.(png|jpe?g|gif|webp)$/i.test(url) ? (
                  <img src={url} alt={label} className="h-24 w-full object-cover" />
                ) : (
                  <div className="flex h-24 w-full flex-col items-center justify-center gap-1 bg-paper-raised px-2 text-center">
                    <FileText size={18} style={{ color: "var(--color-ink-muted)" }} />
                  </div>
                )}
                <div className="px-2 py-1.5 text-center text-[11px] font-medium text-ink">{label}</div>
              </a>
            ))
          ) : (
            <p className="col-span-full text-sm text-ink-muted">No KYC documents uploaded yet.</p>
          )}
        </div>
        {kycDocsFor && (
          <div className="mt-4 flex gap-2">
            {kycDocsFor.status !== "Approved" && (
              <Button
                className="flex-1"
                onClick={() => {
                  approve(kycDocsFor);
                  setKycDocsFor(null);
                }}
              >
                Approve account
              </Button>
            )}
            {kycDocsFor.status !== "On Hold" && (
              <Button
                variant="ghost"
                className="flex-1"
                style={{ color: "var(--color-rose)" }}
                onClick={() => openReject(kycDocsFor)}
              >
                Reject / hold
              </Button>
            )}
          </div>
        )}
      </Modal>

      <Modal open={!!rejectFor} onClose={() => setRejectFor(null)} title={`Reject ${rejectFor?.company || ""}`}>
        <p className="mb-3 text-sm text-ink-muted">
          Yeh reason business account ke apne dashboard par dikhaya jaayega, taaki unhe pata chale KYC kyun reject/hold hui.
        </p>
        <Field label="Rejection reason" required>
          <textarea
            autoFocus
            required
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. GSTIN certificate details company name se match nahi ho rahe."
            className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
          />
        </Field>
        <Button className="mt-3 w-full" style={{ background: "var(--color-rose)" }} onClick={confirmReject}>
          Confirm reject / hold
        </Button>
      </Modal>
    </DashboardShell>
  );
}
