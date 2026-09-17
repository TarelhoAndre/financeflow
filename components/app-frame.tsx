"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

import AppSidebar from "@/components/app-sidebar";

const protectedRoutes = [
  "/dashboard",
  "/transactions",
  "/categories",
  "/budgets",
  "/goals",
  "/reports",
];

export default function AppFrame({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  const useSidebar = protectedRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );

  if (!useSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <AppSidebar />

      <main className="min-h-screen lg:pl-64">
        {children}
      </main>
    </div>
  );
}
