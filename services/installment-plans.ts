import { supabase } from "@/lib/supabase/client";

export type InstallmentPlanPaymentMethod =
  | "pix"
  | "money"
  | "debit"
  | "credit_card"
  | "bank_transfer"
  | "boleto"
  | "other";

export type InstallmentPlan = {
  id: string;
  financial_space_id: string;
  category_id: string | null;
  description: string;
  installment_amount: number;
  first_due_date: string;
  total_installments: number;
  first_installment_number: number;
  payment_method: InstallmentPlanPaymentMethod;
  active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateInstallmentPlanData = {
  financialSpaceId: string;
  categoryId?: string | null;
  description: string;
  installmentAmount: number;
  firstDueDate: string;
  totalInstallments: number;
  firstInstallmentNumber: number;
  paymentMethod: InstallmentPlanPaymentMethod;
  notes?: string | null;
};

export type UpdateInstallmentPlanData = {
  installmentPlanId: string;
  financialSpaceId: string;
  categoryId?: string | null;
  description: string;
  installmentAmount: number;
  firstDueDate: string;
  totalInstallments: number;
  firstInstallmentNumber: number;
  paymentMethod: InstallmentPlanPaymentMethod;
  notes?: string | null;
};

export type UpdateInstallmentPlanActiveStatusData = {
  installmentPlanId: string;
  financialSpaceId: string;
  active: boolean;
};

export type DeleteInstallmentPlanData = {
  installmentPlanId: string;
  financialSpaceId: string;
};

export type GenerateMonthlyInstallmentTransactionsData = {
  financialSpaceId: string;
  referenceMonth: string;
};

export type InstallmentPlanProgress = {
  currentInstallment: number;
  remainingInstallments: number;
  isFinished: boolean;
  finalDueDate: string;
};

function getReferenceMonthDate(referenceMonth: string) {
  return `${referenceMonth}-01`;
}

function getMonthDifference(startDate: string, referenceMonth: string) {
  const start = new Date(`${startDate}T00:00:00`);
  const [referenceYearValue, referenceMonthValue] = referenceMonth.split("-");

  const referenceYear = Number(referenceYearValue);
  const referenceMonthIndex = Number(referenceMonthValue) - 1;

  return (
    (referenceYear - start.getFullYear()) * 12 +
    (referenceMonthIndex - start.getMonth())
  );
}

function addMonthsToDate(date: string, monthsToAdd: number) {
  const start = new Date(`${date}T00:00:00`);
  const year = start.getFullYear();
  const month = start.getMonth();
  const day = start.getDate();

  const targetDate = new Date(year, month + monthsToAdd, 1);
  const lastDayOfTargetMonth = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth() + 1,
    0,
  ).getDate();

  targetDate.setDate(Math.min(day, lastDayOfTargetMonth));

  return targetDate.toISOString().slice(0, 10);
}

function getDueDateFromReferenceMonth(
  firstDueDate: string,
  referenceMonth: string,
) {
  const firstDate = new Date(`${firstDueDate}T00:00:00`);
  const dueDay = firstDate.getDate();
  const [yearValue, monthValue] = referenceMonth.split("-");
  const year = Number(yearValue);
  const month = Number(monthValue);

  const lastDayOfMonth = new Date(year, month, 0).getDate();
  const safeDay = Math.min(dueDay, lastDayOfMonth);

  return `${referenceMonth}-${String(safeDay).padStart(2, "0")}`;
}

export function getInstallmentPlanProgress(
  installmentPlan: Pick<
    InstallmentPlan,
    "first_due_date" | "first_installment_number" | "total_installments"
  >,
  referenceMonth = new Date().toISOString().slice(0, 7),
): InstallmentPlanProgress {
  const monthDifference = getMonthDifference(
    installmentPlan.first_due_date,
    referenceMonth,
  );

  const currentInstallment =
    installmentPlan.first_installment_number + monthDifference;

  const isFinished = currentInstallment > installmentPlan.total_installments;
  const remainingInstallments = Math.max(
    installmentPlan.total_installments - currentInstallment,
    0,
  );

  const monthsUntilFinal =
    installmentPlan.total_installments -
    installmentPlan.first_installment_number;

  return {
    currentInstallment,
    remainingInstallments,
    isFinished,
    finalDueDate: addMonthsToDate(
      installmentPlan.first_due_date,
      monthsUntilFinal,
    ),
  };
}

export async function getInstallmentPlans(financialSpaceId: string) {
  const { data, error } = await supabase
    .from("installment_plans")
    .select("*")
    .eq("financial_space_id", financialSpaceId)
    .order("active", { ascending: false })
    .order("first_due_date", { ascending: true })
    .order("description", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as InstallmentPlan[];
}

export async function getActiveInstallmentPlans(financialSpaceId: string) {
  const { data, error } = await supabase
    .from("installment_plans")
    .select("*")
    .eq("financial_space_id", financialSpaceId)
    .eq("active", true)
    .order("first_due_date", { ascending: true })
    .order("description", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as InstallmentPlan[];
}

export async function createInstallmentPlan({
  financialSpaceId,
  categoryId,
  description,
  installmentAmount,
  firstDueDate,
  totalInstallments,
  firstInstallmentNumber,
  paymentMethod,
  notes,
}: CreateInstallmentPlanData) {
  const normalizedDescription = description.trim();

  const {
    data: existingInstallmentPlans,
    error: existingInstallmentPlanError,
  } = await supabase
    .from("installment_plans")
    .select("id")
    .eq("financial_space_id", financialSpaceId)
    .ilike("description", normalizedDescription)
    .eq("first_due_date", firstDueDate)
    .limit(1);

  if (existingInstallmentPlanError) {
    throw new Error(existingInstallmentPlanError.message);
  }

  if ((existingInstallmentPlans ?? []).length > 0) {
    throw new Error(
      "Esse parcelamento já existe. Confira a lista antes de cadastrar novamente.",
    );
  }

  const { data, error } = await supabase
    .from("installment_plans")
    .insert({
      financial_space_id: financialSpaceId,
      category_id: categoryId || null,
      description: normalizedDescription,
      installment_amount: installmentAmount,
      first_due_date: firstDueDate,
      total_installments: totalInstallments,
      first_installment_number: firstInstallmentNumber,
      payment_method: paymentMethod,
      notes: notes || null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as InstallmentPlan;
}

export async function updateInstallmentPlan({
  installmentPlanId,
  financialSpaceId,
  categoryId,
  description,
  installmentAmount,
  firstDueDate,
  totalInstallments,
  firstInstallmentNumber,
  paymentMethod,
  notes,
}: UpdateInstallmentPlanData) {
  const normalizedDescription = description.trim();

  const {
    data: existingInstallmentPlans,
    error: existingInstallmentPlanError,
  } = await supabase
    .from("installment_plans")
    .select("id")
    .eq("financial_space_id", financialSpaceId)
    .ilike("description", normalizedDescription)
    .eq("first_due_date", firstDueDate)
    .neq("id", installmentPlanId)
    .limit(1);

  if (existingInstallmentPlanError) {
    throw new Error(existingInstallmentPlanError.message);
  }

  if ((existingInstallmentPlans ?? []).length > 0) {
    throw new Error(
      "Já existe outro parcelamento com essa descrição e essa data inicial.",
    );
  }

  const { data, error } = await supabase
    .from("installment_plans")
    .update({
      category_id: categoryId || null,
      description: normalizedDescription,
      installment_amount: installmentAmount,
      first_due_date: firstDueDate,
      total_installments: totalInstallments,
      first_installment_number: firstInstallmentNumber,
      payment_method: paymentMethod,
      notes: notes || null,
    })
    .eq("id", installmentPlanId)
    .eq("financial_space_id", financialSpaceId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as InstallmentPlan;
}

export async function updateInstallmentPlanActiveStatus({
  installmentPlanId,
  financialSpaceId,
  active,
}: UpdateInstallmentPlanActiveStatusData) {
  const { data, error } = await supabase
    .from("installment_plans")
    .update({
      active,
    })
    .eq("id", installmentPlanId)
    .eq("financial_space_id", financialSpaceId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as InstallmentPlan;
}

export async function deleteInstallmentPlan({
  installmentPlanId,
  financialSpaceId,
}: DeleteInstallmentPlanData) {
  const { error } = await supabase
    .from("installment_plans")
    .delete()
    .eq("id", installmentPlanId)
    .eq("financial_space_id", financialSpaceId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function generateMonthlyTransactionsFromInstallmentPlans({
  financialSpaceId,
  referenceMonth,
}: GenerateMonthlyInstallmentTransactionsData) {
  const activeInstallmentPlans =
    await getActiveInstallmentPlans(financialSpaceId);
  const referenceMonthDate = getReferenceMonthDate(referenceMonth);

  if (activeInstallmentPlans.length === 0) {
    return {
      createdCount: 0,
      skippedCount: 0,
      finishedCount: 0,
    };
  }

  const validInstallmentPlans = activeInstallmentPlans
    .map((installmentPlan) => {
      const progress = getInstallmentPlanProgress(
        installmentPlan,
        referenceMonth,
      );

      return {
        installmentPlan,
        progress,
      };
    })
    .filter(({ progress }) => {
      return (
        progress.currentInstallment >= 1 &&
        progress.currentInstallment <=
          progress.currentInstallment + progress.remainingInstallments &&
        !progress.isFinished
      );
    })
    .filter(({ progress, installmentPlan }) => {
      return (
        progress.currentInstallment >=
          installmentPlan.first_installment_number &&
        progress.currentInstallment <= installmentPlan.total_installments
      );
    });

  const finishedCount =
    activeInstallmentPlans.length - validInstallmentPlans.length;

  if (validInstallmentPlans.length === 0) {
    return {
      createdCount: 0,
      skippedCount: 0,
      finishedCount,
    };
  }

  const installmentPlanIds = validInstallmentPlans.map(
    ({ installmentPlan }) => installmentPlan.id,
  );

  const { data: existingTransactions, error: existingTransactionsError } =
    await supabase
      .from("transactions")
      .select("installment_plan_id")
      .eq("financial_space_id", financialSpaceId)
      .eq("reference_month", referenceMonthDate)
      .in("installment_plan_id", installmentPlanIds);

  if (existingTransactionsError) {
    throw new Error(existingTransactionsError.message);
  }

  const alreadyGeneratedIds = new Set(
    (existingTransactions ?? [])
      .map((transaction) => transaction.installment_plan_id)
      .filter(Boolean),
  );

  const transactionsToCreate = validInstallmentPlans
    .filter(
      ({ installmentPlan }) => !alreadyGeneratedIds.has(installmentPlan.id),
    )
    .map(({ installmentPlan, progress }) => ({
      financial_space_id: financialSpaceId,
      installment_plan_id: installmentPlan.id,
      reference_month: referenceMonthDate,
      category_id: installmentPlan.category_id,
      type: "expense",
      description: `${installmentPlan.description} - Parcela ${progress.currentInstallment}/${installmentPlan.total_installments}`,
      amount: installmentPlan.installment_amount,
      due_date: getDueDateFromReferenceMonth(
        installmentPlan.first_due_date,
        referenceMonth,
      ),
      paid_date: null,
      status: "pending",
      payment_method: installmentPlan.payment_method,
      notes: installmentPlan.notes,
      installment_number: progress.currentInstallment,
      installment_total: installmentPlan.total_installments,
    }));

  if (transactionsToCreate.length === 0) {
    return {
      createdCount: 0,
      skippedCount: validInstallmentPlans.length,
      finishedCount,
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
    skippedCount: validInstallmentPlans.length - transactionsToCreate.length,
    finishedCount,
  };
}
