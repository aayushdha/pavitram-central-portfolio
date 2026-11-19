import type { NavGroup } from "@/components/layout/Sidebar";

export const adminNav: NavGroup[] = [
  {
    items: [{ label: "Overview", href: "/dashboard/admin", icon: "LayoutDashboard" }],
  },
  {
    label: "Manage",
    items: [
      { label: "Users & KYC", href: "/dashboard/admin/users", icon: "Users" },
      { label: "Check Listings", href: "/dashboard/admin/listings", icon: "ShieldCheck" },
      { label: "Manage Services", href: "/dashboard/admin/services", icon: "Wrench" },
    ],
  },
  {
    label: "Growth",
    items: [
      { label: "Revenue & Billing", href: "/dashboard/admin/revenue", icon: "IndianRupee" },
      { label: "Website & Marketing", href: "/dashboard/admin/cms", icon: "LayoutTemplate" },
      { label: "Reports", href: "/dashboard/admin/analytics", icon: "BarChart3" },
    ],
  },
  {
    label: "Trust & Safety",
    items: [
      { label: "Disputes & Support", href: "/dashboard/admin/disputes", icon: "MessageCircleWarning" },
      { label: "Security & Activity", href: "/dashboard/admin/security", icon: "Lock" },
    ],
  },
];

export const ownerNav: NavGroup[] = [
  {
    items: [{ label: "Overview", href: "/dashboard/owner", icon: "LayoutDashboard" }],
  },
  {
    label: "Listings",
    items: [
      { label: "My Listings", href: "/dashboard/owner/listings", icon: "Building2" },
      { label: "Builder Projects", href: "/dashboard/owner/projects", icon: "FolderKanban" },
      { label: "Verification & RERA", href: "/dashboard/owner/verification", icon: "BadgeCheck" },
    ],
  },
  {
    label: "Pipeline",
    items: [
      { label: "Leads (CRM)", href: "/dashboard/owner/leads", icon: "Contact" },
      { label: "Messages", href: "/dashboard/owner/messages", icon: "MessageSquare" },
    ],
  },
  {
    label: "Growth",
    items: [
      { label: "Analytics", href: "/dashboard/owner/analytics", icon: "LineChart" },
      { label: "Subscription & Credits", href: "/dashboard/owner/subscription", icon: "Wallet" },
    ],
  },
];

export const seekerNav: NavGroup[] = [
  {
    items: [{ label: "Overview", href: "/dashboard/seeker", icon: "LayoutDashboard" }],
  },
  {
    label: "Search",
    items: [
      { label: "Saved Searches", href: "/dashboard/seeker/saved-searches", icon: "Bookmark" },
      { label: "Wishlist & Compare", href: "/dashboard/seeker/wishlist", icon: "Heart" },
      { label: "Site Visits", href: "/dashboard/seeker/site-visits", icon: "CalendarClock" },
    ],
  },
  {
    label: "Plan & Decide",
    items: [
      { label: "Money & Legal Tools", href: "/dashboard/seeker/tools", icon: "Calculator" },
      { label: "Messages", href: "/dashboard/seeker/messages", icon: "MessageSquare" },
    ],
  },
];

export const providerNav: NavGroup[] = [
  {
    items: [{ label: "Overview", href: "/dashboard/provider", icon: "LayoutDashboard" }],
  },
  {
    label: "Work",
    items: [
      { label: "Bookings", href: "/dashboard/provider/bookings", icon: "FileText" },
      { label: "Calendar & Availability", href: "/dashboard/provider/calendar", icon: "CalendarDays" },
      { label: "Quotes", href: "/dashboard/provider/quotes", icon: "Wrench" },
    ],
  },
  {
    label: "Payouts",
    items: [{ label: "Earnings & Payouts", href: "/dashboard/provider/earnings", icon: "PiggyBank" }],
  },
];
