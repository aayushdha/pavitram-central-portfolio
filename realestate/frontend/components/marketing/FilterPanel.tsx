"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

const propertyTypes = ["Apartment", "Villa", "Plot", "Commercial", "PG/Co-living"];
const budgets = [
  { label: "Any budget", value: "" },
  { label: "Under ₹50 L", value: "0-5000000" },
  { label: "₹50 L – ₹1 Cr", value: "5000000-10000000" },
  { label: "₹1 Cr – ₹2 Cr", value: "10000000-20000000" },
  { label: "Above ₹2 Cr", value: "20000000-999999999" },
];
const bhkOptions = ["1 BHK", "2 BHK", "3 BHK", "4 BHK"];

export function FilterPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  function update(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  function toggleType(type: string) {
    const current = searchParams.get("type")?.split(",").filter(Boolean) ?? [];
    const next = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    update("type", next.length ? next.join(",") : null);
  }

  const selectedTypes = searchParams.get("type")?.split(",").filter(Boolean) ?? [];
  const activeCount =
    (searchParams.get("type") ? 1 : 0) +
    (searchParams.get("budget") ? 1 : 0) +
    (searchParams.get("possession") ? 1 : 0) +
    (searchParams.get("furnishing") ? 1 : 0) +
    (searchParams.get("bhk") ? 1 : 0);

  const body = (
    <div className="space-y-6">
      <div>
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-text-500">Property type</p>
        <div className="flex flex-wrap gap-2">
          {propertyTypes.map((t) => (
            <button
              key={t}
              onClick={() => toggleType(t)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedTypes.includes(t)
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-stone-200 text-text-600 hover:border-stone-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-text-500">Budget</p>
        <select
          value={searchParams.get("budget") ?? ""}
          onChange={(e) => update("budget", e.target.value || null)}
          className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm text-text-700 outline-none"
        >
          {budgets.map((b) => (
            <option key={b.label} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-text-500">Configuration</p>
        <div className="flex flex-wrap gap-2">
          {bhkOptions.map((b) => (
            <button
              key={b}
              onClick={() => update("bhk", searchParams.get("bhk") === b ? null : b)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                searchParams.get("bhk") === b
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-stone-200 text-text-600 hover:border-stone-300"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-text-500">Possession</p>
        <select
          value={searchParams.get("possession") ?? ""}
          onChange={(e) => update("possession", e.target.value || null)}
          className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm text-text-700 outline-none"
        >
          <option value="">Any</option>
          <option value="Ready to Move">Ready to Move</option>
          <option value="Under Construction">Under Construction</option>
        </select>
      </div>

      <div>
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-text-500">Furnishing</p>
        <select
          value={searchParams.get("furnishing") ?? ""}
          onChange={(e) => update("furnishing", e.target.value || null)}
          className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm text-text-700 outline-none"
        >
          <option value="">Any</option>
          <option value="Unfurnished">Unfurnished</option>
          <option value="Semi-Furnished">Semi-Furnished</option>
          <option value="Furnished">Furnished</option>
        </select>
      </div>

      {activeCount > 0 && (
        <button
          onClick={() => router.push(pathname)}
          className="text-xs font-medium text-danger-600 hover:underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <>
      <div className="hidden lg:block">
        <p className="mb-4 flex items-center gap-2 font-display text-base font-medium text-ink-900">
          <SlidersHorizontal size={16} /> Filters
        </p>
        {body}
      </div>

      <div className="mb-4 lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-900"
        >
          <SlidersHorizontal size={15} /> Filters {activeCount > 0 && `(${activeCount})`}
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="absolute inset-0 bg-ink-900/40" onClick={() => setMobileOpen(false)} />
          <div className="relative ml-auto flex h-full w-[85%] max-w-sm flex-col overflow-y-auto bg-white p-5">
            <div className="mb-5 flex items-center justify-between">
              <p className="font-display text-lg font-medium text-ink-900">Filters</p>
              <button onClick={() => setMobileOpen(false)}>
                <X size={18} />
              </button>
            </div>
            {body}
          </div>
        </div>
      )}
    </>
  );
}
