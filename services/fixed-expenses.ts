import { supabase } from "@/lib/supabase/client";

export type FixedExpensePaymentMethod =
  | "pix"
  | "money"
  | "debit"
  | "credit_card"
  | "bank_transfer"
  | "boleto"
  | "other";

export type FixedExpense = {
  id: string;
  financial_space_id: string;
  category_id: string | null;
  description: string;
  amount: number;
  due_day: number;
  payment_method: FixedExpensePaymentMethod;
  active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateFixedExpenseData = {
  financialSpaceId: string;
  categoryId?: string | null;
  description: string;
  amount: number;
  dueDay: number;
  paymentMethod: FixedExpensePaymentMethod;
  notes?: string | null;
};

export type UpdateFixedExpenseData = {
  fixedExpenseId: string;
  financialSpaceId: string;
  categoryId?: string | null;
  description: string;
  amount: number;
  dueDay: number;
  paymentMethod: FixedExpensePaymentMethod;
  notes?: string | null;
};

export type DeleteFixedExpenseData = {
  fixedExpenseId: string;
  financialSpaceId: string;
};

export type UpdateFixedExpenseActiveStatusData = {
  fixedExpenseId: string;
  financialSpaceId: string;
  active: boolean;
};

export type GenerateMonthlyTransactionsData = {
  financialSpaceId: string;
  referenceMonth: string;
};

function getReferenceMonthDate(referenceMonth: string) {
  return `${referenceMonth}-01`;
}

function getDueDateFromMonth(referenceMonth: string, dueDay: number) {
  const [yearValue, monthValue] = referenceMonth.split("-");
  const year = Number(yearValue);
  const month = Number(monthValue);

  const lastDayOfMonth = new Date(year, month, 0).getDate();
  const safeDay = Math.min(dueDay, lastDayOfMonth);

  return `${referenceMonth}-${String(safeDay).padStart(2, "0")}`;
}

export async function getFixedExpenses(financialSpaceId: string) {
  const { data, error } = await supabase
    .from("fixed_expenses")
    .select("*")
    .eq("financial_space_id", financialSpaceId)
    .order("active", { ascending: false })
    .order("due_day", { ascending: true })
    .order("description", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as FixedExpense[];
}

export async function getActiveFixedExpenses(financialSpaceId: string) {
  const { data, error } = await supabase
    .from("fixed_expenses")
    .select("*")
    .eq("financial_space_id", financialSpaceId)
    .eq("active", true)
    .order("due_day", { ascending: true })
    .order("description", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as FixedExpense[];
}

export async function createFixedExpense({
  financialSpaceId,
  categoryId,
  description,
  amount,
  dueDay,
  paymentMethod,
  notes,
}: CreateFixedExpenseData) {
  const normalizedDescription = description.trim();

  const { data: existingFixedExpense, error: existingFixedExpenseError } =
    await supabase
      .from("fixed_expenses")
      .select("id")
      .eq("financial_space_id", financialSpaceId)
      .ilike("description", normalizedDescription)
      .eq("due_day", dueDay)
      .maybeSingle();

  if (existingFixedExpenseError) {
    throw new Error(existingFixedExpenseError.message);
  }

  if (existingFixedExpense) {
    throw new Error(
      "Já existe uma conta fixa com essa descrição e esse dia de vencimento.",
    );
  }

  const { data, error } = await supabase
    .from("fixed_expenses")
    .insert({
      financial_space_id: financialSpaceId,
      category_id: categoryId || null,
      description: normalizedDescription,
      amount,
      due_day: dueDay,
      payment_method: paymentMethod,
      notes: notes || null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as FixedExpense;
}

export async function updateFixedExpense({
  fixedExpenseId,
  financialSpaceId,
  categoryId,
  description,
  amount,
  dueDay,
  paymentMethod,
  notes,
}: UpdateFixedExpenseData) {
  const normalizedDescription = description.trim();

  const { data: existingFixedExpense, error: existingFixedExpenseError } =
    await supabase
      .from("fixed_expenses")
      .select("id")
      .eq("financial_space_id", financialSpaceId)
      .ilike("description", normalizedDescription)
      .eq("due_day", dueDay)
      .neq("id", fixedExpenseId)
      .maybeSingle();

  if (existingFixedExpenseError) {
    throw new Error(existingFixedExpenseError.message);
  }

  if (existingFixedExpense) {
    throw new Error(
      "Já existe outra conta fixa com essa descrição e esse dia de vencimento.",
    );
  }

  const { data, error } = await supabase
    .from("fixed_expenses")
    .update({
      category_id: categoryId || null,
      description: normalizedDescription,
      amount,
      due_day: dueDay,
      payment_method: paymentMethod,
      notes: notes || null,
    })
    .eq("id", fixedExpenseId)
    .eq("financial_space_id", financialSpaceId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as FixedExpense;
}

export async function updateFixedExpenseActiveStatus({
  fixedExpenseId,
  financialSpaceId,
  active,
}: UpdateFixedExpenseActiveStatusData) {
  const { data, error } = await supabase
    .from("fixed_expenses")
    .update({
      active,
    })
    .eq("id", fixedExpenseId)
    .eq("financial_space_id", financialSpaceId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as FixedExpense;
}

export async function generateMonthlyTransactionsFromFixedExpenses({
  financialSpaceId,
  referenceMonth,
}: GenerateMonthlyTransactionsData) {
  const activeFixedExpenses = await getActiveFixedExpenses(financialSpaceId);
  const referenceMonthDate = getReferenceMonthDate(referenceMonth);

  if (activeFixedExpenses.length === 0) {
    return {
      createdCount: 0,
      skippedCount: 0,
    };
  }

  const fixedExpenseIds = activeFixedExpenses.map(
    (fixedExpense) => fixedExpense.id,
  );

  const { data: existingTransactions, error: existingTransactionsError } =
    await supabase
      .from("transactions")
      .select("fixed_expense_id")
      .eq("financial_space_id", financialSpaceId)
      .eq("reference_month", referenceMonthDate)
      .in("fixed_expense_id", fixedExpenseIds);

  if (existingTransactionsError) {
    throw new Error(existingTransactionsError.message);
  }

  const alreadyGeneratedIds = new Set(
    (existingTransactions ?? [])
      .map((transaction) => transaction.fixed_expense_id)
      .filter(Boolean),
  );

  const transactionsToCreate = activeFixedExpenses
    .filter((fixedExpense) => !alreadyGeneratedIds.has(fixedExpense.id))
    .map((fixedExpense) => ({
      financial_space_id: financialSpaceId,
      fixed_expense_id: fixedExpense.id,
      reference_month: referenceMonthDate,
      category_id: fixedExpense.category_id,
      type: "expense",
      description: fixedExpense.description,
      amount: fixedExpense.amount,
      due_date: getDueDateFromMonth(referenceMonth, fixedExpense.due_day),
      paid_date: null,
      status: "pending",
      payment_method: fixedExpense.payment_method,
      notes: fixedExpense.notes,
    }));

  if (transactionsToCreate.length === 0) {
    return {
      createdCount: 0,
      skippedCount: activeFixedExpenses.length,
    };
  }

  const { error: createTransactionsError } = await supabase
    .from("transactions")
    .insert(transactionsToCreate);

  if (createTransactionsError) {
    throw new Error(createTransactionsError.message);
  }

  return {
    createdCount: transactionsToCreate.length,
    skippedCount: activeFixedExpenses.length - transactionsToCreate.length,
  };
}

export async function deleteFixedExpense({
  fixedExpenseId,
  financialSpaceId,
}: DeleteFixedExpenseData) {
  const { error } = await supabase
    .from("fixed_expenses")
    .delete()
    .eq("id", fixedExpenseId)
    .eq("financial_space_id", financialSpaceId);

  if (error) {
    throw new Error(error.message);
  }
}
