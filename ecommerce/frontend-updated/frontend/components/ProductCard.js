"use client";

import Link from "next/link";
import { Star, Plus, Heart } from "lucide-react";
import Badge from "./Badge";
import ProductThumb from "./ProductThumb";
import { useStore } from "@/lib/store";

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, state } = useStore();
  const wishlisted = state.wishlist.includes(product.id);
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-paper-raised transition-shadow hover:shadow-md">
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist(product.id);
        }}
        aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
        className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-transform hover:scale-110"
      >
        <Heart size={15} fill={wishlisted ? "var(--color-rose)" : "none"} style={{ color: wishlisted ? "var(--color-rose)" : "var(--color-ink-muted)" }} />
      </button>
      <Link href={`/products/${product.id}`} className="block">
        <div
          className="flex h-40 items-center justify-center overflow-hidden text-5xl"
          style={{ background: `${product.color}1a` }}
        >
          <ProductThumb image={product.image} fill />
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-1.5">
          {product.channels.includes("b2c") && <Badge tone="gold">Retail</Badge>}
          {product.channels.includes("b2b") && <Badge tone="jade">Bulk B2B</Badge>}
        </div>
        <Link href={`/products/${product.id}`}>
          <h3 className="line-clamp-2 font-display text-[15px] font-semibold leading-snug text-ink">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-ink-muted">{product.vendor}</p>
        <div className="flex items-center gap-1 text-xs text-ink-muted">
          <Star size={13} style={{ color: "var(--color-gold)" }} />
          <span className="font-medium text-ink">{product.rating}</span>
          <span>({product.reviews})</span>
        </div>
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="font-mono text-base font-semibold text-ink">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
          <span className="font-mono text-xs text-ink-muted line-through">
            ₹{product.mrp.toLocaleString("en-IN")}
          </span>
          <span className="text-xs font-semibold" style={{ color: "var(--color-rose)" }}>
            {discount}% off
          </span>
        </div>
        {product.channels.includes("b2b") && (
          <p className="text-[11px] text-ink-muted">
            Bulk from ₹{product.tierPricing.at(-1).price.toLocaleString("en-IN")}/unit · MOQ {product.moq}
          </p>
        )}
        <p className="text-[11px] text-ink-muted">{product.stock.toLocaleString("en-IN")} in stock</p>
        <button
          onClick={(e) => {
            e.preventDefault();
            // BUGFIX: quick-add always added exactly 1 unit, even for
            // B2B-only products with a Minimum Order Quantity (MOQ) greater
            // than 1. That let a shopper add a below-MOQ quantity straight
            // from the listing grid and carry it all the way to checkout,
            // which has no MOQ check of its own — contradicting "MOQ is
            // enforced, you can't check out below it". For a B2B-only
            // listing, quick-add now adds the MOQ instead of 1 unit.
            const isB2bOnly = product.channels.includes("b2b") && !product.channels.includes("b2c");
            addToCart(product.id, isB2bOnly ? product.moq || 1 : 1);
          }}
          disabled={product.stock <= 0}
          className="mt-2 flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white disabled:opacity-40"
          style={{ background: "var(--color-ink)" }}
        >
          <Plus size={13} /> Add to cart
        </button>
      </div>
    </div>
  );
}
