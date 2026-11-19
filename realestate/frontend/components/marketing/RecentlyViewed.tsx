"use client";

import { History } from "lucide-react";
import { useRecentlyViewed } from "@/lib/use-recently-viewed";
import { properties } from "@/lib/mock-data";
import { PropertyCard } from "./PropertyCard";

export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const ids = useRecentlyViewed();
  const items = ids
    .map((id) => properties.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p) && p!.id !== excludeId)
    .slice(0, 4);

  if (items.length === 0) return null;

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <History size={16} className="text-brass-600" />
        <h2 className="font-display text-lg font-medium text-ink-900">Recently viewed</h2>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((p) => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>
    </div>
  );
}
