"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ownerNav } from "@/lib/nav-config";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LoadingRow, ErrorRow } from "@/components/ui/DataState";
import { useApiData } from "@/lib/hooks/useApiData";
import { subscriptionsApi } from "@/lib/api/subscriptions";
import { SubscriptionPlanCode } from "@/lib/api/domain-types";

const plans: { code: SubscriptionPlanCode; name: string; price: string; features: string[] }[] = [
  { code: "FREE", name: "Basic", price: "Free", features: ["2 active listings", "Standard placement", "Email support"] },
  { code: "PRO", name: "Agent Pro", price: "₹4,999/mo", features: ["25 active listings", "Featured placement x3", "Buyer-intent scoring", "Priority support"] },
  { code: "ENTERPRISE", name: "Builder Spotlight", price: "₹24,999/mo", features: ["Unlimited project listings", "Homepage spotlight", "Dedicated microsite", "Account manager"] },
];

export default function OwnerSubscriptionPage() {
  const { data, loading, error, reload } = useApiData(() => subscriptionsApi.mine());
  const [switching, setSwitching] = useState<SubscriptionPlanCode | null>(null);
  const active = data?.subscriptions.find((s) => s.status === "ACTIVE");
  const currentCode = active?.planCode ?? "FREE";

  async function handleSwitch(code: SubscriptionPlanCode) {
    setSwitching(code);
    try {
      await subscriptionsApi.subscribe(code);
      reload();
    } catch {
      alert("Could not change your plan. Please try again.");
    } finally {
      setSwitching(null);
    }
  }

  return (
    <DashboardShell
      groups={ownerNav}
      roleColor="brass"
      pageTitle="Subscription & credits"
      pageSubtitle="Plans and listing credit wallet"
    >
      {loading && <LoadingRow label="Loading your plan…" />}
      {error && <ErrorRow message={error} onRetry={reload} />}

      {!loading && !error && (
        <>
          <Card className="mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-text-600">Listing credit wallet</p>
                <p className="mt-1 font-display text-2xl font-medium text-ink-900">
                  {(active?.creditsTotal ?? 0) - (active?.creditsRemaining ?? 0)} / {active?.creditsTotal ?? 0} credits used
                </p>
              </div>
              <Badge variant="neutral">Plan: {currentCode}</Badge>
            </div>
            <ProgressBar
              value={(active?.creditsTotal ?? 0) - (active?.creditsRemaining ?? 0)}
              max={Math.max(active?.creditsTotal ?? 1, 1)}
              className="mt-4"
            />
          </Card>

          <div className="grid gap-5 lg:grid-cols-3">
            {plans.map((p) => {
              const isCurrent = p.code === currentCode;
              return (
                <div
                  key={p.code}
                  className={`rounded-2xl border p-6 ${isCurrent ? "border-brass-400 bg-brass-50/40" : "border-stone-200 bg-white"}`}
                >
                  {isCurrent && <Badge variant="verified" className="mb-3">Current plan</Badge>}
                  <h3 className="font-display text-lg font-medium text-ink-900">{p.name}</h3>
                  <p className="mt-1 font-display text-2xl font-medium text-ink-900">{p.price}</p>
                  <ul className="mt-4 space-y-2">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-text-600">
                        <Check size={14} className="shrink-0 text-brand-600" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={isCurrent ? "outline" : "primary"}
                    size="sm"
                    className="mt-5 w-full"
                    disabled={isCurrent || switching === p.code}
                    onClick={() => handleSwitch(p.code)}
                  >
                    {isCurrent ? "Current plan" : switching === p.code ? "Switching…" : "Upgrade"}
                  </Button>
                </div>
              );
            })}
          </div>

          <Card className="mt-6" padded={false}>
            <div className="p-5 sm:p-6">
              <CardHeader eyebrow="Billing" title="Invoices" subtitle="GST-compliant invoicing isn't wired up yet" />
              <p className="text-sm text-text-500">
                Payment collection and downloadable GST invoices need a billing provider (e.g. Razorpay) and an
                invoice model on the backend — flagged as a follow-up; plan changes above already update your real
                subscription record.
              </p>
            </div>
          </Card>
        </>
      )}
    </DashboardShell>
  );
}
