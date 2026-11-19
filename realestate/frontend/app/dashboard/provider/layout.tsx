import { ReactNode } from "react";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function ProviderDashboardLayout({ children }: { children: ReactNode }) {
  return <RoleGuard role="PROVIDER">{children}</RoleGuard>;
}
