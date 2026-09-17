import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [
    { data: categories, error: categoriesError },
    { data: transactions, error: transactionsError },
  ] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, type")
      .order("name"),

    supabase
      .from("transactions")
      .select(
        `
        id,
        description,
        amount,
        type,
        category_id,
        transaction_date,
        created_at
      `
      )
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  if (categoriesError) {
    console.error(categoriesError);
  }

  if (transactionsError) {
    console.error(transactionsError);
  }

  const normalizedTransactions = (transactions ?? []).map(
    (transaction) => ({
      ...transaction,
      amount: Number(transaction.amount),
    })
  );

  return (
    <DashboardClient
      userEmail={user.email ?? ""}
      categories={categories ?? []}
      transactions={normalizedTransactions}
    />
  );
}