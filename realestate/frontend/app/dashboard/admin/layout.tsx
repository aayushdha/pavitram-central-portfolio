import { ReactNode } from "react";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  // ADMIN is never self-assigned by a user — it is only ever mirrored in
  // from the central auth account being ADMIN/SUPER_ADMIN there (see
  // `CentralAuthGuard` on the backend). So reaching this layout with the
  // ADMIN role already proves the central account is a real admin.
  return <RoleGuard role="ADMIN">{children}</RoleGuard>;
}
