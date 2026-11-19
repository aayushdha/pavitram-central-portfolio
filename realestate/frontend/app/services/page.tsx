"use client";

import { useState } from "react";
import { Star, ShieldCheck, MessageSquare, Hammer, Scale, Wrench, HandCoins } from "lucide-react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { serviceProviders, ServiceCategory } from "@/lib/mock-data";

const categories: { label: ServiceCategory | "All"; icon: typeof Hammer }[] = [
  { label: "All", icon: ShieldCheck },
  { label: "Material Suppliers", icon: Hammer },
  { label: "Legal Services", icon: Scale },
  { label: "Home Services", icon: Wrench },
  { label: "Finance & Loans", icon: HandCoins },
];

const bundles = [
  { name: "New Home Setup", items: "Electrician check + Deep cleaning + Painter", price: "₹6,499" },
  { name: "Move-In Legal Pack", items: "Sale deed review + Title check + Rent agreement", price: "₹3,999" },
  { name: "Loan Fast-Track", items: "Eligibility check + Document review + Rate comparison", price: "Free" },
];

export default function ServicesPage() {
  const [active, setActive] = useState<ServiceCategory | "All">("All");
  const filtered =
    active === "All" ? serviceProviders : serviceProviders.filter((p) => p.category === active);

  return (
    <>
      <Navbar />
      <main>
        <section className="border-b border-stone-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <p className="font-mono text-xs uppercase tracking-wider text-brand-600">Module D</p>
            <h1 className="mt-1 font-display text-3xl font-medium text-ink-900">
              Everything after the keys, in one place
            </h1>
            <p className="mt-3 max-w-2xl text-text-600">
              Material suppliers, legal consultants, home-service professionals and a finance
              advisory team — verified, bookable and chat-accessible without leaving Pavitram.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Bundled packages */}
          <div className="mb-10 grid gap-4 sm:grid-cols-3">
            {bundles.map((b) => (
              <div key={b.name} className="rounded-2xl border border-brass-200 bg-brass-50/60 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-brass-700">Bundle</p>
                <h3 className="mt-1 font-display text-lg font-medium text-ink-900">{b.name}</h3>
                <p className="mt-1.5 text-sm text-text-600">{b.items}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-display text-lg font-medium text-ink-900">{b.price}</span>
                  <Button variant="outline" size="sm">
                    View bundle
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Category filter */}
          <div className="mb-6 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.label}
                onClick={() => setActive(c.label)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  active === c.label
                    ? "border-ink-900 bg-ink-900 text-white"
                    : "border-stone-200 bg-white text-text-600 hover:border-stone-300"
                }`}
              >
                <c.icon size={14} />
                {c.label}
              </button>
            ))}
          </div>

          {/* Provider grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <div key={p.id} className="rounded-2xl border border-stone-200 bg-white p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-900 text-sm font-semibold text-white">
                      {p.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink-900">{p.name}</p>
                      <p className="text-xs text-text-500">{p.city}</p>
                    </div>
                  </div>
                  {p.verified && <Badge variant="verified">Verified</Badge>}
                </div>

                <p className="mt-3.5 text-sm text-text-600">{p.specialty}</p>

                <div className="mt-3 flex items-center gap-1 text-sm text-brass-600">
                  <Star size={13} className="fill-brass-500 text-brass-500" />
                  <span className="font-medium text-ink-900">{p.rating}</span>
                  <span className="text-text-400">({p.reviews} reviews)</span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4">
                  <span className="text-sm font-medium text-ink-900">{p.priceFrom}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" icon={<MessageSquare size={13} />}>
                      Chat
                    </Button>
                    <Button variant="primary" size="sm">
                      Book
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
