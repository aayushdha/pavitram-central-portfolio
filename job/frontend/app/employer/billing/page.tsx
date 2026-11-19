"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Modal, ConfirmModal, inputCls, labelCls } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useLocalStorage } from "@/lib/use-local-storage";
import { employerCompany } from "@/lib/data";
import { printHtml } from "@/lib/print-html";
import { Wallet, CreditCard, Download, Check } from "lucide-react";

const plans = [
  { name: "Starter", credits: 10, price: "₹4,999", perks: ["10 job credits / month", "Basic candidate search"] },
  { name: "Growth", credits: 40, price: "₹14,999", perks: ["40 job credits / month", "Full resume database", "3 team seats"] },
  { name: "Scale", credits: 120, price: "₹34,999", perks: ["120 job credits / month", "Featured listings included", "Unlimited team seats"] },
];

const invoices = [
  { id: "INV-2026-0821", date: "01 Aug 2026", amount: "₹14,999", status: "Paid" },
  { id: "INV-2026-0721", date: "01 Jul 2026", amount: "₹14,999", status: "Paid" },
  { id: "INV-2026-0621", date: "01 Jun 2026", amount: "₹14,999", status: "Paid" },
];

const BILLING_KEY = "jobportal_employer_billing";
const CREDIT_PRICE = 375;
const GST_RATE = 0.18;

type Billing = {
  plan: string;
  extraCredits: number;
  card: { brand: string; last4: string };
  cancelAtPeriodEnd: boolean;
};

const defaultBilling: Billing = {
  plan: "Growth",
  extraCredits: 0,
  card: { brand: "HDFC", last4: "4821" },
  cancelAtPeriodEnd: false,
};

const RENEWS_ON = "01 Sep 2026";

function rupees(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

function luhnOk(digits: string) {
  let sum = 0;
  let dbl = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

function cardBrand(digits: string) {
  if (/^4/.test(digits)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "Amex";
  if (/^(60|65|81|82|508)/.test(digits)) return "RuPay";
  return "Card";
}

const esc = (v: string) => v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

/** Prints the invoice (choose "Save as PDF" in the print dialog). Returns false if printing could not start. */
function openInvoice(inv: (typeof invoices)[number]) {
  const total = Number(inv.amount.replace(/[^\d]/g, ""));
  const base = Math.round(total / (1 + GST_RATE));
  const gst = total - base;
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(inv.id)}</title>
<style>
  body{font-family:Segoe UI,Arial,sans-serif;color:#1A2238;max-width:720px;margin:40px auto;padding:0 24px}
  h1{font-size:22px;margin:0} .muted{color:#6B6F7B;font-size:13px}
  table{width:100%;border-collapse:collapse;margin-top:24px} td,th{padding:10px 0;border-bottom:1px solid #E8E1D2;text-align:left;font-size:14px}
  td.r,th.r{text-align:right} .tot td{font-weight:700;border-bottom:none}
  .row{display:flex;justify-content:space-between;margin-top:28px}
</style></head><body>
<h1>Tax invoice</h1><p class="muted">${esc(inv.id)} · ${esc(inv.date)}</p>
<div class="row">
  <div><strong>Pavitram JobConnect</strong><p class="muted">GSTIN: not provided</p></div>
  <div><strong>Billed to</strong><p class="muted">${esc(employerCompany.name)}<br>GSTIN: not provided</p></div>
</div>
<table>
  <tr><th>Description</th><th class="r">Amount</th></tr>
  <tr><td>Growth plan — monthly subscription</td><td class="r">${rupees(base)}</td></tr>
  <tr><td>GST @ 18%</td><td class="r">${rupees(gst)}</td></tr>
  <tr class="tot"><td>Total (${esc(inv.status)})</td><td class="r">${rupees(total)}</td></tr>
</table>
<p class="muted" style="margin-top:32px">Amounts are shown inclusive of 18% GST. Add your GSTIN in company settings to have it printed here.</p>
</body></html>`;
  return printHtml(html);
}

export default function BillingPage() {
  const toast = useToast();
  const [stored, write] = useLocalStorage<Billing>(BILLING_KEY);
  const billing: Billing = { ...defaultBilling, ...stored };
  const [modal, setModal] = useState<null | "buy" | "card" | "manage">(null);
  const [switchTo, setSwitchTo] = useState<(typeof plans)[number] | null>(null);

  function save(next: Billing) {
    if (!write(next)) toast("Saved for this session only — browser storage is unavailable.", "info");
  }

  const currentPlan = plans.find((p) => p.name === billing.plan) ?? plans[1];
  const used = employerCompany.creditsTotal - employerCompany.credits;
  const total = currentPlan.credits + billing.extraCredits;
  const remaining = Math.max(0, total - used);

  return (
    <div>
      <PageHeader title="Billing & credits" subtitle="Manage your plan, buy credits, and download bills." />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center gap-2 text-sm text-muted mb-2">
            <Wallet size={16} className="text-brand-600" /> Credit wallet
          </div>
          <p className="font-display text-2xl font-bold text-ink">
            {remaining}<span className="text-sm text-muted font-normal"> / {total}</span>
          </p>
          <button onClick={() => setModal("buy")} className="text-sm font-semibold text-brand-600 mt-2">
            Buy more credits
          </button>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm text-muted mb-2">Current plan</p>
          <p className="font-display text-lg font-bold text-ink">{billing.plan}</p>
          <p className="text-xs text-muted mt-1">
            {billing.cancelAtPeriodEnd ? `Ends ${RENEWS_ON} — won't renew` : `Renews ${RENEWS_ON}`}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm text-muted mb-2">Payment method</p>
          <div className="flex items-center gap-2">
            <CreditCard size={16} className="text-brand-600" />
            <span className="text-sm font-medium text-ink">
              {billing.card.brand} •••• {billing.card.last4}
            </span>
          </div>
          <button onClick={() => setModal("card")} className="text-sm font-semibold text-brand-600 mt-2">
            Change card
          </button>
        </div>
      </div>

      <h2 className="font-display font-semibold text-lg mb-4">Plans</h2>
      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {plans.map((p) => {
          const current = p.name === billing.plan;
          return (
            <div key={p.name} className={`rounded-2xl border p-5 ${current ? "border-brand-500 bg-brand-50" : "border-border bg-surface"}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-display font-semibold text-ink">{p.name}</p>
                {current && <Badge tone="brand">Current</Badge>}
              </div>
              <p className="font-display text-2xl font-bold text-ink mb-3">{p.price}<span className="text-sm text-muted font-normal">/mo</span></p>
              <ul className="flex flex-col gap-1.5 mb-4">
                {p.perks.map((perk) => (
                  <li key={perk} className="text-xs text-muted flex items-center gap-1.5">
                    <Check size={12} className="text-good-500 shrink-0" /> {perk}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => (current ? setModal("manage") : setSwitchTo(p))}
                className={`w-full rounded-xl py-2 text-sm font-semibold ${
                  current ? "bg-white border border-brand-500 text-brand-700" : "bg-brand-500 hover:bg-brand-600 text-ink-900"
                }`}
              >
                {current ? "Manage plan" : "Switch to " + p.name}
              </button>
            </div>
          );
        })}
      </div>

      <h2 className="font-display font-semibold text-lg mb-4">Invoices</h2>
      <div className="rounded-2xl border border-border bg-surface overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted uppercase tracking-wide border-b border-border">
              <th className="px-5 py-3 font-medium">Invoice</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="px-5 py-3.5 font-medium text-ink">{inv.id}</td>
                <td className="px-5 py-3.5 text-muted">{inv.date}</td>
                <td className="px-5 py-3.5 text-muted">{inv.amount}</td>
                <td className="px-5 py-3.5"><Badge tone="good">{inv.status}</Badge></td>
                <td className="px-5 py-3.5">
                  <button
                    onClick={() => {
                      toast('In the print dialog, choose "Save as PDF" to keep the invoice.', "info");
                      if (!openInvoice(inv)) toast("Couldn't open the print dialog in this browser.", "error");
                    }}
                    className="text-muted hover:text-brand-600 flex items-center gap-1 text-xs font-semibold"
                  >
                    <Download size={13} /> GST invoice
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <BuyCreditsModal
        open={modal === "buy"}
        onClose={() => setModal(null)}
        onBuy={(qty) => {
          save({ ...billing, extraCredits: billing.extraCredits + qty });
          setModal(null);
          toast(`${qty} credits added to your wallet.`);
        }}
      />

      <CardModal
        open={modal === "card"}
        onClose={() => setModal(null)}
        onSave={(card) => {
          save({ ...billing, card });
          setModal(null);
          toast(`Payment method updated to ${card.brand} •••• ${card.last4}.`);
        }}
      />

      <Modal
        open={modal === "manage"}
        onClose={() => setModal(null)}
        title={`Manage ${billing.plan} plan`}
        footer={
          <button onClick={() => setModal(null)} className="rounded-xl border border-border text-muted hover:text-ink px-4 py-2 text-sm font-medium">
            Close
          </button>
        }
      >
        <p className="text-muted mb-4">
          {billing.cancelAtPeriodEnd
            ? `Your plan is set to end on ${RENEWS_ON}. You keep full access until then.`
            : `Your plan renews on ${RENEWS_ON} for ${currentPlan.price}.`}
        </p>
        <button
          onClick={() => {
            save({ ...billing, cancelAtPeriodEnd: !billing.cancelAtPeriodEnd });
            toast(billing.cancelAtPeriodEnd ? "Auto-renewal turned back on." : `Auto-renewal turned off. Plan ends ${RENEWS_ON}.`, "info");
            setModal(null);
          }}
          className={`w-full rounded-xl py-2.5 text-sm font-semibold ${
            billing.cancelAtPeriodEnd ? "bg-brand-500 hover:bg-brand-600 text-ink-900" : "border border-bad-500/40 text-bad-500"
          }`}
        >
          {billing.cancelAtPeriodEnd ? "Keep my plan (turn renewal back on)" : "Cancel at end of billing period"}
        </button>
      </Modal>

      <ConfirmModal
        open={switchTo !== null}
        onClose={() => setSwitchTo(null)}
        onConfirm={() => {
          if (switchTo) {
            save({ ...billing, plan: switchTo.name, cancelAtPeriodEnd: false });
            toast(`Switched to the ${switchTo.name} plan.`);
          }
          setSwitchTo(null);
        }}
        title={`Switch to ${switchTo?.name}?`}
        message={`${switchTo?.name} is ${switchTo?.price}/month with ${switchTo?.credits} job credits. Online payments aren't connected yet, so this changes the plan in demo mode — no money is charged.`}
        confirmLabel="Switch plan"
      />
    </div>
  );
}

function BuyCreditsModal({
  open,
  onClose,
  onBuy,
}: {
  open: boolean;
  onClose: () => void;
  onBuy: (qty: number) => void;
}) {
  const [qty, setQty] = useState(10);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Buy job credits"
      maxWidth="max-w-sm"
      footer={
        <button onClick={() => onBuy(qty)} className="w-full rounded-xl bg-brand-500 hover:bg-brand-600 text-ink-900 font-semibold py-2.5 text-sm">
          Pay &amp; add credits
        </button>
      }
    >
      <label className={labelCls}>Number of credits</label>
      <input
        type="range"
        min={5}
        max={100}
        step={5}
        value={qty}
        onChange={(e) => setQty(Number(e.target.value))}
        className="w-full accent-[var(--brand-500)] mb-2"
      />
      <div className="flex justify-between text-sm text-ink font-medium mb-2">
        <span>{qty} credits</span>
        <span>{rupees(qty * CREDIT_PRICE)}</span>
      </div>
      <p className="text-xs text-muted">Online payments aren&apos;t connected yet — credits are added in demo mode and nothing is charged.</p>
    </Modal>
  );
}

function CardModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (card: { brand: string; last4: string }) => void;
}) {
  const toast = useToast();
  const [form, setForm] = useState({ number: "", name: "", expiry: "", cvv: "" });

  // Never leave typed card details sitting in memory after the dialog closes.
  function close() {
    setForm({ number: "", name: "", expiry: "", cvv: "" });
    onClose();
  }

  function submit() {
    const digits = form.number.replace(/\D/g, "");
    if (digits.length < 13 || digits.length > 19 || !luhnOk(digits)) return toast("Enter a valid card number.", "error");
    if (!form.name.trim()) return toast("Enter the name on the card.", "error");
    const m = form.expiry.match(/^(\d{2})\s*\/\s*(\d{2})$/);
    if (!m || Number(m[1]) < 1 || Number(m[1]) > 12) return toast("Enter expiry as MM/YY.", "error");
    const now = new Date();
    const expYear = 2000 + Number(m[2]);
    if (expYear < now.getFullYear() || (expYear === now.getFullYear() && Number(m[1]) < now.getMonth() + 1)) {
      return toast("That card has expired.", "error");
    }
    if (!/^\d{3,4}$/.test(form.cvv)) return toast("Enter the 3 or 4 digit CVV.", "error");

    // Only the brand and last 4 digits are kept — never the full number or CVV.
    onSave({ brand: cardBrand(digits), last4: digits.slice(-4) });
    setForm({ number: "", name: "", expiry: "", cvv: "" });
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Change payment method"
      maxWidth="max-w-sm"
      footer={
        <>
          <button onClick={close} className="rounded-xl border border-border text-muted hover:text-ink px-4 py-2 text-sm font-medium">
            Cancel
          </button>
          <button onClick={submit} className="rounded-xl bg-brand-500 hover:bg-brand-600 text-ink-900 font-semibold px-4 py-2 text-sm">
            Save card
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <div>
          <label className={labelCls}>Card number</label>
          <input
            inputMode="numeric"
            autoComplete="off"
            value={form.number}
            onChange={(e) =>
              setForm({ ...form, number: e.target.value.replace(/\D/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim() })
            }
            placeholder="1234 5678 9012 3456"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Name on card</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Expiry</label>
            <input
              inputMode="numeric"
              value={form.expiry}
              onChange={(e) => {
                const d = e.target.value.replace(/\D/g, "").slice(0, 4);
                setForm({ ...form, expiry: d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d });
              }}
              placeholder="MM/YY"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>CVV</label>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={form.cvv}
              onChange={(e) => setForm({ ...form, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
              className={inputCls}
            />
          </div>
        </div>
        <p className="text-xs text-muted">Demo mode: no payment gateway is connected. Only the card brand and last 4 digits are kept for display.</p>
      </div>
    </Modal>
  );
}
