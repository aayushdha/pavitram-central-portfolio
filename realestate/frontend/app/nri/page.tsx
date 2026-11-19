import { Globe2, Video, FileSignature, Landmark, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PropertyCard } from "@/components/marketing/PropertyCard";
import { nriServices, properties } from "@/lib/mock-data";

const icons = [Landmark, FileSignature, Video, Globe2];

const faqs = [
  {
    q: "Can I buy property in India without visiting in person?",
    a: "Yes. You can complete most of the process remotely with a Power of Attorney and video property tours — you'll only need to be present (or send your POA holder) for the final registration.",
  },
  {
    q: "Which account do I use to pay for the property?",
    a: "Payments must come through your NRE, NRO, or FCNR account — cash payments and payments from a non-NRI account are not allowed under FEMA rules.",
  },
  {
    q: "Can I take a home loan as an NRI?",
    a: "Yes, most major Indian banks offer NRI home loans, usually up to 80% of the property value, based on your overseas income.",
  },
  {
    q: "Can I sell the property later and take the money abroad?",
    a: "Yes, subject to FEMA repatriation limits and applicable capital gains tax — our finance partners can walk you through the current limits.",
  },
];

export default function NriCornerPage() {
  const featured = properties.filter((p) => p.verified).slice(0, 3);

  return (
    <>
      <Navbar />
      <main>
        <section className="border-b border-stone-200 bg-ink-900">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <p className="font-mono text-xs uppercase tracking-wider text-brass-300">NRI corner</p>
            <h1 className="mt-1 max-w-2xl font-display text-3xl font-medium text-white sm:text-4xl">
              Buying a home in India, from anywhere else
            </h1>
            <p className="mt-3 max-w-xl text-stone-300">
              Video tours, remote paperwork, and loan help built around different time zones —
              so you don&apos;t have to fly back just to see a flat.
            </p>
            <Button href="/properties" variant="primary" size="md" className="mt-6" icon={<ArrowRight size={16} />}>
              Browse verified listings
            </Button>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {nriServices.map((s, i) => {
              const Icon = icons[i % icons.length];
              return (
                <Card key={s.title}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brass-50 text-brass-600">
                    <Icon size={18} />
                  </div>
                  <p className="mt-3 font-medium text-ink-900">{s.title}</p>
                  <p className="mt-1.5 text-sm text-text-600">{s.desc}</p>
                </Card>
              );
            })}
          </div>

          <div className="mt-12">
            <h2 className="mb-5 font-display text-xl font-medium text-ink-900">Popular with NRI buyers</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </div>

          <div className="mt-14">
            <h2 className="mb-5 font-display text-xl font-medium text-ink-900">Common questions</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {faqs.map((f) => (
                <Card key={f.q}>
                  <p className="font-medium text-ink-900">{f.q}</p>
                  <p className="mt-2 text-sm text-text-600">{f.a}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
