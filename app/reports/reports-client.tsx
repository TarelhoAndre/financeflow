"use client";

import LogoutButton from "@/components/logout-button";
import Link from "next/link";
import {
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

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
};

type Props = {
  userEmail: string;
  categories: Category[];
  transactions: Transaction[];
};

export default function ReportsClient({
  userEmail = "",
  categories = [],
  transactions = [],
}: Props) {
  const [selectedMonth, setSelectedMonth] =
    useState("");

  useEffect(() => {
    const now = new Date();

    const month = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;

    setSelectedMonth(month);
  }, []);

  const filteredTransactions = useMemo(() => {
    if (!selectedMonth) return [];

    return transactions.filter((transaction) =>
      transaction.transaction_date?.startsWith(
        selectedMonth
      )
    );
  }, [transactions, selectedMonth]);

  const totalIncome = useMemo(
    () =>
      filteredTransactions
        .filter(
          (transaction) =>
            transaction.type === "income"
        )
        .reduce(
          (total, transaction) =>
            total + transaction.amount,
          0
        ),
    [filteredTransactions]
  );

  const totalExpense = useMemo(
    () =>
      filteredTransactions
        .filter(
          (transaction) =>
            transaction.type === "expense"
        )
        .reduce(
          (total, transaction) =>
            total + transaction.amount,
          0
        ),
    [filteredTransactions]
  );

  const balance = totalIncome - totalExpense;

  const savingsRate =
    totalIncome > 0
      ? ((totalIncome - totalExpense) /
          totalIncome) *
        100
      : 0;

  const categoryExpenses = useMemo(() => {
    const totals: Record<string, number> = {};

    filteredTransactions
      .filter(
        (transaction) =>
          transaction.type === "expense"
      )
      .forEach((transaction) => {
        const category =
          categories.find(
            (item) =>
              item.id === transaction.category_id
          )?.name ?? "Sem categoria";

        totals[category] =
          (totals[category] ?? 0) +
          transaction.amount;
      });

    return Object.entries(totals)
      .map(([name, amount]) => ({
        name,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions, categories]);

  const dailyMovement = useMemo(() => {
    const days: Record<
      string,
      {
        income: number;
        expense: number;
      }
    > = {};

    filteredTransactions.forEach(
      (transaction) => {
        const day = transaction.transaction_date;

        if (!days[day]) {
          days[day] = {
            income: 0,
            expense: 0,
          };
        }

        if (transaction.type === "income") {
          days[day].income += transaction.amount;
        } else {
          days[day].expense += transaction.amount;
        }
      }
    );

    return Object.entries(days)
      .map(([date, values]) => ({
        date,
        ...values,
      }))
      .sort((a, b) =>
        a.date.localeCompare(b.date)
      );
  }, [filteredTransactions]);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();

    transactions.forEach((transaction) => {
      if (transaction.transaction_date) {
        months.add(
          transaction.transaction_date.slice(0, 7)
        );
      }
    });

    if (selectedMonth) {
      months.add(selectedMonth);
    }

    return Array.from(months).sort().reverse();
  }, [transactions, selectedMonth]);

  const maxCategoryExpense =
    categoryExpenses.length > 0
      ? Math.max(
          ...categoryExpenses.map(
            (category) => category.amount
          )
        )
      : 0;

  const maxDailyValue =
    dailyMovement.length > 0
      ? Math.max(
          ...dailyMovement.flatMap((day) => [
            day.income,
            day.expense,
          ]),
          1
        )
      : 1;

  function exportCsv() {
    if (filteredTransactions.length === 0) {
      alert(
        "Não existem transações neste mês para exportar."
      );
      return;
    }

    const header = [
      "Data",
      "Descrição",
      "Tipo",
      "Categoria",
      "Valor",
    ];

    const rows = filteredTransactions.map(
      (transaction) => {
        const category =
          categories.find(
            (item) =>
              item.id === transaction.category_id
          )?.name ?? "Sem categoria";

        return [
          transaction.transaction_date,
          transaction.description,
          transaction.type === "income"
            ? "Receita"
            : "Despesa",
          category,
          transaction.amount
            .toFixed(2)
            .replace(".", ","),
        ];
      }
    );

    const csv = [
      header.join(";"),
      ...rows.map((row) =>
        row
          .map(
            (value) =>
              `"${String(value).replace(
                /"/g,
                '""'
              )}"`
          )
          .join(";")
      ),
    ].join("\n");

    const blob = new Blob(
      ["\uFEFF" + csv],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url = URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download = `financeflow-${selectedMonth}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="flex min-h-screen">
        <section className="min-w-0 flex-1">
          <header className="flex flex-col gap-4 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <div>
              <p className="text-sm text-zinc-500">
                FinanceFlow
              </p>

              <h1 className="text-xl font-semibold">
                Relatórios
              </h1>
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={selectedMonth}
                onChange={(event) =>
                  setSelectedMonth(
                    event.target.value
                  )
                }
                className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm outline-none focus:border-cyan-400"
              >
                {availableMonths.map((month) => (
                  <option
                    key={month}
                    value={month}
                  >
                    {monthLabel(month)}
                  </option>
                ))}
              </select>

              <button
                onClick={exportCsv}
                className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-300"
              >
                Exportar CSV
              </button>
            </div>
          </header>

          <div className="p-6 lg:p-8">
            <div>
              <p className="text-zinc-400">
                Visão financeira
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                Relatório mensal
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Analise receitas, despesas e
                comportamento dos seus gastos.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                label="Receitas"
                value={money(totalIncome)}
                valueClass="text-emerald-400"
              />

              <SummaryCard
                label="Despesas"
                value={money(totalExpense)}
                valueClass="text-rose-400"
              />

              <SummaryCard
                label="Resultado"
                value={money(balance)}
                valueClass={
                  balance >= 0
                    ? "text-cyan-400"
                    : "text-rose-400"
                }
              />

              <SummaryCard
                label="Taxa de economia"
                value={`${savingsRate.toFixed(1)}%`}
                valueClass={
                  savingsRate >= 0
                    ? "text-emerald-400"
                    : "text-rose-400"
                }
              />
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div>
                  <h3 className="font-semibold">
                    Gastos por categoria
                  </h3>

                  <p className="mt-1 text-sm text-zinc-500">
                    Distribuição das despesas no mês.
                  </p>
                </div>

                {categoryExpenses.length === 0 ? (
                  <p className="mt-10 text-center text-sm text-zinc-500">
                    Nenhuma despesa encontrada.
                  </p>
                ) : (
                  <div className="mt-8 space-y-6">
                    {categoryExpenses.map(
                      (category) => {
                        const percentage =
                          maxCategoryExpense > 0
                            ? (category.amount /
                                maxCategoryExpense) *
                              100
                            : 0;

                        return (
                          <div key={category.name}>
                            <div className="mb-2 flex items-center justify-between gap-4">
                              <span className="text-sm text-zinc-300">
                                {category.name}
                              </span>

                              <span className="text-sm font-medium">
                                {money(
                                  category.amount
                                )}
                              </span>
                            </div>

                            <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
                              <div
                                className="h-full rounded-full bg-cyan-400 transition-all"
                                style={{
                                  width: `${percentage}%`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div>
                  <h3 className="font-semibold">
                    Movimentação diária
                  </h3>

                  <p className="mt-1 text-sm text-zinc-500">
                    Receitas e despesas por dia.
                  </p>
                </div>

                {dailyMovement.length === 0 ? (
                  <p className="mt-10 text-center text-sm text-zinc-500">
                    Nenhuma movimentação encontrada.
                  </p>
                ) : (
                  <div className="mt-8 space-y-5">
                    {dailyMovement.map((day) => (
                      <div key={day.date}>
                        <p className="mb-2 text-xs text-zinc-500">
                          {formatDay(day.date)}
                        </p>

                        <div className="space-y-2">
                          <MovementBar
                            label="Receitas"
                            value={day.income}
                            max={maxDailyValue}
                            kind="income"
                          />

                          <MovementBar
                            label="Despesas"
                            value={day.expense}
                            max={maxDailyValue}
                            kind="expense"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <section className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="border-b border-white/10 p-6">
                <h3 className="font-semibold">
                  Movimentações do período
                </h3>

                <p className="mt-1 text-sm text-zinc-500">
                  {filteredTransactions.length}{" "}
                  transação(ões)
                </p>
              </div>

              {filteredTransactions.length === 0 ? (
                <div className="p-10 text-center text-sm text-zinc-500">
                  Nenhuma transação neste mês.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left">
                    <thead className="border-b border-white/10 text-xs uppercase text-zinc-500">
                      <tr>
                        <th className="px-6 py-4">
                          Data
                        </th>
                        <th className="px-6 py-4">
                          Descrição
                        </th>
                        <th className="px-6 py-4">
                          Categoria
                        </th>
                        <th className="px-6 py-4">
                          Tipo
                        </th>
                        <th className="px-6 py-4 text-right">
                          Valor
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {[...filteredTransactions]
                        .reverse()
                        .map((transaction) => {
                          const category =
                            categories.find(
                              (item) =>
                                item.id ===
                                transaction.category_id
                            )?.name ??
                            "Sem categoria";

                          return (
                            <tr
                              key={transaction.id}
                              className="border-b border-white/5 last:border-0"
                            >
                              <td className="px-6 py-4 text-sm text-zinc-400">
                                {formatDay(
                                  transaction.transaction_date
                                )}
                              </td>

                              <td className="px-6 py-4 text-sm">
                                {
                                  transaction.description
                                }
                              </td>

                              <td className="px-6 py-4 text-sm text-zinc-400">
                                {category}
                              </td>

                              <td className="px-6 py-4">
                                <span
                                  className={`rounded-full px-2 py-1 text-xs ${
                                    transaction.type ===
                                    "income"
                                      ? "bg-emerald-400/10 text-emerald-400"
                                      : "bg-rose-400/10 text-rose-400"
                                  }`}
                                >
                                  {transaction.type ===
                                  "income"
                                    ? "Receita"
                                    : "Despesa"}
                                </span>
                              </td>

                              <td
                                className={`px-6 py-4 text-right text-sm font-medium ${
                                  transaction.type ===
                                  "income"
                                    ? "text-emerald-400"
                                    : "text-rose-400"
                                }`}
                              >
                                {transaction.type ===
                                "income"
                                  ? "+"
                                  : "-"}
                                {money(
                                  transaction.amount
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function MovementBar({
  label,
  value,
  max,
  kind,
}: {
  label: string;
  value: number;
  max: number;
  kind: "income" | "expense";
}) {
  const width =
    max > 0 ? (value / max) * 100 : 0;

  return (
    <div className="grid grid-cols-[70px_1fr_100px] items-center gap-3">
      <span className="text-xs text-zinc-500">
        {label}
      </span>

      <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full ${
            kind === "income"
              ? "bg-emerald-400"
              : "bg-rose-400"
          }`}
          style={{
            width: `${width}%`,
          }}
        />
      </div>

      <span className="text-right text-xs text-zinc-400">
        {money(value)}
      </span>
    </div>
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

function formatDay(value: string) {
  const [, month, day] = value.split("-");

  return `${day}/${month}`;
}

function monthLabel(value: string) {
  const [year, month] = value.split("-");

  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  return `${
    months[Number(month) - 1] ?? month
  } de ${year}`;
}