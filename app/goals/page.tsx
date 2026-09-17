import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import GoalsClient from "./goals-client";

export default async function GoalsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: goals, error } = await supabase
    .from("goals")
    .select(`
      id,
      name,
      target_amount,
      current_amount,
      target_date,
      created_at
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao carregar metas:", error);
  }

  const normalizedGoals = (goals ?? []).map((goal) => ({
    ...goal,
    target_amount: Number(goal.target_amount),
    current_amount: Number(goal.current_amount),
  }));

  return (
    <GoalsClient
      userEmail={user.email ?? ""}
      goals={normalizedGoals}
    />
  );
}