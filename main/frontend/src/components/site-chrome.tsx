"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AuthProvider } from "@/components/auth/auth-provider";
import { Navbar, Footer, ScrollToTop, ToastHost } from "@/components/site";

function isAppShellPath(pathname: string) {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/sso") ||
    pathname.startsWith("/super-admin")
  );
}

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const appShell = isAppShellPath(pathname);

  return (
    <AuthProvider>
      {appShell ? (
        <>
          {children}
          <ToastHost />
        </>
      ) : (
        <div className="bg-haze">
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <ScrollToTop />
          <ToastHost />
        </div>
      )}
    </AuthProvider>
  );
}
