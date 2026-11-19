import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, ArrowLeft, Calendar } from "lucide-react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { Badge } from "@/components/ui/Badge";
import { articles } from "@/lib/mock-data";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) notFound();

  const related = articles.filter((a) => a.slug !== article.slug && a.category === article.category).slice(0, 2);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/resources" className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-600 hover:text-ink-900">
          <ArrowLeft size={14} /> Back to resource center
        </Link>

        <Badge variant="brand">{article.category}</Badge>
        <h1 className="mt-4 font-display text-3xl font-medium leading-tight text-ink-900 sm:text-4xl">
          {article.title}
        </h1>
        <div className="mt-4 flex items-center gap-4 text-sm text-text-500">
          <span>{article.author}</span>
          <span className="flex items-center gap-1.5">
            <Calendar size={13} /> {article.publishedOn}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={13} /> {article.readMinutes} min read
          </span>
        </div>

        <div className="mt-8 space-y-5">
          {article.body.map((para, i) => (
            <p key={i} className="text-base leading-relaxed text-text-700">
              {para}
            </p>
          ))}
        </div>

        {related.length > 0 && (
          <div className="mt-14 border-t border-stone-200 pt-8">
            <h2 className="mb-4 font-display text-lg font-medium text-ink-900">Read next</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {related.map((a) => (
                <Link
                  key={a.slug}
                  href={`/resources/${a.slug}`}
                  className="rounded-xl border border-stone-200 p-4 hover:border-brass-300"
                >
                  <p className="text-sm font-medium text-ink-900">{a.title}</p>
                  <p className="mt-1 text-xs text-text-500">{a.readMinutes} min read</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
