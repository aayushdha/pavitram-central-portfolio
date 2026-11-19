import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Star, TrendingUp, Home } from "lucide-react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { PropertyCard } from "@/components/marketing/PropertyCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TrendChart } from "@/components/charts/TrendChart";
import { localityGuides, properties, formatINR } from "@/lib/mock-data";

export function generateStaticParams() {
  return localityGuides.map((l) => ({ slug: l.slug }));
}

export default async function LocalityGuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locality = localityGuides.find((l) => l.slug === slug);
  if (!locality) notFound();

  const localListings = properties.filter(
    (p) => p.city === locality.city && p.locality === locality.name
  );
  const avgRating =
    locality.reviews.reduce((s, r) => s + r.rating, 0) / (locality.reviews.length || 1);

  return (
    <>
      <Navbar />
      <main>
        <section className="border-b border-stone-200 bg-ink-900">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <p className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-brass-300">
              <MapPin size={13} /> {locality.city}
            </p>
            <h1 className="mt-1 font-display text-3xl font-medium text-white sm:text-4xl">
              {locality.name} — area guide
            </h1>
            <p className="mt-3 max-w-2xl text-stone-300">{locality.description}</p>
            <div className="mt-6 flex flex-wrap gap-6">
              <div>
                <p className="font-display text-2xl font-medium text-white">
                  ₹{locality.avgPriceSqft.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-stone-400">Average price / sqft</p>
              </div>
              <div>
                <p className="font-display text-2xl font-medium text-white">{formatINR(locality.rentAvg)}/mo</p>
                <p className="text-xs text-stone-400">Average 2BHK rent</p>
              </div>
              <div>
                <p className="flex items-center gap-1 font-display text-2xl font-medium text-brass-300">
                  <TrendingUp size={18} /> +{locality.trend}%
                </p>
                <p className="text-xs text-stone-400">Price change, 6 months</p>
              </div>
              {locality.reviews.length > 0 && (
                <div>
                  <p className="flex items-center gap-1 font-display text-2xl font-medium text-white">
                    <Star size={16} className="fill-brass-400 text-brass-400" /> {avgRating.toFixed(1)}
                  </p>
                  <p className="text-xs text-stone-400">Resident rating</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader eyebrow="Price trend" title={`Price per sqft in ${locality.name}`} />
              <TrendChart data={locality.priceHistory} dataKey="value" valuePrefix="₹" height={240} />
            </Card>
            <Card>
              <CardHeader eyebrow="Getting around" title="Connectivity" />
              <ul className="space-y-2.5">
                {locality.connectivity.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-sm text-text-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brass-500" />
                    {c}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {locality.nearby.map((group) => (
              <Card key={group.category}>
                <p className="text-xs font-medium uppercase tracking-wide text-text-400">{group.category}</p>
                <ul className="mt-2.5 space-y-1.5">
                  {group.places.map((p) => (
                    <li key={p} className="text-sm text-text-700">{p}</li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          {locality.reviews.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-4 font-display text-xl font-medium text-ink-900">What residents say</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {locality.reviews.map((r) => (
                  <Card key={r.author}>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-ink-900">{r.author}</p>
                      <span className="flex items-center gap-1 text-sm text-brass-600">
                        <Star size={13} className="fill-brass-500 text-brass-500" /> {r.rating}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-text-600">{r.text}</p>
                    <p className="mt-2 text-xs text-text-400">Living here since {r.livingSince}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-medium text-ink-900">
                Listings in {locality.name}
              </h2>
              <Link
                href={`/properties?q=${encodeURIComponent(locality.name)}`}
                className="text-sm font-medium text-brass-700 hover:text-brass-600"
              >
                See all
              </Link>
            </div>
            {localListings.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {localListings.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            ) : (
              <Card className="flex flex-col items-center py-10 text-center">
                <Home size={22} className="text-text-400" />
                <p className="mt-3 text-sm text-text-600">No live listings here right now.</p>
                <Link href="/properties" className="mt-2 text-sm font-medium text-brass-700 hover:text-brass-600">
                  Browse nearby areas instead
                </Link>
              </Card>
            )}
          </div>

          <div className="mt-10 flex flex-wrap gap-2">
            <p className="mr-2 text-sm text-text-500">Other areas in {locality.city}:</p>
            {localityGuides
              .filter((l) => l.city === locality.city && l.slug !== locality.slug)
              .map((l) => (
                <Link key={l.slug} href={`/localities/${l.slug}`}>
                  <Badge variant="neutral">{l.name}</Badge>
                </Link>
              ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
