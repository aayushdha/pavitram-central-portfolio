"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useStore } from "@/lib/store";
import api from "@/lib/api";

// BUGFIX (was pulling from the globally preloaded state.products slice):
//  1. That global slice is fetched once with `limit: 200` and NO status
//     filter, even though the backend explicitly documents that public
//     storefront calls MUST pass status=Approved — everything else
//     (Pending/Rejected listings, including other vendors' unapproved
//     pricing/images) was being shipped to every visitor's browser and
//     merely hidden by a client-side `p.status === "Approved"` check.
//     Anyone opening devtools could see unapproved catalog data.
//  2. Because that 200-item cap mixed every status together, approved
//     products could silently fall off the storefront once total product
//     rows (pending+rejected+approved) passed 200.
//  3. The search box did a plain `.includes()` substring match, completely
//     bypassing the backend's typo-tolerant fuzzy search endpoint — so the
//     documented "bansmati still finds basmati" behavior never worked.
// Fix: fetch directly from the products API with status=Approved and the
// real search/category/channel params, so status filtering and fuzzy
// search happen server-side as designed.
function useDebounced(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function ProductsPage() {
  const { state } = useStore();
  const categories = state.categories;
  const [category, setCategory] = useState("all");
  const [channel, setChannel] = useState("all");
  const [sort, setSort] = useState("popular");
  const [q, setQ] = useState("");
  const debouncedQ = useDebounced(q, 300);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.products
      .list({
        status: "Approved",
        category: category === "all" ? undefined : category,
        channel: channel === "all" ? undefined : channel,
        search: debouncedQ.trim() || undefined,
        limit: 200,
      })
      .then((res) => {
        if (!cancelled) setProducts(res?.data || []);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [category, channel, debouncedQ]);

  const filtered = useMemo(() => {
    let list = products;
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [sort, products]);

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="mx-auto max-w-[1600px] px-5 py-10 lg:px-8">
        <h1 className="font-display text-3xl font-semibold text-ink">
          Shop the marketplace
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {filtered.length} products across {categories.length} categories
        </p>

        <div className="relative mt-5 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products or vendors…"
            className="w-full rounded-full border border-line bg-paper-raised py-2.5 pl-10 pr-4 text-sm text-ink outline-none focus:border-[var(--color-gold)]"
          />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
          <aside className="space-y-8">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Category
              </h3>
              <div className="mt-3 flex flex-col gap-1">
                <FilterButton
                  active={category === "all"}
                  onClick={() => setCategory("all")}
                  label="All categories"
                />
                {categories.map((c) => (
                  <FilterButton
                    key={c.id}
                    active={category === c.id}
                    onClick={() => setCategory(c.id)}
                    label={`${c.icon} ${c.name}`}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Buying as
              </h3>
              <div className="mt-3 flex flex-col gap-1">
                <FilterButton active={channel === "all"} onClick={() => setChannel("all")} label="Any" />
                <FilterButton active={channel === "b2c"} onClick={() => setChannel("b2c")} label="Retail (B2C)" />
                <FilterButton active={channel === "b2b"} onClick={() => setChannel("b2b")} label="Bulk / Business (B2B)" />
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-5 flex justify-end">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-full border border-line bg-paper-raised px-4 py-2 text-sm text-ink"
              >
                <option value="popular">Sort: Popular</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Rating</option>
              </select>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-dashed border-line p-16 text-center">
                <p className="text-sm text-ink-muted">Loading products…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line p-16 text-center">
                <p className="font-display text-lg font-semibold text-ink">
                  No products match these filters
                </p>
                <p className="mt-1 text-sm text-ink-muted">
                  Try a different category or switch buying mode.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function FilterButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg px-2.5 py-1.5 text-left text-sm font-medium transition-colors"
      style={{
        background: active ? "var(--color-gold-dim)" : "transparent",
        color: active ? "var(--color-ink)" : "var(--color-ink-muted)",
      }}
    >
      {label}
    </button>
  );
}
