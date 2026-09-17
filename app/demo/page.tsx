"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

type Transaction = {
  id: number;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  date: string;
};

const initialTransactions: Transaction[] = [
  {
    id: 1,
    description: "Salário",
    category: "Trabalho",
    amount: 6500,
    type: "income",
    date: "15/09/2026",
  },
  {
    id: 2,
    description: "Freelance",
    category: "Trabalho",
    amount: 2000,
    type: "income",
    date: "10/09/2026",
  },
  {
    id: 3,
    description: "Aluguel",
    category: "Moradia",
    amount: 1450,
    type: "expense",
    date: "05/09/2026",
  },
  {
    id: 4,
    description: "Supermercado",
    category: "Alimentação",
    amount: 920,
    type: "expense",
    date: "09/09/2026",
  },
  {
    id: 5,
    description: "Combustível",
    category: "Transporte",
    amount: 480,
    type: "expense",
    date: "12/09/2026",
  },
];

export default function DemoPage() {
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);

  const [modalOpen, setModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Alimentação");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");

  const income = useMemo(
    () =>
      transactions
        .filter((item) => item.type === "income")
        .reduce((total, item) => total + item.amount, 0),
    [transactions]
  );

  const expenses = useMemo(
    () =>
      transactions
        .filter((item) => item.type === "expense")
        .reduce((total, item) => total + item.amount, 0),
    [transactions]
  );

  const balance = income - expenses;

  const categories = useMemo(() => {
    const totals: Record<string, number> = {};

    transactions
      .filter((item) => item.type === "expense")
      .forEach((item) => {
        totals[item.category] =
          (totals[item.category] ?? 0) + item.amount;
      });

    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }, [transactions]);

  function addTransaction(event: FormEvent) {
    event.preventDefault();

    const parsedAmount = Number(amount.replace(",", "."));

    if (!description.trim() || parsedAmount <= 0) return;

    const transaction: Transaction = {
      id: Date.now(),
      description,
      category,
      amount: parsedAmount,
      type,
      date: new Date().toLocaleDateString("pt-BR"),
    };

    setTransactions((current) => [transaction, ...current]);

    setDescription("");
    setAmount("");
    setCategory("Alimentação");
    setType("expense");
    setModalOpen(false);
  }

  function removeTransaction(id: number) {
    setTransactions((current) =>
      current.filter((item) => item.id !== id)
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 border-r border-white/10 p-6 lg:block">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400 font-bold text-zinc-950">
              F
            </div>

            <span className="text-xl font-semibold">
              Finance<span className="text-cyan-400">Flow</span>
            </span>
          </Link>

          <nav className="mt-10 space-y-2">
            <MenuItem title="Dashboard" active />
            <MenuItem title="Transações" />
            <MenuItem title="Categorias" />
            <MenuItem title="Orçamentos" />
            <MenuItem title="Metas" />
            <MenuItem title="Relatórios" />
          </nav>

          <div className="mt-10 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4">
            <p className="text-sm font-medium text-cyan-300">
              Modo demonstração
            </p>

            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Os dados desta sessão são temporários.
            </p>
          </div>
        </aside>

        {/* Conteúdo */}
        <section className="flex-1">
          <header className="flex items-center justify-between border-b border-white/10 px-6 py-5 lg:px-8">
            <div>
              <p className="text-sm text-zinc-500">FinanceFlow</p>
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>

            <div className="flex gap-3">
              <Link
                href="/"
                className="hidden rounded-lg border border-white/10 px-4 py-2 text-sm sm:block"
              >
                Sair da demo
              </Link>

              <button
                onClick={() => setModalOpen(true)}
                className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-cyan-300"
              >
                + Nova transação
              </button>
            </div>
          </header>

          <div className="p-6 lg:p-8">
            <div className="mb-8">
              <p className="text-zinc-400">Visão geral</p>
              <h2 className="mt-1 text-2xl font-bold">
                Olá, visitante 👋
              </h2>
            </div>

            {/* Cards */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card
                label="Saldo atual"
                value={money(balance)}
              />

              <Card
                label="Receitas"
                value={money(income)}
                className="text-emerald-400"
              />

              <Card
                label="Despesas"
                value={money(expenses)}
                className="text-rose-400"
              />

              <Card
                label="Economia"
                value={
                  income
                    ? `${Math.round((balance / income) * 100)}%`
                    : "0%"
                }
                className="text-cyan-400"
              />
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              {/* Categorias */}
              <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h3 className="font-semibold">
                  Gastos por categoria
                </h3>

                <p className="mt-1 text-sm text-zinc-500">
                  Distribuição das despesas
                </p>

                <div className="mt-8 space-y-6">
                  {categories.map(([name, value]) => {
                    const percentage =
                      expenses > 0
                        ? Math.round((value / expenses) * 100)
                        : 0;

                    return (
                      <div key={name}>
                        <div className="mb-2 flex justify-between text-sm">
                          <span>{name}</span>

                          <span>
                            {money(value)} · {percentage}%
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                          <div
                            className="h-full rounded-full bg-cyan-400"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Orçamento */}
              <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h3 className="font-semibold">
                  Orçamento mensal
                </h3>

                <p className="mt-1 text-sm text-zinc-500">
                  Limite mensal de R$ 5.000
                </p>

                <p className="mt-8 text-3xl font-bold">
                  {money(expenses)}
                </p>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-cyan-400"
                    style={{
                      width: `${Math.min(
                        (expenses / 5000) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>

                <div className="mt-4 flex justify-between text-sm text-zinc-500">
                  <span>Utilizado</span>
                  <span>
                    {Math.round((expenses / 5000) * 100)}%
                  </span>
                </div>

                <div className="mt-8 rounded-xl bg-zinc-900 p-4">
                  <p className="text-sm text-zinc-500">
                    Disponível
                  </p>

                  <p className="mt-2 text-xl font-semibold text-emerald-400">
                    {money(Math.max(5000 - expenses, 0))}
                  </p>
                </div>
              </section>
            </div>

            {/* Transações */}
            <section className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="border-b border-white/10 p-6">
                <h3 className="font-semibold">
                  Transações recentes
                </h3>

                <p className="mt-1 text-sm text-zinc-500">
                  {transactions.length} movimentações
                </p>
              </div>

              <div className="divide-y divide-white/10">
                {transactions.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 p-5"
                  >
                    <div>
                      <p className="font-medium">
                        {item.description}
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        {item.category} · {item.date}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <p
                        className={
                          item.type === "income"
                            ? "font-semibold text-emerald-400"
                            : "font-semibold text-rose-400"
                        }
                      >
                        {item.type === "income" ? "+" : "-"}{" "}
                        {money(item.amount)}
                      </p>

                      <button
                        onClick={() => removeTransaction(item.id)}
                        className="rounded-md px-2 py-1 text-zinc-500 hover:bg-rose-400/10 hover:text-rose-400"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 p-4">
          <form
            onSubmit={addTransaction}
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-950 p-6"
          >
            <div className="flex justify-between">
              <h2 className="text-xl font-semibold">
                Nova transação
              </h2>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-2xl text-zinc-500"
              >
                ×
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType("expense")}
                className={`rounded-xl border p-3 ${
                  type === "expense"
                    ? "border-rose-400 text-rose-400"
                    : "border-white/10"
                }`}
              >
                Despesa
              </button>

              <button
                type="button"
                onClick={() => setType("income")}
                className={`rounded-xl border p-3 ${
                  type === "income"
                    ? "border-emerald-400 text-emerald-400"
                    : "border-white/10"
                }`}
              >
                Receita
              </button>
            </div>

            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição"
              className="mt-4 w-full rounded-xl border border-white/10 bg-zinc-900 p-3 outline-none"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-4 w-full rounded-xl border border-white/10 bg-zinc-900 p-3"
            >
              <option>Alimentação</option>
              <option>Moradia</option>
              <option>Transporte</option>
              <option>Lazer</option>
              <option>Saúde</option>
              <option>Trabalho</option>
              <option>Outros</option>
            </select>

            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Valor"
              inputMode="decimal"
              className="mt-4 w-full rounded-xl border border-white/10 bg-zinc-900 p-3 outline-none"
            />

            <button
              type="submit"
              className="mt-6 w-full rounded-xl bg-cyan-400 p-3 font-semibold text-zinc-950"
            >
              Salvar transação
            </button>
          </form>
        </div>
      )}
    </main>
  );
}

function Card({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${className}`}>
        {value}
      </p>
    </div>
  );
}

function MenuItem({
  title,
  active = false,
}: {
  title: string;
  active?: boolean;
}) {
  return (
    <button
      className={`w-full rounded-xl px-4 py-3 text-left text-sm ${
        active
          ? "bg-cyan-400/10 text-cyan-300"
          : "text-zinc-400 hover:bg-white/5"
      }`}
    >
      {title}
    </button>
  );
}

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}