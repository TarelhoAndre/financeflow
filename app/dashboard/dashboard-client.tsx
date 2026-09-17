"use client";

type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
};

type Transaction = {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category_id: string | null;
  transaction_date: string;
  created_at: string;
};

type DashboardProps = {
  userEmail: string;
  categories: Category[];
  transactions: Transaction[];
};

export default function DashboardClient({
  userEmail,
  categories,
  transactions,
}: DashboardProps) {
  return (
    <main className="min-h-screen bg-zinc-950 p-8 text-white">
      <h1 className="text-3xl font-bold">
        Finance<span className="text-cyan-400">Flow</span>
      </h1>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-sm text-zinc-500">
          Usuário conectado
        </p>

        <p className="mt-1">
          {userEmail}
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-sm text-zinc-500">
            Categorias
          </p>

          <p className="mt-2 text-3xl font-bold">
            {categories.length}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-sm text-zinc-500">
            Transações
          </p>

          <p className="mt-2 text-3xl font-bold">
            {transactions.length}
          </p>
        </div>
      </div>
    </main>
  );
}