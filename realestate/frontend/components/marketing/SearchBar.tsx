"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { Search } from "lucide-react";

const intents = ["Buy", "Rent", "PG"] as const;
const budgets = [
  { label: "Any budget", value: "" },
  { label: "Under ₹50 L", value: "0-5000000" },
  { label: "₹50 L – ₹1 Cr", value: "5000000-10000000" },
  { label: "₹1 Cr – ₹2 Cr", value: "10000000-20000000" },
  { label: "Above ₹2 Cr", value: "20000000-999999999" },
];

export function SearchBar() {
  const router = useRouter();
  const [intent, setIntent] = useState<(typeof intents)[number]>("Buy");
  const [query, setQuery] = useState("");
  const [budget, setBudget] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("intent", intent);
    if (query) params.set("q", query);
    if (budget) params.set("budget", budget);
    router.push(`/properties?${params.toString()}`);
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-2 shadow-xl shadow-ink-900/[0.06]">
      <div className="flex gap-1 border-b border-stone-100 px-2 pb-2 pt-1">
        {intents.map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIntent(i)}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
              intent === i ? "bg-ink-900 text-white" : "text-text-500 hover:bg-stone-100"
            }`}
          >
            {i === "PG" ? "PG / Co-living" : i}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-2 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-stone-200 px-3.5 py-3">
          <Search size={17} className="shrink-0 text-text-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="City, locality, project or landmark"
            className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-text-400"
          />
        </div>
        <select
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="rounded-xl border border-stone-200 px-3.5 py-3 text-sm text-text-700 outline-none"
        >
          {budgets.map((b) => (
            <option key={b.label} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          <Search size={16} />
          Search
        </button>
      </form>
    </div>
  );
}
