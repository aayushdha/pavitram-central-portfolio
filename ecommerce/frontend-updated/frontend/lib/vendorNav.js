import { LayoutGrid, Store, Package, Layers, ClipboardList, FileText, Wallet } from "lucide-react";

export const vendorNav = [
  {
    section: null,
    items: [{ href: "/vendor/dashboard", label: "Overview", icon: LayoutGrid }],
  },
  {
    section: "Store",
    items: [
      { href: "/vendor/store", label: "Store Setup", icon: Store },
      { href: "/vendor/products", label: "Products & Stock", icon: Package },
    ],
  },
  {
    section: "Selling",
    items: [
      { href: "/vendor/orders", label: "Orders", icon: ClipboardList },
      { href: "/vendor/rfq", label: "RFQ Inbox", icon: FileText },
      { href: "/vendor/b2b-toolkit", label: "B2B Toolkit", icon: Layers },
    ],
  },
  {
    section: "Money",
    items: [{ href: "/vendor/earnings", label: "Earnings & Reviews", icon: Wallet }],
  },
];
