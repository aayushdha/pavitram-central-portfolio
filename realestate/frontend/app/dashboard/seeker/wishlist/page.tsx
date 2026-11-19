"use client";

import { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { seekerNav } from "@/lib/nav-config";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingRow, ErrorRow } from "@/components/ui/DataState";
import { EmptyState } from "@/components/ui/EmptyState";
import { RealPropertyCard } from "@/components/dashboard/RealPropertyCard";
import { useApiData } from "@/lib/hooks/useApiData";
import { wishlistApi } from "@/lib/api/wishlist";
import { formatPropertyPrice } from "@/lib/api/format";
import { Property } from "@/lib/api/domain-types";

export default function SeekerWishlistPage() {
  const { data, loading, error, reload, setData } = useApiData(() => wishlistApi.list());
  const items = (data?.items ?? []).filter((i) => !!i.property);
  const properties = items.map((i) => i.property!) as Property[];

  async function handleRemove(propertyId: string) {
    const prev = items;
    setData({ items: items.filter((i) => i.propertyId !== propertyId) });
    try {
      await wishlistApi.remove(propertyId);
    } catch {
      setData({ items: prev });
      alert("Could not remove this property. Please try again.");
    }
  }

  const rows: { label: string; render: (p: Property) => ReactNode }[] = [
    { label: "Price", render: (p) => formatPropertyPrice(p) },
    { label: "Configuration", render: (p) => p.bhk ?? "—" },
    { label: "Area", render: (p) => `${p.areaSqft.toLocaleString("en-IN")} sqft` },
    { label: "Possession", render: (p) => (p.possession === "READY_TO_MOVE" ? "Ready to Move" : "Under Construction") },
    { label: "Furnishing", render: (p) => p.furnishing.replace("_", " ").toLowerCase() },
    { label: "Verified", render: (p) => (p.verified ? <Badge variant="verified">Verified</Badge> : <Badge variant="neutral">Unverified</Badge>) },
  ];

  return (
    <DashboardShell
      groups={seekerNav}
      pageTitle="Wishlist & compare"
      pageSubtitle="Shortlisted properties, side by side"
    >
      {loading && <LoadingRow label="Loading your wishlist…" />}
      {error && <ErrorRow message={error} onRetry={reload} />}

      {!loading && !error && (
        properties.length === 0 ? (
          <EmptyState
            title="Nothing shortlisted yet"
            description="Tap the heart icon on any property to add it to your wishlist and compare it here."
          />
        ) : (
          <>
            <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((p) => (
                <RealPropertyCard key={p.id} property={p} onRemove={() => handleRemove(p.id)} />
              ))}
            </div>

            <Card padded={false}>
              <div className="p-5 pb-0 sm:p-6 sm:pb-0">
                <CardHeader eyebrow={`Comparing ${properties.length}`} title="Compare shortlisted properties" />
              </div>
              <div className="overflow-x-auto px-5 pb-6 sm:px-6">
                <table className="w-full min-w-max border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-stone-200">
                      <th className="w-40 py-3 text-left text-xs font-semibold uppercase text-text-500">Attribute</th>
                      {properties.map((p) => (
                        <th key={p.id} className="px-4 py-3 text-left text-xs font-medium text-ink-900">
                          {p.title.length > 28 ? p.title.slice(0, 28) + "…" : p.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.label} className="border-b border-stone-100 last:border-0">
                        <td className="py-3 text-xs font-medium text-text-500">{row.label}</td>
                        {properties.map((p) => (
                          <td key={p.id} className="px-4 py-3 text-text-700">
                            {row.render(p)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )
      )}
    </DashboardShell>
  );
}
