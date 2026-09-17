import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import CategoriesClient from "./categories-client";

export default async function CategoriesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name, type, created_at")
    .order("type")
    .order("name");

  const { data: transactions, error: transactionsError } = await supabase
    .from("transactions")
    .select("category_id");

  if (categoriesError) {
    console.error("Erro ao carregar categorias:", categoriesError);
  }

  if (transactionsError) {
    console.error("Erro ao carregar transações:", transactionsError);
  }

  const usage: Record<string, number> = {};

  (transactions ?? []).forEach((transaction) => {
    if (!transaction.category_id) return;

    usage[transaction.category_id] =
      (usage[transaction.category_id] ?? 0) + 1;
  });

  const categoriesWithUsage = (categories ?? []).map((category) => ({
    ...category,
    usage_count: usage[category.id] ?? 0,
  }));

  return (
    <CategoriesClient
      userEmail={user.email ?? ""}
      categories={categoriesWithUsage}
    />
  );
}