import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import ReportsClient from "./reports-client";

export default async function ReportsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: categories, error: categoriesError } =
    await supabase
      .from("categories")
      .select("id, name, type")
      .order("name");

  const { data: transactions, error: transactionsError } =
    await supabase
      .from("transactions")
      .select(`
        id,
        description,
        amount,
        type,
        category_id,
        transaction_date
      `)
      .order("transaction_date", {
        ascending: true,
      });

  if (categoriesError) {
    console.error(
      "Erro ao carregar categorias:",
      categoriesError
    );
  }

  if (transactionsError) {
    console.error(
      "Erro ao carregar transações:",
      transactionsError
    );
  }

  const normalizedTransactions = (
    transactions ?? []
  ).map((transaction) => ({
    ...transaction,
    amount: Number(transaction.amount),
  }));

  return (
    <ReportsClient
      userEmail={user.email ?? ""}
      categories={categories ?? []}
      transactions={normalizedTransactions}
    />
  );
}