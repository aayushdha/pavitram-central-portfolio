"use client";

import { useState } from "react";
import Link from "next/link";
import { BellRing, BellOff } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Input, Button } from "@/components/Field";
import { useStore } from "@/lib/store";

// Doc §3.1 "Wishlist & Price-Drop Alerts" — inline control under each saved
// product to set/clear the target price the customer wants to be notified at.
function PriceAlertRow({ product }) {
  const { state, setWishlistPriceAlert } = useStore();
  const item = state.wishlistItems.find((w) => w.productId === product.id);
  const [value, setValue] = useState(item?.alertPrice ?? "");

  if (!item) return null;

  return (
    <div className="mt-1 flex items-center gap-1.5">
      {item.alertActive && item.alertPrice != null ? (
        <>
          <BellRing size={12} style={{ color: "var(--color-gold)" }} />
          <span className="text-[11px] text-ink-muted">Alert at ₹{item.alertPrice}</span>
          <button
            className="text-[11px] font-semibold"
            style={{ color: "var(--color-rose)" }}
            onClick={() => setWishlistPriceAlert(item.id, null)}
          >
            Remove
          </button>
        </>
      ) : (
        <>
          <BellOff size={12} className="text-ink-muted" />
          <Input
            type="number"
            placeholder="Target ₹"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="!w-24 !py-1 text-[11px]"
          />
          <Button
            variant="ghost"
            className="!px-2 !py-1 text-[11px]"
            disabled={!value}
            onClick={() => setWishlistPriceAlert(item.id, Number(value))}
          >
            Notify me
          </Button>
        </>
      )}
    </div>
  );
}

export default function WishlistPage() {
  const { state } = useStore();
  const items = state.products.filter((p) => state.wishlist.includes(p.id));

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="mx-auto max-w-[1600px] px-5 py-10 lg:px-8">
        <h1 className="font-display text-3xl font-semibold text-ink">Your Wishlist</h1>
        <p className="mt-1 text-sm text-ink-muted">{items.length} saved product{items.length === 1 ? "" : "s"}</p>

        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-line p-16 text-center">
            <p className="font-display text-lg font-semibold text-ink">Nothing saved yet</p>
            <p className="mt-1 text-sm text-ink-muted">Tap the heart on any product to save it here for later.</p>
            <Link href="/products" className="mt-5 inline-flex rounded-full px-6 py-3 text-sm font-semibold text-white" style={{ background: "var(--color-ink)" }}>
              Browse products
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((p) => (
              // BUGFIX: PriceAlertRow (the bell icon / "Alert at ₹X" / target-price
              // input the guide describes in Section 1.5) was fully built but never
              // actually rendered anywhere — ProductCard has no slot for it and this
              // page only ever rendered bare ProductCards. The whole price-drop-alert
              // feature was unreachable through the UI. Rendered here, under each card.
              <div key={p.id}>
                <ProductCard product={p} />
                <PriceAlertRow product={p} />
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
