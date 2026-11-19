"use client";

import Link from "next/link";
import { ArrowRight, Truck, Minus, Plus, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductThumb from "@/components/ProductThumb";
import { useStore } from "@/lib/store";

export default function CartPage() {
  const { state, tierPriceFor, updateCartQty, removeFromCart } = useStore();

  const cartItems = state.cart
    .map((c) => {
      // BUGFIX: prefer the product already embedded on the cart item
      // (from the API) over a lookup in the capped/global state.products
      // list, which could silently drop items from the cart/total.
      const product = c.product || state.products.find((p) => p.id === c.productId);
      if (!product) return null;
      // BUGFIX: cart/checkout ignored variant-specific pricing entirely —
      // a variant with its own price override showed correctly on the
      // product page but silently reverted to the base product price here.
      const activeVariant = c.variantId ? product.variants?.find((v) => v.id === c.variantId) : null;
      const unitPrice = activeVariant?.price ?? (product.channels.includes("b2b") ? tierPriceFor(product, c.qty) : product.price);
      return { ...c, product, unitPrice };
    })
    .filter(Boolean);

  const byVendor = cartItems.reduce((acc, item) => {
    acc[item.product.vendor] = acc[item.product.vendor] || [];
    acc[item.product.vendor].push(item);
    return acc;
  }, {});

  const subtotal = cartItems.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);
  const shipping = cartItems.length === 0 ? 0 : 79 * Object.keys(byVendor).length;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="mx-auto max-w-xl px-5 py-24 text-center">
          <h1 className="font-display text-2xl font-semibold text-ink">Your cart is empty</h1>
          <p className="mt-2 text-sm text-ink-muted">Browse the marketplace and add items to get started.</p>
          <Link
            href="/products"
            className="mt-6 inline-flex rounded-full px-6 py-3 text-sm font-semibold text-white"
            style={{ background: "var(--color-ink)" }}
          >
            Start shopping
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="mx-auto max-w-5xl px-5 py-10 lg:px-8">
        <h1 className="font-display text-3xl font-semibold text-ink">Your Cart</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Items from {Object.keys(byVendor).length} vendor{Object.keys(byVendor).length > 1 ? "s" : ""} — billed once, shipped as {Object.keys(byVendor).length} separate parcel{Object.keys(byVendor).length > 1 ? "s" : ""}.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {Object.entries(byVendor).map(([vendor, items]) => (
              <div key={vendor} className="rounded-2xl border border-line bg-paper-raised">
                <div className="flex items-center gap-2 border-b border-line px-5 py-3">
                  <Truck size={15} style={{ color: "var(--color-jade)" }} />
                  <p className="text-sm font-semibold text-ink">{vendor}</p>
                  <span className="text-xs text-ink-muted">— shipped separately</span>
                </div>
                {items.map(({ id, product, qty, unitPrice }) => (
                  <div key={id} className="flex items-center gap-4 border-b border-line px-5 py-4 last:border-0">
                    <div
                      className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl text-2xl"
                      style={{ background: `${product.color}1a` }}
                    >
                      <ProductThumb image={product.image} fill emojiSize={26} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink">{product.name}</p>
                      <p className="mt-1 font-mono text-sm text-ink-muted">
                        ₹{unitPrice.toLocaleString("en-IN")} / unit
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center rounded-full border border-line">
                          <button
                            onClick={() => updateCartQty(id, qty - 1)}
                            className="grid h-7 w-7 place-items-center text-ink-muted hover:text-ink"
                            aria-label="Decrease"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-10 text-center text-xs font-semibold text-ink">{qty}</span>
                          <button
                            onClick={() => updateCartQty(id, qty + 1)}
                            className="grid h-7 w-7 place-items-center text-ink-muted hover:text-ink"
                            aria-label="Increase"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(id)}
                          className="flex items-center gap-1 text-xs font-medium"
                          style={{ color: "var(--color-rose)" }}
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>
                    <p className="font-mono text-sm font-semibold text-ink">
                      ₹{(unitPrice * qty).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="h-fit rounded-2xl border border-line bg-paper-raised p-5">
            <h3 className="font-display text-base font-semibold text-ink">Order Summary</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-ink-muted">
                <span>Subtotal</span>
                <span className="font-mono text-ink">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-ink-muted">
                <span>Shipping</span>
                <span className="font-mono text-ink">₹{shipping}</span>
              </div>
              <div className="flex justify-between border-t border-line pt-2 font-semibold text-ink">
                <span>Total</span>
                <span className="font-mono">₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="mt-5 flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white"
              style={{ background: "var(--color-ink)" }}
            >
              Proceed to Checkout <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
