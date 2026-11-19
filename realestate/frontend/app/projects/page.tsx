"use client";

import { useState } from "react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { ProjectCard } from "@/components/marketing/ProjectCard";
import { newProjects } from "@/lib/mock-data";

const cities = ["All Cities", "Ahmedabad", "Mumbai", "Bengaluru", "Pune", "Delhi"];
const statuses = ["All", "New Launch", "Under Construction", "Ready to Move"] as const;

export default function ProjectsPage() {
  const [city, setCity] = useState("All Cities");
  const [status, setStatus] = useState<(typeof statuses)[number]>("All");

  const filtered = newProjects.filter((p) => {
    if (city !== "All Cities" && p.city !== city) return false;
    if (status !== "All" && p.status !== status) return false;
    return true;
  });

  return (
    <>
      <Navbar />
      <main>
        <section className="border-b border-stone-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <p className="font-mono text-xs uppercase tracking-wider text-brass-600">New launches, checked first</p>
            <h1 className="mt-1 font-display text-3xl font-medium text-ink-900">New projects</h1>
            <p className="mt-3 max-w-2xl text-text-600">
              Every project here has been checked against the RERA registry before it goes live —
              browse by city, price, and how soon it&apos;s ready.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap gap-2">
            {cities.map((c) => (
              <button
                key={c}
                onClick={() => setCity(c)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  city === c ? "border-ink-900 bg-ink-900 text-white" : "border-stone-200 bg-white text-text-600 hover:border-stone-300"
                }`}
              >
                {c}
              </button>
            ))}
            <span className="mx-1 hidden w-px bg-stone-200 sm:block" />
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  status === s ? "border-brass-500 bg-brass-50 text-ink-900" : "border-stone-200 bg-white text-text-600 hover:border-stone-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <p className="mb-5 text-sm text-text-500">{filtered.length} projects found</p>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-stone-300 py-16 text-center text-text-500">
              No projects match these filters yet — try a different city or status.
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
