import Link from "next/link";
import { BedDouble, Ruler, MapPin } from "lucide-react";
import { Property, formatPrice } from "@/lib/mock-data";
import { Badge } from "../ui/Badge";

export function PropertyCard({ property }: { property: Property }) {
  return (
    <Link
      href={`/properties/${property.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white transition-shadow hover:shadow-lg hover:shadow-ink-900/5"
    >
      <div className="relative h-48 w-full overflow-hidden bg-stone-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={property.image}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-1.5">
          {property.verified && <Badge variant="verified">Verified</Badge>}
          <Badge variant="neutral" className="bg-white/90">
            {property.intent}
          </Badge>
        </div>
        <div className="absolute bottom-3 right-3 rounded-lg bg-ink-900/85 px-2.5 py-1 text-xs font-medium text-white">
          {formatPrice(property)}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-display text-base font-medium leading-snug text-ink-900">
          {property.title}
        </h3>
        <p className="mt-1.5 flex items-center gap-1 text-xs text-text-500">
          <MapPin size={12} />
          {property.locality}, {property.city}
        </p>
        <div className="mt-3 flex items-center gap-4 text-xs text-text-600">
          <span className="flex items-center gap-1">
            <BedDouble size={13} /> {property.bhk}
          </span>
          <span className="flex items-center gap-1">
            <Ruler size={13} /> {property.areaSqft.toLocaleString("en-IN")} sqft
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3 text-xs text-text-400">
          <span>{property.postedByType === "Builder" ? property.postedBy : `Posted by ${property.postedByType}`}</span>
          <span>{property.postedDaysAgo}d ago</span>
        </div>
      </div>
    </Link>
  );
}
