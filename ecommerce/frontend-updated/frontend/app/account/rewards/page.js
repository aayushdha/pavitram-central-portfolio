"use client";

import { useState } from "react";
import { Gift, Share2, Sparkles, Wallet } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import StatCard from "@/components/StatCard";
import Badge from "@/components/Badge";
import { Input, Button } from "@/components/Field";
import { accountNav } from "@/lib/accountNav";
import { useStore } from "@/lib/store";

const TIER_NEXT = { Silver: { next: "Gold", at: 5000 }, Gold: { next: "Platinum", at: 20000 }, Platinum: null };

export default function RewardsPage() {
  const { state, shareReferral, redeemLoyaltyPoints } = useStore();
  const loyalty = state.loyalty;
  const [email, setEmail] = useState("");
  const [redeemAmount, setRedeemAmount] = useState(100);

  const sendReferral = (e) => {
    e.preventDefault();
    if (!email) return;
    shareReferral(email);
    setEmail("");
  };

  const tierInfo = loyalty ? TIER_NEXT[loyalty.tier] : null;
  const progressPct = tierInfo ? Math.min(100, Math.round((loyalty.lifetimePoints / tierInfo.at) * 100)) : 100;

  return (
    <DashboardShell
      title="Rewards & Referrals"
      roleLabel="My Account"
      accent="var(--color-gold)"
      nav={accountNav}
      activeHref="/account/rewards"
      requireRole="customer"
    >
      {!loyalty ? (
        <div className="rounded-2xl border border-dashed border-line p-12 text-center">
          <Sparkles className="mx-auto text-ink-muted" size={22} />
          <p className="mt-2 font-display text-base font-semibold text-ink">Loading your rewards…</p>
          <p className="mt-1 text-sm text-ink-muted">Place your first order to start earning points.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Points balance" value={loyalty.points?.toLocaleString("en-IN") ?? 0} tone="gold" icon={Wallet} />
            <StatCard label="Membership tier" value={loyalty.tier} tone="jade" icon={Sparkles} />
            <StatCard label="Lifetime points" value={loyalty.lifetimePoints?.toLocaleString("en-IN") ?? 0} tone="ink" icon={Gift} />
          </div>

          {tierInfo && (
            <div className="mt-4 rounded-2xl border border-line bg-paper-raised p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-ink">Progress to {tierInfo.next}</span>
                <span className="text-ink-muted">{loyalty.lifetimePoints} / {tierInfo.at} pts</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--color-line)" }}>
                <div className="h-full rounded-full" style={{ width: `${progressPct}%`, background: "var(--color-gold)" }} />
              </div>
            </div>
          )}

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-line bg-paper-raised p-5">
              <p className="flex items-center gap-1.5 font-display text-base font-semibold text-ink">
                <Gift size={16} /> Redeem points
              </p>
              <p className="mt-1 text-xs text-ink-muted">1 point = ₹1 wallet credit at checkout.</p>
              <div className="mt-3 flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={loyalty.points}
                  value={redeemAmount}
                  onChange={(e) => setRedeemAmount(Number(e.target.value))}
                  className="w-28"
                />
                <Button
                  variant="gold"
                  disabled={!redeemAmount || redeemAmount > loyalty.points}
                  onClick={() => redeemLoyaltyPoints(redeemAmount)}
                >
                  Redeem
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-paper-raised p-5">
              <p className="flex items-center gap-1.5 font-display text-base font-semibold text-ink">
                <Share2 size={16} /> Refer a friend
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                Share your code — you both get bonus points once they complete their first order.
              </p>
              <div className="mt-3 flex items-center justify-between rounded-lg border border-dashed border-line px-3 py-2">
                <span className="font-mono text-sm font-semibold text-ink">{loyalty.referralCode}</span>
                <button
                  className="text-xs font-semibold"
                  style={{ color: "var(--color-gold)" }}
                  onClick={() => navigator.clipboard?.writeText(loyalty.referralCode)}
                >
                  Copy
                </button>
              </div>
              <form onSubmit={sendReferral} className="mt-3 flex gap-2">
                <div className="flex-1">
                  <Input
                    type="email"
                    required
                    placeholder="friend@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button type="submit">Invite</Button>
              </form>
            </div>
          </div>

          <div className="mt-6">
            <p className="font-display text-base font-semibold text-ink">Recent activity</p>
            {(!loyalty.transactions || loyalty.transactions.length === 0) ? (
              <p className="mt-2 text-sm text-ink-muted">No point activity yet.</p>
            ) : (
              <div className="mt-2 divide-y divide-line rounded-2xl border border-line bg-paper-raised">
                {loyalty.transactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm text-ink">{t.note || t.type}</p>
                      <p className="text-xs text-ink-muted">{new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                    <Badge tone={t.points >= 0 ? "green" : "rose"}>{t.points >= 0 ? `+${t.points}` : t.points}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {loyalty.referrals?.length > 0 && (
            <div className="mt-6">
              <p className="font-display text-base font-semibold text-ink">Your referrals</p>
              <div className="mt-2 divide-y divide-line rounded-2xl border border-line bg-paper-raised">
                {loyalty.referrals.map((r) => (
                  <div key={r.id} className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-ink">{r.referredEmail}</span>
                    <Badge tone={r.status === "Rewarded" ? "green" : r.status === "Completed" ? "gold" : "ink"}>{r.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </DashboardShell>
  );
}
