"use client";

import Link from "next/link";
import {
  FormEvent,
  ReactNode,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

type Goal = {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  created_at: string;
};

type Props = {
  userEmail: string;
  goals: Goal[];
};

export default function GoalsClient({
  userEmail,
  goals = [],
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [contributionOpen, setContributionOpen] =
    useState(false);

  const [editingGoal, setEditingGoal] =
    useState<Goal | null>(null);

  const [selectedGoal, setSelectedGoal] =
    useState<Goal | null>(null);

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const [contribution, setContribution] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const totalTarget = useMemo(
    () =>
      goals.reduce(
        (total, goal) => total + goal.target_amount,
        0
      ),
    [goals]
  );

  const totalSaved = useMemo(
    () =>
      goals.reduce(
        (total, goal) => total + goal.current_amount,
        0
      ),
    [goals]
  );

  function parseAmount(value: string) {
    const normalized = value.includes(",")
      ? value.replace(/\./g, "").replace(",", ".")
      : value;

    return Number(normalized);
  }

  function openCreateModal() {
    setEditingGoal(null);
    setName("");
    setTargetAmount("");
    setCurrentAmount("");
    setTargetDate("");
    setMessage("");
    setModalOpen(true);
  }

  function openEditModal(goal: Goal) {
    setEditingGoal(goal);
    setName(goal.name);
    setTargetAmount(String(goal.target_amount));
    setCurrentAmount(String(goal.current_amount));
    setTargetDate(goal.target_date ?? "");
    setMessage("");
    setModalOpen(true);
  }

  function openContributionModal(goal: Goal) {
    setSelectedGoal(goal);
    setContribution("");
    setMessage("");
    setContributionOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setMessage("");

    const parsedTarget = parseAmount(targetAmount);
    const parsedCurrent = currentAmount
      ? parseAmount(currentAmount)
      : 0;

    if (!name.trim()) {
      setMessage("Informe o nome da meta.");
      return;
    }

    if (!parsedTarget || parsedTarget <= 0) {
      setMessage("Informe um valor objetivo válido.");
      return;
    }

    if (parsedCurrent < 0) {
      setMessage("O valor atual não pode ser negativo.");
      return;
    }

    setLoading(true);

    if (editingGoal) {
      const { error } = await supabase
        .from("goals")
        .update({
          name: name.trim(),
          target_amount: parsedTarget,
          current_amount: parsedCurrent,
          target_date: targetDate || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingGoal.id);

      if (error) {
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
        .from("goals")
        .insert({
          user_id: user.id,
          name: name.trim(),
          target_amount: parsedTarget,
          current_amount: parsedCurrent,
          target_date: targetDate || null,
        });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    setModalOpen(false);
    router.refresh();
  }

  async function addContribution(event: FormEvent) {
    event.preventDefault();

    if (!selectedGoal) return;

    const parsedContribution =
      parseAmount(contribution);

    if (
      !parsedContribution ||
      parsedContribution <= 0
    ) {
      setMessage("Informe um valor válido.");
      return;
    }

    setLoading(true);

    const newAmount =
      selectedGoal.current_amount +
      parsedContribution;

    const { error } = await supabase
      .from("goals")
      .update({
        current_amount: newAmount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", selectedGoal.id);

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setContributionOpen(false);
    router.refresh();
  }

  async function deleteGoal(goal: Goal) {
    const confirmed = window.confirm(
      `Deseja excluir a meta "${goal.name}"?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("goals")
      .delete()
      .eq("id", goal.id);

    if (error) {
      alert("Não foi possível excluir a meta.");
      return;
    }

    router.refresh();
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 border-r border-white/10 p-6 lg:block">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400 font-bold text-zinc-950">
              F
            </div>

            <span className="text-xl font-semibold">
              Finance
              <span className="text-cyan-400">
                Flow
              </span>
            </span>
          </Link>

          <nav className="mt-10 space-y-2">
            <SidebarLink href="/dashboard">
              Dashboard
            </SidebarLink>

            <SidebarLink href="/transactions">
              Transações
            </SidebarLink>

            <SidebarLink href="/categories">
              Categorias
            </SidebarLink>

            <SidebarLink href="/budgets">
              Orçamentos
            </SidebarLink>

            <SidebarLink
              href="/goals"
              active
            >
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
                Metas
              </h1>
            </div>

            <button
              onClick={openCreateModal}
              className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-cyan-300"
            >
              + Nova meta
            </button>
          </header>

          <div className="p-6 lg:p-8">
            <div>
              <p className="text-zinc-400">
                Planejamento financeiro
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                Metas financeiras
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Acompanhe seus objetivos e registre
                seu progresso.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <SummaryCard
                label="Metas"
                value={String(goals.length)}
              />

              <SummaryCard
                label="Total objetivo"
                value={money(totalTarget)}
              />

              <SummaryCard
                label="Total acumulado"
                value={money(totalSaved)}
                valueClass="text-emerald-400"
              />
            </div>

            {goals.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
                <p className="text-zinc-400">
                  Você ainda não criou nenhuma meta.
                </p>

                <button
                  onClick={openCreateModal}
                  className="mt-4 text-cyan-400"
                >
                  Criar primeira meta
                </button>
              </div>
            ) : (
              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                {goals.map((goal) => {
                  const percentage =
                    goal.target_amount > 0
                      ? Math.round(
                          (goal.current_amount /
                            goal.target_amount) *
                            100
                        )
                      : 0;

                  const remaining = Math.max(
                    goal.target_amount -
                      goal.current_amount,
                    0
                  );

                  return (
                    <article
                      key={goal.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {goal.name}
                          </h3>

                          {goal.target_date && (
                            <p className="mt-1 text-sm text-zinc-500">
                              Prazo:{" "}
                              {formatDate(
                                goal.target_date
                              )}
                            </p>
                          )}
                        </div>

                        <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-sm text-cyan-400">
                          {percentage}%
                        </span>
                      </div>

                      <div className="mt-6">
                        <p className="text-2xl font-bold">
                          {money(goal.current_amount)}
                        </p>

                        <p className="mt-1 text-sm text-zinc-500">
                          de{" "}
                          {money(goal.target_amount)}
                        </p>

                        <div className="mt-4 h-3 overflow-hidden rounded-full bg-zinc-800">
                          <div
                            className="h-full rounded-full bg-cyan-400"
                            style={{
                              width: `${Math.min(
                                percentage,
                                100
                              )}%`,
                            }}
                          />
                        </div>

                        <p className="mt-3 text-sm text-zinc-500">
                          {remaining > 0
                            ? `${money(
                                remaining
                              )} restantes`
                            : "Meta alcançada 🎉"}
                        </p>
                      </div>

                      <div className="mt-6 flex flex-wrap gap-2">
                        <button
                          onClick={() =>
                            openContributionModal(
                              goal
                            )
                          }
                          className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-cyan-300"
                        >
                          Adicionar valor
                        </button>

                        <button
                          onClick={() =>
                            openEditModal(goal)
                          }
                          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5"
                        >
                          Editar
                        </button>

                        <button
                          onClick={() =>
                            deleteGoal(goal)
                          }
                          className="rounded-lg px-4 py-2 text-sm text-rose-400 hover:bg-rose-400/10"
                        >
                          Excluir
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-950 p-6"
          >
            <h2 className="text-xl font-semibold">
              {editingGoal
                ? "Editar meta"
                : "Nova meta"}
            </h2>

            <input
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Ex: Notebook novo"
              className="mt-6 w-full rounded-xl border border-white/10 bg-zinc-900 p-3 outline-none"
            />

            <input
              value={targetAmount}
              onChange={(event) =>
                setTargetAmount(
                  event.target.value
                )
              }
              placeholder="Valor objetivo"
              className="mt-4 w-full rounded-xl border border-white/10 bg-zinc-900 p-3 outline-none"
            />

            <input
              value={currentAmount}
              onChange={(event) =>
                setCurrentAmount(
                  event.target.value
                )
              }
              placeholder="Valor atual"
              className="mt-4 w-full rounded-xl border border-white/10 bg-zinc-900 p-3 outline-none"
            />

            <input
              type="date"
              value={targetDate}
              onChange={(event) =>
                setTargetDate(
                  event.target.value
                )
              }
              className="mt-4 w-full rounded-xl border border-white/10 bg-zinc-900 p-3 outline-none"
            />

            {message && (
              <p className="mt-4 text-sm text-rose-400">
                {message}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() =>
                  setModalOpen(false)
                }
                className="flex-1 rounded-xl border border-white/10 p-3"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-cyan-400 p-3 font-semibold text-zinc-950"
              >
                {loading
                  ? "Salvando..."
                  : "Salvar"}
              </button>
            </div>
          </form>
        </div>
      )}

      {contributionOpen && selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={addContribution}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6"
          >
            <h2 className="text-xl font-semibold">
              Adicionar valor
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              {selectedGoal.name}
            </p>

            <input
              value={contribution}
              onChange={(event) =>
                setContribution(
                  event.target.value
                )
              }
              placeholder="Ex: 500"
              className="mt-6 w-full rounded-xl border border-white/10 bg-zinc-900 p-3 outline-none"
            />

            {message && (
              <p className="mt-4 text-sm text-rose-400">
                {message}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() =>
                  setContributionOpen(false)
                }
                className="flex-1 rounded-xl border border-white/10 p-3"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-cyan-400 p-3 font-semibold text-zinc-950"
              >
                Adicionar
              </button>
            </div>
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}