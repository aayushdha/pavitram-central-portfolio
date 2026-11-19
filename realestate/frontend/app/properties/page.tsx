import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { FilterPanel } from "@/components/marketing/FilterPanel";
import { SortSelect } from "@/components/marketing/SortSelect";
import { ResultsView } from "@/components/marketing/ResultsView";
import { filterProperties } from "@/lib/filter-properties";

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const asString = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

  const results = filterProperties({
    intent: asString(sp.intent),
    q: asString(sp.q),
    type: asString(sp.type),
    budget: asString(sp.budget),
    possession: asString(sp.possession),
    furnishing: asString(sp.furnishing),
    bhk: asString(sp.bhk),
    sort: asString(sp.sort),
  });

  const intent = asString(sp.intent);
  const q = asString(sp.q);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-medium text-ink-900 sm:text-3xl">
            {intent ? `Properties to ${intent === "PG" ? "co-live" : intent.toLowerCase()}` : "All properties"}
            {q ? ` in "${q}"` : ""}
          </h1>
          <p className="mt-1 text-sm text-text-500">{results.length} results · sorted for relevance and trust</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <div>
            <FilterPanel />
          </div>
          <div>
            <div className="mb-4 hidden justify-end lg:flex">
              <SortSelect />
            </div>
            {results.length > 0 ? (
              <ResultsView properties={results} />
            ) : (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/60 py-16 text-center">
                <p className="font-display text-lg text-ink-900">No properties match these filters</p>
                <p className="mt-1.5 text-sm text-text-600">Try widening your budget range or clearing a filter.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
