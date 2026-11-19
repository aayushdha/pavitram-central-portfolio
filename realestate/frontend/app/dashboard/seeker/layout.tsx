import { ReactNode } from "react";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function SeekerDashboardLayout({ children }: { children: ReactNode }) {
  // Every account gets SEEKER by default on first login, so this just
  // requires "logged in" — no separate role check needed.
  return <RoleGuard role="SEEKER">{children}</RoleGuard>;
}
