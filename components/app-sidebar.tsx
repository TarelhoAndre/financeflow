"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import LogoutButton from "@/components/logout-button";

const navigation = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/transactions", label: "Transações" },
  { href: "/categories", label: "Categorias" },
  { href: "/budgets", label: "Orçamentos" },
  { href: "/goals", label: "Metas" },
  { href: "/reports", label: "Relatórios" },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const supabase = createClient();

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUserEmail(user?.email ?? "");
    }

    loadUser();
  }, []);

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-white/10 bg-zinc-950 p-6 lg:flex">
      <Link href="/dashboard" className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400 font-bold text-zinc-950">
          F
        </div>

        <span className="text-xl font-semibold text-white">
          Finance<span className="text-cyan-400">Flow</span>
        </span>
      </Link>

      <nav className="mt-10 space-y-2">
        {navigation.map((item) => {
          const active =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-xl px-4 py-3 text-sm transition ${
                active
                  ? "bg-cyan-400/10 font-medium text-cyan-300"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs text-zinc-500">Conta conectada</p>

          <p className="mt-1 truncate text-sm text-white">
            {userEmail || "Carregando..."}
          </p>

          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
