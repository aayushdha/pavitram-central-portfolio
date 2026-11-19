"use client";

import { useState } from "react";
import { Percent, Wallet, Plus, Pencil, Trash2 } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import DataTable from "@/components/DataTable";
import Badge from "@/components/Badge";
import SectionCard from "@/components/SectionCard";
import Modal from "@/components/Modal";
import { Field, Input, Select, Button } from "@/components/Field";
import { adminNav } from "@/lib/adminNav";
import { useStore } from "@/lib/store";

const emptyRule = { scope: "global", scopeRef: "", channel: "Both", type: "percent", value: "", minOrderValue: "", maxOrderValue: "", active: true };
const emptyPayout = { vendorId: "", channel: "Both", periodFrom: "", periodTo: "", grossSales: "", commission: "", netPayout: "", notes: "" };

function statusTone(status) {
  if (status === "Paid") return "green";
  if (status === "Approved") return "gold";
  if (status === "On Hold") return "rose";
  return "ink";
}

export default function CommissionsPage() {
  const { state, commissionRules, payouts } = useStore();

  const [ruleModal, setRuleModal] = useState(null);
  const [ruleForm, setRuleForm] = useState(emptyRule);
  const [payoutModal, setPayoutModal] = useState(null);
  const [payoutForm, setPayoutForm] = useState(emptyPayout);

  const openAddRule = () => { setRuleForm(emptyRule); setRuleModal({ mode: "add" }); };
  const openEditRule = (r) => { setRuleForm({ ...r, scopeRef: r.scopeRef || "", minOrderValue: r.minOrderValue ?? "", maxOrderValue: r.maxOrderValue ?? "" }); setRuleModal({ mode: "edit", id: r.id }); };
  const submitRule = (e) => {
    e.preventDefault();
    const payload = {
      ...ruleForm,
      scopeRef: ruleForm.scope === "global" ? undefined : ruleForm.scopeRef || undefined,
      value: Number(ruleForm.value) || 0,
      minOrderValue: ruleForm.minOrderValue === "" ? undefined : Number(ruleForm.minOrderValue),
      maxOrderValue: ruleForm.maxOrderValue === "" ? undefined : Number(ruleForm.maxOrderValue),
    };
    if (ruleModal.mode === "add") commissionRules.add(payload, { message: "Commission rule created" });
    else commissionRules.update(ruleModal.id, payload, { message: "Commission rule updated" });
    setRuleModal(null);
  };
  const removeRule = (r) => {
    if (confirm(`Delete this ${r.scope} commission rule?`)) commissionRules.remove(r.id, { message: "Rule deleted" });
  };
  const toggleRuleActive = (r) => commissionRules.update(r.id, { active: !r.active }, { message: r.active ? "Rule paused" : "Rule activated" });

  const openAddPayout = () => { setPayoutForm(emptyPayout); setPayoutModal({ mode: "add" }); };
  const submitPayout = (e) => {
    e.preventDefault();
    const gross = Number(payoutForm.grossSales) || 0;
    const commission = Number(payoutForm.commission) || 0;
    const payload = { ...payoutForm, grossSales: gross, commission, netPayout: Number(payoutForm.netPayout) || gross - commission };
    payouts.add(payload, { message: "Payout scheduled" });
    setPayoutModal(null);
  };
  const setPayoutStatus = (p, status) => payouts.update(p.id, { status }, { message: `Payout ${status}` });
  const removePayout = (p) => { if (confirm("Delete this payout record?")) payouts.remove(p.id, { message: "Payout deleted" }); };

  const vendorName = (id) => state.vendors.find((v) => v.id === id)?.name || id;

  return (
    <DashboardShell
      title="Commissions & Payouts"
      roleLabel="Super Admin"
      accent="var(--color-ink)"
      nav={adminNav}
      activeHref="/admin/commissions"
      requireRole="admin"
    >
      <SectionCard
        icon={Percent}
        title="Commission rules"
        description="Set commission by product, vendor, category, or a global default. The most specific active rule wins — product beats vendor, vendor beats category, category beats global. B2B slabs can narrow a rule to a range of order values."
        action={
          <Button variant="gold" onClick={openAddRule}>
            <Plus size={15} /> Add rule
          </Button>
        }
      >
        {state.commissionRules.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-ink-muted">
            No commission rules yet — sales will show 0% commission until you add one.
          </p>
        ) : (
          <DataTable
            columns={[
              { key: "scope", label: "Scope", render: (r) => <Badge tone="jade">{r.scope}</Badge> },
              { key: "scopeRef", label: "Applies to", render: (r) => r.scopeRef || "All" },
              { key: "channel", label: "Channel" },
              { key: "value", label: "Rate", render: (r) => (r.type === "percent" ? `${r.value}%` : `₹${r.value}`) },
              {
                key: "slab",
                label: "Order value slab",
                render: (r) => (r.minOrderValue != null || r.maxOrderValue != null ? `₹${r.minOrderValue ?? 0} – ₹${r.maxOrderValue ?? "∞"}` : "—"),
              },
              {
                key: "active",
                label: "Status",
                render: (r) => (
                  <button onClick={() => toggleRuleActive(r)}>
                    <Badge tone={r.active ? "green" : "ink"}>{r.active ? "Active" : "Paused"}</Badge>
                  </button>
                ),
              },
              {
                key: "actions",
                label: "",
                render: (r) => (
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditRule(r)} className="text-ink-muted hover:text-ink"><Pencil size={14} /></button>
                    <button onClick={() => removeRule(r)} className="text-ink-muted hover:text-[var(--color-rose)]"><Trash2 size={14} /></button>
                  </div>
                ),
              },
            ]}
            rows={state.commissionRules}
          />
        )}
      </SectionCard>

      <div className="mt-6">
        <SectionCard
          icon={Wallet}
          title="Vendor payouts"
          description="Track what's owed to each vendor for a settlement period and mark it paid once processed."
          action={
            <Button variant="gold" onClick={openAddPayout}>
              <Plus size={15} /> New payout
            </Button>
          }
        >
          {state.payouts.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-ink-muted">
              No payouts scheduled yet.
            </p>
          ) : (
            <DataTable
              columns={[
                { key: "vendorId", label: "Vendor", render: (r) => vendorName(r.vendorId) },
                { key: "period", label: "Period", render: (r) => `${r.periodFrom} → ${r.periodTo}` },
                { key: "grossSales", label: "Gross sales", render: (r) => `₹${r.grossSales.toLocaleString("en-IN")}` },
                { key: "commission", label: "Commission", render: (r) => `₹${r.commission.toLocaleString("en-IN")}` },
                { key: "netPayout", label: "Net payout", render: (r) => `₹${r.netPayout.toLocaleString("en-IN")}` },
                {
                  key: "status",
                  label: "Status",
                  render: (r) => (
                    <Select value={r.status} onChange={(e) => setPayoutStatus(r, e.target.value)} className="!w-auto py-1.5 text-xs">
                      {["Pending", "Approved", "Paid", "On Hold"].map((s) => <option key={s}>{s}</option>)}
                    </Select>
                  ),
                },
                {
                  key: "actions",
                  label: "",
                  render: (r) => (
                    <button onClick={() => removePayout(r)} className="text-ink-muted hover:text-[var(--color-rose)]"><Trash2 size={14} /></button>
                  ),
                },
              ]}
              rows={state.payouts}
            />
          )}
        </SectionCard>
      </div>

      <Modal open={!!ruleModal} onClose={() => setRuleModal(null)} title={ruleModal?.mode === "edit" ? "Edit commission rule" : "Add commission rule"}>
        <form onSubmit={submitRule} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Scope" required>
              <Select value={ruleForm.scope} onChange={(e) => setRuleForm({ ...ruleForm, scope: e.target.value })}>
                <option value="global">Global (all sales)</option>
                <option value="category">Category</option>
                <option value="vendor">Vendor</option>
                <option value="product">Product</option>
              </Select>
            </Field>
            <Field label="Channel">
              <Select value={ruleForm.channel} onChange={(e) => setRuleForm({ ...ruleForm, channel: e.target.value })}>
                <option value="Both">B2C + B2B</option>
                <option value="B2C">B2C only</option>
                <option value="B2B">B2B only</option>
              </Select>
            </Field>
          </div>
          {ruleForm.scope !== "global" && (
            <Field label={ruleForm.scope === "vendor" ? "Vendor" : ruleForm.scope === "category" ? "Category" : "Product ID"} required>
              {ruleForm.scope === "vendor" ? (
                <Select required value={ruleForm.scopeRef} onChange={(e) => setRuleForm({ ...ruleForm, scopeRef: e.target.value })}>
                  <option value="">Select vendor</option>
                  {state.vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                </Select>
              ) : ruleForm.scope === "category" ? (
                <Select required value={ruleForm.scopeRef} onChange={(e) => setRuleForm({ ...ruleForm, scopeRef: e.target.value })}>
                  <option value="">Select category</option>
                  {state.categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                </Select>
              ) : (
                <Input required value={ruleForm.scopeRef} onChange={(e) => setRuleForm({ ...ruleForm, scopeRef: e.target.value })} placeholder="Product ID" />
              )}
            </Field>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <Select value={ruleForm.type} onChange={(e) => setRuleForm({ ...ruleForm, type: e.target.value })}>
                <option value="percent">Percent</option>
                <option value="flat">Flat ₹</option>
              </Select>
            </Field>
            <Field label={ruleForm.type === "percent" ? "Rate (%)" : "Amount (₹)"} required>
              <Input required type="number" step="0.01" value={ruleForm.value} onChange={(e) => setRuleForm({ ...ruleForm, value: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Min order value (B2B slab)" hint="Optional">
              <Input type="number" value={ruleForm.minOrderValue} onChange={(e) => setRuleForm({ ...ruleForm, minOrderValue: e.target.value })} />
            </Field>
            <Field label="Max order value (B2B slab)" hint="Optional">
              <Input type="number" value={ruleForm.maxOrderValue} onChange={(e) => setRuleForm({ ...ruleForm, maxOrderValue: e.target.value })} />
            </Field>
          </div>
          <Button type="submit" className="w-full">{ruleModal?.mode === "edit" ? "Save changes" : "Create rule"}</Button>
        </form>
      </Modal>

      <Modal open={!!payoutModal} onClose={() => setPayoutModal(null)} title="Schedule a payout">
        <form onSubmit={submitPayout} className="space-y-4">
          <Field label="Vendor" required>
            <Select required value={payoutForm.vendorId} onChange={(e) => setPayoutForm({ ...payoutForm, vendorId: e.target.value })}>
              <option value="">Select vendor</option>
              {state.vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Period from" required>
              <Input required type="date" value={payoutForm.periodFrom} onChange={(e) => setPayoutForm({ ...payoutForm, periodFrom: e.target.value })} />
            </Field>
            <Field label="Period to" required>
              <Input required type="date" value={payoutForm.periodTo} onChange={(e) => setPayoutForm({ ...payoutForm, periodTo: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Gross sales (₹)" required>
              <Input required type="number" value={payoutForm.grossSales} onChange={(e) => setPayoutForm({ ...payoutForm, grossSales: e.target.value })} />
            </Field>
            <Field label="Commission (₹)" required>
              <Input required type="number" value={payoutForm.commission} onChange={(e) => setPayoutForm({ ...payoutForm, commission: e.target.value })} />
            </Field>
            <Field label="Net payout (₹)" hint="Auto if left blank">
              <Input type="number" value={payoutForm.netPayout} onChange={(e) => setPayoutForm({ ...payoutForm, netPayout: e.target.value })} />
            </Field>
          </div>
          <Button type="submit" className="w-full">Schedule payout</Button>
        </form>
      </Modal>
    </DashboardShell>
  );
}
