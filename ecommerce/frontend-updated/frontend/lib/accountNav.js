import { LayoutGrid, PackageSearch, Heart, MapPin, UserRound, Gift, PackageX } from "lucide-react";

export const accountNav = [
  { href: "/account", label: "Overview", icon: LayoutGrid },
  { href: "/account/orders", label: "My Orders", icon: PackageSearch },
  { href: "/account/returns", label: "Returns & Refunds", icon: PackageX },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/rewards", label: "Rewards & Referrals", icon: Gift },
  { href: "/account/addresses", label: "Saved Addresses", icon: MapPin },
  { href: "/account/profile", label: "Profile Details", icon: UserRound },
];
