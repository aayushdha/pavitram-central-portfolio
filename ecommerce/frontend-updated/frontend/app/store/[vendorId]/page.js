"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Star, ShieldCheck, MapPin, Globe, AtSign, Building2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import Badge from "@/components/Badge";
import { useStore } from "@/lib/store";

export default function VendorStorefront() {
  const { vendorId } = useParams();
  const { state } = useStore();
  const vendor = state.vendors.find((v) => v.id === vendorId);
  const isOwnStore = state.storeProfile && vendor && state.storeProfile.name === vendor.name;
  const profile = isOwnStore ? state.storeProfile : null;
  const products = state.products.filter((p) => p.vendorId === vendorId && p.status === "Approved");
  const b2cCount = products.filter((p) => p.channels.includes("b2c")).length;
  const b2bCount = products.filter((p) => p.channels.includes("b2b")).length;

  if (!vendor) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="mx-auto max-w-xl px-5 py-24 text-center">
          <h1 className="font-display text-2xl font-semibold text-ink">Store not found</h1>
          <p className="mt-2 text-sm text-ink-muted">This vendor storefront doesn&apos;t exist or was removed.</p>
          <Link href="/products" className="mt-5 inline-block text-sm font-semibold" style={{ color: "var(--color-gold)" }}>
            ← Back to shop
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const initials = vendor.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      {/* Storefront banner */}
      <section className="dot-grid relative overflow-hidden" style={{ background: "var(--color-navy)" }}>
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(circle at 15% 20%, rgba(230,172,82,0.16), transparent 55%)" }}
        />
        <div className="relative mx-auto max-w-[1600px] px-5 py-12 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <span
              className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl border text-2xl font-bold text-white"
              style={{ borderColor: "var(--color-gold)", background: "var(--color-navy-2)" }}
            >
              {initials}
            </span>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-3xl font-semibold text-white">{vendor.name}</h1>
                {vendor.status === "Active" && (
                  <span
                    className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                    style={{ background: "rgba(47,157,120,0.18)", color: "var(--color-jade-light)" }}
                  >
                    <ShieldCheck size={12} /> Verified seller
                  </span>
                )}
              </div>
              <p className="mt-1 max-w-xl text-sm" style={{ color: "var(--color-navy-muted)" }}>
                {profile?.tagline || `Verified marketplace seller across ${vendor.categories?.join(", ") || "multiple categories"}.`}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs" style={{ color: "var(--color-navy-muted)" }}>
                <span className="flex items-center gap-1">
                  <Star size={13} style={{ color: "var(--color-gold-light)" }} /> {vendor.rating || "New"} rating
                </span>
                <span>Return rate {vendor.returns}</span>
                <span>Seller since {vendor.joined}</span>
                {profile?.social?.website && (
                  <span className="flex items-center gap-1"><Globe size={13} /> {profile.social.website}</span>
                )}
                {profile?.social?.instagram && (
                  <span className="flex items-center gap-1"><AtSign size={13} /> {profile.social.instagram}</span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {b2cCount > 0 && <Badge tone="gold">{b2cCount} retail products</Badge>}
              {b2bCount > 0 && <Badge tone="jade">{b2bCount} bulk products</Badge>}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1600px] px-5 py-10 lg:px-8">
        {profile?.warehouses?.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-3">
            {profile.warehouses.map((w) => (
              <span key={w.id} className="flex items-center gap-1.5 rounded-full border border-line bg-paper-raised px-3 py-1.5 text-xs text-ink-muted">
                <MapPin size={12} style={{ color: "var(--color-gold)" }} /> {w.label} · {w.pincode}
              </span>
            ))}
          </div>
        )}

        {b2bCount > 0 && (
          <div className="mb-8 flex flex-col items-start gap-3 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: "var(--color-jade)", background: "var(--color-jade-dim)" }}>
            <div className="flex items-center gap-3">
              <Building2 size={20} style={{ color: "var(--color-jade)" }} />
              <p className="text-sm text-ink">
                Buying in bulk from <span className="font-semibold">{vendor.name}</span>? Send an RFQ for custom pricing and lead times.
              </p>
            </div>
            <Link href="/b2b/rfq" className="shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold text-white" style={{ background: "var(--color-jade)" }}>
              Request a quotation
            </Link>
          </div>
        )}

        <h2 className="font-display text-xl font-semibold text-ink">
          {products.length} product{products.length === 1 ? "" : "s"} from this store
        </h2>
        {products.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-line p-12 text-center text-sm text-ink-muted">
            This store hasn&apos;t listed any products yet.
          </p>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
