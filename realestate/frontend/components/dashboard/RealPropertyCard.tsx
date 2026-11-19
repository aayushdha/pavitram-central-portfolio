import { BedDouble, Ruler, MapPin, Heart } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Property } from "@/lib/api/domain-types";
import { formatPropertyPrice } from "@/lib/api/format";

const typeLabel: Record<Property["type"], string> = {
  APARTMENT: "Apartment",
  VILLA: "Villa",
  PLOT: "Plot",
  COMMERCIAL: "Commercial",
  PG_COLIVING: "PG / Co-living",
};
const intentLabel: Record<Property["intent"], string> = { BUY: "Buy", RENT: "Rent", PG: "PG" };

/**
 * A dashboard-native property card for real backend records. Deliberately
 * separate from `components/marketing/PropertyCard`, which still renders
 * `lib/mock-data.ts` records and links into the (still mock-data-driven)
 * public `/properties/[id]` detail page — real database ids don't resolve
 * there yet, so this card doesn't link out.
 */
export function RealPropertyCard({
  property,
  onRemove,
}: {
  property: Property;
  onRemove?: () => void;
}) {
  const img = property.images[0];
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white">
      <div className="relative h-40 w-full overflow-hidden bg-stone-100">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={property.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-text-400">No photo yet</div>
        )}
        <div className="absolute left-3 top-3 flex gap-1.5">
          {property.verified && <Badge variant="verified">Verified</Badge>}
          <Badge variant="neutral" className="bg-white/90">{intentLabel[property.intent]}</Badge>
        </div>
        <div className="absolute bottom-3 right-3 rounded-lg bg-ink-900/85 px-2.5 py-1 text-xs font-medium text-white">
          {formatPropertyPrice(property)}
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            aria-label="Remove from wishlist"
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-danger-600 hover:bg-white"
          >
            <Heart size={14} fill="currentColor" />
          </button>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-display text-base font-medium leading-snug text-ink-900">{property.title}</h3>
        <p className="mt-1.5 flex items-center gap-1 text-xs text-text-500">
          <MapPin size={12} />
          {property.locality}, {property.city}
        </p>
        <div className="mt-3 flex items-center gap-4 text-xs text-text-600">
          {property.bhk && (
            <span className="flex items-center gap-1">
              <BedDouble size={13} /> {property.bhk}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Ruler size={13} /> {property.areaSqft.toLocaleString("en-IN")} sqft
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3 text-xs text-text-400">
          <span>{typeLabel[property.type]}</span>
          <span>{property.views} views</span>
        </div>
      </div>
    </div>
  );
}
