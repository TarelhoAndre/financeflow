"use client";

import Link from "next/link";
import {
  FormEvent,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "../../lib/supabase/client";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
  type: "expense";
};

type Budget = {
  id: string;
  category_id: string | null;
  amount: number;
  month: string;
  created_at: string;
};

type Transaction = {
  id: string;
  category_id: string | null;
  amount: number;
  type: "expense";
  transaction_date: string;
};

type Props = {
  userEmail: string;
  categories: Category[];
  budgets: Budget[];
  transactions: Transaction[];
};

export default function BudgetsClient({
  userEmail = "",
  categories = [],
  budgets = [],
  transactions = [],
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [selectedMonth, setSelectedMonth] = useState("");

  const [modalOpen, setModalOpen] = useState(false);

  const [editingBudget, setEditingBudget] =
    useState<Budget | null>(null);

  const [categoryId, setCategoryId] = useState(
  categories?.[0]?.id ?? ""
  );

  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

useEffect(() => {
  const now = new Date();

  const currentMonth = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;

  setSelectedMonth(currentMonth);
  setMonth(currentMonth);
}, []);

  const monthBudgets = useMemo(() => {
    if (!selectedMonth) return [];

    return (budgets ?? []).filter((budget) =>
      budget.month?.startsWith(selectedMonth)
  );
}, [budgets, selectedMonth]);

  const monthTransactions = useMemo(() => {
    if (!selectedMonth) return [];

    return (transactions ?? []).filter((transaction) =>
    transaction.transaction_date?.startsWith(selectedMonth)
  );
}, [transactions, selectedMonth]);

  const totalBudget = monthBudgets.reduce(
    (total, budget) => total + budget.amount,
    0
  );

  const totalSpent = monthTransactions.reduce(
    (total, transaction) => total + transaction.amount,
    0
  );

  const remaining = totalBudget - totalSpent;

  function getSpentByCategory(categoryId: string) {
    return monthTransactions
      .filter(
        (transaction) =>
          transaction.category_id === categoryId
      )
      .reduce(
        (total, transaction) =>
          total + transaction.amount,
        0
      );
  }

  function openCreateModal() {
    setEditingBudget(null);

    const categoriesWithoutBudget =
      (categories ?? []).filter(
        (category) =>
          !monthBudgets.some(
            (budget) =>
              budget.category_id === category.id
          )
      );

    setCategoryId(
      categoriesWithoutBudget[0]?.id ??
        categories?.[0]?.id ??
        ""
    );

    setAmount("");
    setMonth(selectedMonth);
    setMessage("");
    setModalOpen(true);
  }

  function openEditModal(budget: Budget) {
    setEditingBudget(budget);
    setCategoryId(budget.category_id ?? "");
    setAmount(String(budget.amount));
    setMonth(budget.month.slice(0, 7));
    setMessage("");
    setModalOpen(true);
  }

  function parseAmount(value: string) {
    const normalized = value.includes(",")
      ? value.replace(/\./g, "").replace(",", ".")
      : value;

    return Number(normalized);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setMessage("");

    const parsedAmount = parseAmount(amount);

    if (!categoryId) {
      setMessage("Selecione uma categoria.");
      return;
    }

    if (!parsedAmount || parsedAmount <= 0) {
      setMessage("Informe um valor válido.");
      return;
    }

    if (!month) {
      setMessage("Selecione um mês.");
      return;
    }

    setLoading(true);

    if (editingBudget) {
      const { error } = await supabase
        .from("budgets")
        .update({
          category_id: categoryId,
          amount: parsedAmount,
          month: `${month}-01`,
        })
        .eq("id", editingBudget.id);

      if (error) {
        console.error(error);

        if (error.code === "23505") {
          setMessage(
            "Já existe um orçamento para essa categoria neste mês."
          );
        } else {
          setMessage(error.message);
        }

        setLoading(false);
        return;
      }
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Sua sessão expirou.");
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from("budgets")
        .insert({
          user_id: user.id,
          category_id: categoryId,
          amount: parsedAmount,
          month: `${month}-01`,
        });

      if (error) {
        console.error("Erro ao criar orçamento:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });

        if (error.code === "23505") {
          setMessage(
            "Já existe um orçamento para essa categoria neste mês."
          );
        } else {
          setMessage(
            `${error.code ?? "Erro"}: ${
              error.message ?? "Não foi possível criar o orçamento."
            }`
          );
        }

        setLoading(false);
        return;
      }
    }

    setLoading(false);
    setModalOpen(false);
    setSelectedMonth(month);

    router.refresh();
  }

  async function deleteBudget(budget: Budget) {
    const category = categories.find(
      (item) => item.id === budget.category_id
    );

    const confirmed = window.confirm(
      `Deseja excluir o orçamento de ${
        category?.name ?? "esta categoria"
      }?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("budgets")
      .delete()
      .eq("id", budget.id);

    if (error) {
      console.error(error);
      alert("Não foi possível excluir o orçamento.");
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
              <p className="text-sm text-zinc-500">
                FinanceFlow
              </p>

              <h1 className="text-xl font-semibold">
                Orçamentos
              </h1>
            </div>

            <button
              onClick={openCreateModal}
              className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-300"
            >
              + Novo orçamento
            </button>
          </header>

          <div className="p-6 lg:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-zinc-400">
                  Planejamento financeiro
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  Orçamento mensal
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  Defina limites para controlar seus
                  gastos por categoria.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-xs text-zinc-500">
                  Mês
                </label>

                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(event) =>
                    setSelectedMonth(
                      event.target.value
                    )
                  }
                  className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* RESUMO */}
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <SummaryCard
                label="Orçamento planejado"
                value={money(totalBudget)}
              />

              <SummaryCard
                label="Gasto no mês"
                value={money(totalSpent)}
                valueClass="text-rose-400"
              />

              <SummaryCard
                label={
                  remaining >= 0
                    ? "Disponível"
                    : "Acima do orçamento"
                }
                value={money(Math.abs(remaining))}
                valueClass={
                  remaining >= 0
                    ? "text-emerald-400"
                    : "text-rose-400"
                }
              />
            </div>

            {/* ORÇAMENTOS */}
            <section className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="border-b border-white/10 p-6">
                <h3 className="font-semibold">
                  Limites por categoria
                </h3>

                <p className="mt-1 text-sm text-zinc-500">
                  {monthBudgets.length} orçamento(s)
                  configurado(s)
                </p>
              </div>

              {monthBudgets.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-zinc-400">
                    Nenhum orçamento definido para
                    este mês.
                  </p>

                  <button
                    onClick={openCreateModal}
                    className="mt-4 text-sm text-cyan-400"
                  >
                    Criar primeiro orçamento
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 p-6 lg:grid-cols-2">
                  {monthBudgets.map((budget) => {
                    const category =
                      categories.find(
                        (item) =>
                          item.id ===
                          budget.category_id
                      );

                    const spent =
                      budget.category_id
                        ? getSpentByCategory(
                            budget.category_id
                          )
                        : 0;

                    const percentage =
                      budget.amount > 0
                        ? Math.round(
                            (spent / budget.amount) *
                              100
                          )
                        : 0;

                    const difference =
                      budget.amount - spent;

                    return (
                      <article
                        key={budget.id}
                        className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold">
                              {category?.name ??
                                "Categoria removida"}
                            </p>

                            <p className="mt-1 text-sm text-zinc-500">
                              Limite:{" "}
                              {money(
                                budget.amount
                              )}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-xs ${
                              percentage >= 100
                                ? "bg-rose-400/10 text-rose-400"
                                : percentage >= 80
                                  ? "bg-amber-400/10 text-amber-400"
                                  : "bg-emerald-400/10 text-emerald-400"
                            }`}
                          >
                            {percentage}%
                          </span>
                        </div>

                        <div className="mt-6">
                          <div className="mb-2 flex justify-between text-sm">
                            <span className="text-zinc-500">
                              Gasto
                            </span>

                            <span>
                              {money(spent)}
                            </span>
                          </div>

                          <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
                            <div
                              className={`h-full rounded-full transition-all ${
                                percentage >= 100
                                  ? "bg-rose-400"
                                  : percentage >= 80
                                    ? "bg-amber-400"
                                    : "bg-cyan-400"
                              }`}
                              style={{
                                width: `${Math.min(
                                  percentage,
                                  100
                                )}%`,
                              }}
                            />
                          </div>

                          <div className="mt-4">
                            {difference >= 0 ? (
                              <p className="text-sm text-emerald-400">
                                {money(
                                  difference
                                )}{" "}
                                disponível
                              </p>
                            ) : (
                              <p className="text-sm text-rose-400">
                                Orçamento excedido em{" "}
                                {money(
                                  Math.abs(
                                    difference
                                  )
                                )}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-6 flex gap-2">
                          <button
                            onClick={() =>
                              openEditModal(
                                budget
                              )
                            }
                            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/5"
                          >
                            Editar
                          </button>

                          <button
                            onClick={() =>
                              deleteBudget(budget)
                            }
                            className="rounded-lg px-4 py-2 text-sm text-rose-400 transition hover:bg-rose-400/10"
                          >
                            Excluir
                          </button>
                        </div>
                      </article>
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
                  {editingBudget
                    ? "Editar orçamento"
                    : "Novo orçamento"}
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Defina quanto deseja gastar.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setModalOpen(false)
                }
                className="text-2xl text-zinc-500 hover:text-white"
              >
                ×
              </button>
            </div>

            <label className="mt-6 block text-sm text-zinc-400">
              Categoria
            </label>

            <select
              value={categoryId}
              onChange={(event) =>
                setCategoryId(
                  event.target.value
                )
              }
              className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-900 p-3 outline-none focus:border-cyan-400"
            >
              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>

            <label className="mt-4 block text-sm text-zinc-400">
              Limite
            </label>

            <input
              value={amount}
              onChange={(event) =>
                setAmount(event.target.value)
              }
              inputMode="decimal"
              placeholder="Ex: 800,00"
              className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-900 p-3 outline-none focus:border-cyan-400"
            />

            <label className="mt-4 block text-sm text-zinc-400">
              Mês
            </label>

            <input
              type="month"
              value={month}
              onChange={(event) =>
                setMonth(event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-900 p-3 outline-none focus:border-cyan-400"
            />

            {message && (
              <p className="mt-4 text-sm text-rose-400">
                {message}
              </p>
            )}

            <button
              disabled={loading}
              type="submit"
              className="mt-6 w-full rounded-xl bg-cyan-400 p-3 font-semibold text-zinc-950 transition hover:bg-cyan-300 disabled:opacity-50"
            >
              {loading
                ? "Salvando..."
                : editingBudget
                  ? "Salvar alterações"
                  : "Criar orçamento"}
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
  children: ReactNode;
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

function SummaryCard({
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
      <p className="text-sm text-zinc-500">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${valueClass}`}
      >
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