import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { Badge } from "@/components/ui/Badge";
import { articles } from "@/lib/mock-data";

export default function ResourcesPage() {
  const categories = Array.from(new Set(articles.map((a) => a.category)));

  return (
    <>
      <Navbar />
      <main>
        <section className="border-b border-stone-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <p className="font-mono text-xs uppercase tracking-wider text-brass-600">Resource center</p>
            <h1 className="mt-1 font-display text-3xl font-medium text-ink-900">
              Straight answers before you sign anything
            </h1>
            <p className="mt-3 max-w-2xl text-text-600">
              Buying guides, legal explainers, and market trends written in plain language —
              no jargon, no sales pitch.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((c) => (
              <Badge key={c} variant="neutral">{c}</Badge>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <Link
                key={a.slug}
                href={`/resources/${a.slug}`}
                className="group flex flex-col rounded-2xl border border-stone-200 bg-white p-6 transition-shadow hover:shadow-lg hover:shadow-ink-900/5"
              >
                <Badge variant="brand" className="w-fit">{a.category}</Badge>
                <h2 className="mt-4 font-display text-lg font-medium leading-snug text-ink-900 group-hover:text-brass-700">
                  {a.title}
                </h2>
                <p className="mt-2 line-clamp-3 flex-1 text-sm text-text-600">{a.excerpt}</p>
                <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4 text-xs text-text-400">
                  <span className="flex items-center gap-1.5">
                    <Clock size={12} /> {a.readMinutes} min read
                  </span>
                  <span className="flex items-center gap-1 font-medium text-brass-700 group-hover:gap-1.5">
                    Read <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
