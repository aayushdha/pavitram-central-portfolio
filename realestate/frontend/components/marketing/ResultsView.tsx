"use client";

import { useState } from "react";
import { LayoutGrid, MapIcon } from "lucide-react";
import { Property } from "@/lib/mock-data";
import { PropertyCard } from "./PropertyCard";
import { MapPreview } from "./MapPreview";

export function ResultsView({ properties }: { properties: Property[] }) {
  const [view, setView] = useState<"grid" | "map">("grid");

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <div className="inline-flex rounded-lg border border-stone-200 bg-white p-0.5">
          <button
            onClick={() => setView("grid")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${
              view === "grid" ? "bg-ink-900 text-white" : "text-text-500"
            }`}
          >
            <LayoutGrid size={13} /> List
          </button>
          <button
            onClick={() => setView("map")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${
              view === "map" ? "bg-ink-900 text-white" : "text-text-500"
            }`}
          >
            <MapIcon size={13} /> Map
          </button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {properties.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      ) : (
        <MapPreview properties={properties} />
      )}
    </div>
  );
}
