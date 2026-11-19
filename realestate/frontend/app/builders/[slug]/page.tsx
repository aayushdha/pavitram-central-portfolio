import { notFound } from "next/navigation";
import { Building2, MapPin, Calendar, Layers } from "lucide-react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { PropertyCard } from "@/components/marketing/PropertyCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SealMark } from "@/components/ui/SealMark";
import { builderProfiles, properties } from "@/lib/mock-data";

export function generateStaticParams() {
  return builderProfiles.map((b) => ({ slug: b.slug }));
}

export default async function BuilderProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const builder = builderProfiles.find((b) => b.slug === slug);
  if (!builder) notFound();

  const builderListings = properties.filter((p) => p.postedBy === builder.name);

  return (
    <>
      <Navbar />
      <main>
        <section className="border-b border-stone-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-ink-900 font-display text-xl font-medium text-brass-300">
                  {builder.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-display text-2xl font-medium text-ink-900 sm:text-3xl">{builder.name}</h1>
                    {builder.verified && <Badge variant="verified">Verified builder</Badge>}
                  </div>
                  <p className="mt-1.5 flex items-center gap-1.5 text-sm text-text-500">
                    <MapPin size={14} /> Head office in {builder.city}
                  </p>
                  <p className="mt-3 max-w-2xl text-sm text-text-600">{builder.description}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 sm:max-w-md">
              <div className="rounded-xl bg-stone-50 p-4 text-center">
                <Calendar size={16} className="mx-auto text-brass-600" />
                <p className="mt-2 font-display text-xl font-medium text-ink-900">{builder.founded}</p>
                <p className="text-xs text-text-500">Founded</p>
              </div>
              <div className="rounded-xl bg-stone-50 p-4 text-center">
                <Layers size={16} className="mx-auto text-brass-600" />
                <p className="mt-2 font-display text-xl font-medium text-ink-900">{builder.totalProjects}</p>
                <p className="text-xs text-text-500">Projects</p>
              </div>
              <div className="rounded-xl bg-stone-50 p-4 text-center">
                <Building2 size={16} className="mx-auto text-brass-600" />
                <p className="mt-2 font-display text-xl font-medium text-ink-900">
                  {builder.unitsDelivered.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-text-500">Units delivered</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h2 className="mb-5 font-display text-xl font-medium text-ink-900">
            Live listings from {builder.name}
          </h2>
          {builderListings.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {builderListings.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          ) : (
            <Card className="flex flex-col items-center py-10 text-center">
              <SealMark size={22} className="text-brass-500" />
              <p className="mt-3 text-sm text-text-600">
                No live listings from this builder right now — check back soon.
              </p>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
