"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Pavitram has exactly ONE login for every account type (customer, vendor,
// business buyer, admin). This route used to be a separate "Business &
// Vendor Login" screen that created a second, confusing entry point — it
// now just forwards to the single /login page, which figures out the
// right dashboard to send people to based on their account's role.
export default function BusinessLoginRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/login");
  }, [router]);
  return null;
}
