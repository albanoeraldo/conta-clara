import { supabase } from "@/lib/supabase/client";

export type MonthlyClosing = {
  id: string;
  financial_space_id: string;
  reference_month: string;
  total_income: number;
  total_expenses: number;
  final_balance: number;
  biggest_category_name: string | null;
  biggest_category_total: number | null;
  biggest_expense_description: string | null;
  biggest_expense_amount: number | null;
  closed_at: string;
  created_at: string;
  updated_at: string;
};

export type CloseMonthlyClosingInput = {
  financialSpaceId: string;
  referenceMonth: string;
  totalIncome: number;
  totalExpenses: number;
  finalBalance: number;
  biggestCategoryName?: string | null;
  biggestCategoryTotal?: number | null;
  biggestExpenseDescription?: string | null;
  biggestExpenseAmount?: number | null;
};

export async function getMonthlyClosing(
  financialSpaceId: string,
  referenceMonth: string,
) {
  const { data, error } = await supabase
    .from("monthly_closings")
    .select("*")
    .eq("financial_space_id", financialSpaceId)
    .eq("reference_month", referenceMonth)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as MonthlyClosing | null;
}

export async function closeMonthlyClosing(input: CloseMonthlyClosingInput) {
  const { data, error } = await supabase
    .from("monthly_closings")
    .upsert(
      {
        financial_space_id: input.financialSpaceId,
        reference_month: input.referenceMonth,
        total_income: input.totalIncome,
        total_expenses: input.totalExpenses,
        final_balance: input.finalBalance,
        biggest_category_name: input.biggestCategoryName ?? null,
        biggest_category_total: input.biggestCategoryTotal ?? null,
        biggest_expense_description: input.biggestExpenseDescription ?? null,
        biggest_expense_amount: input.biggestExpenseAmount ?? null,
        closed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "financial_space_id,reference_month",
      },
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as MonthlyClosing;
}

export async function reopenMonthlyClosing(
  financialSpaceId: string,
  referenceMonth: string,
) {
  const { error } = await supabase
    .from("monthly_closings")
    .delete()
    .eq("financial_space_id", financialSpaceId)
    .eq("reference_month", referenceMonth);

  if (error) {
    throw new Error(error.message);
  }
}

export async function isReferenceMonthClosed(
  financialSpaceId: string,
  referenceMonth: string,
) {
  const monthlyClosing = await getMonthlyClosing(
    financialSpaceId,
    referenceMonth,
  );

  return Boolean(monthlyClosing);
}
