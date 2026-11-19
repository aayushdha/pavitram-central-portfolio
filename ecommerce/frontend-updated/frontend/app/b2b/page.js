import Link from "next/link";
import { ArrowRight, FileText, Users, Wallet, Truck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductThumb from "@/components/ProductThumb";
import api from "@/lib/api";

function unwrap(res) {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

export const dynamic = "force-dynamic";

const features = [
  { icon: FileText, title: "RFQ → Quotation → PO", text: "Submit specs and quantity, compare quotations from multiple vendors, and confirm with a PO." },
  { icon: Users, title: "Multi-user company accounts", text: "Company Admin, Purchase Manager, Approver, and Accountant roles with spend thresholds." },
  { icon: Wallet, title: "Credit terms & consolidated billing", text: "Net 15/30/45/60 terms, GST e-invoicing, and one consolidated invoice per billing cycle." },
  { icon: Truck, title: "Multi-branch, staggered shipping", text: "Deliver to multiple warehouses and receive large orders in tracked partial batches." },
];

export default async function B2BLanding() {
  const res = await api.products.list({ channel: "b2b", limit: 3 }).catch(() => []);
  const bulkProducts = unwrap(res).slice(0, 3);

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <section className="border-b border-line" style={{ background: "var(--color-jade-dim)" }}>
        <div className="mx-auto max-w-[1600px] px-5 py-16 lg:px-8">
          <span
            className="inline-flex rounded-full px-3 py-1 text-xs font-semibold text-white"
            style={{ background: "var(--color-jade)" }}
          >
            Business Buyer Portal
          </span>
          <h1 className="mt-5 max-w-2xl font-display text-4xl font-semibold leading-tight text-ink">
            Procure at wholesale scale, with the paperwork handled for you.
          </h1>
          <p className="mt-4 max-w-xl text-[15px] text-ink-muted">
            Register your business once, get GST-verified in days, and
            unlock tiered pricing, RFQs, credit limits, and consolidated
            GST invoicing across every vendor on Pavitram.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/business/signup"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white"
              style={{ background: "var(--color-jade)" }}
            >
              Sell / Buy in Bulk <ArrowRight size={16} />
            </Link>
            <Link
              href="/b2b/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-paper-raised px-6 py-3 text-sm font-semibold text-ink"
            >
              View demo dashboard
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 py-14 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-line bg-paper-raised p-5">
              <f.icon size={20} style={{ color: "var(--color-jade)" }} />
              <h3 className="mt-3 font-display text-sm font-semibold text-ink">{f.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 pb-20 lg:px-8">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl font-semibold text-ink">Popular for bulk ordering</h2>
          <Link href="/products" className="text-sm font-medium" style={{ color: "var(--color-jade)" }}>
            Browse full catalog →
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {bulkProducts.map((p) => (
            <Link
              key={p.id}
              href={`/products/${p.id}`}
              className="rounded-2xl border border-line bg-paper-raised p-5"
            >
              <span className="block h-11 w-11 overflow-hidden rounded-md text-3xl">
                <ProductThumb image={p.image} fill emojiSize={30} />
              </span>
              <p className="mt-3 line-clamp-2 font-display text-sm font-semibold text-ink">{p.name}</p>
              <p className="mt-1 text-xs text-ink-muted">MOQ {p.moq} units</p>
              <p className="mt-2 font-mono text-sm font-semibold" style={{ color: "var(--color-jade)" }}>
                from ₹{p.tierPricing.at(-1).price.toLocaleString("en-IN")}/unit
              </p>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
