import { ReactNode } from "react";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function OwnerDashboardLayout({ children }: { children: ReactNode }) {
  return <RoleGuard role="OWNER">{children}</RoleGuard>;
}
