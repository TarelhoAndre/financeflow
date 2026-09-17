"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Erro ao sair:", error.message);
      setLoading(false);
      return;
    }

    router.replace("/auth/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="mt-3 w-full rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-400 transition hover:border-rose-400/30 hover:bg-rose-400/10 hover:text-rose-400 disabled:opacity-50"
    >
      {loading ? "Saindo..." : "Sair da conta"}
    </button>
  );
}