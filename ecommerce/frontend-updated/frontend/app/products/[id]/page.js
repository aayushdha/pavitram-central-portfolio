"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Star, ShieldCheck, Minus, Plus } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Badge from "@/components/Badge";
import ProductCard from "@/components/ProductCard";
import ProductThumb from "@/components/ProductThumb";
import { useStore } from "@/lib/store";

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { state, tierPriceFor, addToCart } = useStore();
  const product = state.products.find((p) => p.id === id && p.status === "Approved");
  const [qty, setQty] = useState(1);
  const [variant, setVariant] = useState(0);
  const [activeMedia, setActiveMedia] = useState(0);

  const related = useMemo(
    () => (product ? state.products.filter((p) => p.status === "Approved" && p.category === product.category && p.id !== product.id).slice(0, 3) : []),
    [product, state.products]
  );

  if (!product) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="mx-auto max-w-xl px-5 py-24 text-center">
          <h1 className="font-display text-2xl font-semibold text-ink">Product not found</h1>
          <p className="mt-2 text-sm text-ink-muted">It may have been removed by the vendor.</p>
          <Link href="/products" className="mt-5 inline-block text-sm font-semibold" style={{ color: "var(--color-gold)" }}>
            ← Back to shop
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const isB2B = product.channels.includes("b2b");
  const activeVariant = product.variants?.[variant];
  // BUGFIX: unitPrice/stock always used the base product's values, ignoring
  // the selected variant entirely — a variant with its own price or its own
  // (possibly zero) stock had no effect on what the customer was shown or
  // charged, or on whether Add to Cart was even blocked.
  const availableStock = activeVariant?.stock ?? product.stock;
  const unitPrice = activeVariant?.price ?? (isB2B ? tierPriceFor(product, qty) : product.price);
  const lineTotal = unitPrice * qty;
  const minQty = isB2B ? product.moq || 1 : 1;

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="mx-auto max-w-[1600px] px-5 py-10 lg:px-8">
        <nav className="mb-6 text-xs text-ink-muted">
          <Link href="/products" className="hover:text-ink">Shop</Link> /{" "}
          <span className="text-ink">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            {(() => {
              // Media strip = photo gallery first, then videos. Falls back
              // to the single cover `image` field for older products that
              // were never re-saved with a gallery.
              const media = [
                ...((product.images?.length ? product.images : product.image ? [product.image] : []).map((url) => ({ type: "image", url }))),
                ...((product.videos || []).map((url) => ({ type: "video", url }))),
              ];
              const current = media[activeMedia] || media[0];

              return (
                <>
                  <div
                    className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-line text-9xl"
                    style={{ background: `${product.color}1a` }}
                  >
                    {!current ? (
                      <ProductThumb image={product.image} fill emojiSize={110} />
                    ) : current.type === "video" ? (
                      <video src={current.url} controls className="h-full w-full object-cover" />
                    ) : (
                      <ProductThumb image={current.url} fill emojiSize={110} />
                    )}
                  </div>

                  {media.length > 1 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                      {media.map((m, i) => (
                        <button
                          key={`${m.type}-${i}`}
                          onClick={() => setActiveMedia(i)}
                          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors"
                          style={{ borderColor: i === activeMedia ? "var(--color-gold)" : "var(--color-line)" }}
                        >
                          {m.type === "video" ? (
                            <video src={m.url} className="h-full w-full object-cover" muted />
                          ) : (
                            <ProductThumb image={m.url} fill emojiSize={22} />
                          )}
                          {m.type === "video" && (
                            <span className="absolute inset-0 flex items-center justify-center bg-black/25 text-[10px] font-semibold text-white">▶</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              {product.channels.includes("b2c") && <Badge tone="gold">Retail</Badge>}
              {isB2B && <Badge tone="jade">Bulk B2B</Badge>}
              {availableStock <= 0 && <Badge tone="rose">Out of stock</Badge>}
            </div>
            <h1 className="mt-3 font-display text-3xl font-semibold text-ink">
              {product.name}
            </h1>
            <Link href={`/store/${product.vendorId}`} className="mt-1 inline-block text-sm text-ink-muted hover:text-ink hover:underline">
              Sold by {product.vendor}
            </Link>
            <div className="mt-2 flex items-center gap-1 text-sm">
              <Star size={14} style={{ color: "var(--color-gold)" }} />
              <span className="font-medium text-ink">{product.rating}</span>
              <span className="text-ink-muted">({product.reviews} ratings)</span>
            </div>

            {product.variants && product.variants.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Variant</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.variants.map((v, i) => (
                    <button
                      key={v.id || i}
                      onClick={() => setVariant(i)}
                      className="rounded-full border px-4 py-1.5 text-xs font-semibold"
                      style={{
                        borderColor: variant === i ? "var(--color-gold)" : "var(--color-line)",
                        background: variant === i ? "var(--color-gold-dim)" : "transparent",
                        color: "var(--color-ink)",
                      }}
                    >
                      {v.name} {v.stock !== undefined ? `· ${v.stock} left` : ""}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-mono text-3xl font-semibold text-ink">
                ₹{unitPrice.toLocaleString("en-IN")}
              </span>
              <span className="font-mono text-base text-ink-muted line-through">
                ₹{product.mrp.toLocaleString("en-IN")}
              </span>
              <span className="text-sm font-semibold" style={{ color: "var(--color-rose)" }}>
                {discount}% off
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-muted">
              Inclusive of all taxes · {isB2B && qty >= (product.tierPricing?.[1]?.min || Infinity) ? "Bulk tier price" : "Retail (B2C) price"}
            </p>

            <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-muted">
              {product.description}
            </p>

            <div className="mt-6 flex items-center gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Quantity</p>
              <div className="flex items-center rounded-full border border-line">
                <button
                  onClick={() => setQty((q) => Math.max(minQty, q - 1))}
                  className="grid h-9 w-9 place-items-center text-ink-muted hover:text-ink"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <input
                  value={qty}
                  onChange={(e) => setQty(Math.max(minQty, Number(e.target.value.replace(/\D/g, "")) || minQty))}
                  className="w-14 border-x border-line bg-transparent text-center text-sm font-semibold text-ink outline-none"
                />
                <button
                  onClick={() => setQty((q) => Math.min(availableStock, q + 1))}
                  className="grid h-9 w-9 place-items-center text-ink-muted hover:text-ink"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
              {isB2B && <span className="text-xs text-ink-muted">MOQ {product.moq} units</span>}
            </div>
            <p className="mt-2 font-mono text-sm text-ink-muted">
              Line total: <span className="font-semibold text-ink">₹{lineTotal.toLocaleString("en-IN")}</span>
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => addToCart(product.id, qty, activeVariant?.id || null)}
                disabled={availableStock <= 0 || (isB2B && qty < product.moq)}
                className="rounded-full px-7 py-3 text-sm font-semibold text-white disabled:opacity-40"
                style={{ background: "var(--color-ink)" }}
              >
                Add to Cart
              </button>
              <button
                onClick={() => {
                  addToCart(product.id, qty, activeVariant?.id || null);
                  router.push("/checkout");
                }}
                disabled={availableStock <= 0 || (isB2B && qty < product.moq)}
                className="rounded-full border px-7 py-3 text-sm font-semibold disabled:opacity-40"
                style={{ borderColor: "var(--color-line)", color: "var(--color-ink)" }}
              >
                Buy Now
              </button>
            </div>
            {isB2B && qty < product.moq && (
              <p className="mt-2 text-xs" style={{ color: "var(--color-rose)" }}>
                Minimum order quantity for bulk is {product.moq} units.
              </p>
            )}

            <div className="mt-6 flex items-center gap-2 text-xs text-ink-muted">
              <ShieldCheck size={16} style={{ color: "var(--color-jade)" }} />
              7-day return · GST invoice included · {availableStock.toLocaleString("en-IN")} in stock
            </div>

            {isB2B && (
              <div className="mt-8 rounded-2xl border p-5" style={{ borderColor: "var(--color-jade)", background: "var(--color-jade-dim)" }}>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-semibold text-ink">
                    Buying in bulk?
                  </h3>
                  <Badge tone="jade">MOQ {product.moq} units</Badge>
                </div>
                <table className="mt-4 w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs text-ink-muted">
                      <th className="pb-2 font-medium">Quantity</th>
                      <th className="pb-2 font-medium">Price / unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.tierPricing.map((t) => (
                      <tr
                        key={t.min}
                        className="border-t border-jade/20"
                        style={{ fontWeight: qty >= t.min && (t.max === null || qty <= t.max) ? 700 : 400 }}
                      >
                        <td className="py-2 font-mono text-ink">
                          {t.min}{t.max ? `–${t.max}` : "+"} units
                        </td>
                        <td className="py-2 font-mono font-semibold" style={{ color: "var(--color-jade)" }}>
                          ₹{t.price.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Link
                  href={`/b2b/rfq?product=${product.id}`}
                  className="mt-4 inline-flex rounded-full px-5 py-2.5 text-sm font-semibold text-white"
                  style={{ background: "var(--color-jade)" }}
                >
                  Request a custom quotation
                </Link>
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-xl font-semibold text-ink">
              More from this category
            </h2>
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
      <Footer />
    </div>
  );
}
