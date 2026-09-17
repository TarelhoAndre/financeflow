import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import TransactionsClient from "./transactions-client";

export default async function TransactionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name, type")
    .order("name");

  const { data: transactions, error: transactionsError } = await supabase
    .from("transactions")
    .select(`
      id,
      description,
      amount,
      type,
      category_id,
      transaction_date,
      created_at
    `)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (categoriesError) {
    console.error("Erro ao carregar categorias:", categoriesError);
  }

  if (transactionsError) {
    console.error("Erro ao carregar transações:", transactionsError);
  }

  const normalizedTransactions = (transactions ?? []).map((transaction) => ({
    ...transaction,
    amount: Number(transaction.amount),
  }));

  return (
    <TransactionsClient
      userEmail={user.email ?? ""}
      categories={categories ?? []}
      transactions={normalizedTransactions}
    />
  );
}