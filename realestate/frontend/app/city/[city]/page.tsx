import { notFound } from "next/navigation";
import Link from "next/link";
import { TrendingUp, ArrowRight, MapPin } from "lucide-react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { PropertyCard } from "@/components/marketing/PropertyCard";
import { ProjectCard } from "@/components/marketing/ProjectCard";
import { Button } from "@/components/ui/Button";
import { BarComparison } from "@/components/charts/BarComparison";
import { cityGuides, properties, newProjects, localityGuides } from "@/lib/mock-data";

export function generateStaticParams() {
  return Object.keys(cityGuides).map((city) => ({ city: city.toLowerCase() }));
}

export default async function CityGuidePage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const guide = Object.values(cityGuides).find((g) => g.city.toLowerCase() === city.toLowerCase());
  if (!guide) notFound();

  const cityProperties = properties.filter((p) => p.city === guide.city).slice(0, 3);
  const cityProjects = newProjects.filter((p) => p.city === guide.city).slice(0, 3);

  const localityChart = guide.topLocalities.map((l) => ({ label: l.name, value: l.avgPriceSqft }));

  return (
    <>
      <Navbar />
      <main>
        <section className="border-b border-stone-200 bg-ink-900">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <p className="font-mono text-xs uppercase tracking-wider text-brass-300">City guide</p>
            <h1 className="mt-1 font-display text-3xl font-medium text-white sm:text-4xl">
              Property in {guide.city}
            </h1>
            <p className="mt-3 max-w-2xl text-stone-300">{guide.tagline}</p>

            <div className="mt-8 flex flex-wrap gap-8">
              <div>
                <p className="font-display text-2xl font-medium text-white">
                  ₹{guide.avgPriceSqft.toLocaleString("en-IN")}
                </p>
                <p className="mt-1 text-xs text-stone-400">Average price per sqft</p>
              </div>
              <div>
                <p className="flex items-center gap-1 font-display text-2xl font-medium text-brass-300">
                  <TrendingUp size={20} /> {guide.yoyChange}%
                </p>
                <p className="mt-1 text-xs text-stone-400">Price change this year</p>
              </div>
              <div>
                <p className="font-display text-2xl font-medium text-white">{guide.topLocalities.length}+</p>
                <p className="mt-1 text-xs text-stone-400">Localities tracked</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="max-w-3xl text-text-600">{guide.aboutText}</p>

          {/* Top localities */}
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <h2 className="mb-4 font-display text-xl font-medium text-ink-900">Top localities</h2>
              <div className="overflow-hidden rounded-2xl border border-stone-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50 text-left text-xs uppercase text-text-500">
                      <th className="px-4 py-3">Locality</th>
                      <th className="px-4 py-3">Avg. ₹/sqft</th>
                      <th className="px-4 py-3">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guide.topLocalities.map((l) => {
                      const match = localityGuides.find(
                        (lg) => lg.name === l.name && lg.slug.endsWith(guide.city.toLowerCase())
                      );
                      return (
                        <tr key={l.name} className="border-b border-stone-100 last:border-0">
                          <td className="px-4 py-3 font-medium text-ink-900">
                            {match ? (
                              <Link href={`/localities/${match.slug}`} className="flex items-center gap-1.5 hover:text-brass-700">
                                <MapPin size={12} className="text-brass-600" /> {l.name}
                              </Link>
                            ) : (
                              <span className="flex items-center gap-1.5">
                                <MapPin size={12} className="text-brass-600" /> {l.name}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-text-700">₹{l.avgPriceSqft.toLocaleString("en-IN")}</td>
                          <td className="px-4 py-3 text-brass-700">+{l.trend}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h2 className="mb-4 font-display text-xl font-medium text-ink-900">Price by locality</h2>
              <div className="rounded-2xl border border-stone-200 p-5">
                <BarComparison data={localityChart} dataKey="value" horizontal height={280} />
              </div>
            </div>
          </div>

          {/* Featured properties */}
          {cityProperties.length > 0 && (
            <div className="mt-14">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-display text-xl font-medium text-ink-900">Properties in {guide.city}</h2>
                <Button href={`/properties?city=${guide.city}`} variant="outline" size="sm" icon={<ArrowRight size={14} />}>
                  View all
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {cityProperties.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            </div>
          )}

          {/* Featured projects */}
          {cityProjects.length > 0 && (
            <div className="mt-14">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-display text-xl font-medium text-ink-900">New projects in {guide.city}</h2>
                <Button href="/projects" variant="outline" size="sm" icon={<ArrowRight size={14} />}>
                  View all
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {cityProjects.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            </div>
          )}

          {/* Other cities */}
          <div className="mt-14 border-t border-stone-200 pt-8">
            <p className="mb-3 text-sm font-medium text-text-600">Explore other cities</p>
            <div className="flex flex-wrap gap-2">
              {Object.values(cityGuides)
                .filter((g) => g.city !== guide.city)
                .map((g) => (
                  <Link
                    key={g.city}
                    href={`/city/${g.city.toLowerCase()}`}
                    className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-text-600 hover:border-brass-400 hover:text-ink-900"
                  >
                    {g.city}
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
