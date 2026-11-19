"use client";

import { BellRing, Plug, ShieldCheck, Languages, Headset, Sparkles } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import DataTable from "@/components/DataTable";
import Badge from "@/components/Badge";
import SectionCard from "@/components/SectionCard";
import { adminNav } from "@/lib/adminNav";
import { useStore } from "@/lib/store";

const advancedFeatures = [
  "AI-Powered Demand Forecasting for vendor inventory across both channels",
  "Marketplace Financing — invoice discounting / working-capital loans via lending partners",
  "Export / Cross-Border B2B with multi-currency and customs documentation",
  "Private-Label & Dropshipping tools for vendors without holding inventory",
  "Subscription Commerce — recurring box/consumables for the B2C channel",
  "StoreHippo.com feature parity across the platform",
];

export default function SystemPage() {
  const { state, notificationRules, integrations, supportTickets, notify } = useStore();
  const { securitySettings, languages } = state;

  // BUGFIX (critical — nothing on this page actually saved): every toggle
  // here called setState() directly, mutating only the in-memory client
  // state. Nothing was ever sent to the backend — an admin "resolving" a
  // support ticket, or disconnecting an integration, or disabling a
  // notification rule looked like it worked, but a page refresh (or a
  // different admin's session) showed the old values, because nothing had
  // actually been persisted. Now uses the real update endpoints.
  const toggleNotification = (rule) =>
    notificationRules.update(rule.id, { status: rule.status === "Enabled" ? "Disabled" : "Enabled" }, { notify: false });

  const toggleIntegration = (i) => {
    integrations.update(i.id, { status: i.status === "Connected" ? "Not Connected" : "Connected" }, {
      message: `Integration status updated for ${i.name}`,
    });
  };

  const toggleTicketStatus = (t) =>
    supportTickets.update(
      t.id,
      { status: t.status === "Open" ? "In Progress" : t.status === "In Progress" ? "Resolved" : "Open" },
      { notify: false }
    );

  return (
    <DashboardShell
      title="System & Integrations"
      roleLabel="Super Admin"
      accent="var(--color-ink)"
      nav={adminNav}
      activeHref="/admin/system"
      requireRole="admin"
    >
      <SectionCard icon={BellRing} title="Notification engine" description="Role-specific alerts across WhatsApp, SMS, email, and in-app channels. Click a status to toggle it.">
        <DataTable
          columns={[
            { key: "audience", label: "Audience" },
            { key: "trigger", label: "Trigger" },
            { key: "channel", label: "Channel" },
            {
              key: "status",
              label: "Status",
              render: (r) => (
                <button onClick={() => toggleNotification(r)}>
                  <Badge tone={r.status === "Enabled" ? "green" : "rose"}>{r.status}</Badge>
                </button>
              ),
            },
          ]}
          rows={state.notificationRules}
        />
      </SectionCard>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SectionCard icon={Plug} title="Integration & API layer" description="ERP/accounting connectors, logistics aggregator APIs, and a documented public/partner API. Click a badge to connect/disconnect.">
          <div className="space-y-2">
            {state.integrations.map((i) => (
              <button
                key={i.name}
                onClick={() => toggleIntegration(i)}
                className="flex w-full items-center justify-between rounded-lg border border-line px-3 py-2 text-xs hover:bg-paper"
              >
                <div className="text-left">
                  <p className="font-medium text-ink">{i.name}</p>
                  <p className="text-ink-muted">{i.category}</p>
                </div>
                <Badge tone={i.status === "Not Connected" ? "rose" : "green"}>{i.status}</Badge>
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard icon={ShieldCheck} title="Security & compliance" description="RBAC, encryption, regulatory alignment, and 2FA across the platform.">
          <div className="space-y-2">
            {securitySettings.map((s) => (
              <div key={s.control} className="rounded-lg border border-line px-3 py-2 text-xs">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-ink">{s.control}</p>
                  <Badge tone="green">{s.status}</Badge>
                </div>
                <p className="mt-0.5 text-ink-muted">{s.scope}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SectionCard icon={Languages} title="Multi-language & multi-currency readiness" description="Regional language support for the B2C storefront; architecture ready for future cross-border trade.">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {languages.map((l) => (
              <div key={l.code} className="flex items-center justify-between rounded-lg border border-line px-3 py-2">
                <span className="font-medium text-ink">{l.name}</span>
                <span className="text-ink-muted">{l.coverage}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard icon={Headset} title="Customer support & helpdesk" description="Messages sent from the site's Contact/Help page, plus B2B support tickets. Click a ticket to cycle its status.">
          <div className="space-y-2">
            {state.supportTickets.length === 0 && (
              <p className="rounded-lg border border-dashed border-line px-3 py-4 text-center text-xs text-ink-muted">
                No support messages yet.
              </p>
            )}
            {state.supportTickets.map((t) => (
              <button
                key={t.id}
                onClick={() => toggleTicketStatus(t)}
                className="flex w-full items-start justify-between gap-3 rounded-lg border border-line px-3 py-2.5 text-left text-xs hover:bg-paper"
              >
                <div className="min-w-0">
                  <p className="font-medium text-ink">{t.subject}</p>
                  {t.message && <p className="mt-1 line-clamp-2 text-ink-muted">{t.message}</p>}
                  <p className="mt-1 text-ink-muted">
                    {t.from}{t.email ? ` (${t.email})` : ""} · {t.priority || "Normal"}
                  </p>
                </div>
                <Badge tone={t.status === "Open" ? "gold" : t.status === "Resolved" ? "green" : "ink"}>{t.status}</Badge>
              </button>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard icon={Sparkles} title="Additional advanced features in current scope" description="Included in the current build rather than deferred to a later phase.">
          <ul className="grid gap-2 sm:grid-cols-2">
            {advancedFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2 rounded-lg border border-line px-3 py-2 text-xs text-ink-muted">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--color-gold)" }} />
                {f}
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </DashboardShell>
  );
}
