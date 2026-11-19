"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useToast } from "@/components/ui/Toast";
import { useLocalStorage } from "@/lib/use-local-storage";
import { people as initialPeople } from "@/lib/data";
import { Search, UserPlus, Check, MapPin } from "lucide-react";

export default function PeoplePage() {
  const [query, setQuery] = useState("");
  const toast = useToast();
  const [stored, write] = useLocalStorage<Record<string, boolean>>("jobportal_people_connections");
  const people = initialPeople.map((p) => ({ ...p, connected: stored?.[p.id] ?? p.connected }));

  function toggleConnect(id: string) {
    const person = people.find((p) => p.id === id);
    if (!person) return;
    write({ ...(stored ?? {}), [id]: !person.connected });
    toast(person.connected ? `Removed ${person.name} from your connections.` : `You're now connected with ${person.name}.`, person.connected ? "info" : "success");
  }

  const filtered = people.filter(
    (p) =>
      !query ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.role.toLowerCase().includes(query.toLowerCase()) ||
      p.company.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Find people" subtitle="Search by name, role, or company to grow your network." />

      <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2.5 mb-6 max-w-md">
        <Search size={16} className="text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people"
          className="flex-1 outline-none text-sm bg-transparent"
        />
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <div key={p.id} className="rounded-2xl border border-border bg-surface p-5 flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-brand-50 text-brand-700 grid place-items-center font-display font-bold text-lg mb-3">
              {p.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <p className="text-sm font-semibold text-ink">{p.name}</p>
            <p className="text-xs text-muted mt-0.5">{p.role} at {p.company}</p>
            <p className="text-xs text-muted flex items-center gap-1 mt-1"><MapPin size={11} /> {p.location}</p>
            <p className="text-[11px] text-muted mt-1">{p.mutual} mutual connections</p>
            <button
              onClick={() => toggleConnect(p.id)}
              className={`mt-4 w-full inline-flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold ${
                p.connected ? "bg-good-100 text-good-500" : "bg-brand-500 hover:bg-brand-600 text-ink-900"
              }`}
            >
              {p.connected ? <><Check size={14} /> Connected</> : <><UserPlus size={14} /> Connect</>}
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted text-sm">No one matches your search.</div>
        )}
      </div>
    </div>
  );
}
