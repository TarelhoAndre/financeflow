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
import LogoutButton from "@/components/logout-button";

type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
  created_at: string;
  usage_count: number;
};

type Props = {
  userEmail: string;
  categories: Category[];
};

export default function CategoriesClient({
  userEmail,
  categories,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [name, setName] = useState("");
  const [type, setType] =
    useState<"income" | "expense">("expense");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const filteredCategories = useMemo(() => {
    return categories.filter((category) =>
      category.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [categories, search]);

  const incomeCategories = categories.filter(
    (category) => category.type === "income"
  );

  const expenseCategories = categories.filter(
    (category) => category.type === "expense"
  );

  function openCreateModal() {
    setEditingCategory(null);
    setName("");
    setType("expense");
    setMessage("");
    setModalOpen(true);
  }

  function openEditModal(category: Category) {
    setEditingCategory(category);
    setName(category.name);
    setType(category.type);
    setMessage("");
    setModalOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setMessage("");

    if (!name.trim()) {
      setMessage("Informe um nome para a categoria.");
      return;
    }

    setLoading(true);

    if (editingCategory) {
      const { error } = await supabase
        .from("categories")
        .update({
          name: name.trim(),
        })
        .eq("id", editingCategory.id);

      if (error) {
        console.error(error);

        if (error.code === "23505") {
          setMessage("Já existe uma categoria com esse nome e tipo.");
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
        .from("categories")
        .insert({
          user_id: user.id,
          name: name.trim(),
          type,
        });

      if (error) {
        console.error(error);

        if (error.code === "23505") {
          setMessage("Essa categoria já existe.");
        } else {
          setMessage(error.message);
        }

        setLoading(false);
        return;
      }
    }

    setLoading(false);
    setModalOpen(false);
    router.refresh();
  }

  async function deleteCategory(category: Category) {
    const warning =
      category.usage_count > 0
        ? `Esta categoria está sendo usada por ${category.usage_count} transação(ões). Elas ficarão sem categoria. Deseja continuar?`
        : `Deseja excluir a categoria "${category.name}"?`;

    const confirmed = window.confirm(warning);

    if (!confirmed) return;

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", category.id);

    if (error) {
      console.error(error);
      alert("Não foi possível excluir a categoria.");
      return;
    }

    router.refresh();
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="flex min-h-screen">
        <section className="flex-1">
          <header className="flex items-center justify-between border-b border-white/10 px-6 py-5 lg:px-8">
            <div>
              <p className="text-sm text-zinc-500">
                FinanceFlow
              </p>

              <h1 className="text-xl font-semibold">
                Categorias
              </h1>
            </div>

            <button
              onClick={openCreateModal}
              className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-300"
            >
              + Nova categoria
            </button>
          </header>

          <div className="p-6 lg:p-8">
            <div>
              <p className="text-zinc-400">
                Organização financeira
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                Suas categorias
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Organize suas receitas e despesas da maneira que preferir.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <SummaryCard
                label="Total"
                value={String(categories.length)}
              />

              <SummaryCard
                label="Receitas"
                value={String(incomeCategories.length)}
                valueClass="text-emerald-400"
              />

              <SummaryCard
                label="Despesas"
                value={String(expenseCategories.length)}
                valueClass="text-rose-400"
              />
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Pesquisar categoria..."
                className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 outline-none transition focus:border-cyan-400 md:max-w-md"
              />
            </div>

            <section className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="flex items-center justify-between border-b border-white/10 p-6">
                <div>
                  <h3 className="font-semibold">
                    Categorias cadastradas
                  </h3>

                  <p className="mt-1 text-sm text-zinc-500">
                    {filteredCategories.length} resultados
                  </p>
                </div>
              </div>

              {filteredCategories.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-zinc-500">
                    Nenhuma categoria encontrada.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {filteredCategories.map(
                    (category) => (
                      <div
                        key={category.id}
                        className="flex flex-col gap-4 p-5 transition hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                              category.type ===
                              "income"
                                ? "bg-emerald-400/10 text-emerald-400"
                                : "bg-rose-400/10 text-rose-400"
                            }`}
                          >
                            {category.type ===
                            "income"
                              ? "↑"
                              : "↓"}
                          </div>

                          <div>
                            <p className="font-medium">
                              {category.name}
                            </p>

                            <p className="mt-1 text-sm text-zinc-500">
                              {category.type ===
                              "income"
                                ? "Receita"
                                : "Despesa"}{" "}
                              ·{" "}
                              {
                                category.usage_count
                              }{" "}
                              transação(ões)
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              openEditModal(
                                category
                              )
                            }
                            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/5"
                          >
                            Editar
                          </button>

                          <button
                            onClick={() =>
                              deleteCategory(
                                category
                              )
                            }
                            className="rounded-lg px-4 py-2 text-sm text-rose-400 transition hover:bg-rose-400/10"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    )
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
                  {editingCategory
                    ? "Editar categoria"
                    : "Nova categoria"}
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  {editingCategory
                    ? "Altere o nome da categoria."
                    : "Crie uma categoria personalizada."}
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

            {!editingCategory && (
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setType("expense")
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
                    setType("income")
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
            )}

            {editingCategory && (
              <div className="mt-6 rounded-xl border border-white/10 bg-zinc-900 p-4">
                <p className="text-xs text-zinc-500">
                  Tipo
                </p>

                <p
                  className={
                    editingCategory.type ===
                    "income"
                      ? "mt-1 text-emerald-400"
                      : "mt-1 text-rose-400"
                  }
                >
                  {editingCategory.type ===
                  "income"
                    ? "Receita"
                    : "Despesa"}
                </p>
              </div>
            )}

            <input
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Ex: Educação"
              className="mt-4 w-full rounded-xl border border-white/10 bg-zinc-900 p-3 outline-none focus:border-cyan-400"
            />

            {message && (
              <p className="mt-4 text-sm text-rose-400">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-cyan-400 p-3 font-semibold text-zinc-950 transition hover:bg-cyan-300 disabled:opacity-50"
            >
              {loading
                ? "Salvando..."
                : editingCategory
                  ? "Salvar alterações"
                  : "Criar categoria"}
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