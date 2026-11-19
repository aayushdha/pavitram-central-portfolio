"use client";

import { useState } from "react";
import { UserPlus, Trash2 } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import DataTable from "@/components/DataTable";
import Badge from "@/components/Badge";
import { Input, Select, Button } from "@/components/Field";
import { b2bNav } from "@/lib/b2bNav";
import { useStore } from "@/lib/store";

const roleTone = { "Company Admin": "jade", "Purchase Manager": "gold", Approver: "rose", Accountant: "ink" };
const limitByRole = {
  "Purchase Manager / Buyer": "Up to ₹1,00,000 / order",
  "Approver": "Approves orders above ₹1,00,000",
  "Accountant / Finance User": "Read-only — invoices & ledger",
};

export default function TeamPage() {
  const { state, auth, teamMembers, notify } = useStore();
  const buyer = state.businessBuyers.find((b) => b.id === auth?.buyerId);
  // BUGFIX (cross-tenant data leak): this page rendered state.teamMembers —
  // every company's team roster on the entire platform, unfiltered — and
  // let anyone here remove any of them. New invites also never carried a
  // buyerId, so they weren't even tagged to the inviting company.
  const myTeam = state.teamMembers.filter((m) => m.buyerId === buyer?.id);
  const [form, setForm] = useState({ name: "", email: "", role: "Purchase Manager / Buyer" });

  const invite = (e) => {
    e.preventDefault();
    teamMembers.add(
      { name: form.name, email: form.email, role: form.role.split(" / ")[0], limit: limitByRole[form.role], buyerId: buyer?.id },
      { message: `Invite sent to ${form.email}` }
    );
    setForm({ name: "", email: "", role: "Purchase Manager / Buyer" });
  };

  const remove = (m) => {
    if (confirm(`Remove ${m.name} from the team?`)) teamMembers.remove(m.id, { message: `${m.name} removed` });
  };

  return (
    <DashboardShell
      title="Team & Approval Hierarchy"
      roleLabel="Business Buyer · Company Admin"
      accent="var(--color-jade)"
      nav={b2bNav}
      activeHref="/b2b/team"
      requireRole="b2b"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">Company users</h2>
          <div className="mt-3">
            <DataTable
              columns={[
                { key: "name", label: "Name" },
                { key: "role", label: "Role", render: (r) => <Badge tone={roleTone[r.role] || "ink"}>{r.role}</Badge> },
                { key: "email", label: "Email" },
                { key: "limit", label: "Spend / Access" },
                {
                  key: "actions", label: "", render: (r) => (
                    r.role !== "Company Admin" && (
                      <button onClick={() => remove(r)} style={{ color: "var(--color-rose)" }}><Trash2 size={14} /></button>
                    )
                  ),
                },
              ]}
              rows={myTeam}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-line bg-paper-raised p-5">
            <h3 className="font-display text-sm font-semibold text-ink">Role definitions</h3>
            <ul className="mt-3 space-y-2 text-xs text-ink-muted">
              <li><span className="font-semibold text-ink">Company Admin</span> — full control: manages users, approves credit terms, views all orders and invoices.</li>
              <li><span className="font-semibold text-ink">Purchase Manager / Buyer</span> — browses catalog, raises RFQs, places orders up to a configured limit.</li>
              <li><span className="font-semibold text-ink">Approver</span> — reviews and approves/rejects orders exceeding the spend limit before confirmation.</li>
              <li><span className="font-semibold text-ink">Accountant / Finance User</span> — read-only access to invoices, payment schedules, and credit ledger.</li>
            </ul>
          </div>
        </div>

        <div className="h-fit space-y-5">
          <div className="rounded-2xl border border-line bg-paper-raised p-5">
            <h3 className="flex items-center gap-2 font-display text-base font-semibold text-ink">
              <UserPlus size={16} style={{ color: "var(--color-jade)" }} /> Invite a user
            </h3>
            <form onSubmit={invite} className="mt-4 space-y-3">
              <Input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input required type="email" placeholder="Work email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option>Purchase Manager / Buyer</option>
                <option>Approver</option>
                <option>Accountant / Finance User</option>
              </Select>
              <Button type="submit" className="w-full" style={{ background: "var(--color-jade)" }}>Send invite</Button>
            </form>
          </div>

          <div className="rounded-2xl border p-5" style={{ borderColor: "var(--color-jade)", background: "var(--color-jade-dim)" }}>
            <h3 className="font-display text-sm font-semibold text-ink">Spend & approval rule</h3>
            <p className="mt-2 text-xs text-ink-muted">Orders above <span className="font-semibold text-ink">₹1,00,000</span> automatically require Approver sign-off before confirmation.</p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
