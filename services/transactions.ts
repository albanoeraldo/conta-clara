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

function formatDateToDatabase(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getCurrentMonthDateRange() {
  const today = new Date();

  const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  return {
    startDate: formatDateToDatabase(startDate),
    endDate: formatDateToDatabase(endDate),
  };
}

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

export async function getCurrentMonthTransactions(financialSpaceId: string) {
  const { startDate, endDate } = getCurrentMonthDateRange();

  const { data, error } = await supabase
    .from("transactions")
    .select(
      "id, type, description, amount, due_date, paid_date, status, payment_method, notes, created_at",
    )
    .eq("financial_space_id", financialSpaceId)
    .gte("due_date", startDate)
    .lte("due_date", endDate)
    .order("due_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data as Transaction[];
}
