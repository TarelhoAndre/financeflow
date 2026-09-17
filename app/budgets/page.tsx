import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import BudgetsClient from "./budgets-client";

export default async function BudgetsPage() {
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
    .eq("type", "expense")
    .order("name");

  const { data: budgets, error: budgetsError } = await supabase
    .from("budgets")
    .select(`
      id,
      category_id,
      amount,
      month,
      created_at
    `)
    .order("month", { ascending: false });

  const { data: transactions, error: transactionsError } = await supabase
    .from("transactions")
    .select(`
      id,
      category_id,
      amount,
      type,
      transaction_date
    `)
    .eq("type", "expense");

  if (categoriesError) {
    console.error("Erro ao carregar categorias:", categoriesError);
  }

  if (budgetsError) {
    console.error("Erro ao carregar orçamentos:", budgetsError);
  }

  if (transactionsError) {
    console.error("Erro ao carregar transações:", transactionsError);
  }

  const normalizedBudgets = (budgets ?? []).map((budget) => ({
    ...budget,
    amount: Number(budget.amount),
  }));

  const normalizedTransactions = (transactions ?? []).map(
    (transaction) => ({
      ...transaction,
      amount: Number(transaction.amount),
    })
  );

  return (
    <BudgetsClient
      userEmail={user.email ?? ""}
      categories={categories ?? []}
      budgets={normalizedBudgets}
      transactions={normalizedTransactions}
    />
  );
}