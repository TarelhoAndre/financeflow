"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

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

type Props = {
  userEmail: string;
  categories: Category[];
  transactions: Transaction[];
};

export default function TransactionsClient({
  userEmail,
  categories,
  transactions,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const category = categories.find(
        (item) => item.id === transaction.category_id
      );

      const matchesSearch =
        transaction.description
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        category?.name
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesType =
        typeFilter === "all" || transaction.type === typeFilter;

      const matchesCategory =
        categoryFilter === "all" ||
        transaction.category_id === categoryFilter;

      const matchesMonth =
        !monthFilter ||
        transaction.transaction_date.startsWith(monthFilter);

      return (
        matchesSearch &&
        matchesType &&
        matchesCategory &&
        matchesMonth
      );
    });
  }, [
    transactions,
    categories,
    search,
    typeFilter,
    categoryFilter,
    monthFilter,
  ]);

  const filteredIncome = filteredTransactions
    .filter((item) => item.type === "income")
    .reduce((total, item) => total + item.amount, 0);

  const filteredExpenses = filteredTransactions
    .filter((item) => item.type === "expense")
    .reduce((total, item) => total + item.amount, 0);

  const availableCategories = categories.filter(
    (category) => category.type === type
  );

  function openCreateModal() {
    setEditingId(null);
    setDescription("");
    setAmount("");
    setType("expense");
    setDate(new Date().toISOString().slice(0, 10));
    setMessage("");

    const category = categories.find(
      (item) => item.type === "expense"
    );

    setCategoryId(category?.id ?? "");
    setModalOpen(true);
  }

  function openEditModal(transaction: Transaction) {
    setEditingId(transaction.id);
    setDescription(transaction.description);
    setAmount(String(transaction.amount));
    setType(transaction.type);
    setCategoryId(transaction.category_id ?? "");
    setDate(transaction.transaction_date);
    setMessage("");
    setModalOpen(true);
  }

  function changeType(newType: "income" | "expense") {
    setType(newType);

    const category = categories.find(
      (item) => item.type === newType
    );

    setCategoryId(category?.id ?? "");
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

    if (editingId) {
      const { error } = await supabase
        .from("transactions")
        .update({
          description: description.trim(),
          amount: parsedAmount,
          type,
          category_id: categoryId,
          transaction_date: date,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingId);

      if (error) {
        console.error(error);
        setMessage(error.message);
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
        .from("transactions")
        .insert({
          user_id: user.id,
          description: description.trim(),
          amount: parsedAmount,
          type,
          category_id: categoryId,
          transaction_date: date,
        });

      if (error) {
        console.error(error);
        setMessage(error.message);
        setLoading(false);
        return;
      }
    }

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
        <aside className="hidden w-64 border-r border-white/10 p-6 lg:block">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400 font-bold text-zinc-950">
              F
            </div>

            <span className="text-xl font-semibold">
              Finance
              <span className="text-cyan-400">Flow</span>
            </span>
          </Link>

          <nav className="mt-10 space-y-2">
            <SidebarLink href="/dashboard">
              Dashboard
            </SidebarLink>

            <SidebarLink href="/transactions" active>
              Transações
            </SidebarLink>

            <SidebarLink href="/categories">
              Categorias
            </SidebarLink>

            <SidebarLink href="/budgets">
              Orçamentos
            </SidebarLink>

            <SidebarLink href="/goals">
              Metas
            </SidebarLink>

            <SidebarLink href="/reports">
              Relatórios
            </SidebarLink>
          </nav>

          <div className="mt-10 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs text-zinc-500">
              Conta conectada
            </p>

            <p className="mt-1 truncate text-sm">
              {userEmail}
            </p>
          </div>
        </aside>

        <section className="flex-1">
          <header className="flex items-center justify-between border-b border-white/10 px-6 py-5 lg:px-8">
            <div>
              <p className="text-sm text-zinc-500">
                FinanceFlow
              </p>

              <h1 className="text-xl font-semibold">
                Transações
              </h1>
            </div>

            <button
              onClick={openCreateModal}
              className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-cyan-300"
            >
              + Nova transação
            </button>
          </header>

          <div className="p-6 lg:p-8">
            <div>
              <p className="text-zinc-400">
                Movimentações financeiras
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                Histórico de transações
              </h2>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <SummaryCard
                label="Receitas filtradas"
                value={money(filteredIncome)}
                valueClass="text-emerald-400"
              />

              <SummaryCard
                label="Despesas filtradas"
                value={money(filteredExpenses)}
                valueClass="text-rose-400"
              />

              <SummaryCard
                label="Resultado"
                value={money(
                  filteredIncome - filteredExpenses
                )}
                valueClass="text-cyan-400"
              />
            </div>

            <div className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:grid-cols-2 xl:grid-cols-4">
              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Pesquisar..."
                className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 outline-none focus:border-cyan-400"
              />

              <select
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(event.target.value)
                }
                className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 outline-none"
              >
                <option value="all">
                  Todos os tipos
                </option>
                <option value="income">
                  Receitas
                </option>
                <option value="expense">
                  Despesas
                </option>
              </select>

              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(event.target.value)
                }
                className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 outline-none"
              >
                <option value="all">
                  Todas as categorias
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>

              <input
                type="month"
                value={monthFilter}
                onChange={(event) =>
                  setMonthFilter(event.target.value)
                }
                className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 outline-none"
              />
            </div>

            <section className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="flex items-center justify-between border-b border-white/10 p-6">
                <div>
                  <h3 className="font-semibold">
                    Transações
                  </h3>

                  <p className="mt-1 text-sm text-zinc-500">
                    {filteredTransactions.length} registros
                  </p>
                </div>

                {(search ||
                  typeFilter !== "all" ||
                  categoryFilter !== "all" ||
                  monthFilter) && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setTypeFilter("all");
                      setCategoryFilter("all");
                      setMonthFilter("");
                    }}
                    className="text-sm text-cyan-400"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>

              {filteredTransactions.length === 0 ? (
                <div className="p-12 text-center text-zinc-500">
                  Nenhuma transação encontrada.
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {filteredTransactions.map(
                    (transaction) => {
                      const category = categories.find(
                        (item) =>
                          item.id ===
                          transaction.category_id
                      );

                      return (
                        <div
                          key={transaction.id}
                          className="flex flex-col gap-4 p-5 transition hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="font-medium">
                              {transaction.description}
                            </p>

                            <p className="mt-1 text-sm text-zinc-500">
                              {category?.name ??
                                "Sem categoria"}{" "}
                              ·{" "}
                              {formatDate(
                                transaction.transaction_date
                              )}
                            </p>
                          </div>

                          <div className="flex items-center justify-between gap-4 sm:justify-end">
                            <p
                              className={
                                transaction.type ===
                                "income"
                                  ? "font-semibold text-emerald-400"
                                  : "font-semibold text-rose-400"
                              }
                            >
                              {transaction.type ===
                              "income"
                                ? "+"
                                : "-"}{" "}
                              {money(
                                transaction.amount
                              )}
                            </p>

                            <button
                              onClick={() =>
                                openEditModal(
                                  transaction
                                )
                              }
                              className="rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5"
                            >
                              Editar
                            </button>

                            <button
                              onClick={() =>
                                deleteTransaction(
                                  transaction.id
                                )
                              }
                              className="rounded-lg px-3 py-2 text-sm text-rose-400 hover:bg-rose-400/10"
                            >
                              Excluir
                            </button>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </section>
          </div>
        </section>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  {editingId
                    ? "Editar transação"
                    : "Nova transação"}
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  {editingId
                    ? "Atualize os dados da movimentação."
                    : "Registre uma nova movimentação."}
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

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  changeType("expense")
                }
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
                onClick={() =>
                  changeType("income")
                }
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
              className="mt-4 w-full rounded-xl border border-white/10 bg-zinc-900 p-3 outline-none"
            >
              {availableCategories.map(
                (category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                )
              )}
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
              className="mt-4 w-full rounded-xl border border-white/10 bg-zinc-900 p-3 outline-none"
            />

            {message && (
              <p className="mt-4 text-sm text-rose-400">
                {message}
              </p>
            )}

            <button
              disabled={loading}
              type="submit"
              className="mt-6 w-full rounded-xl bg-cyan-400 p-3 font-semibold text-zinc-950 hover:bg-cyan-300 disabled:opacity-50"
            >
              {loading
                ? "Salvando..."
                : editingId
                  ? "Salvar alterações"
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}