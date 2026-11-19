import { LayoutGrid, FileCheck2, Users, FileText, ReceiptText, Truck, Headset } from "lucide-react";

export const b2bNav = [
  {
    section: null,
    items: [{ href: "/b2b/dashboard", label: "Overview", icon: LayoutGrid }],
  },
  {
    section: "Company",
    items: [
      { href: "/b2b/register", label: "Onboarding", icon: FileCheck2 },
      { href: "/b2b/team", label: "Team & Approvals", icon: Users },
    ],
  },
  {
    section: "Buying",
    items: [
      { href: "/b2b/rfq", label: "RFQs & Bulk Orders", icon: FileText },
      { href: "/b2b/logistics", label: "Logistics", icon: Truck },
    ],
  },
  {
    section: "Money & Help",
    items: [
      { href: "/b2b/billing", label: "Credit & Invoicing", icon: ReceiptText },
      { href: "/b2b/support", label: "Support & Analytics", icon: Headset },
    ],
  },
];
