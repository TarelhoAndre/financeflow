"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import LogoutButton from "@/components/logout-button";

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
  const router = useRouter();
  const supabase = createClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [categoryId, setCategoryId] = useState(
    categories.find((category) => category.type === "expense")?.id ?? ""
  );
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const income = useMemo(() => {
    return transactions
      .filter((transaction) => transaction.type === "income")
      .reduce((total, transaction) => total + transaction.amount, 0);
  }, [transactions]);

  const expenses = useMemo(() => {
    return transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((total, transaction) => total + transaction.amount, 0);
  }, [transactions]);

  const balance = income - expenses;

  const economy =
    income > 0 ? Math.round((balance / income) * 100) : 0;

  const expenseCategories = useMemo(() => {
    const totals: Record<string, number> = {};

    transactions
      .filter((transaction) => transaction.type === "expense")
      .forEach((transaction) => {
        const category = categories.find(
          (item) => item.id === transaction.category_id
        );

        const categoryName = category?.name ?? "Sem categoria";

        totals[categoryName] =
          (totals[categoryName] ?? 0) + transaction.amount;
      });

    return Object.entries(totals)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, categories]);

  const availableCategories = categories.filter(
    (category) => category.type === type
  );

  function changeType(newType: "income" | "expense") {
    setType(newType);

    const firstCategory = categories.find(
      (category) => category.type === newType
    );

    setCategoryId(firstCategory?.id ?? "");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setMessage("");

    const parsedAmount = Number(amount.replace(",", "."));

    if (!description.trim()) {
      setMessage("Informe uma descrição.");
      return;
    }

    if (!parsedAmount || parsedAmount <= 0) {
      setMessage("Informe um valor válido.");
      return;
    }

    if (!categoryId) {
      setMessage("Selecione uma categoria.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Sua sessão expirou. Faça login novamente.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      category_id: categoryId,
      description: description.trim(),
      amount: parsedAmount,
      type,
      transaction_date: date,
    });

    if (error) {
      console.error(error);
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setDescription("");
    setAmount("");
    setDate(new Date().toISOString().slice(0, 10));
    setType("expense");

    const firstExpenseCategory = categories.find(
      (category) => category.type === "expense"
    );

    setCategoryId(firstExpenseCategory?.id ?? "");

    setLoading(false);
    setModalOpen(false);

    router.refresh();
  }

  async function deleteTransaction(id: string) {
    const confirmed = window.confirm(
      "Deseja realmente excluir esta transação?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Não foi possível excluir a transação.");
      return;
    }

    router.refresh();
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="flex min-h-screen">
        {/* CONTEÚDO */}
        <section className="flex-1">
          <header className="flex items-center justify-between border-b border-white/10 px-6 py-5 lg:px-8">
            <div>
              <p className="text-sm text-zinc-500">FinanceFlow</p>
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-300"
            >
              + Nova transação
            </button>
          </header>

          <div className="p-6 lg:p-8">
            <div>
              <p className="text-zinc-400">Visão geral</p>

              <h2 className="mt-1 text-2xl font-bold">
                Suas finanças
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Acompanhe suas receitas e despesas.
              </p>
            </div>

            {/* CARDS */}
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card
                label="Saldo atual"
                value={money(balance)}
              />

              <Card
                label="Receitas"
                value={money(income)}
                valueClass="text-emerald-400"
              />

              <Card
                label="Despesas"
                value={money(expenses)}
                valueClass="text-rose-400"
              />

              <Card
                label="Economia"
                value={`${economy}%`}
                valueClass="text-cyan-400"
              />
            </div>

            {/* CATEGORIAS */}
            <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="font-semibold">
                Gastos por categoria
              </h3>

              <p className="mt-1 text-sm text-zinc-500">
                Distribuição das suas despesas
              </p>

              {expenseCategories.length === 0 ? (
                <p className="mt-8 text-sm text-zinc-500">
                  Nenhuma despesa cadastrada.
                </p>
              ) : (
                <div className="mt-8 space-y-6">
                  {expenseCategories.map((category) => {
                    const percentage =
                      expenses > 0
                        ? Math.round(
                            (category.value / expenses) * 100
                          )
                        : 0;

                    return (
                      <div key={category.name}>
                        <div className="mb-2 flex justify-between gap-4 text-sm">
                          <span>{category.name}</span>

                          <span>
                            {money(category.value)} · {percentage}%
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
              )}
            </section>

            {/* TRANSAÇÕES */}
            <section className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="border-b border-white/10 p-6">
                <h3 className="font-semibold">
                  Transações recentes
                </h3>

                <p className="mt-1 text-sm text-zinc-500">
                  {transactions.length} registros
                </p>
              </div>

              {transactions.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-zinc-400">
                    Nenhuma transação cadastrada.
                  </p>

                  <button
                    onClick={() => setModalOpen(true)}
                    className="mt-4 text-sm text-cyan-400"
                  >
                    Adicionar primeira transação
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {transactions.map((transaction) => {
                    const category = categories.find(
                      (item) =>
                        item.id === transaction.category_id
                    );

                    return (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between gap-4 p-5 transition hover:bg-white/[0.02]"
                      >
                        <div>
                          <p className="font-medium">
                            {transaction.description}
                          </p>

                          <p className="mt-1 text-sm text-zinc-500">
                            {category?.name ?? "Sem categoria"} ·{" "}
                            {formatDate(
                              transaction.transaction_date
                            )}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <p
                            className={
                              transaction.type === "income"
                                ? "font-semibold text-emerald-400"
                                : "font-semibold text-rose-400"
                            }
                          >
                            {transaction.type === "income"
                              ? "+"
                              : "-"}{" "}
                            {money(transaction.amount)}
                          </p>

                          <button
                            onClick={() =>
                              deleteTransaction(transaction.id)
                            }
                            className="rounded-lg px-2 py-1 text-zinc-500 transition hover:bg-rose-400/10 hover:text-rose-400"
                            title="Excluir"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </section>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Nova transação
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Registre uma receita ou despesa.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-2xl text-zinc-500 hover:text-white"
              >
                ×
              </button>
            </div>

            {/* TIPO */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => changeType("expense")}
                className={`rounded-xl border p-3 ${
                  type === "expense"
                    ? "border-rose-400 bg-rose-400/10 text-rose-400"
                    : "border-white/10 text-zinc-400"
                }`}
              >
                Despesa
              </button>

              <button
                type="button"
                onClick={() => changeType("income")}
                className={`rounded-xl border p-3 ${
                  type === "income"
                    ? "border-emerald-400 bg-emerald-400/10 text-emerald-400"
                    : "border-white/10 text-zinc-400"
                }`}
              >
                Receita
              </button>
            </div>

            <input
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Descrição"
              className="mt-4 w-full rounded-xl border border-white/10 bg-zinc-900 p-3 outline-none focus:border-cyan-400"
            />

            <select
              value={categoryId}
              onChange={(event) =>
                setCategoryId(event.target.value)
              }
              className="mt-4 w-full rounded-xl border border-white/10 bg-zinc-900 p-3 outline-none focus:border-cyan-400"
            >
              {availableCategories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>

            <input
              value={amount}
              onChange={(event) =>
                setAmount(event.target.value)
              }
              inputMode="decimal"
              placeholder="Valor"
              className="mt-4 w-full rounded-xl border border-white/10 bg-zinc-900 p-3 outline-none focus:border-cyan-400"
            />

            <input
              type="date"
              value={date}
              onChange={(event) =>
                setDate(event.target.value)
              }
              className="mt-4 w-full rounded-xl border border-white/10 bg-zinc-900 p-3 outline-none focus:border-cyan-400"
            />

            {message && (
              <p className="mt-4 text-sm text-rose-400">
                {message}
              </p>
            )}

            <button
              disabled={loading}
              type="submit"
              className="mt-6 w-full rounded-xl bg-cyan-400 p-3 font-semibold text-zinc-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Salvando..."
                : "Salvar transação"}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}

function SidebarLink({
  href,
  children,
  active = false,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-xl px-4 py-3 text-sm transition ${
        active
          ? "bg-cyan-400/10 font-medium text-cyan-300"
          : "text-zinc-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}

function Card({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-sm text-zinc-500">{label}</p>

      <p className={`mt-2 text-2xl font-bold ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}