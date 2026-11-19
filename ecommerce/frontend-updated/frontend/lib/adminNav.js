import {
  LayoutGrid,
  Store,
  Building2,
  ClipboardList,
  BarChart3,
  Megaphone,
  ShieldCheck,
  Settings2,
  Users,
  Percent,
} from "lucide-react";

export const adminNav = [
  {
    section: null,
    items: [{ href: "/admin/dashboard", label: "Overview", icon: LayoutGrid }],
  },
  {
    section: "People",
    items: [
      { href: "/admin/vendors", label: "Vendors", icon: Store },
      { href: "/admin/customers", label: "Customers & Users", icon: Users },
      { href: "/admin/b2b-accounts", label: "B2B Accounts", icon: Building2 },
    ],
  },
  {
    section: "Operations",
    items: [
      { href: "/admin/orders", label: "Orders & Disputes", icon: ClipboardList },
      { href: "/admin/commissions", label: "Commissions & Payouts", icon: Percent },
      { href: "/admin/cms", label: "Homepage & Marketing", icon: Megaphone },
    ],
  },
  {
    section: "Reports",
    items: [
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/admin/audit", label: "Tax & Audit", icon: ShieldCheck },
    ],
  },
  {
    section: "Settings",
    items: [{ href: "/admin/system", label: "System & Support", icon: Settings2 }],
  },
];
