"use client";

import { useState } from "react";
import { UserRound, TrendingUp, LifeBuoy } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import StatCard from "@/components/StatCard";
import SectionCard from "@/components/SectionCard";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import { Field, Input, Select, Button } from "@/components/Field";
import { b2bNav } from "@/lib/b2bNav";
import { useStore } from "@/lib/store";

export default function SupportPage() {
  const { state, auth, supportTickets } = useStore();
  const buyer = state.businessBuyers.find((b) => b.id === auth?.buyerId);
  const myTickets = state.supportTickets.filter((t) => t.from.includes(buyer?.company || "___"));
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ subject: "", priority: "Normal" });

  const raiseTicket = (e) => {
    e.preventDefault();
    supportTickets.add(
      { from: `${buyer?.company} (B2B)`, subject: form.subject, priority: form.priority, status: "Open" },
      { message: "Support ticket raised" }
    );
    setForm({ subject: "", priority: "Normal" });
    setOpen(false);
  };

  return (
    <DashboardShell
      title="Relationship & Support"
      roleLabel="Business Buyer · Company Admin"
      accent="var(--color-jade)"
      nav={b2bNav}
      activeHref="/b2b/support"
      requireRole="b2b"
    >
      <SectionCard icon={UserRound} accent="jade" title="Dedicated Account Manager" description="High-volume business buyers get a named relationship-manager contact for priority support and negotiation assistance.">
        <div className="flex items-center gap-4 rounded-xl border border-line p-4">
          <span className="grid h-12 w-12 place-items-center rounded-full text-lg font-semibold text-white" style={{ background: "var(--color-jade)" }}>MJ</span>
          <div>
            <p className="text-sm font-semibold text-ink">Meera Joshi</p>
            <p className="text-xs text-ink-muted">meera.joshi@pavitram.com · +91 98200 xxxxx</p>
          </div>
          <button onClick={() => setOpen(true)} className="ml-auto rounded-full border px-4 py-2 text-xs font-semibold" style={{ borderColor: "var(--color-jade)", color: "var(--color-jade)" }}>
            Message
          </button>
        </div>
      </SectionCard>

      <SectionCard icon={TrendingUp} accent="jade" title="Business analytics dashboard" description="Buyer-side view of monthly spend, category-wise purchase trends, and savings from tiered pricing.">
        <div className="mt-1 grid gap-4 sm:grid-cols-3">
          <StatCard label="Monthly Spend" value="₹9.4L" tone="jade" />
          <StatCard label="Top Category" value="Textiles" sub="42% of spend" />
          <StatCard label="Saved via Tiered Pricing" value="₹1.8L" sub="Last 6 months" tone="green" />
        </div>
      </SectionCard>

      <div className="mt-6">
        <SectionCard icon={LifeBuoy} accent="jade" title="Unified support ticketing" description="Shared support desk with priority SLA tiers for high-value B2B accounts.">
          {myTickets.length > 0 && (
            <div className="mb-3 space-y-2">
              {myTickets.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-xs">
                  <span className="text-ink">{t.subject}</span>
                  <Badge tone={t.status === "Open" ? "gold" : "ink"}>{t.status}</Badge>
                </div>
              ))}
            </div>
          )}
          <Button onClick={() => setOpen(true)} style={{ background: "var(--color-jade)" }}>Raise a support ticket</Button>
        </SectionCard>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Raise a support ticket">
        <form onSubmit={raiseTicket} className="space-y-4">
          <Field label="Subject" required><Input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></Field>
          <Field label="Priority">
            <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option>Normal</option><option>High — SLA 4h</option><option>Urgent</option>
            </Select>
          </Field>
          <Button type="submit" className="w-full">Submit ticket</Button>
        </form>
      </Modal>
    </DashboardShell>
  );
}
