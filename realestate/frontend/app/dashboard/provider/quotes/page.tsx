"use client";

import { useState } from "react";
import { Plus, Trash2, Send, Info } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { providerNav } from "@/lib/nav-config";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatINR } from "@/lib/api/format";

const pendingRequests = [
  { id: "QR-771", customer: "Karan Mehta", request: "Bulk cement & tiles for 3BHK renovation", deadline: "Respond by 20 Aug" },
  { id: "QR-772", customer: "Priya Nair", request: "Sanitaryware set — full bathroom fit-out", deadline: "Respond by 21 Aug" },
];

type LineItem = { id: number; name: string; qty: number; rate: number };

export default function ProviderQuotesPage() {
  const [items, setItems] = useState<LineItem[]>([
    { id: 1, name: "OPC 53-grade cement (bag)", qty: 40, rate: 420 },
    { id: 2, name: "Vitrified floor tiles (sqft)", qty: 600, rate: 65 },
  ]);

  function updateItem(id: number, field: keyof LineItem, value: string) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: field === "name" ? value : Number(value) } : it))
    );
  }

  function addItem() {
    setItems((prev) => [...prev, { id: Date.now(), name: "", qty: 1, rate: 0 }]);
  }

  function removeItem(id: number) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  const total = items.reduce((sum, it) => sum + it.qty * it.rate, 0);

  return (
    <DashboardShell
      groups={providerNav}
      roleColor="info"
      pageTitle="Quotes"
      pageSubtitle="Respond to quote requests with itemized pricing"
    >
      <div className="mb-5 flex items-start gap-2 rounded-xl border border-info-100 bg-info-100/30 p-3.5 text-xs text-text-600">
        <Info size={15} className="mt-0.5 shrink-0 text-info-600" />
        Itemized quotes aren&apos;t persisted by the backend yet (no quotes model exists there). This
        builder works locally — wiring it up needs a small `quotes` module added to the NestJS backend.
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader eyebrow="Awaiting response" title="Quote requests" />
          <ul className="space-y-3">
            {pendingRequests.map((r) => (
              <li key={r.id} className="rounded-xl border border-stone-200 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-text-400">{r.id}</span>
                  <Badge variant="warning">{r.deadline}</Badge>
                </div>
                <p className="mt-1.5 text-sm font-medium text-ink-900">{r.customer}</p>
                <p className="mt-0.5 text-xs text-text-600">{r.request}</p>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader eyebrow="Quote builder" title="Itemized quote — Karan Mehta" subtitle="QR-771 · Bulk cement & tiles" />

          <div className="overflow-x-auto">
            <table className="w-full min-w-max border-collapse text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-xs uppercase text-text-500">
                  <th className="py-2 text-left">Item</th>
                  <th className="w-20 py-2 text-right">Qty</th>
                  <th className="w-28 py-2 text-right">Rate (₹)</th>
                  <th className="w-28 py-2 text-right">Total</th>
                  <th className="w-10 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-b border-stone-100">
                    <td className="py-2 pr-2">
                      <input
                        value={it.name}
                        onChange={(e) => updateItem(it.id, "name", e.target.value)}
                        placeholder="Item name"
                        className="w-full rounded-md border border-stone-200 px-2 py-1.5 text-sm outline-none"
                      />
                    </td>
                    <td className="py-2">
                      <input
                        type="number"
                        value={it.qty}
                        onChange={(e) => updateItem(it.id, "qty", e.target.value)}
                        className="w-full rounded-md border border-stone-200 px-2 py-1.5 text-right text-sm outline-none"
                      />
                    </td>
                    <td className="py-2">
                      <input
                        type="number"
                        value={it.rate}
                        onChange={(e) => updateItem(it.id, "rate", e.target.value)}
                        className="w-full rounded-md border border-stone-200 px-2 py-1.5 text-right text-sm outline-none"
                      />
                    </td>
                    <td className="py-2 text-right font-medium text-ink-900">{formatINR(it.qty * it.rate)}</td>
                    <td className="py-2 text-right">
                      <button onClick={() => removeItem(it.id)} className="text-text-400 hover:text-danger-600">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={addItem} className="mt-3 flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700">
            <Plus size={14} /> Add line item
          </button>

          <div className="mt-5 flex items-center justify-between rounded-xl bg-stone-50 p-4">
            <span className="text-sm text-text-600">Estimated total</span>
            <span className="font-display text-xl font-medium text-ink-900">{formatINR(total)}</span>
          </div>

          <Button variant="primary" size="md" icon={<Send size={15} />} className="mt-4 w-full">
            Send quote to customer
          </Button>
        </Card>
      </div>
    </DashboardShell>
  );
}
