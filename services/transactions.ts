import { supabase } from "@/lib/supabase/client";

export type Transaction = {
  id: string;
  type: "income" | "expense";
  description: string;
  amount: number;
  due_date: string;
  paid_date: string | null;
  status: "pending" | "paid" | "overdue" | "cancelled";
  payment_method:
    | "pix"
    | "money"
    | "debit"
    | "credit_card"
    | "bank_transfer"
    | "boleto"
    | "other";
  notes: string | null;
  created_at: string;
};

export async function getLatestTransactions(financialSpaceId: string) {
  const { data, error } = await supabase
    .from("transactions")
    .select(
      "id, type, description, amount, due_date, paid_date, status, payment_method, notes, created_at",
    )
    .eq("financial_space_id", financialSpaceId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    throw new Error(error.message);
  }

  return data as Transaction[];
}
