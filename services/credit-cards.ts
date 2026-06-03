import { supabase } from "@/lib/supabase/client";

export type CreditCard = {
  id: string;
  financial_space_id: string;
  name: string;
  nickname: string | null;
  limit_amount: number | null;
  closing_day: number;
  due_day: number;
  brand: string | null;
  active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CreditCardPurchaseStatus = "active" | "cancelled";

export type CreditCardPurchase = {
  id: string;
  financial_space_id: string;
  credit_card_id: string;
  category_id: string | null;
  description: string;
  total_amount: number;
  purchase_date: string;
  installments_total: number;
  first_installment_number: number;
  status: CreditCardPurchaseStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CreditCardStatementStatus =
  | "open"
  | "generated"
  | "paid"
  | "cancelled";

export type CreditCardStatement = {
  id: string;
  financial_space_id: string;
  credit_card_id: string;
  reference_month: string;
  due_date: string;
  total_amount: number;
  status: CreditCardStatementStatus;
  created_at: string;
  updated_at: string;
};

export type CreateCreditCardData = {
  financialSpaceId: string;
  name: string;
  nickname?: string | null;
  limitAmount?: number | null;
  closingDay: number;
  dueDay: number;
  brand?: string | null;
  notes?: string | null;
};

export type UpdateCreditCardData = CreateCreditCardData & {
  creditCardId: string;
};

export type UpdateCreditCardActiveStatusData = {
  creditCardId: string;
  financialSpaceId: string;
  active: boolean;
};

export type DeleteCreditCardData = {
  creditCardId: string;
  financialSpaceId: string;
};

export type CreateCreditCardPurchaseData = {
  financialSpaceId: string;
  creditCardId: string;
  categoryId?: string | null;
  description: string;
  totalAmount: number;
  purchaseDate: string;
  installmentsTotal: number;
  firstInstallmentNumber: number;
  notes?: string | null;
};

export type UpdateCreditCardPurchaseData = CreateCreditCardPurchaseData & {
  purchaseId: string;
};

export type DeleteCreditCardPurchaseData = {
  purchaseId: string;
  financialSpaceId: string;
};

export type UpdateCreditCardPurchaseStatusData = {
  purchaseId: string;
  financialSpaceId: string;
  status: CreditCardPurchaseStatus;
};

export type GenerateCreditCardStatementData = {
  financialSpaceId: string;
  creditCardId: string;
  referenceMonth: string;
};

export type CreditCardStatementItem = {
  purchase: CreditCardPurchase;
  installmentNumber: number;
  installmentsTotal: number;
  installmentAmount: number;
};

function getReferenceMonthDate(referenceMonth: string) {
  return `${referenceMonth}-01`;
}

function addMonthsToYearMonth(yearMonth: string, monthsToAdd: number) {
  const [yearValue, monthValue] = yearMonth.split("-");
  const date = new Date(
    Number(yearValue),
    Number(monthValue) - 1 + monthsToAdd,
    1,
  );

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getYearMonthFromDate(date: string) {
  return date.slice(0, 7);
}

function getMonthDifference(startYearMonth: string, referenceMonth: string) {
  const [startYearValue, startMonthValue] = startYearMonth.split("-");
  const [referenceYearValue, referenceMonthValue] = referenceMonth.split("-");

  return (
    (Number(referenceYearValue) - Number(startYearValue)) * 12 +
    (Number(referenceMonthValue) - Number(startMonthValue))
  );
}

function getSafeDate(referenceMonth: string, day: number) {
  const [yearValue, monthValue] = referenceMonth.split("-");
  const year = Number(yearValue);
  const month = Number(monthValue);
  const lastDayOfMonth = new Date(year, month, 0).getDate();
  const safeDay = Math.min(day, lastDayOfMonth);

  return `${referenceMonth}-${String(safeDay).padStart(2, "0")}`;
}

function getStatementReferenceMonthForPurchase(
  purchaseDate: string,
  creditCard: Pick<CreditCard, "closing_day" | "due_day">,
) {
  const purchase = new Date(`${purchaseDate}T00:00:00`);
  const purchaseDay = purchase.getDate();
  const purchaseMonth = getYearMonthFromDate(purchaseDate);

  const closingMonth =
    purchaseDay <= creditCard.closing_day
      ? purchaseMonth
      : addMonthsToYearMonth(purchaseMonth, 1);

  return creditCard.due_day > creditCard.closing_day
    ? closingMonth
    : addMonthsToYearMonth(closingMonth, 1);
}

function getStatementDueDate(
  creditCard: Pick<CreditCard, "due_day">,
  referenceMonth: string,
) {
  return getSafeDate(referenceMonth, creditCard.due_day);
}

function getInstallmentAmount(
  totalAmount: number,
  installmentsTotal: number,
  installmentNumber: number,
) {
  const totalInCents = Math.round(totalAmount * 100);
  const baseInstallmentInCents = Math.floor(totalInCents / installmentsTotal);

  if (installmentNumber === installmentsTotal) {
    const previousInstallmentsTotal =
      baseInstallmentInCents * (installmentsTotal - 1);

    return (totalInCents - previousInstallmentsTotal) / 100;
  }

  return baseInstallmentInCents / 100;
}

export function getCreditCardDisplayName(creditCard: CreditCard) {
  return creditCard.nickname || creditCard.name;
}

export function getCreditCardStatementItems({
  creditCard,
  purchases,
  referenceMonth,
}: {
  creditCard: Pick<CreditCard, "closing_day" | "due_day">;
  purchases: CreditCardPurchase[];
  referenceMonth: string;
}) {
  return purchases
    .filter((purchase) => purchase.status === "active")
    .map((purchase) => {
      const firstStatementMonth = getStatementReferenceMonthForPurchase(
        purchase.purchase_date,
        creditCard,
      );

      const monthDifference = getMonthDifference(
        firstStatementMonth,
        referenceMonth,
      );

      const installmentNumber =
        purchase.first_installment_number + monthDifference;

      return {
        purchase,
        installmentNumber,
      };
    })
    .filter(({ purchase, installmentNumber }) => {
      return (
        installmentNumber >= purchase.first_installment_number &&
        installmentNumber <= purchase.installments_total
      );
    })
    .map(({ purchase, installmentNumber }) => ({
      purchase,
      installmentNumber,
      installmentsTotal: purchase.installments_total,
      installmentAmount: getInstallmentAmount(
        Number(purchase.total_amount),
        purchase.installments_total,
        installmentNumber,
      ),
    }));
}

export async function getCreditCards(financialSpaceId: string) {
  const { data, error } = await supabase
    .from("credit_cards")
    .select("*")
    .eq("financial_space_id", financialSpaceId)
    .order("active", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as CreditCard[];
}

export async function getActiveCreditCards(financialSpaceId: string) {
  const { data, error } = await supabase
    .from("credit_cards")
    .select("*")
    .eq("financial_space_id", financialSpaceId)
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as CreditCard[];
}

export async function getCreditCardById({
  creditCardId,
  financialSpaceId,
}: {
  creditCardId: string;
  financialSpaceId: string;
}) {
  const { data, error } = await supabase
    .from("credit_cards")
    .select("*")
    .eq("id", creditCardId)
    .eq("financial_space_id", financialSpaceId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as CreditCard;
}

export async function createCreditCard({
  financialSpaceId,
  name,
  nickname,
  limitAmount,
  closingDay,
  dueDay,
  brand,
  notes,
}: CreateCreditCardData) {
  const normalizedName = name.trim();

  const { data: existingCreditCards, error: existingCreditCardError } =
    await supabase
      .from("credit_cards")
      .select("id")
      .eq("financial_space_id", financialSpaceId)
      .ilike("name", normalizedName)
      .limit(1);

  if (existingCreditCardError) {
    throw new Error(existingCreditCardError.message);
  }

  if ((existingCreditCards ?? []).length > 0) {
    throw new Error(
      "Esse cartão já existe. Confira a lista antes de cadastrar novamente.",
    );
  }

  const { data, error } = await supabase
    .from("credit_cards")
    .insert({
      financial_space_id: financialSpaceId,
      name: normalizedName,
      nickname: nickname?.trim() || null,
      limit_amount: limitAmount ?? null,
      closing_day: closingDay,
      due_day: dueDay,
      brand: brand?.trim() || null,
      notes: notes || null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as CreditCard;
}

export async function updateCreditCard({
  creditCardId,
  financialSpaceId,
  name,
  nickname,
  limitAmount,
  closingDay,
  dueDay,
  brand,
  notes,
}: UpdateCreditCardData) {
  const normalizedName = name.trim();

  const { data: existingCreditCards, error: existingCreditCardError } =
    await supabase
      .from("credit_cards")
      .select("id")
      .eq("financial_space_id", financialSpaceId)
      .ilike("name", normalizedName)
      .neq("id", creditCardId)
      .limit(1);

  if (existingCreditCardError) {
    throw new Error(existingCreditCardError.message);
  }

  if ((existingCreditCards ?? []).length > 0) {
    throw new Error("Já existe outro cartão com esse nome.");
  }

  const { data, error } = await supabase
    .from("credit_cards")
    .update({
      name: normalizedName,
      nickname: nickname?.trim() || null,
      limit_amount: limitAmount ?? null,
      closing_day: closingDay,
      due_day: dueDay,
      brand: brand?.trim() || null,
      notes: notes || null,
    })
    .eq("id", creditCardId)
    .eq("financial_space_id", financialSpaceId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as CreditCard;
}

export async function updateCreditCardActiveStatus({
  creditCardId,
  financialSpaceId,
  active,
}: UpdateCreditCardActiveStatusData) {
  const { data, error } = await supabase
    .from("credit_cards")
    .update({
      active,
    })
    .eq("id", creditCardId)
    .eq("financial_space_id", financialSpaceId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as CreditCard;
}

export async function deleteCreditCard({
  creditCardId,
  financialSpaceId,
}: DeleteCreditCardData) {
  const { error } = await supabase
    .from("credit_cards")
    .delete()
    .eq("id", creditCardId)
    .eq("financial_space_id", financialSpaceId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getCreditCardPurchases(financialSpaceId: string) {
  const { data, error } = await supabase
    .from("credit_card_purchases")
    .select("*")
    .eq("financial_space_id", financialSpaceId)
    .order("purchase_date", { ascending: false })
    .order("description", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as CreditCardPurchase[];
}

export async function getCreditCardPurchasesByCard({
  financialSpaceId,
  creditCardId,
}: {
  financialSpaceId: string;
  creditCardId: string;
}) {
  const { data, error } = await supabase
    .from("credit_card_purchases")
    .select("*")
    .eq("financial_space_id", financialSpaceId)
    .eq("credit_card_id", creditCardId)
    .order("purchase_date", { ascending: false })
    .order("description", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as CreditCardPurchase[];
}

export async function createCreditCardPurchase({
  financialSpaceId,
  creditCardId,
  categoryId,
  description,
  totalAmount,
  purchaseDate,
  installmentsTotal,
  firstInstallmentNumber,
  notes,
}: CreateCreditCardPurchaseData) {
  const { data, error } = await supabase
    .from("credit_card_purchases")
    .insert({
      financial_space_id: financialSpaceId,
      credit_card_id: creditCardId,
      category_id: categoryId || null,
      description: description.trim(),
      total_amount: totalAmount,
      purchase_date: purchaseDate,
      installments_total: installmentsTotal,
      first_installment_number: firstInstallmentNumber,
      notes: notes || null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as CreditCardPurchase;
}

export async function updateCreditCardPurchase({
  purchaseId,
  financialSpaceId,
  creditCardId,
  categoryId,
  description,
  totalAmount,
  purchaseDate,
  installmentsTotal,
  firstInstallmentNumber,
  notes,
}: UpdateCreditCardPurchaseData) {
  const { data, error } = await supabase
    .from("credit_card_purchases")
    .update({
      credit_card_id: creditCardId,
      category_id: categoryId || null,
      description: description.trim(),
      total_amount: totalAmount,
      purchase_date: purchaseDate,
      installments_total: installmentsTotal,
      first_installment_number: firstInstallmentNumber,
      notes: notes || null,
    })
    .eq("id", purchaseId)
    .eq("financial_space_id", financialSpaceId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as CreditCardPurchase;
}

export async function updateCreditCardPurchaseStatus({
  purchaseId,
  financialSpaceId,
  status,
}: UpdateCreditCardPurchaseStatusData) {
  const { data, error } = await supabase
    .from("credit_card_purchases")
    .update({
      status,
    })
    .eq("id", purchaseId)
    .eq("financial_space_id", financialSpaceId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as CreditCardPurchase;
}

export async function deleteCreditCardPurchase({
  purchaseId,
  financialSpaceId,
}: DeleteCreditCardPurchaseData) {
  const { error } = await supabase
    .from("credit_card_purchases")
    .delete()
    .eq("id", purchaseId)
    .eq("financial_space_id", financialSpaceId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getCreditCardStatements(financialSpaceId: string) {
  const { data, error } = await supabase
    .from("credit_card_statements")
    .select("*")
    .eq("financial_space_id", financialSpaceId)
    .order("reference_month", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as CreditCardStatement[];
}

export async function getCreditCardStatementPreview({
  financialSpaceId,
  creditCardId,
  referenceMonth,
}: GenerateCreditCardStatementData) {
  const [creditCard, purchases] = await Promise.all([
    getCreditCardById({
      creditCardId,
      financialSpaceId,
    }),
    getCreditCardPurchasesByCard({
      creditCardId,
      financialSpaceId,
    }),
  ]);

  const items = getCreditCardStatementItems({
    creditCard,
    purchases,
    referenceMonth,
  });

  const totalAmount = items.reduce(
    (total, item) => total + item.installmentAmount,
    0,
  );

  return {
    creditCard,
    items,
    totalAmount: Number(totalAmount.toFixed(2)),
    dueDate: getStatementDueDate(creditCard, referenceMonth),
  };
}

export async function generateCreditCardStatementTransaction({
  financialSpaceId,
  creditCardId,
  referenceMonth,
}: GenerateCreditCardStatementData) {
  const preview = await getCreditCardStatementPreview({
    financialSpaceId,
    creditCardId,
    referenceMonth,
  });

  const referenceMonthDate = getReferenceMonthDate(referenceMonth);
  const cardName = getCreditCardDisplayName(preview.creditCard);
  const totalAmount = Number(preview.totalAmount.toFixed(2));

  const { data: statement, error: statementError } = await supabase
    .from("credit_card_statements")
    .upsert(
      {
        financial_space_id: financialSpaceId,
        credit_card_id: creditCardId,
        reference_month: referenceMonthDate,
        due_date: preview.dueDate,
        total_amount: totalAmount,
        status: totalAmount > 0 ? "generated" : "open",
      },
      {
        onConflict: "financial_space_id,credit_card_id,reference_month",
      },
    )
    .select("*")
    .single();

  if (statementError) {
    throw new Error(statementError.message);
  }

  if (totalAmount <= 0) {
    return {
      createdCount: 0,
      updatedCount: 0,
      skippedCount: 0,
      itemCount: 0,
      totalAmount,
    };
  }

  const { data: existingTransactions, error: existingTransactionError } =
    await supabase
      .from("transactions")
      .select("id,status")
      .eq("financial_space_id", financialSpaceId)
      .eq("credit_card_statement_id", statement.id)
      .limit(1);

  if (existingTransactionError) {
    throw new Error(existingTransactionError.message);
  }

  const existingTransaction = existingTransactions?.[0];

  const transactionDescription = `Fatura ${cardName} - ${referenceMonth
    .split("-")
    .reverse()
    .join("/")}`;

  if (existingTransaction) {
    if (existingTransaction.status !== "pending") {
      return {
        createdCount: 0,
        updatedCount: 0,
        skippedCount: 1,
        itemCount: preview.items.length,
        totalAmount,
      };
    }

    const { error: updateTransactionError } = await supabase
      .from("transactions")
      .update({
        description: transactionDescription,
        amount: totalAmount,
        due_date: preview.dueDate,
        reference_month: referenceMonthDate,
      })
      .eq("id", existingTransaction.id)
      .eq("financial_space_id", financialSpaceId);

    if (updateTransactionError) {
      throw new Error(updateTransactionError.message);
    }

    return {
      createdCount: 0,
      updatedCount: 1,
      skippedCount: 0,
      itemCount: preview.items.length,
      totalAmount,
    };
  }

  const { error: createTransactionError } = await supabase
    .from("transactions")
    .insert({
      financial_space_id: financialSpaceId,
      credit_card_statement_id: statement.id,
      reference_month: referenceMonthDate,
      category_id: null,
      type: "expense",
      description: transactionDescription,
      amount: totalAmount,
      due_date: preview.dueDate,
      paid_date: null,
      status: "pending",
      payment_method: "boleto",
      notes: "Lançamento gerado a partir da fatura do cartão de crédito.",
    });

  if (createTransactionError) {
    throw new Error(createTransactionError.message);
  }

  return {
    createdCount: 1,
    updatedCount: 0,
    skippedCount: 0,
    itemCount: preview.items.length,
    totalAmount,
  };
}
