import Link from "next/link";
import { SealMark } from "../ui/SealMark";

const columns = [
  {
    title: "Discover",
    links: [
      { label: "Buy a home", href: "/properties?intent=Buy" },
      { label: "Rent a home", href: "/properties?intent=Rent" },
      { label: "PG & Co-living", href: "/properties?intent=PG" },
      { label: "New projects", href: "/projects" },
      { label: "Commercial", href: "/properties?type=Commercial" },
      { label: "Property in Ahmedabad", href: "/city/ahmedabad" },
    ],
  },
  {
    title: "For Owners, Agents & Builders",
    links: [
      { label: "List a property", href: "/login?role=owner" },
      { label: "Add a project", href: "/dashboard/owner/projects/new" },
      { label: "Pricing & credits", href: "/dashboard/owner/subscription" },
      { label: "Manage buyers", href: "/dashboard/owner/leads" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Material suppliers", href: "/services" },
      { label: "Legal help", href: "/services" },
      { label: "Home services", href: "/services" },
      { label: "Home loans & finance", href: "/home-loans" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "Admin dashboard", href: "/dashboard/admin" },
      { label: "Trust & checks", href: "/#trust" },
      { label: "Help & support", href: "/services" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-ink-900 text-stone-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <SealMark size={22} className="text-brass-400" />
              <span className="font-display text-lg font-medium text-white">Pavitram</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-stone-400">
              A property site built on checking things first — search, list, and close deals,
              all without leaving Pavitram.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-mono text-[11px] uppercase tracking-wider text-stone-500">{col.title}</h4>
              <ul className="mt-3 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-stone-300 hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-ink-800 pt-6 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Pavitram Realestate. Listings checked against RERA where it applies.</p>
          <p>Made for the Indian property market — Hindi · Gujarati · English</p>
        </div>
      </div>
    </footer>
  );
}
