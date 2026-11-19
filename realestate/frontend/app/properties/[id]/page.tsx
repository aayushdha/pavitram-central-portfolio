import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  BedDouble,
  Ruler,
  Layers,
  Sofa,
  CalendarCheck2,
  Phone,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { PropertyCard } from "@/components/marketing/PropertyCard";
import { EmiCalculator } from "@/components/marketing/EmiCalculator";
import { MapPreview } from "@/components/marketing/MapPreview";
import { ViewTracker } from "@/components/marketing/ViewTracker";
import { RecentlyViewed } from "@/components/marketing/RecentlyViewed";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SealMark } from "@/components/ui/SealMark";
import { properties, formatPrice, formatINR, findLocalityGuide } from "@/lib/mock-data";

export function generateStaticParams() {
  return properties.map((p) => ({ id: p.id }));
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = properties.find((p) => p.id === id);
  if (!property) notFound();

  const similar = properties
    .filter((p) => p.id !== property.id && (p.city === property.city || p.type === property.type))
    .slice(0, 3);

  const localityGuide = findLocalityGuide(property.city, property.locality);

  const facts = [
    { icon: BedDouble, label: "Configuration", value: property.bhk },
    { icon: Ruler, label: "Area", value: `${property.areaSqft.toLocaleString("en-IN")} sqft` },
    { icon: Layers, label: "Possession", value: property.possession },
    { icon: Sofa, label: "Furnishing", value: property.furnishing },
  ];

  return (
    <>
      <ViewTracker propertyId={property.id} />
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center gap-1.5 text-xs text-text-400">
          <Link href="/properties" className="hover:text-ink-900">Properties</Link>
          <ChevronRight size={12} />
          <span>{property.city}</span>
          <ChevronRight size={12} />
          <span className="text-text-600">{property.locality}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            {/* Gallery */}
            <div className="grid grid-cols-3 gap-2 overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={property.image} alt={property.title} className="col-span-2 row-span-2 h-full max-h-[420px] w-full object-cover" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={property.image} alt="" className="h-full max-h-[206px] w-full object-cover" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={property.image} alt="" className="h-full max-h-[206px] w-full object-cover" />
            </div>

            {/* Title & badges */}
            <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  {property.verified && <Badge variant="verified">Verified</Badge>}
                  <Badge variant="neutral">{property.intent}</Badge>
                  <Badge variant="neutral">{property.type}</Badge>
                </div>
                <h1 className="mt-3 font-display text-2xl font-medium text-ink-900 sm:text-3xl">
                  {property.title}
                </h1>
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-text-500">
                  <MapPin size={14} />
                  {property.locality}, {property.city}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-3xl font-medium text-ink-900">{formatPrice(property)}</p>
                <p className="text-xs text-text-400">
                  {formatINR(Math.round(property.price / property.areaSqft))}/sqft
                </p>
              </div>
            </div>

            {/* Key facts */}
            <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-stone-200 bg-white p-5 sm:grid-cols-4">
              {facts.map((f) => (
                <div key={f.label}>
                  <f.icon size={16} className="text-brand-600" />
                  <p className="mt-2 text-xs text-text-500">{f.label}</p>
                  <p className="text-sm font-medium text-ink-900">{f.value}</p>
                </div>
              ))}
            </div>

            {/* RERA / verification card */}
            {property.rera && (
              <div className="mt-6 flex items-center gap-4 rounded-2xl border border-brand-100 bg-brand-50/60 p-5">
                <SealMark size={30} className="shrink-0 text-brand-600" />
                <div>
                  <p className="text-sm font-semibold text-brand-800">RERA Registered Project</p>
                  <p className="font-mono text-xs text-brand-700">{property.rera}</p>
                  <p className="mt-0.5 text-xs text-brand-700/80">Cross-checked against the official registry — Aug 2026</p>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mt-8">
              <h2 className="font-display text-lg font-medium text-ink-900">About this property</h2>
              <p className="mt-3 text-sm leading-relaxed text-text-600">
                {property.title} is a {property.furnishing.toLowerCase()} {property.bhk !== "—" ? `${property.bhk} ` : ""}
                {property.type.toLowerCase()} spread across {property.areaSqft.toLocaleString("en-IN")} sqft in{" "}
                {property.locality}, {property.city}. Listed by {property.postedBy} ({property.postedByType.toLowerCase()}),
                the property is {property.possession.toLowerCase()} and has drawn {property.views.toLocaleString("en-IN")}{" "}
                views and {property.inquiries} inquiries on the platform so far.
              </p>
            </div>

            {/* Locality insight */}
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-medium text-ink-900">Locality &amp; connectivity</h2>
                {localityGuide && (
                  <Link
                    href={`/localities/${localityGuide.slug}`}
                    className="text-sm font-medium text-brass-700 hover:text-brass-600"
                  >
                    View area guide
                  </Link>
                )}
              </div>
              <p className="mt-1.5 text-sm text-text-500">
                Other verified listings near {property.locality}, {property.city}
              </p>
              <div className="mt-3">
                <MapPreview properties={similar.length > 0 ? similar : [property]} />
              </div>
            </div>

            {/* EMI calculator */}
            {property.intent === "Buy" && (
              <div className="mt-8">
                <EmiCalculator initialPrice={property.price} />
              </div>
            )}
          </div>

          {/* Sidebar — contact / schedule visit */}
          <aside className="space-y-5">
            <div className="sticky top-24 rounded-2xl border border-stone-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-900 text-sm font-semibold text-white">
                  {property.postedBy.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-900">{property.postedBy}</p>
                  <p className="text-xs text-text-500">{property.postedByType}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2.5">
                <Button variant="primary" size="md" icon={<Phone size={15} />} className="w-full">
                  Contact — masked call
                </Button>
                <Button variant="outline" size="md" icon={<MessageSquare size={15} />} className="w-full">
                  Chat in-platform
                </Button>
                <Button variant="secondary" size="md" icon={<CalendarCheck2 size={15} />} className="w-full">
                  Schedule a site visit
                </Button>
              </div>

              <div className="mt-5 flex items-start gap-2 rounded-xl bg-stone-50 p-3 text-xs text-text-500">
                <ShieldCheck size={14} className="mt-0.5 shrink-0 text-brand-600" />
                Your phone number stays masked until you choose to share it — standard on every
                contact across the platform.
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <p className="text-xs text-text-500">Listing ID</p>
              <p className="font-mono text-sm text-ink-900">{property.id}</p>
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-stone-100 pt-3 text-center">
                <div>
                  <p className="font-display text-base font-medium text-ink-900">{property.views}</p>
                  <p className="text-[11px] text-text-400">Views</p>
                </div>
                <div>
                  <p className="font-display text-base font-medium text-ink-900">{property.shortlists}</p>
                  <p className="text-[11px] text-text-400">Shortlists</p>
                </div>
                <div>
                  <p className="font-display text-base font-medium text-ink-900">{property.inquiries}</p>
                  <p className="text-[11px] text-text-400">Inquiries</p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Similar properties */}
        {similar.length > 0 && (
          <div className="mt-14">
            <h2 className="mb-5 font-display text-xl font-medium text-ink-900">Similar properties</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-14">
          <RecentlyViewed excludeId={property.id} />
        </div>
      </main>
      <Footer />
    </>
  );
}
