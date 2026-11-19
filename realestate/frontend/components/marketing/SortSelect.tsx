"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const options = [
  { label: "Most relevant", value: "" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Newest first", value: "newest" },
];

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <select
      value={searchParams.get("sort") ?? ""}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        if (e.target.value) params.set("sort", e.target.value);
        else params.delete("sort");
        router.push(`${pathname}?${params.toString()}`);
      }}
      className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-text-700 outline-none"
    >
      {options.map((o) => (
        <option key={o.label} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
