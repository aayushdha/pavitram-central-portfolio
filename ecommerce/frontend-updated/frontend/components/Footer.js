import Link from "next/link";

const columns = [
  {
    title: "Shopping",
    links: [
      { href: "/products", label: "Shop all categories" },
      { href: "/cart", label: "My cart" },
      { href: "/register", label: "Create a personal account" },
    ],
  },
  {
    title: "For Business & Vendors",
    links: [
      { href: "/business/signup", label: "Sell or buy in bulk" },
      { href: "/b2b/rfq", label: "Raise a bulk order (RFQ)" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/support", label: "Contact & Help" },
      { href: "/b2b/support", label: "Business support & FAQs" },
      { href: "/#how-it-works", label: "How Pavitram works" },
      { href: "/#trade-types", label: "B2B, B2C & D2C explained" },
    ],
  },
];

export default function Footer() {
  return (
    <footer style={{ background: "var(--color-navy)", color: "var(--color-navy-muted)" }}>
      <div className="mx-auto max-w-[1600px] px-5 py-14 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="grid h-9 w-9 place-items-center rounded-full border text-sm font-semibold"
                style={{ borderColor: "var(--color-gold)", color: "var(--color-gold-light)" }}
              >
                ॐ
              </span>
              <span className="font-display text-lg font-semibold text-white">Pavitram</span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed">
              Shop for yourself in minutes, or trade in bulk as a verified
              business — both live on the same platform, with separate,
              simple logins for each.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-display text-sm font-semibold" style={{ color: "var(--color-gold-light)" }}>
                {col.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div
          className="mt-12 flex flex-col gap-2 border-t pt-6 text-xs sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: "var(--color-navy-line)" }}
        >
          <p>© 2026 Pavitram Commerce Pvt Ltd. All rights reserved.</p>
          <p>Hybrid B2B + B2C Edition — Version 2.0</p>
        </div>
      </div>
    </footer>
  );
}
