import Link from "next/link";
import {
  Building2,
  Home as HomeIcon,
  Users2,
  Landmark,
  Briefcase,
  Trees,
  ShieldCheck,
  ScanSearch,
  FileWarning,
  ArrowRight,
  Hammer,
  Scale,
  Wrench,
  HandCoins,
  Star,
} from "lucide-react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { SearchBar } from "@/components/marketing/SearchBar";
import { PropertyCard } from "@/components/marketing/PropertyCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SealMark } from "@/components/ui/SealMark";
import { TrendChart } from "@/components/charts/TrendChart";
import { properties, priceTrend, cityGuides } from "@/lib/mock-data";

const categories = [
  { label: "Buy", icon: HomeIcon, href: "/properties?intent=Buy", desc: "Flats, villas & plots" },
  { label: "Rent", icon: Building2, href: "/properties?intent=Rent", desc: "Move-in ready homes" },
  { label: "PG / Co-living", icon: Users2, href: "/properties?intent=PG", desc: "Checked PGs & flatmates" },
  { label: "New Projects", icon: Landmark, href: "/projects", desc: "RERA-listed launches" },
  { label: "Commercial", icon: Briefcase, href: "/properties?type=Commercial", desc: "Offices & shops" },
  { label: "Plots / Land", icon: Trees, href: "/properties?type=Plot", desc: "Home & farm plots" },
];

const trustPoints = [
  {
    icon: ShieldCheck,
    title: "RERA checked",
    body: "We check every new project against the government RERA list before it goes live.",
  },
  {
    icon: ScanSearch,
    title: "Fake listing check",
    body: "Our system flags copied photos, odd pricing, and repeat posts. A real person checks it before it goes live.",
  },
  {
    icon: FileWarning,
    title: "One team for complaints",
    body: "If something goes wrong, one team handles it — with a clear timeline, not a lost email.",
  },
];

const serviceCategories = [
  { icon: Hammer, label: "Material Suppliers", desc: "Cement, tiles, paint & more" },
  { icon: Scale, label: "Legal Help", desc: "Papers checked, disputes solved" },
  { icon: Wrench, label: "Home Services", desc: "Electrician, plumber & cleaning" },
  { icon: HandCoins, label: "Loans & Finance", desc: "Home loan help, made simple" },
];

export default function HomePage() {
  const featured = properties.slice(0, 6);

  return (
    <>
      <Navbar />
      <main>
        {/* Hero — dark navy */}
        <section className="relative overflow-hidden bg-ink-900">
          <div className="seal-watermark-dark pointer-events-none absolute inset-0 opacity-60" />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-24">
            <div>
              <Badge variant="verified" className="mb-5">
                Housing.com + 99acres.com, in one place
              </Badge>
              <h1 className="font-display text-4xl font-medium leading-[1.1] text-white sm:text-5xl lg:text-[3.4rem]">
                Every listing carries a seal.
                <br />
                <span className="italic text-brass-400">Every seal means something.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-stone-300 sm:text-lg">
                Pavitram brings home search, listing tools for owners and builders, and easy
                booking for services — all in one place. Every listing is checked before it
                goes live, not just promised to be real.
              </p>
              <div className="mt-8">
                <SearchBar />
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 h-56 overflow-hidden rounded-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={properties[3].image} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="h-40 overflow-hidden rounded-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={properties[2].image} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="h-40 overflow-hidden rounded-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={properties[4].image} alt="" className="h-full w-full object-cover" />
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-xl shadow-ink-900/30">
                <SealMark size={30} className="text-brass-500" />
                <div>
                  <p className="text-sm font-semibold text-ink-900">RERA Verified</p>
                  <p className="text-xs text-text-500">Checked against the registry, Aug 2026</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trust ledger strip */}
          <div className="border-t border-ink-800 bg-white">
            <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 md:grid-cols-4 lg:px-8">
              {[
                { value: "2.1L+", label: "People looking for homes" },
                { value: "18,400+", label: "Owners, agents & builders" },
                { value: "96,000+", label: "Checked listings, live now" },
                { value: "4.8%", label: "Inquiries that turn into deals" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-display text-2xl font-medium text-ink-900 sm:text-3xl">{s.value}</p>
                  <p className="mt-1 text-xs text-text-500 sm:text-sm">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories — cream */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-brass-600">All in one place</p>
              <h2 className="mt-1 font-display text-2xl font-medium text-ink-900 sm:text-3xl">
                Every kind of property, one site
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((c) => (
              <Link
                key={c.label}
                href={c.href}
                className="group flex flex-col items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4 transition-colors hover:border-brass-300 hover:bg-brass-50/40"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brass-50 text-brass-600 group-hover:bg-white">
                  <c.icon size={19} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-900">{c.label}</p>
                  <p className="mt-0.5 text-xs text-text-500">{c.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Popular cities */}
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="font-mono text-xs uppercase tracking-wider text-brass-600">By city</p>
            <h2 className="mt-1 font-display text-2xl font-medium text-ink-900 sm:text-3xl">
              Where are you looking?
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {Object.values(cityGuides).map((g) => (
              <Link
                key={g.city}
                href={`/city/${g.city.toLowerCase()}`}
                className="group overflow-hidden rounded-2xl border border-stone-200 bg-white transition-colors hover:border-brass-300"
              >
                <div className="h-24 bg-ink-900 p-4">
                  <p className="font-display text-lg font-medium text-white">{g.city}</p>
                  <p className="mt-0.5 text-xs text-brass-300">₹{g.avgPriceSqft.toLocaleString("en-IN")}/sqft avg</p>
                </div>
                <div className="p-3">
                  <p className="text-xs text-text-500">{g.topLocalities.length} localities tracked</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured listings */}
        <section className="border-y border-stone-200 bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-brass-600">Popular this week</p>
                <h2 className="mt-1 font-display text-2xl font-medium text-ink-900 sm:text-3xl">
                  Featured &amp; checked listings
                </h2>
              </div>
              <Button href="/properties" variant="outline" size="sm" icon={<ArrowRight size={15} />}>
                See all
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </div>
        </section>

        {/* Our Mission — dark navy */}
        <section id="trust" className="bg-ink-900 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-brass-400">Our Mission</p>
                <h2 className="mt-1 font-display text-2xl font-medium text-white sm:text-3xl">
                  We check first. You trust more.
                </h2>
                <p className="mt-4 text-stone-300">
                  Pavitram means sacred in Hindi. We believe you shouldn&apos;t have to just
                  trust a listing — you should be able to check it. Fake and duplicate listings
                  are the biggest complaint in Indian property search. That&apos;s why every
                  check happens before a listing goes live, not after.
                </p>
                <div className="mt-6 flex items-center gap-4 rounded-2xl border border-brass-500/30 bg-brass-500/10 p-4">
                  <SealMark size={28} className="shrink-0 text-brass-400" />
                  <p className="text-sm text-brass-100">
                    A <span className="font-semibold text-white">Verified</span> listing means
                    the papers or RERA number are already checked. You&apos;ll see this same
                    mark everywhere on the site.
                  </p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-1">
                {trustPoints.map((t) => (
                  <div key={t.title} className="flex gap-4 rounded-2xl border border-ink-700 bg-ink-800 p-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-900 text-brass-400">
                      <t.icon size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-white">{t.title}</p>
                      <p className="mt-1 text-sm text-stone-300">{t.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Two journeys — dark navy */}
        <section className="bg-ink-900 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <p className="font-mono text-xs uppercase tracking-wider text-brass-400">Made for both sides</p>
              <h2 className="mt-1 font-display text-2xl font-medium text-white sm:text-3xl">
                Built for buyers and sellers, together
              </h2>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-ink-700 bg-ink-800 p-7">
                <p className="font-mono text-xs uppercase tracking-wider text-brass-400">For people looking for a home</p>
                <h3 className="mt-2 font-display text-xl font-medium text-white">
                  Search, compare, and choose with confidence
                </h3>
                <ul className="mt-5 space-y-2.5 text-sm text-stone-300">
                  <li>· Search on a map with smart suggestions</li>
                  <li>· EMI calculator, loan check & price estimate tools</li>
                  <li>· Book visits without sharing your phone number</li>
                  <li>· Area reviews from real, checked residents</li>
                </ul>
                <Button href="/dashboard/seeker" variant="primary" size="sm" className="mt-6">
                  Open My Dashboard
                </Button>
              </div>
              <div className="rounded-2xl border border-ink-700 bg-ink-800 p-7">
                <p className="font-mono text-xs uppercase tracking-wider text-brass-400">
                  For owners, agents &amp; builders
                </p>
                <h3 className="mt-2 font-display text-xl font-medium text-white">
                  List, manage buyers, and close deals — in one place
                </h3>
                <ul className="mt-5 space-y-2.5 text-sm text-stone-300">
                  <li>· See how serious each buyer is</li>
                  <li>· Upload many listings at once, or a full project page</li>
                  <li>· RERA papers and renewal reminders, handled</li>
                  <li>· See how your listings are doing, area by area</li>
                </ul>
                <Button href="/dashboard/owner" variant="primary" size="sm" className="mt-6">
                  Open Owner Dashboard
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Services marketplace — cream */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-brass-600">More than listings</p>
              <h2 className="mt-1 font-display text-2xl font-medium text-ink-900 sm:text-3xl">
                Your work isn&apos;t done after you get the keys
              </h2>
              <p className="mt-4 text-text-600">
                Talk to a lawyer about your papers, plan your home loan, or book a trusted
                electrician or painter — all here. We hold your payment safely until the work
                is done.
              </p>
              <Button href="/services" variant="secondary" size="md" className="mt-6" icon={<ArrowRight size={16} />}>
                See all services
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {serviceCategories.map((s) => (
                <div key={s.label} className="rounded-2xl border border-stone-200 bg-white p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brass-50 text-brass-600">
                    <s.icon size={18} />
                  </div>
                  <p className="mt-3 font-medium text-ink-900">{s.label}</p>
                  <p className="mt-1 text-xs text-text-500">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Locality price trend */}
        <section id="resources" className="border-t border-stone-200 bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-brass-600">Area prices</p>
                <h2 className="mt-1 font-display text-2xl font-medium text-ink-900 sm:text-3xl">
                  Bodakdev, Ahmedabad — price trend
                </h2>
                <p className="mt-3 text-sm text-text-600">
                  Average price per square foot over the last six months, based on real
                  listings on Pavitram.
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm text-brass-700">
                  <Star size={14} className="fill-brass-500 text-brass-500" />
                  <span>Up 13.7% since March — one of the fastest-growing areas we track</span>
                </div>
                <Button href="/city/ahmedabad" variant="outline" size="sm" className="mt-5" icon={<ArrowRight size={15} />}>
                  See the full Ahmedabad guide
                </Button>
              </div>
              <div className="rounded-2xl border border-stone-200 p-5">
                <TrendChart data={priceTrend} dataKey="value" valuePrefix="₹" height={220} />
              </div>
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-brass-200 bg-brass-50 p-8 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-xl font-medium text-ink-900 sm:text-2xl">
                Run the platform? See everything in one place.
              </h2>
              <p className="mt-1.5 text-sm text-text-600">
                Check listings, manage RERA, track money, and solve complaints — all here.
              </p>
            </div>
            <Button href="/dashboard/admin" variant="secondary" size="md" icon={<ArrowRight size={16} />}>
              Open Admin Dashboard
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
