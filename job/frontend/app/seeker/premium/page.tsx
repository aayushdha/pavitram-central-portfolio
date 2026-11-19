"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ConfirmModal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { usePlan } from "@/lib/use-plan";
import { seekerPremiumPlans } from "@/lib/data";
import { Check, Sparkles } from "lucide-react";

export default function PremiumPage() {
  const toast = useToast();
  const { plan, setPlan } = usePlan();
  const [target, setTarget] = useState<(typeof seekerPremiumPlans)[number] | null>(null);

  function confirmChange() {
    if (!target) return;
    setPlan(target.name);
    toast(target.price === "Free" ? "You're back on the Basic plan." : `You're now on ${target.name}.`);
    setTarget(null);
  }

  return (
    <div>
      <PageHeader title="Premium" subtitle="See who's viewing your profile, and get noticed by recruiters first." />

      <div className="grid sm:grid-cols-3 gap-5">
        {seekerPremiumPlans.map((p) => (
          <div
            key={p.name}
            className={`rounded-2xl border p-6 flex flex-col ${
              p.highlight ? "border-brand-500 bg-brand-50 relative" : "border-border bg-surface"
            }`}
          >
            {p.highlight && (
              <span className="absolute -top-3 left-6 bg-brand-500 text-ink-900 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Sparkles size={10} /> MOST POPULAR
              </span>
            )}
            <p className="font-display font-semibold text-ink mt-2">{p.name}</p>
            <p className="font-display text-2xl font-bold text-ink mb-4">{p.price}</p>
            <ul className="flex flex-col gap-2 mb-6 flex-1">
              {p.perks.map((perk) => (
                <li key={perk} className="text-sm text-muted flex items-start gap-2">
                  <Check size={14} className="text-good-500 mt-0.5 shrink-0" /> {perk}
                </li>
              ))}
            </ul>
            {plan === p.name ? (
              <button
                disabled
                className="rounded-xl py-2.5 text-sm font-semibold border border-border text-muted cursor-default"
              >
                Current plan
              </button>
            ) : (
              <button
                onClick={() => setTarget(p)}
                className={`rounded-xl py-2.5 text-sm font-semibold ${
                  p.price === "Free" ? "border border-border text-muted hover:text-ink" : "bg-brand-500 hover:bg-brand-600 text-ink-900"
                }`}
              >
                {p.price === "Free" ? "Switch to Basic" : plan === "Basic" ? "Upgrade" : `Switch to ${p.name}`}
              </button>
            )}
          </div>
        ))}
      </div>

      <ConfirmModal
        open={target !== null}
        onClose={() => setTarget(null)}
        onConfirm={confirmChange}
        title={target?.price === "Free" ? "Switch to Basic?" : `Get ${target?.name}?`}
        message={
          target?.price === "Free"
            ? "You'll lose Premium perks like profile-view insights."
            : `${target?.name} costs ${target?.price}. Online payments aren't connected yet, so this activates the plan in demo mode — no money is charged.`
        }
        confirmLabel={target?.price === "Free" ? "Switch" : "Activate plan"}
      />
    </div>
  );
}
