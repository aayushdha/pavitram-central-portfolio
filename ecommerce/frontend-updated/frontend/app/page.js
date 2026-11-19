import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  ReceiptText,
  ShoppingBag,
  Building2,
  Factory,
  Search,
  PackageCheck,
  Quote,
  Store,
  TrendingUp,
  Star,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductThumb from "@/components/ProductThumb";
import TradeTypeCard from "@/components/TradeTypeCard";
import FAQAccordion from "@/components/FAQAccordion";
import api from "@/lib/api";

function unwrap(res) {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

// Always hit the API fresh — this is a storefront, not static marketing copy.
export const dynamic = "force-dynamic";

// Defaults for every homepage section that Admin > CMS > Homepage can edit.
// If the admin hasn't saved a section yet, the site shows these — so the
// homepage is never blank, and admin edits show up instantly for anyone new.
const DEFAULT_HERO = {
  badge: "🇮🇳 India's everyday shopping + wholesale trade, one site",
  titleLine1: "Buy one saree, or",
  titleHighlight: "ten thousand of them",
  titleSuffix: "— it's that simple.",
  subtitle:
    "Shopping for yourself? Add to cart and pay in a minute — just like any store you already use. Buying or selling for your business? Get wholesale prices, credit terms, and proper GST bills — on the very same account, once you're verified.",
  primaryCta: "Start shopping",
  secondaryCta: "I run a business",
};

const DEFAULT_HOW_IT_WORKS = [
  { title: "Browse & choose", text: "Search products by category, price, or vendor — same catalog for everyone." },
  { title: "Buy your way", text: "Shoppers pay instantly and check out. Businesses request a quote (RFQ) for bulk pricing and credit terms." },
  { title: "Track & receive", text: "Follow your order status and get it delivered, with a proper bill every time." },
];

const DEFAULT_TESTIMONIALS = [
  { quote: "I ordered one saree for my sister's wedding and it reached in three days. Checkout took less than a minute.", name: "Priya M.", role: "Shopper, Pune" },
  { quote: "We switched our turmeric sourcing to Pavitram's B2B account. Bulk pricing and GST bills, sorted every month without any calls.", name: "Rakesh Traders", role: "Registered B2B buyer" },
  { quote: "Registering my handloom store took one afternoon. Now I sell to single customers and shops from the same dashboard.", name: "Kutch Handloom Co.", role: "Verified vendor" },
];

const faqItems = [
  {
    q: "Do I need a different login to sell or buy in bulk?",
    a: "No — Pavitram has exactly one login for everyone. Sign up once, and the same email/password works whether you're shopping, selling as a vendor, or buying in bulk as a business. Your dashboard is chosen automatically based on your account.",
  },
  {
    q: "I run a shop or a factory. How do I start selling here?",
    a: "Log in to your regular Pavitram account, tap 'Sell / Buy in Bulk' at the top, choose Vendor, and complete a quick store verification (KYC). Once approved by our team, your same login takes you straight to your seller dashboard.",
  },
  {
    q: "Do I have to buy in bulk, or can I just buy one item?",
    a: "You can buy just a single item, like any regular online store — add it to your cart and pay. Bulk pricing, credit terms, and GST billing are only unlocked for verified, registered businesses.",
  },
  {
    q: "Is registering my business free?",
    a: "Yes, it's free. We only ask for your GST and PAN details so that buyers and sellers can trust each other on the platform.",
  },
];

export default async function Home() {
  const [categoriesRes, productsRes, heroStatsRes, vendorsRes, siteContentRes] = await Promise.allSettled([
    api.categories.list({ limit: 50 }),
    api.products.list({ limit: 50, status: "Approved" }),
    api.heroStats.list({ limit: 20 }),
    api.vendors.list({ limit: 50 }),
    api.siteContent.all(),
  ]);
  const categories = categoriesRes.status === "fulfilled" ? unwrap(categoriesRes.value) : [];
  const products = productsRes.status === "fulfilled" ? unwrap(productsRes.value) : [];
  const heroStats = heroStatsRes.status === "fulfilled" ? unwrap(heroStatsRes.value) : [];
  const vendors = vendorsRes.status === "fulfilled" ? unwrap(vendorsRes.value) : [];
  const content = siteContentRes.status === "fulfilled" && siteContentRes.value ? siteContentRes.value : {};

  // Admin-edited content, falling back to the defaults above for any
  // section that hasn't been saved yet.
  const hero = { ...DEFAULT_HERO, ...(content["homepage.hero"] || {}) };
  const howItWorks = content["homepage.howItWorks"]?.length ? content["homepage.howItWorks"] : DEFAULT_HOW_IT_WORKS;
  const testimonials = content["homepage.testimonials"]?.length ? content["homepage.testimonials"] : DEFAULT_TESTIMONIALS;
  const howItWorksIcons = [Search, ShoppingBag, PackageCheck]; // fixed icon per position 1/2/3 — only text is admin-editable

  const featured = products.slice(0, 4);
  const dealOfTheDay = products[1];

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      {/* Hero — dark navy, gold accents */}
      <section className="dot-grid relative overflow-hidden" style={{ background: "var(--color-navy)" }}>
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(circle at 78% 35%, rgba(230,185,85,0.16), transparent 55%)" }}
        />
        <div className="relative mx-auto grid max-w-[1600px] gap-10 px-5 py-16 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
          <div>
            <span
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-wide"
              style={{ borderColor: "var(--color-navy-line)", color: "var(--color-gold-light)" }}
            >
              {hero.badge}
            </span>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl">
              {hero.titleLine1}
              <br />
              <span style={{ color: "var(--color-gold-light)" }}>{hero.titleHighlight}</span>
              {" "}{hero.titleSuffix}
            </h1>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed" style={{ color: "var(--color-navy-muted)" }}>
              {hero.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
                style={{ background: "var(--color-gold-light)", color: "var(--color-navy)" }}
              >
                {hero.primaryCta} <ArrowRight size={16} />
              </Link>
              <Link
                href="/business/signup"
                className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold text-white"
                style={{ borderColor: "var(--color-navy-line)" }}
              >
                <Building2 size={16} />
                {hero.secondaryCta}
              </Link>
            </div>
            <p className="mt-3 text-xs" style={{ color: "var(--color-navy-muted)" }}>
              New to Pavitram? Shoppers just need a name and mobile number. Businesses log in
              separately and register only after that — see{" "}
              <a href="#how-it-works" className="underline decoration-dotted underline-offset-2" style={{ color: "var(--color-gold-light)" }}>
                how it works
              </a>{" "}
              below.
            </p>

            <dl className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {heroStats.map((s) => (
                <div key={s.label}>
                  <dt className="text-xs" style={{ color: "var(--color-navy-muted)" }}>{s.label}</dt>
                  <dd className="font-display text-xl font-semibold text-white">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div
              className="absolute -inset-6 -z-10 rounded-[2rem] opacity-70"
              style={{
                background:
                  "radial-gradient(circle at 30% 20%, rgba(230,172,82,0.14), transparent 60%), radial-gradient(circle at 80% 80%, rgba(230,172,82,0.08), transparent 55%)",
              }}
            />
            <div className="flex h-full flex-col rounded-2xl border p-5" style={{ borderColor: "var(--color-navy-line)", background: "var(--color-navy-2)" }}>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-gold-light)" }}>
                  <TrendingUp size={13} /> Trending right now
                </span>
                <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--color-navy-muted)" }}>
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: "var(--color-jade-light)" }} /> Live catalog
                </span>
              </div>

              <div className="mt-4 flex-1 space-y-2.5">
                {products.slice(0, 5).map((p, i) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    className="flex items-center gap-3 rounded-xl border p-2.5 transition-colors hover:border-[var(--color-gold)]"
                    style={{ borderColor: "var(--color-navy-line)", background: "var(--color-navy-3)" }}
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-lg text-xl" style={{ background: "var(--color-navy-2)" }}>
                      <ProductThumb image={p.image} fill emojiSize={22} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-white">{p.name}</p>
                      <p className="text-[11px]" style={{ color: "var(--color-navy-muted)" }}>{p.vendor}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-mono text-xs font-semibold" style={{ color: "var(--color-gold-light)" }}>
                        ₹{p.price.toLocaleString("en-IN")}
                      </p>
                      {p.channels.includes("b2b") && (
                        <p className="text-[10px]" style={{ color: "var(--color-jade-light)" }}>bulk avail.</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              <Link
                href="/products"
                className="mt-4 flex items-center justify-between rounded-xl border px-4 py-3 text-xs font-semibold text-white transition-colors hover:border-[var(--color-gold)]"
                style={{ borderColor: "var(--color-navy-line)" }}
              >
                Browse the full catalog
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works — plain 3-step explainer */}
      <section id="how-it-works" className="border-b border-line bg-paper-raised scroll-mt-20">
        <div className="mx-auto max-w-[1600px] px-5 py-16 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--color-gold)" }}>
            — How Pavitram works
          </p>
          <h2 className="mt-3 text-center font-display text-3xl font-semibold text-ink">
            Three simple steps, whoever you are
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-ink-muted">
            No confusing menus. Shoppers and businesses both follow the same
            simple path — only the pricing and paperwork change.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {howItWorks.map((s, i) => {
              const Icon = howItWorksIcons[i] || Search;
              return (
                <div key={s.title} className="relative rounded-2xl border border-line bg-paper p-6">
                  <span
                    className="absolute -top-3 left-6 grid h-7 w-7 place-items-center rounded-full text-xs font-bold text-white"
                    style={{ background: "var(--color-navy)" }}
                  >
                    {i + 1}
                  </span>
                  <span
                    className="mt-2 grid h-12 w-12 place-items-center rounded-xl"
                    style={{ background: "var(--color-gold-dim)", color: "var(--color-gold)" }}
                  >
                    <Icon size={22} />
                  </span>
                  <h3 className="mt-4 font-display text-base font-semibold text-ink">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{s.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trade types — B2C / B2B / D2C explained in plain language */}
      <section id="trade-types" className="scroll-mt-20">
        <div className="mx-auto max-w-[1600px] px-5 py-16 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--color-gold)" }}>
            — B2B, B2C & D2C, explained simply
          </p>
          <h2 className="mt-3 text-center font-display text-3xl font-semibold text-ink">
            Three ways to trade, one platform
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-ink-muted">
            These terms sound technical, but they just describe who is buying
            from whom. Here&apos;s what each one means for you.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <TradeTypeCard
              icon={ShoppingBag}
              tag="B2C — For you"
              title="You shop, like any store"
              text="You buy single items for yourself or your home. Add to cart, pay online, and get it delivered — the normal online shopping experience."
              example="Buying one saree for a wedding, or a 1kg pack of turmeric for your kitchen."
              accent="var(--color-gold)"
            />
            <TradeTypeCard
              icon={Building2}
              tag="B2B — Business to business"
              title="Businesses buy in bulk"
              text="A registered business buys large quantities from another business, at special wholesale prices, with credit terms and GST invoices."
              example="A clothing shop buying 500 sarees at a discounted bulk rate to resell in their store."
              accent="var(--color-jade)"
            />
            <TradeTypeCard
              icon={Factory}
              tag="D2C — Direct to you"
              title="Makers sell straight to you"
              text="The brand or manufacturer sells directly, skipping middlemen — so you often get fresher stock and better prices."
              example="A spice farm selling its turmeric straight to your door, instead of through a distributor."
              accent="#6b4fa0"
            />
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-t border-line bg-paper-raised">
        <div className="mx-auto grid max-w-[1600px] gap-6 px-5 py-6 sm:grid-cols-3 lg:px-8">
          {[
            { icon: ShieldCheck, text: "Every vendor is ID and document verified" },
            { icon: Truck, text: "Delivery all over India, small parcels or full truckloads" },
            { icon: ReceiptText, text: "You always get a proper, GST-correct bill" },
          ].map((t) => (
            <div key={t.text} className="flex items-center gap-3">
              <t.icon size={20} style={{ color: "var(--color-jade)" }} />
              <p className="text-sm text-ink-muted">{t.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-[1600px] px-5 py-14 lg:px-8">
        <h2 className="font-display text-2xl font-semibold text-ink">
          Shop by category
        </h2>
        <p className="mt-1 text-sm text-ink-muted">Tap a category to see everything on offer.</p>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-6">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${c.id}`}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-line bg-paper-raised p-5 text-center transition-all hover:-translate-y-0.5 hover:border-[var(--color-gold)] hover:shadow-md"
            >
              <span
                className="grid h-14 w-14 place-items-center rounded-2xl text-3xl transition-transform group-hover:scale-110"
                style={{ background: "var(--color-gold-dim)" }}
              >
                {c.icon}
              </span>
              <span className="text-xs font-medium leading-snug text-ink">{c.name}</span>
              <span className="text-[11px] text-ink-muted">{c.count} listings</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Top vendors — each has its own public storefront */}
      <section className="border-y border-line bg-paper-raised">
        <div className="mx-auto max-w-[1600px] px-5 py-14 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--color-gold)" }}>
                — Meet the sellers
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
                Top verified vendor stores
              </h2>
              <p className="mt-1 text-sm text-ink-muted">Every seller gets their own branded storefront page.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {vendors
              .filter((v) => v.status === "Active")
              .slice(0, 4)
              .map((v) => {
                const initials = v.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
                return (
                  <Link
                    key={v.id}
                    href={`/store/${v.id}`}
                    className="group flex flex-col rounded-2xl border border-line bg-paper p-5 transition-all hover:-translate-y-0.5 hover:border-[var(--color-gold)] hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-sm font-bold text-white"
                        style={{ background: "var(--color-navy)" }}
                      >
                        {initials}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">{v.name}</p>
                        <p className="flex items-center gap-1 text-xs text-ink-muted">
                          <Star size={11} style={{ color: "var(--color-gold)" }} /> {v.rating} · since {v.joined}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 line-clamp-2 text-xs text-ink-muted">
                      {v.categories?.join(" · ") || "Multi-category seller"}
                    </p>
                    <span
                      className="mt-4 flex items-center gap-1 text-xs font-semibold"
                      style={{ color: "var(--color-gold)" }}
                    >
                      Visit store <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                );
              })}
          </div>
        </div>
      </section>

      {/* Deal of the day */}
      {dealOfTheDay && (
      <section className="mx-auto max-w-[1600px] px-5 pb-4 lg:px-8">
        <div
          className="flex flex-col gap-6 overflow-hidden rounded-2xl p-8 sm:flex-row sm:items-center"
          style={{ background: "var(--color-navy)" }}
        >
          <span className="grid h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl text-6xl sm:h-28 sm:w-28">
            <ProductThumb image={dealOfTheDay.image} fill emojiSize={60} />
          </span>
          <div className="flex-1 text-white">
            <Badge />
            <h3 className="mt-3 font-display text-2xl font-semibold">
              {dealOfTheDay.name}
            </h3>
            <p className="mt-1 text-sm text-white/70">{dealOfTheDay.vendor}</p>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="font-mono text-2xl font-semibold" style={{ color: "var(--color-gold-light)" }}>
                ₹{dealOfTheDay.price}
              </span>
              <span className="font-mono text-sm text-white/50 line-through">
                ₹{dealOfTheDay.mrp}
              </span>
            </div>
          </div>
          <Link
            href={`/products/${dealOfTheDay.id}`}
            className="inline-flex items-center gap-2 self-start rounded-full px-5 py-2.5 text-sm font-semibold text-ink"
            style={{ background: "var(--color-gold-light)" }}
          >
            Grab the deal <ArrowRight size={15} />
          </Link>
        </div>
      </section>
      )}

      {/* Featured products */}
      <section className="mx-auto max-w-[1600px] px-5 py-14 lg:px-8">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl font-semibold text-ink">
            Featured this week
          </h2>
          <Link href="/products" className="text-sm font-medium" style={{ color: "var(--color-gold)" }}>
            View all →
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y border-line bg-paper-raised">
        <div className="mx-auto max-w-[1600px] px-5 py-16 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--color-gold)" }}>
            — What people say
          </p>
          <h2 className="mt-3 text-center font-display text-3xl font-semibold text-ink">
            Trusted by shoppers and businesses alike
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="flex flex-col rounded-2xl border border-line bg-paper p-6">
                <Quote size={22} style={{ color: "var(--color-gold)" }} />
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-4">
                  <p className="text-sm font-semibold text-ink">{t.name}</p>
                  <p className="text-xs text-ink-muted">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-[1600px] px-5 py-16 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--color-gold)" }}>
          — Common questions
        </p>
        <h2 className="mt-3 text-center font-display text-3xl font-semibold text-ink">
          Still a little confused? Read this
        </h2>
        <FAQAccordion items={faqItems} />
      </section>

      {/* B2B / Vendor cross-promo — same login, this just starts the KYC
          flow so an existing customer account can become a vendor/business */}
      <section className="mx-auto max-w-[1600px] px-5 pb-20 lg:px-8">
        <div
          className="flex flex-col items-start gap-4 rounded-2xl border p-8 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: "var(--color-jade)", background: "var(--color-jade-dim)" }}
        >
          <div className="flex items-start gap-4">
            <span
              className="hidden shrink-0 rounded-full p-3 sm:block"
              style={{ background: "#ffffff", color: "var(--color-jade)" }}
            >
              <Store size={22} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-jade)" }}>
                For businesses & sellers
              </p>
              <h3 className="mt-2 font-display text-xl font-semibold text-ink">
                Buying in bulk or want to sell here? Use your same account.
              </h3>
              <p className="mt-1 text-sm text-ink-muted">
                No separate login required — log in with your existing Pavitram
                account, complete a quick KYC form, and your dashboard
                automatically switches to Vendor or Business once approved.
              </p>
            </div>
          </div>
          <Link
            href="/business/signup"
            className="inline-flex shrink-0 items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white"
            style={{ background: "var(--color-jade)" }}
          >
            Sell / Buy in Bulk <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Badge() {
  return (
    <span
      className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
      style={{ background: "var(--color-gold-light)", color: "var(--color-ink)" }}
    >
      Deal of the Day
    </span>
  );
}
